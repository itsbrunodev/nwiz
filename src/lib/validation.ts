import type { Network } from "@/types/network";
import type { Device, EndDevice, Router, Switch } from "@/types/network/device";

import { isValidIPv4 } from "./network";

export interface ValidationResult {
  level: "error" | "warning";
  message: string;
  source: {
    deviceId: string;
    deviceName: string;
    interfaceName?: string;
  };
}

function getSubnet(ip?: string, mask?: string): string | null {
  if (!ip || !mask) return null;
  const ipParts = ip.split(".").map(Number);
  const maskParts = mask.split(".").map(Number);
  if (ipParts.some(Number.isNaN) || maskParts.some(Number.isNaN)) return null;
  return ipParts.map((part, i) => part & maskParts[i]).join(".");
}

function validateAddressFormat(
  address: string,
  type: "IPv4 address" | "subnet mask" | "default gateway",
  source: ValidationResult["source"],
): ValidationResult | null {
  const isValid =
    type === "subnet mask"
      ? isValidIPv4("0.0.0.0", address)
      : isValidIPv4(address);

  if (isValid) return null;

  return {
    level: "error",
    message: `Invalid ${type} format: "${address}".`,
    source,
  };
}

function validateRouterConfig(
  device: Router,
  ipAddressMap: Map<string, ValidationResult["source"]>,
): ValidationResult[] {
  const results: ValidationResult[] = [];
  for (const iface of device.config.interfaces) {
    const source = {
      deviceId: device.id,
      deviceName: device.name,
      interfaceName: iface.name,
    };

    if (iface.ipAddress) {
      const err = validateAddressFormat(
        iface.ipAddress,
        "IPv4 address",
        source,
      );

      if (err) {
        results.push(err);
      } else {
        if (ipAddressMap.has(iface.ipAddress)) {
          const original = ipAddressMap.get(iface.ipAddress);

          results.push({
            level: "error",
            message: `Duplicate IP address ${iface.ipAddress} also found on ${original?.deviceName} (${original?.interfaceName}).`,
            source,
          });
        } else {
          ipAddressMap.set(iface.ipAddress, source);
        }
      }
    }

    if (iface.subnetMask) {
      const err = validateAddressFormat(
        iface.subnetMask,
        "subnet mask",
        source,
      );

      if (err) results.push(err);
    }

    if (iface.ipAddress && !iface.enabled) {
      results.push({
        level: "warning",
        message: `Interface ${iface.name} has an IP address but is disabled.`,
        source,
      });
    }
  }
  return results;
}

function validateSwitchConfig(
  device: Switch,
  globallyDefinedVlans: Set<number>,
  validGatewayIps: Set<string>,
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const source = { deviceId: device.id, deviceName: device.name };

  for (const iface of device.config.interfaces) {
    if (
      iface.mode === "access" &&
      !globallyDefinedVlans.has(iface.accessVlan)
    ) {
      results.push({
        level: "error",
        message: `Interface ${iface.name} is assigned to VLAN ${iface.accessVlan}, which is not defined.`,
        source: { ...source, interfaceName: iface.name },
      });
    }
  }

  if (device.config.defaultGateway) {
    const formatErr = validateAddressFormat(
      device.config.defaultGateway,
      "default gateway",
      source,
    );
    if (formatErr) {
      results.push(formatErr);
    } else if (!validGatewayIps.has(device.config.defaultGateway)) {
      results.push({
        level: "error",
        message: `Default gateway ${device.config.defaultGateway} does not exist on any router interface.`,
        source,
      });
    }
  }

  return results;
}

function validateEndDeviceConfig(
  device: EndDevice,
  validGatewayIps: Set<string>,
  ipAddressMap: Map<string, ValidationResult["source"]>,
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const { ipAddress, subnetMask, defaultGateway } = device.config;
  const source = { deviceId: device.id, deviceName: device.name };

  if (ipAddress) {
    const err = validateAddressFormat(ipAddress, "IPv4 address", source);
    if (err) {
      results.push(err);
    } else {
      if (ipAddressMap.has(ipAddress)) {
        const original = ipAddressMap.get(ipAddress);

        results.push({
          level: "error",
          message: `Duplicate IP address ${ipAddress} also found on ${
            original?.deviceName
          }${original?.interfaceName ? ` (${original?.interfaceName})` : ""}.`,
          source,
        });
      } else {
        ipAddressMap.set(ipAddress, source);
      }
    }
  }

  if (subnetMask) {
    const err = validateAddressFormat(subnetMask, "subnet mask", source);

    if (err) results.push(err);
  }

  if (defaultGateway) {
    const formatErr = validateAddressFormat(
      defaultGateway,
      "default gateway",
      source,
    );
    if (formatErr) {
      results.push(formatErr);
    } else if (!validGatewayIps.has(defaultGateway)) {
      results.push({
        level: "error",
        message: `Default gateway ${defaultGateway} does not exist on any router interface.`,
        source,
      });
    }
  }

  if (ipAddress && defaultGateway && ipAddress === defaultGateway) {
    results.push({
      level: "error",
      message: "Device IP address cannot be the same as its default gateway.",
      source,
    });
  }

  if (ipAddress && subnetMask && defaultGateway && results.length === 0) {
    const deviceSubnet = getSubnet(ipAddress, subnetMask);
    const gatewaySubnet = getSubnet(defaultGateway, subnetMask);

    if (deviceSubnet && gatewaySubnet && deviceSubnet !== gatewaySubnet) {
      results.push({
        level: "warning",
        message: `Default gateway ${defaultGateway} is not on the same subnet.`,
        source,
      });
    }
  }

  return results;
}

