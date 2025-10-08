import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { Pre } from "@/components/ui/pre";

import { networkAtom } from "@/stores/network";

import { createNetworkTree } from "@/lib/visualization/tree";

export function NetworkVisualizationTree() {
  const network = useAtomValue(networkAtom);

  const tree = useMemo(() => {
    return createNetworkTree(network);
  }, [network]);

  return <Pre>{tree}</Pre>;
}
