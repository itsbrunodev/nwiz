import type { SshConfig } from "@/types/network/config/ssh";

export const generateSshCommands = (
  ssh?: SshConfig,
  domainName?: string,
): string[] => {
  if (!ssh) return [];
  const commands = [
    `ip domain-name ${domainName || "example.com"}`,
    `crypto key generate rsa general-keys modulus ${ssh.rsaKey.modulus}`,
    `ip ssh version ${ssh.version}`,
  ];
  if (ssh.timeout) commands.push(`ip ssh time-out ${ssh.timeout}`);
  if (ssh.authenticationRetries)
    commands.push(`ip ssh authentication-retries ${ssh.authenticationRetries}`);
  return commands;
};