export function validateNetwork(network: Network): ValidationResult[] {
  const results: ValidationResult[] = [];
  const ipAddressMap = new Map<string, ValidationResult["source"]>();
  const deviceMap = new Map<string, Device>(
    network.devices.map((d) => [d.id, d]),
  );
  const routers = network.devices.filter(
    (d): d is Router => d.deviceType === "Router",
  );

  const globallyDefinedVlans = new Set<number>([1]);
  const validGatewayIps = new Set<string>();

  for (const device of network.devices) {
    if (device.deviceType === "Switch") {
      for (const vlan of device.config.vlans) {
        globallyDefinedVlans.add(vlan.id);
      }
    } else if (device.deviceType === "Router") {
      for (const iface of device.config.interfaces) {
        if (iface.ipAddress) validGatewayIps.add(iface.ipAddress);
        if (iface.subInterfaces) {
          for (const sub of iface.subInterfaces) {
            globallyDefinedVlans.add(sub.vlanId);
            if (sub.ipAddress) validGatewayIps.add(sub.ipAddress);
          }
        }
      }
    }
  }

  for (const device of network.devices) {
    switch (device.deviceType) {
      case "Router":
        results.push(...validateRouterConfig(device, ipAddressMap));
        break;
      case "Switch":
        results.push(
          ...validateSwitchConfig(
            device,
            globallyDefinedVlans,
            validGatewayIps,
          ),
        );
        break;
      case "PC":
      case "Server":
      case "Laptop":
        results.push(
          ...validateEndDeviceConfig(device, validGatewayIps, ipAddressMap),
        );
        break;
    }
  }

  for (const connection of network.connections) {
    const dev1 = deviceMap.get(connection.from.deviceId);
    const dev2 = deviceMap.get(connection.to.deviceId);
    if (!dev1 || !dev2) continue;

    const endDevice = [dev1, dev2].find((d) =>
      ["PC", "Server", "Laptop"].includes(d.deviceType),
    ) as EndDevice | undefined;
    const switchDevice = [dev1, dev2].find((d) => d.deviceType === "Switch") as
      | Switch
      | undefined;

    if (endDevice && switchDevice) {
      const switchIntName =
        switchDevice.id === dev1.id
          ? connection.from.interfaceName
          : connection.to.interfaceName;
      const switchInterface = switchDevice.config.interfaces.find(
        (i) => i.name === switchIntName,
      );

      if (switchInterface?.mode !== "access") continue;

      const accessVlanId = switchInterface.accessVlan;
      const {
        ipAddress: pcIp,
        subnetMask: pcMask,
        defaultGateway: pcGateway,
      } = endDevice.config;
      let vlanGatewayInterface: {
        ipAddress: string;
        subnetMask: string;
      } | null = null;

      for (const router of routers) {
        for (const iface of router.config.interfaces) {
          const subIface = iface.subInterfaces?.find(
            (sub) => sub.vlanId === accessVlanId,
          );
          if (subIface) {
            vlanGatewayInterface = subIface;
            break;
          }
        }
        if (vlanGatewayInterface) break;
      }

      if (vlanGatewayInterface) {
        const vlanSubnet = getSubnet(
          vlanGatewayInterface.ipAddress,
          vlanGatewayInterface.subnetMask,
        );

        if (pcIp && pcMask && vlanSubnet) {
          const pcSubnet = getSubnet(pcIp, pcMask);
          if (pcSubnet && pcSubnet !== vlanSubnet) {
            results.push({
              level: "error",
              message: `Device is on VLAN ${accessVlanId} (subnet ${vlanSubnet}), but its IP ${pcIp} is on a different subnet (${pcSubnet}).`,
              source: { deviceId: endDevice.id, deviceName: endDevice.name },
            });
          }
        }

        if (pcGateway && pcGateway !== vlanGatewayInterface.ipAddress) {
          results.push({
            level: "error",
            message: `Device is on VLAN ${accessVlanId}, but its gateway is ${pcGateway} instead of the correct router IP ${vlanGatewayInterface.ipAddress}.`,
            source: { deviceId: endDevice.id, deviceName: endDevice.name },
          });
        }
      }
    }
  }

  results.sort((a, b) =>
    a.source.deviceName.localeCompare(b.source.deviceName),
  );

  return results;
}
