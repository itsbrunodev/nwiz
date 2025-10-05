import type { VtyLineConfig } from "@/types/network/config/password";

export const generateLineVtyCommands = (
  vty?: VtyLineConfig,
  isSshEnabled?: boolean,
): string[] => {
  if (!vty) return [];
  if (!isSshEnabled && !vty.password) return [];

  const commands = [`line vty ${vty.from} ${vty.to}`];
  if (isSshEnabled) {
    commands.push("  transport input ssh", "  login local");
  } else if (vty.password) {
    commands.push(`  password ${vty.password}`, "  login");
  }

  if (vty.accessClass) commands.push(`  access-class ${vty.accessClass} in`);
  commands.push("  exit");
  return commands;
};
