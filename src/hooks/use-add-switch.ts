import { useAtom } from "jotai";
import short from "short-uuid";

import { networkAtom } from "@/stores/network";

import { calculateDeviceName } from "@/lib/network";

import type { Switch } from "@/types/network/device";

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
