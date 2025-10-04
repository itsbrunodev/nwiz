import { RouterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { useDevice } from "@/hooks/use-device";
import { useDevices } from "@/hooks/use-devices";
import { useRemoveDevice } from "@/hooks/use-remove-device";

import { cn } from "@/lib/utils";

import { AddDeviceButton } from "../add";
import { RouterContent } from "./router";
import { SwitchContent } from "./switch";

export function DevicesList() {
  const [devices] = useDevices();

  if (devices.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RouterIcon />
          </EmptyMedia>
        </EmptyHeader>
        <div>
          <EmptyTitle>No devices</EmptyTitle>
          <EmptyDescription>Add some devices to get started</EmptyDescription>
        </div>
        <EmptyContent>
          <AddDeviceButton />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {devices.map(({ id }) => (
        <DeviceButton deviceId={id} key={id} />
      ))}
    </div>
  );
}

function DeviceButton({ deviceId }: { deviceId: string }) {
  const [device] = useDevice(deviceId);
  const removeDevice = useRemoveDevice(deviceId);

  return (
    <Dialog key={device.id}>
      <div className="flex h-[72px] rounded-md border bg-card shadow-sm">
        <div className="flex w-full items-center justify-center">
          <div className="text-center">
            <p className="font-medium text-card-foreground text-sm">
              {device.name}
            </p>
            {(device.deviceType === "Router" ||
              device.deviceType === "Switch") && (
              <p className="text-muted-foreground text-xs">{device.model}</p>
            )}
          </div>
        </div>
        <ButtonGroup
          className="border-l [&>button]:rounded-l-none"
          orientation="vertical"
        >
          {["Router", "Switch"].includes(device.deviceType) && (
            <DialogTrigger asChild>
              <Button variant="secondary">View</Button>
            </DialogTrigger>
          )}
          <Button
            className={cn(
              !["Router", "Switch"].includes(device.deviceType) && "h-full",
            )}
            variant="destructive"
            onClick={removeDevice}
          >
            Remove
          </Button>
        </ButtonGroup>
      </div>
      <DialogContent className="max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{device.name}</DialogTitle>
          <DialogDescription>
            Model{" "}
            {device.deviceType === "Router"
              ? device.model
              : device.deviceType === "Switch"
                ? device.model
                : "unknown"}
          </DialogDescription>
        </DialogHeader>
        {device.deviceType === "Router" && (
          <RouterContent routerId={device.id} />
        )}
        {device.deviceType === "Switch" && (
          <SwitchContent switchId={device.id} />
        )}
      </DialogContent>
    </Dialog>
  );
}
