import type { RouterModel, SwitchModel } from "@/constants/devices";

import type { EndDeviceConfig, ServerConfig } from "./config/end-device";
import type { RouterConfig } from "./config/router";
import type { SwitchConfig } from "./config/switch";

interface BaseDevice {
  id: string;
  /**
   * Name shown in the UI
   */
  name: string;
  /**
   * Name shown in the CLI
   */
  hostname: string;
  position?: { x?: number; y?: number };
}

export type EndDevice = PC | Server | Laptop;
export type Device = Router | Switch | EndDevice;

export interface Router extends BaseDevice {
  deviceType: "Router";
  model: RouterModel;
  config: RouterConfig;
}

export interface Switch extends BaseDevice {
  deviceType: "Switch";
  model: SwitchModel;
  config: SwitchConfig;
}

export interface PC extends BaseDevice {
  deviceType: "PC";
  config: EndDeviceConfig;
}

export interface Server extends BaseDevice {
  deviceType: "Server";
  config: ServerConfig;
}

export interface Laptop extends BaseDevice {
  deviceType: "Laptop";
  config: EndDeviceConfig;
}
