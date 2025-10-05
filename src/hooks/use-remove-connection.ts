import { useAtom } from "jotai";

import { networkAtom } from "@/stores/network";

import type { Connection } from "@/types/network/connection";

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
