import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import short from "short-uuid";

import { validateNetwork } from "@/lib/validation";
import type { ValidationResult } from "@/lib/validation/types";

import type { Network } from "@/types/network";

export const INITIAL_NETWORK: Network = {
  id: short.generate(),
  devices: [],
  connections: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const networkAtom = atomWithStorage<Network>("network", INITIAL_NETWORK);

export const validationAtom = atom<ValidationResult[]>((get) => {
  const currentNetwork = get(networkAtom);
  return validateNetwork(currentNetwork);
});

export const VISUALIZATION_TYPES = [
  { label: "Graph", value: "graph" },
  { label: "Tree", value: "tree" },
] as const;

export const networkVisualizationAtom = atomWithStorage<
  (typeof VISUALIZATION_TYPES)[number]["value"]
>("network-visualization", "graph");

const INITIAL_GRAPH_VISUALIZATION = {
  showPortLabels: true,
};

export const graphVisualizationAtom = atomWithStorage<
  typeof INITIAL_GRAPH_VISUALIZATION
>("graph-visualization", INITIAL_GRAPH_VISUALIZATION);
