import type { Network } from "@/types/network";
import type { VtyLineConfig } from "@/types/network/config/password";
import type { AccessControlList, SshConfig } from "@/types/network/config/ssh";
import type { LocalUser } from "@/types/network/config/user";
import type { Connection } from "@/types/network/connection";
import type { Router, Switch } from "@/types/network/device";
import type { StaticRoute } from "@/types/network/route/static";

let logger = (_: string) => {}; // default to no-op

function createLogger(isVerbose: boolean) {
  if (isVerbose) {
    logger = (message: string) => console.log(`[LOG] ${message}`);
  } else {
    logger = (_: string) => {};
  }
}

/**
 * Configuration options for the command generation process.
 */
export interface CommandGenerationOptions {
  enableServicePasswordEncryption?: boolean;
  saveConfiguration?: boolean;
  verbose?: boolean;
}

// Automatic static routing

type RouterGraph = Map<string, Set<string>>;

function getSubnet(ip?: string, mask?: string): string | null {
  if (!ip || !mask) return null;
  const ipParts = ip.split(".").map(Number);
  const maskParts = mask.split(".").map(Number);
  if (
    ipParts.length !== 4 ||
    maskParts.length !== 4 ||
    ipParts.some(Number.isNaN) ||
    maskParts.some(Number.isNaN)
  )
    return null;
  const subnetParts = ipParts.map((part, i) => part & maskParts[i]);
  return subnetParts.join(".");
}

