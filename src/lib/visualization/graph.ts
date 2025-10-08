import * as d3 from "d3";

import type { Network } from "@/types/network";
import type { Device } from "@/types/network/device";

type SimulationNode = Device & d3.SimulationNodeDatum;

const getRank = (node: Device): number => {
  switch (node.deviceType) {
    case "Router":
      return 0;
    case "Switch":
      return 1;
    default:
      return 2;
  }
};

export function ensureNetworkLayout(network: Network): Network {
  if (network.devices.every((d) => d.position)) {
    return network;
  }

  const simulationNodes: SimulationNode[] = JSON.parse(
    JSON.stringify(network.devices),
  );

  const d3Edges = network.connections.map((conn) => ({
    source: conn.from.deviceId,
    target: conn.to.deviceId,
  }));

  const nodeIds = new Set(simulationNodes.map((n) => n.id));
  const validEdges = d3Edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );

  const simulation = d3
    .forceSimulation(simulationNodes)
    .force(
      "link",
      d3
        .forceLink(validEdges)
        .id((d) => (d as { id: string }).id)
        .distance(180)
        .strength(1),
    )
    .force("charge", d3.forceManyBody().strength(-1500))
    .force("center", d3.forceCenter(450, 400))
    .force("collide", d3.forceCollide().radius(80).strength(1))
    .force(
      "y",
      d3.forceY<SimulationNode>((d) => getRank(d) * 250 + 100).strength(0.5),
    )
    .force("x", d3.forceX<SimulationNode>(450).strength(0.08))
    .stop();

  simulation.tick(400);

  const positionMap = new Map<string, { x: number; y: number }>();

  for (const node of simulation.nodes()) {
    positionMap.set(node.id, { x: node?.x || 0, y: node?.y || 0 });
  }

  const networkWithLayout: Network = JSON.parse(JSON.stringify(network));

  for (const device of networkWithLayout.devices) {
    if (positionMap.has(device.id)) {
      device.position = positionMap.get(device.id);
    }
  }

  return networkWithLayout;
}
