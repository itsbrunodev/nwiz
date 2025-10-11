import * as d3 from "d3";

import type { Network } from "@/types/network";
import type { Device } from "@/types/network/device";

type SimulationNode = Device & d3.SimulationNodeDatum;

const LAYOUT_CONFIG = {
  // canvas center position
  CENTER_X: 450,
  CENTER_Y: 400,

  // link forces
  LINK_DISTANCE: 120,
  LINK_STRENGTH: 1.8,

  // repulsion force (negative = repulsion)
  CHARGE_STRENGTH: -1000,

  // node collision radius
  COLLIDE_RADIUS: 60,
  COLLIDE_STRENGTH: 1.2,

  // hierarchical spacing
  RANK_VERTICAL_SPACING: 180,
  RANK_VERTICAL_OFFSET: 100,
  RANK_Y_STRENGTH: 0.7,

  // horizontal centering
  CENTER_X_STRENGTH: 0.12,

  // simulation iterations
  SIMULATION_TICKS: 400,
};

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
  if (
    network.devices.every(
      (d) => d.position?.x !== undefined && d.position?.y !== undefined,
    )
  ) {
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
        .forceLink<SimulationNode, d3.SimulationLinkDatum<SimulationNode>>(
          validEdges,
        )
        .id((d) => d.id)
        .distance(LAYOUT_CONFIG.LINK_DISTANCE)
        .strength(LAYOUT_CONFIG.LINK_STRENGTH),
    )
    .force("charge", d3.forceManyBody().strength(LAYOUT_CONFIG.CHARGE_STRENGTH))
    .force(
      "center",
      d3.forceCenter(LAYOUT_CONFIG.CENTER_X, LAYOUT_CONFIG.CENTER_Y),
    )
    .force(
      "collide",
      d3
        .forceCollide()
        .radius(LAYOUT_CONFIG.COLLIDE_RADIUS)
        .strength(LAYOUT_CONFIG.COLLIDE_STRENGTH),
    )
    .force(
      "y",
      d3
        .forceY<SimulationNode>(
          (d) =>
            getRank(d) * LAYOUT_CONFIG.RANK_VERTICAL_SPACING +
            LAYOUT_CONFIG.RANK_VERTICAL_OFFSET,
        )
        .strength(LAYOUT_CONFIG.RANK_Y_STRENGTH),
    )
    .force(
      "x",
      d3
        .forceX<SimulationNode>(LAYOUT_CONFIG.CENTER_X)
        .strength(LAYOUT_CONFIG.CENTER_X_STRENGTH),
    )
    .stop();

  simulation.tick(LAYOUT_CONFIG.SIMULATION_TICKS);

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
