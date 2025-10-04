import type { Network } from "@/types/network";
import type { Device } from "@/types/network/device";

// Helper type for easier connection handling
interface DeviceConnection {
  neighborId: string;
  localInterface: string;
  neighborInterface: string;
}

/**
 * Replaces long interface names with common shorter aliases.
 */
function aliasPortName(name: string): string {
  return name.replace("GigabitEthernet", "Gig").replace("FastEthernet", "Fa");
}

/**
 * Creates a hierarchical, file tree-like visualization of the network,
 * prioritizing Routers as the roots of the network trees.
 *
 * @param network The network object containing devices and connections.
 * @returns A string representing the network tree with aliased port names.
 */
export function createNetworkTree(network: Network): string {
  if (!network?.devices?.length) {
    return "";
  }

  const deviceMap = new Map<string, Device>(
    network.devices.map((device) => [device.id, device]),
  );
  const adjacencyList = new Map<string, DeviceConnection[]>();

  // --- Setup Phase ---
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

  // --- Tree Building Phase ---

  // Define the logical hierarchy order. Lower numbers have higher priority.
  const deviceTypeOrder: Record<Device["deviceType"], number> = {
    Router: 1,
    Switch: 2,
    Server: 3,
    PC: 3,
  };

  // Sort devices to ensure routers are always processed first as potential tree roots.
  const sortedDevices = [...network.devices].sort((a, b) => {
    const rankA = deviceTypeOrder[a.deviceType] ?? 99;
    const rankB = deviceTypeOrder[b.deviceType] ?? 99;
    return rankA - rankB;
  });

  const visited = new Set<string>();
  let fullTree = "";

  // Iterate over the sorted devices. This ensures that if a Router exists
  // in any connected component, it will be chosen as the root of that tree.
  for (const device of sortedDevices) {
    if (!visited.has(device.id)) {
      if (fullTree) fullTree += "\n"; // Add space between disconnected trees
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

/**
 * Recursively builds the tree structure for a given device's connections
 * using a pure Depth-First Search.
 */
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
    if (!neighbor) return; // Safely skip if neighbor data is missing

    const localPort = aliasPortName(conn.localInterface);
    const neighborPort = aliasPortName(conn.neighborInterface);

    subTree += `${prefix}${connector} [${localPort} <-> ${neighborPort}] ${neighbor.name} (${neighbor.deviceType})\n`;

    // Recurse for the neighbor's connections, building the nested tree
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
