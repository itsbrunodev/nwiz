import type { StaticRoute } from "../route/static";
import type {
  ConsoleLineConfig,
  EnableSecretConfig,
  VtyLineConfig,
} from "./password";
import type { AccessControlList, SshConfig } from "./ssh";
import type { LocalUser } from "./user";

export interface RouterConfig {
  interfaces: RouterInterface[];
  dhcpPools?: DHCPPool[];
  staticRoutes?: StaticRoute[];
  accessLists?: AccessControlList[];
  motd?: {
    content: string;
    wrapper: string;
  };
  // security
  localUsers?: LocalUser[];
  domainName?: string;
  ssh?: SshConfig;
  encryptPasswords?: boolean;
  saveConfiguration?: boolean;
  enableSecret?: EnableSecretConfig;
  lineConsole?: ConsoleLineConfig;
  lineVty?: VtyLineConfig;
  lineAux?: ConsoleLineConfig;
}

export interface RouterInterface {
  /**
   * Name of the interface
   * @example "GigabitEthernet0/0"
   */
  name: string;
  description?: string;
  /**
   * Whether the interface is enabled (no shutdown)
   */
  enabled: boolean;
  ipAddress?: string;
  subnetMask?: string;
  subInterfaces?: SubInterface[];
}

export interface SubInterface {
  /**
   * Name of the sub-interface
   * @example 10 // GigabitEthernet0/0.10
   */
  vlanId: number;
  description?: string;
  encapsulation: "dot1Q";
  ipAddress: string;
  subnetMask: string;
}

export interface DHCPPool {
  name: string;
  network: string;
  subnetMask: string;
  /**
   * The gateway for clients to reach the router
   */
  defaultRouter: string;
  dnsServer?: string;
  excludedAddresses?: string[];
}
