export interface EndDeviceConfig {
  ipAddress: string;
  subnetMask: string;
  defaultGateway: string;
  dnsServer?: string;
}

export interface ServerConfig extends EndDeviceConfig {
  services?: {
    http?: { enabled: boolean };
    dns?: DnsService;
  };
}

export interface DnsService {
  enabled: boolean;
  records: DnsRecord[];
}

export interface DnsRecord {
  // todo: add more record types
  type: "A";
  /**
   * Domain name
   * @example "zserbo.hu"
   */
  name: string;
  /**
   * IP address the record points to
   */
  address: string;
}
