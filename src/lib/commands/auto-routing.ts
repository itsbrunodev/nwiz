import type { Network } from "@/types/network";
import type { Router } from "@/types/network/device";
import type { StaticRoute } from "@/types/network/route/static";

import { logger } from "./types";

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

export function addAutoStaticRoutes(network: Network): Network {
  logger("Starting automatic static route calculation.");

  const networkCopy: Network = JSON.parse(JSON.stringify(network));

  const routers = networkCopy.devices.filter(
    (d): d is Router => d.deviceType === "Router",
  );

  if (routers.length < 2) {
    logger("Skipping static routing: fewer than 2 routers found.");

    return networkCopy;
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

  return networkCopy;
}
