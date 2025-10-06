import type { EndDevice } from "@/types/network/device";

export function generateEndDeviceCommands(device: EndDevice): string[] {
  const { ipAddress, subnetMask, defaultGateway } = device.config;

  const commands: string[] = [];

  if (ipAddress && subnetMask && defaultGateway) {
    commands.push(`ipconfig ${ipAddress} ${subnetMask} ${defaultGateway}`);
  }

  return commands;
}
