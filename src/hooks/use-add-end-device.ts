import { useAtom } from "jotai";
import short from "short-uuid";

import { networkAtom } from "@/stores/network";

import { calculateDeviceName } from "@/lib/network";

import type { EndDevice } from "@/types/network/device";

function createEndDevice(deviceType: EndDevice["deviceType"]): EndDevice {
  const model = `${deviceType}-PT` as const;

  return {
    id: short.generate(),
    name: "",
    hostname: "",
    deviceType,
    model,
    config: {
      ipAddress: "",
      subnetMask: "",
      defaultGateway: "",
    },
  } as EndDevice;
}

export function useAddEndDevice() {
  const [network, setNetwork] = useAtom(networkAtom);
  const devices = network.devices;

  return (deviceType: EndDevice["deviceType"]) => {
    const deviceName = calculateDeviceName(deviceType, deviceType, devices);

    const newDevice = createEndDevice(deviceType);
    newDevice.name = deviceName;
    newDevice.hostname = deviceName;

    setNetwork({
      ...network,
      devices: [...devices, newDevice],
    });
  };
}
