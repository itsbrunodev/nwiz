import type { Connection } from "@/types/network/connection";
import type { Switch } from "@/types/network/device";

import { generateBaseDeviceCommands } from "./common";

export function generateSwitchCommands(
  sw: Switch,
  connections: Connection[],
): string[] {
  const commands = generateBaseDeviceCommands(sw);
  const { config } = sw;

  if (config.defaultGateway) {
    commands.push(`ip default-gateway ${config.defaultGateway}`);
  }

  config.vlans?.forEach((vlan) => {
    commands.push(`vlan ${vlan.id}`, `  name ${vlan.name}`, "  exit");
  });

  config.interfaces.forEach((iface) => {
    commands.push(`interface ${iface.name}`);
    if (iface.description) commands.push(`  description ${iface.description}`);

    switch (iface.mode) {
      case "dynamic auto":
      case "dynamic desirable":
        commands.push(`  switchport mode dynamic ${iface.mode.split(" ")[1]}`);
        break;
      case "access":
        commands.push("  switchport mode access");
        commands.push(`  switchport access vlan ${iface.accessVlan}`);
        break;
      case "trunk":
        commands.push("  switchport mode trunk");
        if (iface.nativeVlan)
          commands.push(`  switchport trunk native vlan ${iface.nativeVlan}`);
        if (iface.allowedVlans) {
          const allowed =
            iface.allowedVlans === "all" ? "all" : iface.allowedVlans.join(",");
          commands.push(`  switchport trunk allowed vlan ${allowed}`);
        }
        break;
    }

    if (
      (iface.mode === "access" || iface.mode === "trunk") &&
      iface.negotiate === false
    ) {
      commands.push("  switchport nonegotiate");
    }

    const isConnected = connections.some(
      (c) =>
        (c.from.deviceId === sw.id && c.from.interfaceName === iface.name) ||
        (c.to.deviceId === sw.id && c.to.interfaceName === iface.name),
    );
    commands.push(
      iface.enabled === false || !isConnected ? "  shutdown" : "  no shutdown",
      "  exit",
    );
  });

  commands.push("end");

  if (config.saveConfiguration) commands.push("write memory");

  return commands;
}
