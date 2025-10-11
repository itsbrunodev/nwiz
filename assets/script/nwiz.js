// Scans the workspace and returns a single JSON object containing a list of all devices and all connections, ready for import.
function getWorkspaceTopology() {
  const net = ipc.network();
  const allDevices = [];
  const connections = [];

  const devCount = net.getDeviceCount();
  const linkCount = net.getLinkCount();

  // portuuidtoinfo map will store: { port_uuid -> { deviceid: "...", interfacename: "..." } }
  const portUuidToInfo = {};

  for (let i = 0; i < devCount; i++) {
    const device = net.getDeviceAt(i);

    if (!device) continue;

    const deviceId = device.getObjectUuid();
    const deviceName = device.getName();
    const deviceModel = device.getModel();

    allDevices.push({
      id: deviceId,
      name: deviceName,
      model: deviceModel,
    });

    const portCount = device.getPortCount();

    for (let j = 0; j < portCount; j++) {
      const port = device.getPortAt(j);

      if (port && typeof port.getObjectUuid === "function") {
        const portUuid = port.getObjectUuid();

        portUuidToInfo[portUuid] = {
          deviceId: deviceId,
          interfaceName: port.getName(),
        };
      }
    }
  }

  for (let k = 0; k < linkCount; k++) {
    const link = net.getLinkAt(k);

    if (!link) continue;

    let port1;
    let port2;

    if (typeof link.getPort1 === "function") {
      port1 = link.getPort1();
      port2 = link.getPort2();
    } else if (typeof link.getStartPort === "function") {
      port1 = link.getStartPort();
      port2 = link.getEndPort();
    } else if (typeof link.getSourcePort === "function") {
      port1 = link.getSourcePort();
      port2 = link.getDestinationPort();
    } else {
      continue;
    }

    if (
      !port1 ||
      !port2 ||
      typeof port1.getObjectUuid !== "function" ||
      typeof port2.getObjectUuid !== "function"
    ) {
      continue;
    }

    const port1Uuid = port1.getObjectUuid();
    const port2Uuid = port2.getObjectUuid();

    const connectionPoint1 = portUuidToInfo[port1Uuid];
    const connectionPoint2 = portUuidToInfo[port2Uuid];

    if (connectionPoint1 && connectionPoint2) {
      const newConnection = {
        id: `connection-${k}`,
        from: connectionPoint1,
        to: connectionPoint2,
      };

      connections.push(newConnection);
    }
  }

  // create a set of all device ids that are part of a connection
  const connectedDeviceIds = new Set();

  connections.forEach((conn) => {
    connectedDeviceIds.add(conn.from.deviceId);
    connectedDeviceIds.add(conn.to.deviceId);
  });

  // filter the original devices list to include only those that are connected
  const connectedDevices = allDevices.filter((dev) => {
    return connectedDeviceIds.has(dev.id);
  });

  return {
    devices: connectedDevices,
    connections: connections,
  };
}

console.log(JSON.stringify(getWorkspaceTopology(), null, 2));
