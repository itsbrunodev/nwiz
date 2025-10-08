import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useDevice } from "@/hooks/use-device";
import { useRemoveDevice } from "@/hooks/use-remove-device";
import { isNetworkDevice } from "@/lib/network";

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
      {isNetworkDevice(device) && (
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
      {isNetworkDevice(device) && (
        <div className="flex gap-2">
          <Input
            containerClassName="flex-1"
            label="Message of the Day (MOTD)"
            value={device.config.motd?.content}
            onChange={(e) =>
              setDevice({
                ...device,
                config: {
                  ...device.config,
                  motd: {
                    ...device.config.motd,
                    content: e.target.value,
                  },
                },
              })
            }
          />
          <Input
            containerClassName="w-21"
            label="Wrapper"
            value={device.config.motd?.wrapper}
            maxLength={1}
            onChange={(e) =>
              setDevice({
                ...device,
                config: {
                  ...device.config,
                  motd: {
                    ...device.config.motd,
                    wrapper: e.target.value,
                  },
                },
              })
            }
          />
        </div>
      )}
      {isNetworkDevice(device) && (
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
