import {
  AlertCircleIcon,
  ChevronDown,
  EthernetPortIcon,
  PencilIcon,
  PlusIcon,
  UnplugIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import short from "short-uuid";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { useConnections } from "@/hooks/use-connections";
import { useDevice } from "@/hooks/use-device";
import { useDevices } from "@/hooks/use-devices";

import {
  getInterfacesForDevice,
  isEndDevice,
  isNetworkDevice,
} from "@/lib/network";

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newInterfaceName, setNewInterfaceName] = useState("");

  const allInterfaceNames = useMemo(() => {
    if (!isNetworkDevice(device)) {
      return getInterfacesForDevice(device);
    }
    const predefined = getInterfacesForDevice(device);
    const custom = (device.config.interfaces || [])
      .filter((i) => i.custom)
      .map((i) => i.name);
    return [...new Set([...predefined, ...custom])].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }, [device]);

  const [currentInterface, setCurrentInterface] = useState<string>(
    allInterfaceNames[0],
  );
  const portStatusId = useId();

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

  const handleCreateInterface = () => {
    const trimmedName = newInterfaceName.trim();
    if (!trimmedName) {
      toast.error("Interface name cannot be empty.");
      return;
    }
    if (allInterfaceNames.includes(trimmedName)) {
      toast.error("An interface with this name already exists.");
      return;
    }
    if (!/^[a-zA-Z]+[a-zA-Z0-9/.-]*$/.test(trimmedName)) {
      toast.error(
        "Invalid interface name format. It must start with a letter.",
      );
      return;
    }

    if (!isNetworkDevice(device)) return;

    const newInterface: RouterInterface | SwitchInterface =
      device.deviceType === "Router"
        ? {
            name: trimmedName,
            enabled: false,
            custom: true,
          }
        : {
            // Switch
            name: trimmedName,
            enabled: false,
            mode: "access",
            accessVlan: 1,
            custom: true,
          };

    const newInterfaces = [...device.config.interfaces, newInterface];

    setDevice({
      ...device,
      config: {
        ...device.config,
        interfaces: newInterfaces,
      },
    } as T);

    toast.success(`Successfully created ${trimmedName} interface.`);

    setCurrentInterface(trimmedName);
    setIsCreateDialogOpen(false);
    setNewInterfaceName("");
  };

  const handleRemoveInterface = (interfaceNameToRemove: string) => {
    if (!isNetworkDevice(device)) return;

    const newInterfaces = device.config.interfaces.filter(
      (i) => i.name !== interfaceNameToRemove,
    );

    const newConnections = connections.filter(
      (c) =>
        !(
          c.from.deviceId === deviceId &&
          c.from.interfaceName === interfaceNameToRemove
        ) &&
        !(
          c.to.deviceId === deviceId &&
          c.to.interfaceName === interfaceNameToRemove
        ),
    );
    setConnections(newConnections);

    setDevice({
      ...device,
      config: {
        ...device.config,
        interfaces: newInterfaces,
      },
    } as T);

    if (currentInterface === interfaceNameToRemove) {
      const predefined = getInterfacesForDevice(device);
      const remainingCustom = newInterfaces
        .filter((i) => i.custom)
        .map((i) => i.name);
      const remainingInterfaces = [
        ...new Set([...predefined, ...remainingCustom]),
      ];
      setCurrentInterface(remainingInterfaces[0] || "");
    }

    toast.success(`Successfully removed ${interfaceNameToRemove} interface.`);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-1 flex h-96 flex-col">
        <ButtonGroup
          className="w-full flex-col overflow-y-auto"
          orientation="vertical"
        >
          {allInterfaceNames.map((int) => {
            const intConfig = isNetworkDevice(device)
              ? device.config.interfaces.find((i) => i.name === int)
              : undefined;
            const isCustom = intConfig?.custom;

            return (
              <Button
                className="justify-start"
                variant={currentInterface === int ? "default" : "outline"}
                size="sm"
                title={isCustom ? "Custom Interface" : ""}
                onClick={() => setCurrentInterface(int)}
                key={int}
              >
                {isOccupied(deviceId, int) && (
                  <EthernetPortIcon className="size-4" />
                )}
                {int}
                {isCustom && <PencilIcon />}
              </Button>
            );
          })}
        </ButtonGroup>
        {isNetworkDevice(device) && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="mt-2 w-full" variant="outline" size="sm">
                <PlusIcon />
                Create Interface
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Interface</DialogTitle>
                <DialogDescription>
                  Enter a unique name for the new interface.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-3">
                <div>
                  <Input
                    label="Interface Name (e.g. Serial0/0/0)"
                    value={newInterfaceName}
                    onChange={(e) => setNewInterfaceName(e.target.value)}
                    autoFocus
                  />
                  <p className="mx-3 mt-1 text-muted-foreground text-xs">
                    Custom interfaces show a pencil icon (
                    <PencilIcon className="inline size-3" />) in the interface
                    list.
                  </p>
                </div>
                <Alert variant="default">
                  <AlertCircleIcon />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Please make sure the interface you create actually exists on
                    the device you're configuring, otherwise the command you
                    paste will break.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateInterface}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="col-span-2 space-y-6 overflow-y-auto">
        {isNetworkDevice(device) && interfaceConfig && (
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex w-full flex-row items-center gap-2">
              <Label htmlFor={portStatusId}>Port Status</Label>
              <Switch
                id={portStatusId}
                checked={interfaceConfig.enabled}
                onCheckedChange={(enabled) => updateInterface({ enabled })}
              />
            </div>
            {interfaceConfig?.custom && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveInterface(currentInterface)}
              >
                Remove Interface
              </Button>
            )}
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
            <h2 className="font-medium">Connection</h2>
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
