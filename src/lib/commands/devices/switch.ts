import type { Connection } from "@/types/network/connection";
import type { Switch } from "@/types/network/device";

import type { CommandGenerationOptions } from "../types";
import { generateBaseDeviceCommands } from "./common";

export function generateSwitchCommands(
  sw: Switch,
  connections: Connection[],
  options: CommandGenerationOptions,
): string[] {
  const commands = generateBaseDeviceCommands(sw, options);
  const { config } = sw;

  config.vlans?.forEach((vlan) => {
    commands.push(`vlan ${vlan.id}`, `  name ${vlan.name}`, "  exit");
  });

  config.interfaces.forEach((iface) => {
    commands.push(`interface ${iface.name}`);
    if (iface.description) commands.push(`  description ${iface.description}`);
    if (iface.mode === "access") {
      commands.push(
        "  switchport mode access",
        `  switchport access vlan ${iface.accessVlan}`,
      );
    } else if (iface.mode === "trunk") {
      commands.push("  switchport mode trunk");
      if (iface.nativeVlan)
        commands.push(`  switchport trunk native vlan ${iface.nativeVlan}`);
      if (iface.allowedVlans) {
        const allowed =
          iface.allowedVlans === "all" ? "all" : iface.allowedVlans.join(",");
        commands.push(`  switchport trunk allowed vlan ${allowed}`);
      }
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
  if (options.saveConfiguration) commands.push("write memory");
  return commands;
}
