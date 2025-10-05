import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useDevice } from "@/hooks/use-device";
import { useRemoveDevice } from "@/hooks/use-remove-device";

import type { Device } from "@/types/network/device";

interface GeneralTabProps {
  deviceId: string;
}

export function DeviceGeneralManager<T extends Device>({
  deviceId,
}: GeneralTabProps) {
  const [device, setDevice] = useDevice<T>(deviceId);
  const removeDevice = useRemoveDevice(deviceId);

  // Defensive: if the hook hasn't resolved the device yet, render nothing (or a loader if you prefer)
  if (!device) return null;

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
      <Button variant="destructive" className="w-fit" onClick={removeDevice}>
        {device.deviceType ? `Remove ${device.deviceType}` : "Remove Device"}
      </Button>
    </div>
  );
}
