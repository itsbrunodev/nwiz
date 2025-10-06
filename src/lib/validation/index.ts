import type { Network } from "@/types/network";
import type { Device, Router } from "@/types/network/device";

import { validateConnections } from "./connections";
import {
  validateEndDeviceConfig,
  validateRouterConfig,
  validateSwitchConfig,
} from "./devices";
import type { ValidationResult } from "./types";

export function validateNetwork(network: Network): ValidationResult[] {
  const ipAddressMap = new Map<string, ValidationResult["source"]>();
  const deviceMap = new Map<string, Device>(
    network.devices.map((d) => [d.id, d]),
  );
  const routers = network.devices.filter(
    (d): d is Router => d.deviceType === "Router",
  );

  const metadata = {
    globallyDefinedVlans: new Set<number>([1]),
    validGatewayIps: new Set<string>(),
  };

  network.devices.forEach((device) => {
    if (device.deviceType === "Switch") {
      for (const vlan of device.config.vlans) {
        metadata.globallyDefinedVlans.add(vlan.id);
      }
    } else if (device.deviceType === "Router") {
      device.config.interfaces.forEach((iface) => {
        if (iface.ipAddress) metadata.validGatewayIps.add(iface.ipAddress);
        iface.subInterfaces?.forEach((sub) => {
          metadata.globallyDefinedVlans.add(sub.vlanId);
          if (sub.ipAddress) metadata.validGatewayIps.add(sub.ipAddress);
        });
      });
    }
  });

  const results: ValidationResult[] = [];
  for (const device of network.devices) {
    switch (device.deviceType) {
      case "Router":
        results.push(...validateRouterConfig(device, ipAddressMap));
        break;
      case "Switch":
        results.push(...validateSwitchConfig(device, metadata));
        break;
      case "PC":
      case "Server":
      case "Laptop":
        results.push(
          ...validateEndDeviceConfig(device, metadata, ipAddressMap),
        );
        break;
    }
  }

  results.push(...validateConnections(network, deviceMap, routers));

  results.sort((a, b) =>
    a.source.deviceName.localeCompare(b.source.deviceName),
  );

  return results;
}
