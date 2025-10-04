import { useAtom } from "jotai";

import { Button } from "../ui/button";
import { INITIAL_NETWORK, networkAtom } from "@/stores/network";

export function ResetNetworkButton() {
  const [network, setNetwork] = useAtom(networkAtom);

  return (
    <Button
      variant="destructive"
      onClick={() => setNetwork(INITIAL_NETWORK)}
      disabled={
        network.connections.length === 0 && network.devices.length === 0
      }
    >
      Reset Network
    </Button>
  );
}
