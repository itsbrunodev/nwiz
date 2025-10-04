import { atomWithStorage } from "jotai/utils";
import short from "short-uuid";

import type { Network } from "@/types/network";

export const INITIAL_NETWORK: Network = {
  id: short.generate(),
  devices: [],
  connections: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const networkAtom = atomWithStorage<Network>("network", INITIAL_NETWORK);
