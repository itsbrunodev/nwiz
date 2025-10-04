import type { Connection } from "./connection";
import type { Device } from "./device";

export interface Network {
  id: string;
  name?: string;
  description?: string;
  devices: Device[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
}
