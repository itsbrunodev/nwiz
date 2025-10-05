import { useAtom } from "jotai";
import short from "short-uuid";

import { networkAtom } from "@/stores/network";

import { calculateDeviceName } from "@/lib/network";

export function useAddPc() {
  const [network, setNetwork] = useAtom(networkAtom);
  const devices = network.devices;

  return () => {
    const deviceName = calculateDeviceName("PC", "PC", devices);

    setNetwork({
      ...network,
      devices: [
        ...devices,
        {
          id: short.generate(),
          name: deviceName,
          hostname: deviceName,
          deviceType: "PC",
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
