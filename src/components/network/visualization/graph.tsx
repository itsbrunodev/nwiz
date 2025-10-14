import * as d3 from "d3";
import { useAtom } from "jotai";
import { MaximizeIcon, RotateCwIcon, TagIcon } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

import { graphVisualizationAtom, networkAtom } from "@/stores/network";

import { aliasPortName } from "@/lib/network";
import { ensureNetworkLayout } from "@/lib/visualization/graph";

import type { Connection } from "@/types/network/connection";
import type { Device } from "@/types/network/device";

type PositionedNode = Device & { x: number; y: number };

interface ComputedEdge extends Connection {
  sourceNode: PositionedNode | undefined;
  targetNode: PositionedNode | undefined;
  sourceInterface: string;
  targetInterface: string;
  index: number;
  total: number;
}

interface LabelData {
  key: string;
  text: string;
  x: number;
  y: number;
  width: number;
}

const memoizedGetTextWidth = () => {
  const cache = new Map<string, number>();

  if (typeof document === "undefined") {
    return (text: string) => text.length * 6;
  }
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (context) {
    context.font = "10px sans-serif";
  }

  return (text: string) => {
    if (!context) return text.length * 6;

    if (cache.has(text)) {
      return cache.get(text) as number;
    }

    const width = context.measureText(text).width;
    cache.set(text, width);
    return width;
  };
};

function getNodeColorClasses(deviceType: string): string {
  switch (deviceType) {
    case "Router":
      return "fill-slate-500 dark:fill-slate-400 stroke-slate-600";
    case "Switch":
      return "fill-zinc-500 dark:fill-zinc-400 stroke-zinc-600";
    default:
      return "fill-stone-500 dark:fill-stone-400 stroke-stone-600";
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
  const [graphState, setGraphState] = useAtom(graphVisualizationAtom);

  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);

  const graphRootId = useId();
  const getTextWidth = useMemo(() => memoizedGetTextWidth(), []);

  useEffect(() => {
    const layout = ensureNetworkLayout(network);
    if (JSON.stringify(layout) !== JSON.stringify(network)) {
      setNetwork(layout);
    }
  }, [network, setNetwork]);

  const { nodes, edges } = useMemo(() => {
    const positionedNodes = (network.devices || [])
      .filter(
        (d): d is Device & { position: { x: number; y: number } } =>
          d.position?.x !== undefined && d.position?.y !== undefined,
      )
      .map((d) => ({
        ...d,
        x: d.position.x,
        y: d.position.y,
      })) as PositionedNode[];

    const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));

    const grouped = new Map<string, Connection[]>();

    (network.connections || []).forEach((edge) => {
      const key1 = `${edge.from.deviceId}-${edge.to.deviceId}`;
      const key2 = `${edge.to.deviceId}-${edge.from.deviceId}`;
      const key = key1 < key2 ? key1 : key2;

      if (!grouped.has(key)) grouped.set(key, []);

      grouped.get(key)?.push(edge);
    });

    const allEdges: ComputedEdge[] = [];

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

  const getFitTransform = useCallback(() => {
    if (!svgRef.current || nodes.length === 0) return d3.zoomIdentity;

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

    return d3.zoomIdentity
      .translate(svgCenterX, svgCenterY)
      .scale(scale)
      .translate(-graphCenterX, -graphCenterY);
  }, [nodes]);

  const handleRecenter = () => {
    const svg = d3.select(svgRef.current);
    const zoom = zoomRef.current;
    if (!svg || !zoom) return;

    const newTransform = getFitTransform();
    if (newTransform) {
      svg
        .transition()
        .duration(300)
        .call(zoom.transform as any, newTransform);
    }
  };

  const handleResimulate = () => {
    setNetwork((prev) => ({
      ...prev,
      devices: prev.devices.map((device) => ({
        ...device,
        position: undefined,
      })),
    }));

    toast.success("Successfully resimulated network.");
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>(`g#${graphRootId}`);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      });

    zoomRef.current = zoom;

    const drag = d3
      .drag<SVGGElement, PositionedNode>()
      .on(
        "start",
        (event: d3.D3DragEvent<SVGGElement, PositionedNode, any>) => {
          d3.select(event.sourceEvent.target.parentNode).raise();
        },
      )
      .on("drag", (event, d) => {
        setNetwork((prev) => ({
          ...prev,
          devices: prev.devices.map((device) =>
            device.id === d.id
              ? { ...device, position: { x: event.x, y: event.y } }
              : device,
          ),
        }));
      });

    svg.call(zoom);
    d3.selectAll<SVGGElement, PositionedNode>(".node-group").call(drag);

    const initialTransform = getFitTransform();
    if (initialTransform) {
      svg.call(zoom.transform, initialTransform);
    }
  }, [nodes, setNetwork, graphRootId, getFitTransform]);

  const labelData = useMemo(() => {
    const results: LabelData[] = [];

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

      const sourceText = edge.sourceInterface;
      const targetText = edge.targetInterface;

      results.push({
        key: `src-${edge.id}`,
        text: sourceText,
        x: srcX,
        y: srcY,
        width: getTextWidth(sourceText),
      });

      results.push({
        key: `tgt-${edge.id}`,
        text: targetText,
        x: tgtX,
        y: tgtY,
        width: getTextWidth(targetText),
      });
    });

    return results;
  }, [edges, getTextWidth]);

  return (
    <div className="relative overflow-hidden rounded-md border bg-card">
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
              <title>
                {node.model}
                {"\n"}
                {node.name}
              </title>
              <circle className={getNodeColorClasses(node.deviceType)} r={12} />
              <text
                className="pointer-events-none select-none fill-card-foreground text-[10px]"
                textAnchor="middle"
                dy={24}
              >
                {node.model}
              </text>
              <text
                className="pointer-events-none select-none fill-card-foreground text-[10px]"
                textAnchor="middle"
                dy={36}
              >
                {node.name}
              </text>
            </g>
          ))}
          {graphState.showPortLabels &&
            labelData.map((label) => {
              const displayText =
                label.text.length > 14
                  ? `${label.text.slice(0, 9)}…`
                  : label.text;

              const rectWidth = label.width + 6;
              const rectHeight = 14;
              const rectX = -rectWidth / 2;
              const rectY = -rectHeight / 2;

              return (
                <g
                  className="cursor-default"
                  transform={`translate(${label.x}, ${label.y})`}
                  key={label.key}
                >
                  <title>{label.text}</title>
                  <rect
                    className="fill-accent"
                    x={rectX}
                    y={rectY}
                    width={rectWidth}
                    height={rectHeight}
                  />
                  <text
                    className="pointer-events-none select-none fill-accent-foreground text-[10px] text-xs"
                    textAnchor="middle"
                    dy=".3em"
                  >
                    {displayText}
                  </text>
                </g>
              );
            })}
        </g>
      </svg>
      <ButtonGroup className="absolute bottom-3 left-3" orientation="vertical">
        <Button
          variant={graphState.showPortLabels ? "default" : "secondary"}
          size="icon"
          aria-label="Toggle Port Labels"
          title="Toggle Port Labels"
          onClick={() =>
            setGraphState((prev) => ({
              ...prev,
              showPortLabels: !prev.showPortLabels,
            }))
          }
        >
          <TagIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Resimulate"
          title="Resimulate"
          onClick={handleResimulate}
        >
          <RotateCwIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Recenter"
          title="Recenter"
          onClick={handleRecenter}
        >
          <MaximizeIcon className="h-4 w-4" />
        </Button>
      </ButtonGroup>
    </div>
  );
}
