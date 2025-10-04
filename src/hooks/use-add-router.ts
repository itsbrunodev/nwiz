import { useAtom } from "jotai";
import short from "short-uuid";

import { calculateDeviceName } from "@/lib/network";

import type { Router } from "@/types/network/device";

import { networkAtom } from "@/stores/network";

export function useAddRouter() {
  const [network, setNetwork] = useAtom(networkAtom);
  const devices = network.devices;

  return (model: Router["model"]) => {
    const deviceName = calculateDeviceName("Router", "Router", network.devices);

    setNetwork({
      ...network,
      devices: [
        ...devices,
        {
          id: short.generate(),
          name: deviceName,
          hostname: "Router",
          deviceType: "Router",
          model,
          config: {
            interfaces: [],
          },
        },
      ],
    });
  };
}
