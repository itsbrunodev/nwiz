export interface PacketTracerTopology {
  devices: {
    id: string; // The UUID from Packet Tracer
    name: string; // The device name, e.g., "Router0"
  }[];
  connections: {
    id: string;
    from: {
      deviceId: string; // The UUID from Packet Tracer
      interfaceName: string;
    };
    to: {
      deviceId: string; // The UUID from Packet Tracer
      interfaceName: string;
    };
  }[];
}
