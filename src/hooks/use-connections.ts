import { useAtom } from "jotai";

import { networkAtom } from "@/stores/network";

import type { Connection } from "@/types/network/connection";

export function useConnections(): [
  Connection[],
  (connections: Connection[]) => void,
] {
  const [network, setNetwork] = useAtom(networkAtom);

  function setConnections(connections: Connection[]) {
    setNetwork({
      ...network,
      connections,
    });
  }

  return [network.connections, setConnections];
}
