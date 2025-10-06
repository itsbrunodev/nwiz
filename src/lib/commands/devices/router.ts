import type { Connection } from "@/types/network/connection";
import type { Router } from "@/types/network/device";

import { generateBaseDeviceCommands } from "./common";

export function generateRouterCommands(
  router: Router,
  connections: Connection[],
): string[] {
  const commands = generateBaseDeviceCommands(router);
  const { config } = router;

  config.interfaces.forEach((iface) => {
    commands.push(`interface ${iface.name}`);
    if (iface.description) commands.push(`  description ${iface.description}`);
    if (iface.ipAddress && iface.subnetMask)
      commands.push(`  ip address ${iface.ipAddress} ${iface.subnetMask}`);
    const isConnected = connections.some(
      (c) =>
        (c.from.deviceId === router.id &&
          c.from.interfaceName === iface.name) ||
        (c.to.deviceId === router.id && c.to.interfaceName === iface.name),
    );
    commands.push(
      iface.enabled === false || !isConnected ? "  shutdown" : "  no shutdown",
      "  exit",
    );
    iface.subInterfaces?.forEach((sub) => {
      commands.push(`interface ${iface.name}.${sub.vlanId}`);
      if (sub.description) commands.push(`  description ${sub.description}`);
      commands.push(
        `  encapsulation ${sub.encapsulation} ${sub.vlanId}`,
        `  ip address ${sub.ipAddress} ${sub.subnetMask}`,
        "  exit",
      );
    });
  });

  config.dhcpPools?.forEach((pool) => {
    for (const addr of pool.excludedAddresses ?? []) {
      commands.push(`ip dhcp excluded-address ${addr}`);
    }
    commands.push(
      `ip dhcp pool ${pool.name}`,
      `  network ${pool.network} ${pool.subnetMask}`,
      `  default-router ${pool.defaultRouter}`,
    );
    if (pool.dnsServer) commands.push(`  dns-server ${pool.dnsServer}`);
    commands.push("  exit");
  });

  config.staticRoutes?.forEach((route) => {
    const path =
      route.forwarding.type === "nextHop"
        ? route.forwarding.address
        : route.forwarding.interfaceName;
    commands.push(
      `ip route ${route.destinationNetwork} ${route.subnetMask} ${path}`,
    );
  });

  commands.push("end");

  if (config.saveConfiguration) commands.push("write memory");

  return commands;
}