function findPathBFS(
  startId: string,
  endId: string,
  graph: RouterGraph,
): string[] | null {
  if (startId === endId) return [startId];
  const queue: string[][] = [[startId]];
  const visited = new Set([startId]);
  while (queue.length > 0) {
    const path = queue.shift() || [];
    const lastNode = path[path.length - 1];
    if (lastNode === endId) return path;
    const neighbors = graph.get(lastNode) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

function addAutoStaticRoutes(network: Network): void {
  logger("Starting automatic static route calculation.");
  const routers = network.devices.filter(
    (d): d is Router => d.deviceType === "Router",
  );
  if (routers.length < 2) {
    logger("Skipping static routing: fewer than 2 routers found.");
    return;
  }

  logger("Clearing old auto-generated routes...");
  for (const router of routers) {
    if (router.config.staticRoutes) {
      router.config.staticRoutes = router.config.staticRoutes.filter(
        (route) => !route.id.startsWith("auto-route-"),
      );
    }
  }

  const allSubnets = new Map<string, string>(); // subnet => mask
  const routerInfo = new Map<
    string,
    { device: Router; subnets: Set<string> }
  >();
  const subnetToRouterMap = new Map<string, string>(); // subnet => routerId

  for (const router of routers) {
    const directlyConnectedSubnets = new Set<string>();
    router.config.interfaces.forEach((iface) => {
      const subnet = getSubnet(iface.ipAddress, iface.subnetMask);
      if (subnet && iface.subnetMask) {
        directlyConnectedSubnets.add(subnet);
        allSubnets.set(subnet, iface.subnetMask);
        subnetToRouterMap.set(subnet, router.id);
      }
    });
    routerInfo.set(router.id, {
      device: router,
      subnets: directlyConnectedSubnets,
    });
  }

  const routerGraph: RouterGraph = new Map(
    routers.map((r) => [r.id, new Set()]),
  );
  for (const conn of network.connections) {
    if (
      routerInfo.has(conn.from.deviceId) &&
      routerInfo.has(conn.to.deviceId)
    ) {
      routerGraph.get(conn.from.deviceId)?.add(conn.to.deviceId);
      routerGraph.get(conn.to.deviceId)?.add(conn.from.deviceId);
    }
  }

  for (const sourceInfo of routerInfo.values()) {
    const { device: sourceRouter, subnets: localSubnets } = sourceInfo;
    const remoteSubnets = [...allSubnets.keys()].filter(
      (s) => !localSubnets.has(s),
    );

    if (remoteSubnets.length === 0) continue;
    if (!sourceRouter.config.staticRoutes)
      sourceRouter.config.staticRoutes = [];

    for (const remoteSubnet of remoteSubnets) {
      const targetRouterId = subnetToRouterMap.get(remoteSubnet);
      if (!targetRouterId) continue;
      const path = findPathBFS(sourceRouter.id, targetRouterId, routerGraph);
      if (path && path.length > 1) {
        const nextHopRouterId = path[1];
        const connection = network.connections.find(
          (c) =>
            (c.from.deviceId === sourceRouter.id &&
              c.to.deviceId === nextHopRouterId) ||
            (c.from.deviceId === nextHopRouterId &&
              c.to.deviceId === sourceRouter.id),
        );
        if (connection) {
          const nextHopEndpoint =
            connection.from.deviceId === nextHopRouterId
              ? connection.from
              : connection.to;
          const nextHopRouter = routerInfo.get(nextHopRouterId)?.device;
          const nextHopInterface = nextHopRouter?.config.interfaces.find(
            (i) => i.name === nextHopEndpoint.interfaceName,
          );
          if (nextHopInterface?.ipAddress) {
            const newRoute: StaticRoute = {
              id: `auto-route-${sourceRouter.id}-${remoteSubnet}`,
              destinationNetwork: remoteSubnet,
              subnetMask: allSubnets.get(remoteSubnet) || "",
              forwarding: {
                type: "nextHop",
                address: nextHopInterface.ipAddress,
              },
            };
            sourceRouter.config.staticRoutes.push(newRoute);
          }
        }
      }
    }
  }
}

// Feature specific functions

const generateLocalUserCommands = (users?: LocalUser[]): string[] =>
  users
    ?.filter((u) => u.username && u.password)
    .map(
      (u) =>
        `username ${u.username} privilege ${u.privilege || 1} password ${
          u.password
        }`,
    ) ?? [];

const generateAclCommands = (acls?: AccessControlList[]): string[] =>
  acls?.flatMap((acl) => [
    `no access-list ${acl.id}`,
    ...acl.rules.map(
      (rule) =>
        `access-list ${acl.id} ${rule.action} ${rule.sourceAddress} ${rule.sourceWildcard}`,
    ),
  ]) ?? [];

const generateSshCommands = (
  ssh?: SshConfig,
  domainName?: string,
): string[] => {
  if (!ssh) return [];
  const commands = [];
  commands.push(`ip domain-name ${domainName || "example.com"}`);
  commands.push(
    `crypto key generate rsa general-keys modulus ${ssh.rsaKey.modulus}`,
  );
  commands.push(`ip ssh version ${ssh.version}`);
  if (ssh.timeout) commands.push(`ip ssh time-out ${ssh.timeout}`);
  if (ssh.authenticationRetries)
    commands.push(`ip ssh authentication-retries ${ssh.authenticationRetries}`);
  return commands;
};

const generateLineVtyCommands = (
  vty?: VtyLineConfig,
  isSshEnabled?: boolean,
): string[] => {
  if (!vty) return [];
  // if SSH is not enabled, a password is required
  if (!isSshEnabled && !vty.password) return [];

  const commands = [`line vty ${vty.from} ${vty.to}`];

  if (isSshEnabled) {
    // for SSH, use local user database and enable SSH transport
    commands.push("  transport input ssh");
    commands.push("  login local");
  } else if (vty.password) {
    // for basic Telnet, use the line password
    commands.push(`  password ${vty.password}`);
    commands.push("  login");
  }

  if (vty.accessClass) {
    commands.push(`  access-class ${vty.accessClass} in`);
  }

  commands.push("  exit");
  return commands;
};

// Shared command generation for both Routers and Switches
function generateBaseDeviceCommands(
  device: Router | Switch,
  options: CommandGenerationOptions,
): string[] {
  const { config, hostname } = device;
  const commands: string[] = [];

  commands.push("enable", "configure terminal", `hostname ${hostname}`);
  if (options.enableServicePasswordEncryption)
    commands.push("service password-encryption");
  commands.push("no ip domain-lookup");

  if (config.enableSecret?.password)
    commands.push(`enable secret ${config.enableSecret.password}`);
  commands.push(...generateLocalUserCommands(config.localUsers));
  commands.push(...generateSshCommands(config.ssh, config.domainName));
  commands.push(...generateAclCommands(config.accessLists));

  if (config.lineConsole?.password)
    commands.push(
      "line con 0",
      `  password ${config.lineConsole.password}`,
      "  login",
      "  exit",
    );

  commands.push(...generateLineVtyCommands(config.lineVty, !!config.ssh));

  return commands;
}

// Device specific functions

function generateRouterCommands(
  router: Router,
  connections: Connection[],
  options: CommandGenerationOptions,
): string[] {
  const commands = generateBaseDeviceCommands(router, options);
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
  if (options.saveConfiguration) commands.push("write memory");
  return commands;
}

function generateSwitchCommands(
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

/**
 * Converts a network data structure into a map of Cisco IOS commands.
 * It automatically calculates and adds necessary static routes for full connectivity.
 */
export function generateCommands(
  network: Network,
  options: CommandGenerationOptions = {},
): Map<string, string[]> {
  createLogger(options.verbose || false);
  logger("Starting command generation process...");

  const networkCopy = JSON.parse(JSON.stringify(network));
  addAutoStaticRoutes(networkCopy);

  const allCommands = new Map<string, string[]>();
  for (const device of networkCopy.devices) {
    let deviceCommands: string[] = [];
    switch (device.deviceType) {
      case "Router":
        deviceCommands = generateRouterCommands(
          device,
          networkCopy.connections,
          options,
        );
        break;
      case "Switch":
        deviceCommands = generateSwitchCommands(
          device,
          networkCopy.connections,
          options,
        );
        break;
      default:
        continue;
    }
    if (deviceCommands.length > 0) {
      allCommands.set(device.id, deviceCommands);
    }
  }

  logger("Command generation process finished.");
  return allCommands;
}
