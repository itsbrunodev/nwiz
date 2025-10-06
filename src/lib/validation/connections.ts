import type { Network } from "@/types/network";
import type { Device, EndDevice, Router, Switch } from "@/types/network/device";

import { MESSAGES, type ValidationResult } from "./types";
import { getSubnet } from "./utils";

export function validateConnections(
  network: Network,
  deviceMap: Map<string, Device>,
  routers: Router[],
): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const connection of network.connections) {
    const dev1 = deviceMap.get(connection.from.deviceId);
    const dev2 = deviceMap.get(connection.to.deviceId);
    if (!dev1 || !dev2) continue;

    const endDevice = [dev1, dev2].find((d) =>
      ["PC", "Server", "Laptop"].includes(d.deviceType),
    ) as EndDevice | undefined;
    const switchDevice = [dev1, dev2].find((d) => d.deviceType === "Switch") as
      | Switch
      | undefined;

    if (!endDevice || !switchDevice) continue;

    const switchIntName =
      switchDevice.id === dev1.id
        ? connection.from.interfaceName
        : connection.to.interfaceName;
    const switchInterface = switchDevice.config.interfaces.find(
      (i) => i.name === switchIntName,
    );

    if (switchInterface?.mode !== "access") continue;

    const accessVlanId = switchInterface.accessVlan;
    const {
      ipAddress: pcIp,
      subnetMask: pcMask,
      defaultGateway: pcGateway,
    } = endDevice.config;
    let vlanGatewayInterface: { ipAddress: string; subnetMask: string } | null =
      null;

    for (const router of routers) {
      for (const iface of router.config.interfaces) {
        const subIface = iface.subInterfaces?.find(
          (sub) => sub.vlanId === accessVlanId,
        );
        if (subIface) {
          vlanGatewayInterface = subIface;
          break;
        }
      }
      if (vlanGatewayInterface) break;
    }

    if (vlanGatewayInterface) {
      const vlanSubnet = getSubnet(
        vlanGatewayInterface.ipAddress,
        vlanGatewayInterface.subnetMask,
      );
      if (pcIp && pcMask && vlanSubnet) {
        const pcSubnet = getSubnet(pcIp, pcMask);
        if (pcSubnet && pcSubnet !== vlanSubnet) {
          results.push({
            level: "error",
            message: MESSAGES.DEVICE_VLAN_MISMATCH(
              accessVlanId,
              vlanSubnet,
              pcIp,
              pcSubnet,
            ),
            source: { deviceId: endDevice.id, deviceName: endDevice.name },
          });
        }
      }
      if (pcGateway && pcGateway !== vlanGatewayInterface.ipAddress) {
        results.push({
          level: "error",
          message: MESSAGES.INCORRECT_GATEWAY_VLAN(
            accessVlanId,
            pcGateway,
            vlanGatewayInterface.ipAddress,
          ),
          source: { deviceId: endDevice.id, deviceName: endDevice.name },
        });
      }
    }
  }

  return results;
}
