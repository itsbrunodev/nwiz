import { useAtom } from "jotai";

import type { Device } from "@/types/network/device";

import { networkAtom } from "@/stores/network";

export function useDevice<T extends Device>(
  deviceId: string,
): [T, (device: T) => void] {
  const [network, setNetwork] = useAtom(networkAtom);

  function setDevice(device: T) {
    setNetwork({
      ...network,
      devices: network.devices.map((d) => (d.id === deviceId ? device : d)),
    });
  }

  return [network.devices.find((d) => d.id === deviceId) as T, setDevice];
}
