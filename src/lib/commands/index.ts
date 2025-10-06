import type { Network } from "@/types/network";

import { generateRouterCommands } from "./devices/router";
import { generateSwitchCommands } from "./devices/switch";
import { type CommandGenerationOptions, createLogger, logger } from "./types";

/**
 * Converts a network data structure into a map of Cisco IOS commands.
 */
export function generateCommands(
  network: Network,
  options: CommandGenerationOptions = {},
): Map<string, string[]> {
  createLogger(options.verbose || false);

  logger("Starting command generation process...");

  const networkCopy: Network = JSON.parse(JSON.stringify(network));

  const allCommands = new Map<string, string[]>();

  for (const device of networkCopy.devices) {
    let deviceCommands: string[] = [];

    switch (device.deviceType) {
      case "Router": {
        deviceCommands = generateRouterCommands(
          device,
          networkCopy.connections,
        );
        break;
      }
      case "Switch": {
        deviceCommands = generateSwitchCommands(
          device,
          networkCopy.connections,
        );
        break;
      }
      default: {
        continue;
      }
    }
    if (deviceCommands.length > 0) {
      allCommands.set(device.id, deviceCommands);
    }
  }

  logger("Command generation process finished.");
  return allCommands;
}
