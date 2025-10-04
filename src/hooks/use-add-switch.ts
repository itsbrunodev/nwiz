import { useAtom } from "jotai";
import short from "short-uuid";

import { calculateDeviceName } from "@/lib/network";

import type { Switch } from "@/types/network/device";

import { networkAtom } from "@/stores/network";

export function useAddSwitch() {
  const [network, setNetwork] = useAtom(networkAtom);
  const devices = network.devices;

  return (model: Switch["model"]) => {
    const deviceName = calculateDeviceName("Switch", "Switch", network.devices);

    setNetwork({
      ...network,
      devices: [
        ...devices,
        {
          id: short.generate(),
          name: deviceName,
          hostname: "Switch",
          deviceType: "Switch",
          model,
          config: {
            vlans: [],
            interfaces: [],
          },
        },
      ],
    });
  };
}
