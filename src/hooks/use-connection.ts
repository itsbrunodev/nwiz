/* import { useAtom } from "jotai";

import type { Connection } from "@/types/network/connection";

import { networkAtom } from "@/stores/network";

export function useConnection(
  connectionId: string,
): [Connection, (connection: Connection) => void] {
  const [network, setNetwork] = useAtom(networkAtom);

  function setConnection(connection: Connection) {
    setNetwork({
      ...network,
      connections: network.connections.map((c) =>
        c.id === connection.id ? connection : c,
      ),
    });
  }

  return [
    network.connections.find((c) => c.id === connectionId),
    setConnections,
  ];
}
 */
