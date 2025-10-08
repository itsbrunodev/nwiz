import * as d3 from "d3";
import { useAtom } from "jotai";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { networkAtom } from "@/stores/network";

import { aliasPortName } from "@/lib/network";
import { ensureNetworkLayout } from "@/lib/visualization/graph";

import type { Device } from "@/types/network/device";

type PositionedNode = Device & { x: number; y: number };

function getNodeColorClasses(deviceType: string): string {
  switch (deviceType) {
    case "Router":
      return "fill-stone-600 dark:fill-stone-400 stroke-white dark:stroke-gray-900";
    case "Switch":
      return "fill-gray-500 dark:fill-gray-400 stroke-white dark:stroke-gray-900";
    default:
      return "fill-foreground stroke-background";
  }
}

function computeEdgeEndpoints(
  s: PositionedNode,
  t: PositionedNode,
  index: number,
  total: number,
) {
  const dx = t.x - s.x;
  const dy = t.y - s.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const normX = dx / dist;
  const normY = dy / dist;

  const perpX = -normY;
  const perpY = normX;

  const offsetStep = 6;
  const offset = (index - (total - 1) / 2) * offsetStep;

  const sx = s.x + perpX * offset;
  const sy = s.y + perpY * offset;
  const tx = t.x + perpX * offset;
  const ty = t.y + perpY * offset;

  return { sx, sy, tx, ty };
}

