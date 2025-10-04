import { useAtom } from "jotai";

import type { Connection } from "@/types/network/connection";

import { networkAtom } from "@/stores/network";

export function useAddConnection(): (connection: Connection) => void {
  const [network, setNetwork] = useAtom(networkAtom);

  function addConnection(connection: Connection) {
    setNetwork({
      ...network,
      connections: [...network.connections, connection],
    });
  }

  return addConnection;
}
