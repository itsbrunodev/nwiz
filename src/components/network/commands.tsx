import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import type { Device } from "@/types/network/device";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Pre } from "../ui/pre";

export function Commands({
  commandsMap,
  devices,
}: {
  commandsMap: Map<string, string[]>;
  devices: Device[];
}) {
  // Create a quick-lookup map for finding devices by their ID
  const deviceNameMap = new Map<string, string>();
  devices.forEach((device) => {
    deviceNameMap.set(device.id, device.name || device.hostname);
  });

  // Convert the map to an array to easily render it
  const commandEntries = Array.from(commandsMap.entries());

  if (commandEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {commandEntries.map(([deviceId, commands]) => {
        // Find the device name, or use the ID as a fallback
        const deviceName =
          deviceNameMap.get(deviceId) || `Device ID: ${deviceId}`;

        // Join the commands into a single string with newlines for the <pre> tag
        const commandString = commands.join("\n");

        return (
          <div className="relative" key={deviceId}>
            <div className="rounded-t-md border-x border-t bg-accent p-3">
              <Label>{deviceName}</Label>
            </div>
            <Pre className="rounded-t-none">{commandString}</Pre>
            <Button
              className="absolute top-13 right-3"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(commandString);
                toast.success("Copied to clipboard");
              }}
            >
              <CopyIcon />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
