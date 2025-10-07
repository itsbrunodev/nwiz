import type { Network } from "@/types/network";
import type { Device, EndDevice, Router, Switch } from "@/types/network/device";

function createGatewayToVlanMap(routers: Router[]): Map<string, number> {
  const gatewayMap = new Map<string, number>();

  for (const router of routers) {
    for (const iface of router.config.interfaces) {
      if (iface.ipAddress) {
        gatewayMap.set(iface.ipAddress, 1);
      }

      if (iface.subInterfaces) {
        for (const sub of iface.subInterfaces) {
          if (sub.ipAddress) {
            gatewayMap.set(sub.ipAddress, sub.vlanId);
          }
        }
      }
    }
  }

  return gatewayMap;
}

export function addAutoSwitchport(network: Network): Network {
  const networkCopy: Network = JSON.parse(JSON.stringify(network));

  const deviceMap = new Map<string, Device>(
    networkCopy.devices.map((d) => [d.id, d]),
  );

  const routers = networkCopy.devices.filter(
    (d): d is Router => d.deviceType === "Router",
  );

  const switches = networkCopy.devices.filter(
    (d): d is Switch => d.deviceType === "Switch",
  );

  const gatewayToVlanMap = createGatewayToVlanMap(routers);

  for (const sw of switches) {
    for (const iface of sw.config.interfaces) {
      const connection = networkCopy.connections.find(
        (c) =>
          (c.from.deviceId === sw.id && c.from.interfaceName === iface.name) ||
          (c.to.deviceId === sw.id && c.to.interfaceName === iface.name),
      );

      if (!connection) continue;

      const otherEndId =
        connection.from.deviceId === sw.id
          ? connection.to.deviceId
          : connection.from.deviceId;
      const connectedDevice = deviceMap.get(otherEndId);

      if (!connectedDevice) continue;

      switch (connectedDevice.deviceType) {
        case "Router":
        case "Switch":
          iface.mode = "trunk";
          break;
        case "PC":
        case "Server":
        case "Laptop":
          {
            iface.mode = "access";
            const endDevice = connectedDevice as EndDevice;
            const gatewayIp = endDevice.config.defaultGateway;
            if (gatewayIp && gatewayToVlanMap.has(gatewayIp)) {
              iface.accessVlan = gatewayToVlanMap.get(gatewayIp) ?? 1;
            } else {
              iface.accessVlan = 1; // default to VLAN 1 if gateway is unknown
            }
          }
          break;
      }
    }
  }

  return networkCopy;
}
