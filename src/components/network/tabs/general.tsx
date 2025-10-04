import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useDevice } from "@/hooks/use-device";
import { useRemoveDevice } from "@/hooks/use-remove-device";

import type { Router, Switch } from "@/types/network/device";

interface GeneralTabProps {
  deviceId: string;
}

export function DeviceGeneralManager<T extends Router | Switch>({
  deviceId,
}: GeneralTabProps) {
  const [device, setDevice] = useDevice<T>(deviceId);
  const removeDevice = useRemoveDevice(deviceId);

  // Defensive: if the hook hasn't resolved the device yet, render nothing (or a loader if you prefer)
  if (!device) return null;

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Hostname"
        value={device.hostname}
        onChange={(e) => setDevice({ ...device, hostname: e.target.value })}
      />
      <Input
        label="Name"
        value={device.name}
        onChange={(e) => setDevice({ ...device, name: e.target.value })}
      />
      <Button variant="destructive" className="w-fit" onClick={removeDevice}>
        {device.deviceType ? `Remove ${device.deviceType}` : "Remove Device"}
      </Button>
    </div>
  );
}
