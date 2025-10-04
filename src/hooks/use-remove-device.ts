import { useAtom } from "jotai";

import { networkAtom } from "@/stores/network";

export function useRemoveDevice(deviceId: string): () => void {
  const [network, setNetwork] = useAtom(networkAtom);

  return function removeDevice() {
    const newDevices = network.devices.filter((d) => d.id !== deviceId);
    const newConnections = network.connections.filter(
      (c) => c.from.deviceId !== deviceId && c.to.deviceId !== deviceId,
    );

    setNetwork({
      ...network,
      devices: newDevices,
      connections: newConnections,
    });
  };
}
