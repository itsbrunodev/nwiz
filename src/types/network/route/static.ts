/**
 * Represents a single static IP route
 *
 * Defines how to reach a destination network that is not directly connected
 *
 * Example CLI command: `ip route 172.16.1.0 255.255.255.0 10.10.10.2`
 */
export interface StaticRoute {
  id: string;
  destinationNetwork: string;
  subnetMask: string;
  /**
   * Defines the forwarding path for the route.
   *
   * A route can be defined by pointing to the next router's IP address (`nextHop`)
   * or by specifying the local router's outgoing interface (`exitInterface`).
   */
  forwarding:
    | {
        type: "nextHop";
        address: string;
      }
    | {
        type: "exitInterface";
        interfaceName: string;
      };
  description?: string;
}
