import type { EndDevice, Router, Switch } from "@/types/network/device";

import { MESSAGES, type ValidationResult } from "./types";
import { getSubnet, validateAddressFormat, validateAndTrackIp } from "./utils";

export function validateRouterConfig(
  device: Router,
  ipAddressMap: Map<string, ValidationResult["source"]>,
): ValidationResult[] {
  const results: ValidationResult[] = [];
  device.config.interfaces.forEach((iface) => {
    const source = {
      deviceId: device.id,
      deviceName: device.name,
      interfaceName: iface.name,
    };
    if (iface.ipAddress) {
      const err = validateAndTrackIp(iface.ipAddress, source, ipAddressMap);
      if (err) results.push(err);
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
        message: MESSAGES.INTERFACE_DISABLED_WITH_IP(iface.name),
        source,
      });
    }
    iface.subInterfaces?.forEach((sub) => {
      const subSource = {
        ...source,
        interfaceName: `${iface.name}.${sub.vlanId}`,
      };
      if (sub.ipAddress) {
        const err = validateAndTrackIp(sub.ipAddress, subSource, ipAddressMap);
        if (err) results.push(err);
      }
      if (sub.subnetMask) {
        const err = validateAddressFormat(
          sub.subnetMask,
          "subnet mask",
          subSource,
        );
        if (err) results.push(err);
      }
    });
  });
  return results;
}

export function validateSwitchConfig(
  device: Switch,
  metadata: { globallyDefinedVlans: Set<number>; validGatewayIps: Set<string> },
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const source = { deviceId: device.id, deviceName: device.name };
  const definedVlanIds = new Set<number>();

  device.config.vlans.forEach((vlan) => {
    if (definedVlanIds.has(vlan.id)) {
      results.push({
        level: "error",
        message: MESSAGES.DUPLICATE_VLAN_ID(vlan.id),
        source,
      });
    }
    definedVlanIds.add(vlan.id);
  });

  device.config.interfaces.forEach((iface) => {
    if (
      iface.mode === "access" &&
      !metadata.globallyDefinedVlans.has(iface.accessVlan)
    ) {
      results.push({
        level: "error",
        message: MESSAGES.VLAN_NOT_DEFINED(iface.name, iface.accessVlan),
        source: { ...source, interfaceName: iface.name },
      });
    }
  });

  if (device.config.defaultGateway) {
    const gateway = device.config.defaultGateway;
    const err = validateAddressFormat(gateway, "default gateway", source);
    if (err) {
      results.push(err);
    } else if (!metadata.validGatewayIps.has(gateway)) {
      results.push({
        level: "error",
        message: MESSAGES.GATEWAY_DOES_NOT_EXIST(gateway),
        source,
      });
    }
  }
  return results;
}

export function validateEndDeviceConfig(
  device: EndDevice,
  metadata: { validGatewayIps: Set<string> },
  ipAddressMap: Map<string, ValidationResult["source"]>,
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const { ipAddress, subnetMask, defaultGateway } = device.config;
  const source = { deviceId: device.id, deviceName: device.name };

  if (ipAddress) {
    const err = validateAndTrackIp(ipAddress, source, ipAddressMap);
    if (err) results.push(err);
  }
  if (subnetMask) {
    const err = validateAddressFormat(subnetMask, "subnet mask", source);
    if (err) results.push(err);
  }
  if (defaultGateway) {
    const err = validateAddressFormat(
      defaultGateway,
      "default gateway",
      source,
    );
    if (err) {
      results.push(err);
    } else if (!metadata.validGatewayIps.has(defaultGateway)) {
      results.push({
        level: "error",
        message: MESSAGES.GATEWAY_DOES_NOT_EXIST(defaultGateway),
        source,
      });
    }
  }

  if (
    ipAddress &&
    subnetMask &&
    defaultGateway &&
    !results.some((r) => r.level === "error")
  ) {
    const deviceSubnet = getSubnet(ipAddress, subnetMask);
    const gatewaySubnet = getSubnet(defaultGateway, subnetMask);
    if (deviceSubnet && gatewaySubnet && deviceSubnet !== gatewaySubnet) {
      results.push({
        level: "warning",
        message: MESSAGES.GATEWAY_SUBNET_MISMATCH(defaultGateway),
        source,
      });
    }
  }
  return results;
}
