import { useAtom } from "jotai";

import { networkAtom } from "@/stores/network";

import type { Device } from "@/types/network/device";

export function useDevices(): [Device[], (devices: Device[]) => void] {
  const [network, setNetwork] = useAtom(networkAtom);

  function setDevices(devices: Device[]) {
    setNetwork({
      ...network,
      devices,
    });
  }

  return [network.devices, setDevices];
}