export function NetworkVisualizationGraph() {
  const [network, setNetwork] = useAtom(networkAtom);
  const svgRef = useRef<SVGSVGElement>(null);

  const graphRootId = useId();
  const [transform, setTransform] = useState(d3.zoomIdentity);

  useEffect(() => {
    const layout = ensureNetworkLayout(network);
    if (JSON.stringify(layout) !== JSON.stringify(network)) {
      setNetwork(layout);
    }
  }, [network, setNetwork]);

  const { nodes, edges } = useMemo(() => {
    const positionedNodes = (network.devices || [])
      .filter((d) => d.position)
      .map((d) => ({ ...d, ...d.position })) as PositionedNode[];

    const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));

    const grouped = new Map<string, any[]>();

    (network.connections || []).forEach((edge) => {
      const key1 = `${edge.from.deviceId}-${edge.to.deviceId}`;
      const key2 = `${edge.to.deviceId}-${edge.from.deviceId}`;
      const key = key1 < key2 ? key1 : key2;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(edge);
    });

    const allEdges: any[] = [];

    for (const group of grouped.values()) {
      group.forEach((edge, idx) => {
        allEdges.push({
          ...edge,
          sourceNode: nodeMap.get(edge.from.deviceId),
          targetNode: nodeMap.get(edge.to.deviceId),
          sourceInterface: aliasPortName(edge.from.interfaceName),
          targetInterface: aliasPortName(edge.to.interfaceName),
          index: idx,
          total: group.length,
        });
      });
    }

    return { nodes: positionedNodes, edges: allEdges };
  }, [network]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>(`g#${graphRootId}`);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
        setTransform(event.transform);
      });

    const drag = d3
      .drag<SVGGElement, PositionedNode>()
      .on("start", (event) => {
        d3.select(event.sourceEvent.target.parentNode).raise();
      })
      .on("drag", (event, d) => {
        setNetwork((prev) => ({
          ...prev,
          devices: prev.devices.map((device) =>
            device.id === d.id
              ? { ...device, position: { x: event.x, y: event.y } }
              : device,
          ),
        }));
      })
      .on("end", () => {
        setTransform((t) => t.translate(0, 0).scale(1).translate(0, 0));
      });

    svg.call(zoom);
    d3.selectAll<SVGGElement, PositionedNode>(".node-group").call(drag);

    const bounds = {
      minX: Math.min(...nodes.map((n) => n.x)),
      maxX: Math.max(...nodes.map((n) => n.x)),
      minY: Math.min(...nodes.map((n) => n.y)),
      maxY: Math.max(...nodes.map((n) => n.y)),
    };

    const graphWidth = bounds.maxX - bounds.minX;
    const graphHeight = bounds.maxY - bounds.minY;
    const graphCenterX = (bounds.minX + bounds.maxX) / 2;
    const graphCenterY = (bounds.minY + bounds.maxY) / 2;

    const svgWidth = svgRef.current.clientWidth;
    const svgHeight = svgRef.current.clientHeight;
    const svgCenterX = svgWidth / 2;
    const svgCenterY = svgHeight / 2;

    const scaleX = svgWidth / (graphWidth + 100);
    const scaleY = svgHeight / (graphHeight + 100);
    const scale = Math.min(scaleX, scaleY, 1);

    const initialTransform = d3.zoomIdentity
      .translate(svgCenterX, svgCenterY)
      .scale(scale)
      .translate(-graphCenterX, -graphCenterY);

    svg.call(zoom.transform, initialTransform);
  }, [nodes, setNetwork, graphRootId]);

  const labelData = useMemo(() => {
    const results: {
      key: string;
      text: string;
      x: number;
      y: number;
    }[] = [];

    edges.forEach((edge) => {
      const s = edge.sourceNode;
      const t = edge.targetNode;
      if (!s || !t) return;

      const { sx, sy, tx, ty } = computeEdgeEndpoints(
        s,
        t,
        edge.index,
        edge.total,
      );

      const labelOffset = 22;
      const perpOffset = edge.total > 1 ? 12 : 8;
      const dx = tx - sx;
      const dy = ty - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normX = dx / dist;
      const normY = dy / dist;

      const perpX = -normY;
      const perpY = normX;

      const edgeOffset = (edge.index - (edge.total - 1) / 2) * 6;
      const labelPerpOffset = perpOffset * Math.sign(edgeOffset || 1);

      const srcX = sx + normX * labelOffset + perpX * labelPerpOffset;
      const srcY = sy + normY * labelOffset + perpY * labelPerpOffset;

      const tgtX = tx - normX * labelOffset + perpX * labelPerpOffset;
      const tgtY = ty - normY * labelOffset + perpY * labelPerpOffset;

      results.push({
        key: `src-${edge.id}`,
        text: edge.sourceInterface,
        x: srcX * transform.k + transform.x,
        y: srcY * transform.k + transform.y,
      });
      results.push({
        key: `tgt-${edge.id}`,
        text: edge.targetInterface,
        x: tgtX * transform.k + transform.x,
        y: tgtY * transform.k + transform.y,
      });
    });

    return results;
  }, [edges, transform]);

  return (
    <div className="relative overflow-hidden rounded-md border bg-card">
      <div className="pointer-events-none absolute inset-0">
        {labelData.map((label) => (
          <div
            className="-translate-1/2 pointer-events-auto absolute cursor-default select-none whitespace-nowrap bg-accent px-0.5 text-accent-foreground tabular-nums shadow-sm hover:z-50 hover:scale-125"
            title={label.text}
            style={{
              left: `${label.x}px`,
              top: `${label.y}px`,
              fontSize: `${10 * transform.k}px`,
            }}
            key={label.key}
          >
            {label.text}
          </div>
        ))}
      </div>
      <svg className="aspect-[4/3] w-full" ref={svgRef}>
        <title>Network Visualization</title>
        <g id={graphRootId}>
          {edges.map((edge) => {
            const s = edge.sourceNode;
            const t = edge.targetNode;
            if (!s || !t) return null;

            const { sx, sy, tx, ty } = computeEdgeEndpoints(
              s,
              t,
              edge.index,
              edge.total,
            );

            return (
              <line
                className="stroke-muted-foreground/40"
                strokeWidth={1.5}
                x1={sx}
                y1={sy}
                x2={tx}
                y2={ty}
                key={edge.id}
              />
            );
          })}
          {nodes.map((node) => (
            <g
              className="node-group"
              transform={`translate(${node.x}, ${node.y})`}
              key={node.id}
            >
              <title>{node.name}</title>
              <circle className={getNodeColorClasses(node.deviceType)} r={12} />
              <text
                className="select-none fill-card-foreground font-medium text-xs"
                textAnchor="middle"
                dy={24}
              >
                {node.name}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
