import { useAtom } from "jotai";
import short from "short-uuid";

import { networkAtom } from "@/stores/network";

import { calculateDeviceName } from "@/lib/network";

import type { EndDevice } from "@/types/network/device";

export function useAddEndDevice() {
  const [network, setNetwork] = useAtom(networkAtom);
  const devices = network.devices;

  return (deviceType: EndDevice["deviceType"]) => {
    const deviceName = calculateDeviceName(deviceType, deviceType, devices);

    setNetwork({
      ...network,
      devices: [
        ...devices,
        {
          id: short.generate(),
          name: deviceName,
          hostname: deviceName,
          deviceType,
          config: {
            ipAddress: "",
            subnetMask: "",
            defaultGateway: "",
          },
        },
      ],
    });
  };
}
