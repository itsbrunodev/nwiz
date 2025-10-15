export interface ValidationResult {
  level: "error" | "warning";
  message: string;
  source: {
    deviceId: string;
    deviceName: string;
    interfaceName?: string;
  };
}

export const MESSAGES = {
  INVALID_FORMAT: (type: string, address: string) =>
    `Invalid ${type} format: "${address}".`,
  DUPLICATE_IP: (ip: string, otherDevice: string, otherIface?: string) =>
    `Duplicate IP address ${ip} also found on ${otherDevice}${
      otherIface ? ` (${otherIface})` : ""
    }.`,
  INTERFACE_DISABLED_WITH_IP: (iface: string) =>
    `Interface ${iface} has an IP address but is disabled.`,
  VLAN_NOT_DEFINED: (iface: string, vlan: number) =>
    `Interface ${iface} is assigned to VLAN ${vlan}, which is not defined.`,
  GATEWAY_DOES_NOT_EXIST: (gateway: string) =>
    `Default gateway ${gateway} does not exist on any router interface.`,
  GATEWAY_SUBNET_MISMATCH: (gateway: string) =>
    `Default gateway ${gateway} is not on the same subnet.`,
  DUPLICATE_VLAN_ID: (id: number) =>
    `Duplicate VLAN ID ${id} defined on this switch.`,
  DEVICE_VLAN_MISMATCH: (
    vlan: number,
    vlanSubnet: string,
    ip: string,
    pcSubnet: string,
  ) =>
    `Device is on VLAN ${vlan} (subnet ${vlanSubnet}), but its IP ${ip} is on a different subnet (${pcSubnet}).`,
  INCORRECT_GATEWAY_VLAN: (
    vlan: number,
    gateway: string,
    correctGateway: string,
  ) =>
    `Device is on VLAN ${vlan}, but its gateway is ${gateway} instead of the correct router IP ${correctGateway}.`,
};
