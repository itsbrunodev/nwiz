import type { Network } from "@/types/network";
import type { Device } from "@/types/network/device";

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

export function validateNetwork(network: Network): ValidationResult[] {
  const results: ValidationResult[] = [];
  const ipAddressMap = new Map<string, ValidationResult["source"]>();
  const deviceMap = new Map<string, Device>(
    network.devices.map((d) => [d.id, d]),
  );

  const globallyDefinedVlans = new Set<number>([1]);

  for (let i = 0; i < network.devices.length; i++) {
    const device = network.devices[i];
    if (device.deviceType === "Switch") {
      for (let j = 0; j < device.config.vlans.length; j++) {
        globallyDefinedVlans.add(device.config.vlans[j].id);
      }
    } else if (device.deviceType === "Router") {
      for (let j = 0; j < device.config.interfaces.length; j++) {
        const iface = device.config.interfaces[j];
        if (iface.subInterfaces) {
          for (let k = 0; k < iface.subInterfaces.length; k++) {
            globallyDefinedVlans.add(iface.subInterfaces[k].vlanId);
          }
        }
      }
    }
  }

  for (const device of network.devices) {
    if (device.deviceType === "Router") {
      for (const iface of device.config.interfaces) {
        if (iface.ipAddress) {
          if (!isValidIPv4(iface.ipAddress)) {
            results.push({
              level: "error",
              message: `Invalid IPv4 address format: "${iface.ipAddress}".`,
              source: {
                deviceId: device.id,
                deviceName: device.name,
                interfaceName: iface.name,
              },
            });
          } else {
            const source = {
              deviceId: device.id,
              deviceName: device.name,
              interfaceName: iface.name,
            };
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

        if (iface.ipAddress && iface.enabled === false) {
          results.push({
            level: "warning",
            message: `Interface ${iface.name} has an IP address but is disabled.`,
            source: {
              deviceId: device.id,
              deviceName: device.name,
              interfaceName: iface.name,
            },
          });
        }

        if (iface.subnetMask && !isValidIPv4("0.0.0.0", iface.subnetMask)) {
          results.push({
            level: "error",
            message: `Invalid subnet mask format: "${iface.subnetMask}".`,
            source: {
              deviceId: device.id,
              deviceName: device.name,
              interfaceName: iface.name,
            },
          });
        }
      }
    }

    if (device.deviceType === "Switch") {
      for (const iface of device.config.interfaces) {
        if (
          iface.mode === "access" &&
          !globallyDefinedVlans.has(iface.accessVlan)
        ) {
          results.push({
            level: "error",
            message: `Interface ${iface.name} is assigned to VLAN ${iface.accessVlan}, which is not defined anywhere in the network.`,
            source: {
              deviceId: device.id,
              deviceName: device.name,
              interfaceName: iface.name,
            },
          });
        }
      }
    }
  }

  for (const connection of network.connections) {
    const dev1 = deviceMap.get(connection.from.deviceId);
    const dev2 = deviceMap.get(connection.to.deviceId);
    if (!dev1 || !dev2) continue;

    const checkConnectedInterface = (device: Device, interfaceName: string) => {
      if (device.deviceType === "Router") {
        const iface = device.config.interfaces.find(
          (i) => i.name === interfaceName,
        );
        const hasSubInterfaces =
          iface?.subInterfaces && iface.subInterfaces.length > 0;

        if ((!iface || !iface.ipAddress) && !hasSubInterfaces) {
          results.push({
            level: "warning",
            message: `Connected interface ${interfaceName} is missing an IP address.`,
            source: {
              deviceId: device.id,
              deviceName: device.name,
              interfaceName,
            },
          });
        } else if (iface?.ipAddress && !iface.subnetMask) {
          results.push({
            level: "warning",
            message: `Interface ${interfaceName} is missing a subnet mask.`,
            source: {
              deviceId: device.id,
              deviceName: device.name,
              interfaceName,
            },
          });
        }
      }
    };

    checkConnectedInterface(dev1, connection.from.interfaceName);
    checkConnectedInterface(dev2, connection.to.interfaceName);

    if (dev1.deviceType === "Router" && dev2.deviceType === "Router") {
      const iface1 = dev1.config.interfaces.find(
        (i) => i.name === connection.from.interfaceName,
      );
      const iface2 = dev2.config.interfaces.find(
        (i) => i.name === connection.to.interfaceName,
      );

      if (
        iface1?.ipAddress &&
        isValidIPv4(iface1.ipAddress) &&
        iface1.subnetMask &&
        isValidIPv4("0.0.0.0", iface1.subnetMask) &&
        iface2?.ipAddress &&
        isValidIPv4(iface2.ipAddress) &&
        iface2.subnetMask &&
        isValidIPv4("0.0.0.0", iface2.subnetMask)
      ) {
        const subnet1 = getSubnet(iface1.ipAddress, iface1.subnetMask);
        const subnet2 = getSubnet(iface2.ipAddress, iface2.subnetMask);
        if (subnet1 && subnet2 && subnet1 !== subnet2) {
          results.push({
            level: "error",
            message: `Subnet mismatch. ${dev1.name}(${connection.from.interfaceName}) is on ${subnet1}, but connected ${dev2.name}(${connection.to.interfaceName}) is on ${subnet2}.`,
            source: {
              deviceId: dev1.id,
              deviceName: dev1.name,
              interfaceName: connection.from.interfaceName,
            },
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
