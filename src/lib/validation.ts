import type { Network } from "@/types/network";
import type { Device } from "@/types/network/device";

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

  for (const device of network.devices) {
    const checkIpUniqueness = (
      ip: string,
      source: ValidationResult["source"],
    ) => {
      if (ipAddressMap.has(ip)) {
        const original = ipAddressMap.get(ip);
        results.push({
          level: "error",
          message: `Duplicate IP address ${ip} also found on ${original?.deviceName}${original?.interfaceName ? ` (${original?.interfaceName})` : ""}.`,
          source,
        });
      } else {
        ipAddressMap.set(ip, source);
      }
    };

    if (device.deviceType === "Router") {
      for (const iface of device.config.interfaces) {
        if (iface.ipAddress) {
          checkIpUniqueness(iface.ipAddress, {
            deviceId: device.id,
            deviceName: device.name,
            interfaceName: iface.name,
          });
        }
      }
    }

    if (device.deviceType === "Switch") {
      const definedVlans = new Set(device.config.vlans.map((v) => v.id));
      for (const iface of device.config.interfaces) {
        if (iface.mode === "access" && !definedVlans.has(iface.accessVlan)) {
          results.push({
            level: "error",
            message: `Interface ${iface.name} is assigned to VLAN ${iface.accessVlan}, which does not exist on this switch.`,
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

    const checkMissingIp = (device: Device, interfaceName: string) => {
      if (device.deviceType === "Router") {
        const iface = device.config.interfaces.find(
          (i) => i.name === interfaceName,
        );
        if (!iface || !iface.ipAddress) {
          results.push({
            level: "warning",
            message: `Connected interface ${interfaceName} is missing an IP address.`,
            source: {
              deviceId: device.id,
              deviceName: device.name,
              interfaceName: interfaceName,
            },
          });
        }
      }
    };

    checkMissingIp(dev1, connection.from.interfaceName);
    checkMissingIp(dev2, connection.to.interfaceName);

    if (dev1.deviceType === "Router" && dev2.deviceType === "Router") {
      const iface1 = dev1.config.interfaces.find(
        (i) => i.name === connection.from.interfaceName,
      );
      const iface2 = dev2.config.interfaces.find(
        (i) => i.name === connection.to.interfaceName,
      );

      if (iface1?.ipAddress && iface2?.ipAddress) {
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

  return results;
}
