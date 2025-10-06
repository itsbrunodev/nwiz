import { RouterIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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

import { AddDeviceButton } from "../add";
import { EndDeviceContent } from "./end-device";
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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
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
      <div className="flex h-28 flex-col overflow-hidden rounded-md border bg-card shadow-sm">
        <div className="flex size-full items-center justify-center">
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
        <div className="[&>button]:!flex-1 flex border-t [&>button]:rounded-none">
          <DialogTrigger asChild>
            <Button variant="secondary">View</Button>
          </DialogTrigger>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Remove</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Remove {device.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {device.name}?
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={removeDevice}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
        {(device.deviceType === "PC" || device.deviceType === "Server") && (
          <EndDeviceContent deviceId={device.id} />
        )}
      </DialogContent>
    </Dialog>
  );
}
