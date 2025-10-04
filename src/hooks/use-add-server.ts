import { useAtom } from "jotai";
import short from "short-uuid";

import { calculateDeviceName } from "@/lib/network";

import { networkAtom } from "@/stores/network";

export function useAddServer() {
  const [network, setNetwork] = useAtom(networkAtom);
  const devices = network.devices;

  return () => {
    const deviceName = calculateDeviceName("Server", "Server", devices);

    setNetwork({
      ...network,
      devices: [
        ...devices,
        {
          id: short.generate(),
          name: deviceName,
          hostname: deviceName,
          deviceType: "Server",
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
