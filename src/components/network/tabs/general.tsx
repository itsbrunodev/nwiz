import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Renamed to avoid conflict

import { useDevice } from "@/hooks/use-device";
import { useRemoveDevice } from "@/hooks/use-remove-device";

import type { Device, Switch as SwitchDevice } from "@/types/network/device";

interface GeneralTabProps {
  deviceId: string;
}

export function DeviceGeneralManager<T extends Device>({
  deviceId,
}: GeneralTabProps) {
  const [device, setDevice] = useDevice<T>(deviceId);
  const removeDevice = useRemoveDevice(deviceId);

  return (
    <div className="space-y-3">
      {(device.deviceType === "Router" || device.deviceType === "Switch") && (
        <Input
          label="Hostname"
          value={device.hostname}
          onChange={(e) => setDevice({ ...device, hostname: e.target.value })}
        />
      )}
      <Input
        label="Name"
        value={device.name}
        onChange={(e) => setDevice({ ...device, name: e.target.value })}
      />
      {device.deviceType === "Switch" && (
        <Input
          label="Default Gateway"
          value={(device as SwitchDevice).config.defaultGateway || ""}
          onChange={(e) =>
            setDevice({
              ...device,
              config: { ...device.config, defaultGateway: e.target.value },
            })
          }
        />
      )}
      {(device.deviceType === "Router" || device.deviceType === "Switch") && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label>Save Device Configuration</Label>
            <Switch
              checked={device.config.saveConfiguration}
              onCheckedChange={(checked) =>
                setDevice({
                  ...device,
                  config: { ...device.config, saveConfiguration: checked },
                })
              }
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Enabling this will save the device configuration to the{" "}
            {device.deviceType.toLowerCase()} and will load it on next boot.
          </p>
        </div>
      )}
      <Button variant="destructive" className="w-fit" onClick={removeDevice}>
        {device.deviceType ? `Remove ${device.deviceType}` : "Remove Device"}
      </Button>
    </div>
  );
}
