import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import type { Device } from "@/types/network/device";

import { Button } from "../ui/button";
import { HighlightedPre } from "../ui/highlighted-pre";
import { Label } from "../ui/label";

export function Commands({
  commandsMap,
  devices,
}: {
  commandsMap: Map<string, string[]>;
  devices: Device[];
}) {
  const deviceNameMap = new Map<string, string>();
  devices.forEach((device) => {
    deviceNameMap.set(device.id, device.name || device.hostname);
  });

  const commandEntries = Array.from(commandsMap.entries());

  if (commandEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {commandEntries.map(([deviceId, commands]) => {
        const deviceName =
          deviceNameMap.get(deviceId) || `Device ID: ${deviceId}`;

        const commandString = commands.join("\n");

        return (
          <div className="relative" key={deviceId}>
            <div className="rounded-t-md border-x border-t bg-card p-3 text-card-foreground">
              <Label>{deviceName}</Label>
            </div>
            <HighlightedPre className="min-h-16 rounded-t-none">
              {commandString}
            </HighlightedPre>
            <Button
              className="absolute top-13 right-3"
              variant="secondary"
              size="icon"
              aria-label="Copy to clipboard"
              onClick={() => {
                navigator.clipboard.writeText(commandString);
                toast.success("Copied to clipboard.");
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
