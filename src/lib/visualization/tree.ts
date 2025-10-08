import type { Network } from "@/types/network";
import type { Device } from "@/types/network/device";

import { aliasPortName } from "../network";

interface DeviceConnection {
  neighborId: string;
  localInterface: string;
  neighborInterface: string;
}

export function createNetworkTree(network: Network): string {
  if (!network?.devices?.length) {
    return "";
  }

  const deviceMap = new Map<string, Device>(
    network.devices.map((device) => [device.id, device]),
  );
  const adjacencyList = new Map<string, DeviceConnection[]>();

  for (const device of network.devices) {
    adjacencyList.set(device.id, []);
  }

  for (const conn of network.connections) {
    const fromList = adjacencyList.get(conn.from.deviceId);
    if (fromList) {
      fromList.push({
        neighborId: conn.to.deviceId,
        localInterface: conn.from.interfaceName,
        neighborInterface: conn.to.interfaceName,
      });
    }

    const toList = adjacencyList.get(conn.to.deviceId);
    if (toList) {
      toList.push({
        neighborId: conn.from.deviceId,
        localInterface: conn.to.interfaceName,
        neighborInterface: conn.from.interfaceName,
      });
    }
  }

  const deviceTypeOrder: Record<Device["deviceType"], number> = {
    Router: 1,
    Switch: 2,
    Server: 3,
    PC: 3,
    Laptop: 3,
  };

  const sortedDevices = [...network.devices].sort((a, b) => {
    const rankA = deviceTypeOrder[a.deviceType] ?? 99;
    const rankB = deviceTypeOrder[b.deviceType] ?? 99;
    return rankA - rankB;
  });

  const visited = new Set<string>();
  let fullTree = "";

  for (const device of sortedDevices) {
    if (!visited.has(device.id)) {
      if (fullTree) fullTree += "\n";
      fullTree += `${device.name} (${device.deviceType})\n`;
      fullTree += buildSubTree(
        device.id,
        "",
        visited,
        deviceMap,
        adjacencyList,
      );
    }
  }

  return fullTree.trim();
}

function buildSubTree(
  deviceId: string,
  prefix: string,
  visited: Set<string>,
  deviceMap: Map<string, Device>,
  adjacencyList: Map<string, DeviceConnection[]>,
): string {
  visited.add(deviceId);
  let subTree = "";
  const connections = (adjacencyList.get(deviceId) || []).filter(
    (conn) => !visited.has(conn.neighborId),
  );

  connections.forEach((conn, index) => {
    const isLast = index === connections.length - 1;
    const connector = isLast ? "└──" : "├──";
    const newPrefix = prefix + (isLast ? "    " : "│   ");

    const neighbor = deviceMap.get(conn.neighborId);

    if (!neighbor) return;

    const localPort = aliasPortName(conn.localInterface);
    const neighborPort = aliasPortName(conn.neighborInterface);

    subTree += `${prefix}${connector} [${localPort} <-> ${neighborPort}] ${neighbor.name} (${neighbor.deviceType})\n`;

    subTree += buildSubTree(
      neighbor.id,
      newPrefix,
      visited,
      deviceMap,
      adjacencyList,
    );
  });

  return subTree;
}
