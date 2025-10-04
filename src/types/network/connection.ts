/**
 * Represents a physical or logical connection between two device interfaces.
 */
export interface Connection {
  id: string;
  from: ConnectionPoint;
  to: ConnectionPoint;
}

export interface ConnectionPoint {
  /**
   * ID of the device this connection point belongs to
   */
  deviceId: string;
  /**
   * Name of the interface
   * @example "GigabitEthernet0/0"
   */
  interfaceName: string;
}
