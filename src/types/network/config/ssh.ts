/**
 * Represents a rule within a standard numbered Access Control List.
 */
export interface AclRule {
  id: string; // Unique ID for UI list management
  action: "permit" | "deny";
  sourceAddress: string; // The network address (e.g., "10.10.10.0")
  sourceWildcard: string; // The wildcard mask (e.g., "0.0.0.255")
}

/**
 * Represents a standard numbered Access Control List (ACL).
 */
export interface AccessControlList {
  id: number; // The ACL number (e.g., 23). Standard lists are 1-99.
  rules: AclRule[];
}

/**
 * Defines the parameters for generating an RSA key pair, which is required for SSH.
 *
 * Corresponds to `crypto key generate rsa`.
 */
export interface SshRsaKeyConfig {
  /**
   * The size of the key in bits.
   */
  modulus: 1024 | 2048 | 4096;
}

/**
 * Represents an SSH user authenticated via their public key.
 *
 * Corresponds to `ip ssh pubkey-chain`.
 */
export interface SshUserPublicKey {
  username: string;
  /**
   * The user's public RSA key, pasted as a single long string.
   */
  keyString: string;
}

export interface SshConfig {
  /**
   * Enforces the use of the more secure SSH Version 2.
   *
   * Corresponds to `ip ssh version 2`.
   */
  version: 2;
  /**
   * The configuration for the RSA key pair needed to enable SSH.
   */
  rsaKey: SshRsaKeyConfig;
  /**
   * The time in seconds to wait for a user to authenticate.
   *
   * Corresponds to `ip ssh time-out <seconds>`.
   */
  timeout?: number;
  /**
   * The number of authentication attempts allowed.
   *
   * Corresponds to `ip ssh authentication-retries <integer>`.
   */
  authenticationRetries?: number;
  /**
   * A list of users who can authenticate using RSA public keys instead of passwords.
   */
  userPublicKeys?: SshUserPublicKey[];
}
