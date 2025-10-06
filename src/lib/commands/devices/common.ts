import type { Router, Switch } from "@/types/network/device";

import { generateAclCommands } from "../features/acl";
import { generateSshCommands } from "../features/ssh";
import { generateLocalUserCommands } from "../features/user";
import { generateLineVtyCommands } from "../features/vty";

export function generateBaseDeviceCommands(device: Router | Switch): string[] {
  const { config, hostname } = device;
  const commands: string[] = [];

  commands.push("enable", "configure terminal", `hostname ${hostname}`);

  if (config.encryptPasswords) commands.push("service password-encryption");

  commands.push("no ip domain-lookup");

  if (config.enableSecret?.password)
    commands.push(`enable secret ${config.enableSecret.password}`);

  commands.push(...generateLocalUserCommands(config.localUsers));
  commands.push(...generateSshCommands(config.ssh, config.domainName));
  commands.push(...generateAclCommands(config.accessLists));

  if (config.lineConsole?.password)
    commands.push(
      "line con 0",
      `  password ${config.lineConsole.password}`,
      "  login",
      "  exit",
    );

  commands.push(...generateLineVtyCommands(config.lineVty, !!config.ssh));
  return commands;
}
