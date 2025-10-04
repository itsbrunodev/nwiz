import { useAtom } from "jotai";

import type { Device } from "@/types/network/device";

import { networkAtom } from "@/stores/network";

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
