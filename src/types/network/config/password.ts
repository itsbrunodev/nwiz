export interface EnableSecretConfig {
  password: string;
}

/**
 * Represents the configuration for a single access line like the console or auxiliary port.
 *
 * Corresponds to `line con 0` or `line aux 0`.
 */
export interface ConsoleLineConfig {
  password: string;
}

/**
 * Represents the configuration for the virtual terminal (VTY) lines used for remote access (Telnet/SSH).
 *
 * Corresponds to `line vty 0 4`.
 */
export interface VtyLineConfig {
  password: string;
  /**
   * The range of VTY lines to apply this configuration to.
   */
  from: number;
  to: number;
  /**
   * The ID of a configured AccessControlList to apply to these lines.
   *
   * Restricts which IP addresses can connect.
   *
   * Corresponds to `access-class <id> in`.
   */
  accessClass?: number;
}
