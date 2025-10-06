import type {
  ConsoleLineConfig,
  EnableSecretConfig,
  VtyLineConfig,
} from "./password";
import type { AccessControlList, SshConfig } from "./ssh";
import type { LocalUser } from "./user";

export interface SwitchConfig {
  vlans: VLAN[];
  interfaces: SwitchInterface[];
  accessLists?: AccessControlList[];
  defaultGateway?: string;
  // security
  localUsers?: LocalUser[];
  domainName?: string;
  ssh?: SshConfig;
  encryptPasswords?: boolean;
  saveConfiguration?: boolean;
  enableSecret?: EnableSecretConfig;
  lineConsole?: ConsoleLineConfig;
  lineVty?: VtyLineConfig;
}

export interface VLAN {
  id: number;
  name: string;
}

export interface SwitchInterface {
  name: string; // e.g., "FastEthernet0/1"
  description?: string;
  enabled: boolean;
  mode: "access" | "trunk";

  // Properties for access mode
  accessVlan: number;

  // Properties for trunk mode
  nativeVlan?: number;
  allowedVlans?: "all" | number[];
}
