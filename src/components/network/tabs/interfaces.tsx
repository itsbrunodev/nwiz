import { ChevronDown, EthernetPortIcon, UnplugIcon } from "lucide-react";
import { useId, useState } from "react";
import short from "short-uuid";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { useConnections } from "@/hooks/use-connections";
import { useDevice } from "@/hooks/use-device";
import { useDevices } from "@/hooks/use-devices";

import { getInterfacesForDevice } from "@/lib/network";

import type { RouterInterface } from "@/types/network/config/router";
import type { SwitchInterface } from "@/types/network/config/switch";
import type {
  Device,
  EndDevice,
  Router,
  Switch as SwitchDevice,
} from "@/types/network/device";

type InterfaceConfig = RouterInterface | SwitchInterface;

type RenderFieldsFn<T extends Device> = T extends Router | SwitchDevice
  ? (
      interfaceConfig: InterfaceConfig,
      updateInterface: (config: Partial<InterfaceConfig>) => void,
    ) => React.ReactNode
  : () => React.ReactNode;

interface InterfaceManagerProps<T extends Device> {
  deviceId: string;
  renderInterfaceFields?: RenderFieldsFn<T>;
}

export function DeviceInterfaceManager<T extends Device>({
  deviceId,
  renderInterfaceFields,
}: InterfaceManagerProps<T>) {
  const [devices] = useDevices();
  const [device, setDevice] = useDevice<T>(deviceId);
  const [connections, setConnections] = useConnections();

  const interfaces = getInterfacesForDevice(device);
  const [currentInterface, setCurrentInterface] = useState<string>(
    interfaces[0],
  );
  const portStatusId = useId();

  const isNetworkDevice = (d: Device): d is Router | SwitchDevice => {
    return d.deviceType === "Router" || d.deviceType === "Switch";
  };

  const isEndDevice = (d: Device): d is EndDevice => {
    return (
      d.deviceType === "PC" ||
      d.deviceType === "Server" ||
      d.deviceType === "Laptop"
    );
  };

  const interfaceConfig = isNetworkDevice(device)
    ? device.config.interfaces.find((int) => int.name === currentInterface) ||
      ({
        name: currentInterface,
        enabled: false,
        ...(device.deviceType === "Switch" && {
          mode: "access",
          accessVlan: 1,
        }),
      } as InterfaceConfig)
    : undefined;

  const updateInterface = (updates: Partial<InterfaceConfig>) => {
    if (!isNetworkDevice(device) || !interfaceConfig) return;

    const updatedInterface = {
      ...interfaceConfig,
      ...updates,
      name: currentInterface,
    };

    const newInterfaces = [
      ...device.config.interfaces.filter(
        (int) => int.name !== currentInterface,
      ),
      updatedInterface as RouterInterface & SwitchInterface,
    ];

    setDevice({
      ...device,
      config: {
        ...device.config,
        interfaces: newInterfaces,
      },
    } as T);
  };

  const handleConnect = (targetDeviceId: string, targetInterface: string) => {
    const filtered = connections.filter(
      (c) =>
        !(
          (c.from.deviceId === deviceId &&
            c.from.interfaceName === currentInterface) ||
          (c.to.deviceId === deviceId &&
            c.to.interfaceName === currentInterface)
        ),
    );

    setConnections([
      ...filtered,
      {
        id: short.generate(),
        from: { deviceId, interfaceName: currentInterface },
        to: { deviceId: targetDeviceId, interfaceName: targetInterface },
      },
    ]);
  };

  const isOccupied = (lookupDeviceId: string, interfaceName: string) => {
    return connections.some(
      (c) =>
        (c.from.deviceId === lookupDeviceId &&
          c.from.interfaceName === interfaceName) ||
        (c.to.deviceId === lookupDeviceId &&
          c.to.interfaceName === interfaceName),
    );
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <ButtonGroup
        className="col-span-1 flex h-96 w-full flex-col overflow-y-auto"
        orientation="vertical"
      >
        {interfaces.map((int) => (
          <Button
            className="justify-start"
            variant={currentInterface === int ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentInterface(int)}
            key={int}
          >
            {isOccupied(deviceId, int) && <EthernetPortIcon />}
            {int}
          </Button>
        ))}
      </ButtonGroup>
      <div className="col-span-2 space-y-6 overflow-y-auto">
        {isNetworkDevice(device) && interfaceConfig && (
          <div className="mb-3 flex flex-row items-center gap-2">
            <Switch
              id={portStatusId}
              checked={interfaceConfig.enabled}
              onCheckedChange={(enabled) => updateInterface({ enabled })}
            />
            <Label htmlFor={portStatusId}>Port Status</Label>
          </div>
        )}
        {!isEndDevice(device) && <Separator className="my-3" />}
        {renderInterfaceFields &&
          (isNetworkDevice(device) && interfaceConfig
            ? (renderInterfaceFields as RenderFieldsFn<Router | SwitchDevice>)(
                interfaceConfig,
                updateInterface,
              )
            : (renderInterfaceFields as RenderFieldsFn<EndDevice>)())}
        <Separator className="my-3" />
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Connection</h3>
            <p className="text-muted-foreground text-xs">
              To which device and interface this interface is connected.
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-fit" variant="outline">
                  {(() => {
                    const occupiedConnection = connections.find(
                      (c) =>
                        (c.from.deviceId === deviceId &&
                          c.from.interfaceName === currentInterface) ||
                        (c.to.deviceId === deviceId &&
                          c.to.interfaceName === currentInterface),
                    );
                    if (!occupiedConnection) return "Not Connected";

                    const otherDeviceId =
                      occupiedConnection.from.deviceId === deviceId
                        ? occupiedConnection.to.deviceId
                        : occupiedConnection.from.deviceId;
                    const otherInterface =
                      occupiedConnection.from.deviceId === deviceId
                        ? occupiedConnection.to.interfaceName
                        : occupiedConnection.from.interfaceName;
                    const otherDeviceName =
                      devices.find((d) => d.id === otherDeviceId)?.name ??
                      "Unknown Device";

                    return `${otherDeviceName} (${otherInterface})`;
                  })()}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                {devices
                  .filter((d) => d.id !== deviceId)
                  .map((d) => (
                    <DropdownMenuSub key={d.id}>
                      <DropdownMenuSubTrigger>{d.name}</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="max-h-96 overflow-auto">
                          {getInterfacesForDevice(d).map((int) => (
                            <DropdownMenuItem
                              disabled={isOccupied(d.id, int)}
                              onClick={() => handleConnect(d.id, int)}
                              key={int}
                            >
                              {int}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {isOccupied(deviceId, currentInterface) && (
              <Button
                variant="destructive"
                size="icon"
                title="Disconnect"
                aria-label="Disconnect"
                onClick={() =>
                  setConnections(
                    connections.filter(
                      (c) =>
                        !(
                          (c.from.deviceId === deviceId &&
                            c.from.interfaceName === currentInterface) ||
                          (c.to.deviceId === deviceId &&
                            c.to.interfaceName === currentInterface)
                        ),
                    ),
                  )
                }
              >
                <UnplugIcon />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
