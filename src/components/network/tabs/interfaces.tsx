import { ChevronDown, EthernetPortIcon, UnplugIcon } from "lucide-react";
import { useId, useState } from "react";
import short from "short-uuid";

import { Button } from "@/components/ui/button";
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
import type { Router, Switch as SwitchDevice } from "@/types/network/device";

type InterfaceConfig = RouterInterface | SwitchInterface;

interface InterfaceManagerProps {
  deviceId: string;
  renderInterfaceFields?: (
    interfaceConfig: InterfaceConfig,
    updateInterface: (config: Partial<InterfaceConfig>) => void,
  ) => React.ReactNode;
}

export function DeviceInterfaceManager<T extends Router | SwitchDevice>({
  deviceId,
  renderInterfaceFields,
}: InterfaceManagerProps) {
  const [devices] = useDevices();
  const [device, setDevice] = useDevice<T>(deviceId);
  const [connections, setConnections] = useConnections();

  const interfaces = getInterfacesForDevice(device);
  const [currentInterface, setCurrentInterface] = useState<string>(
    interfaces[0],
  );
  const portStatusId = useId();

  const isSwitch = device.deviceType === "Switch";

  const interfaceConfig =
    device.config.interfaces.find((int) => int.name === currentInterface) ||
    ({
      name: currentInterface,
      enabled: false,
      ...(isSwitch && {
        mode: "access",
        accessVlan: 1,
      }),
    } as InterfaceConfig);

  const updateInterface = (updates: Partial<InterfaceConfig>) => {
    const updatedInterface = {
      ...interfaceConfig,
      ...updates,
      name: currentInterface,
    };

    setDevice({
      ...device,
      config: {
        ...device.config,
        interfaces: [
          ...device.config.interfaces.filter(
            (int) => int.name !== currentInterface,
          ),
          updatedInterface as RouterInterface & SwitchInterface,
        ],
      },
    } as T);
  };

  const handleConnect = (targetDeviceId: string, targetInterface: string) => {
    const filtered = connections.filter(
      (c) =>
        !(
          (c.from.deviceId === deviceId &&
            c.from.interfaceName === currentInterface) ||
          (c.to.deviceId === targetDeviceId &&
            c.to.interfaceName === targetInterface) ||
          (c.from.deviceId === targetDeviceId &&
            c.from.interfaceName === targetInterface)
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

  const isOccupied = (interfaceName: string) => {
    return (
      connections.some(
        (c) =>
          c.from.deviceId === deviceId &&
          c.from.interfaceName === interfaceName,
      ) ||
      connections.some(
        (c) =>
          c.to.deviceId === deviceId && c.to.interfaceName === interfaceName,
      )
    );
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-1 flex h-96 flex-col gap-2 overflow-y-auto">
        {interfaces.map((int) => (
          <Button
            variant={currentInterface === int ? "default" : "secondary"}
            size="sm"
            onClick={() => setCurrentInterface(int)}
            key={int}
          >
            {isOccupied(int) && <EthernetPortIcon />}
            {int}
          </Button>
        ))}
      </div>
      <div className="col-span-2 flex flex-col gap-3 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="mb-2 flex flex-row gap-2">
            <Label htmlFor={portStatusId}>Port Status</Label>
            <Switch
              id={portStatusId}
              checked={interfaceConfig.enabled}
              onCheckedChange={(enabled) => updateInterface({ enabled })}
            />
          </div>
          {renderInterfaceFields?.(interfaceConfig, updateInterface)}
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-fit" variant="outline">
                  {(() => {
                    // Check if the current interface is connected (either as from or to)
                    const occupiedConnection = connections.find(
                      (c) =>
                        (c.from.deviceId === deviceId &&
                          c.from.interfaceName === currentInterface) ||
                        (c.to.deviceId === deviceId &&
                          c.to.interfaceName === currentInterface),
                    );

                    if (!occupiedConnection) return "Not Connected";

                    // Determine the other device and interface
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
                          {getInterfacesForDevice(d).map((int) => {
                            const isOccupied = connections.some(
                              (c) =>
                                (c.from.deviceId === d.id &&
                                  c.from.interfaceName === int) ||
                                (c.to.deviceId === d.id &&
                                  c.to.interfaceName === int),
                            );
                            return (
                              <DropdownMenuItem
                                disabled={isOccupied}
                                onClick={() => handleConnect(d.id, int)}
                                key={int}
                              >
                                {int}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {connections.some(
              (c) =>
                (c.from.deviceId === deviceId &&
                  c.from.interfaceName === currentInterface) ||
                (c.to.deviceId === deviceId &&
                  c.to.interfaceName === currentInterface),
            ) && (
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
