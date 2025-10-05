import { useAtom } from "jotai";
import { Wand2Icon, XIcon } from "lucide-react";
import { useId, useState } from "react";
import short from "short-uuid";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { networkAtom } from "@/stores/network";

import { addAutoStaticRoutes } from "@/lib/commands/auto-routing";

import type { Router } from "@/types/network/device";
import type { StaticRoute } from "@/types/network/route/static";

export function StaticRoutesTab({ routerId }: { routerId: string }) {
  const [network, setNetwork] = useAtom(networkAtom);

  const [destination, setDestination] = useState("");
  const [subnetMask, setSubnetMask] = useState("");
  const [forwardingType, setForwardingType] = useState<
    "nextHop" | "exitInterface"
  >("nextHop");
  const [nextHop, setNextHop] = useState("");
  const [exitInterface, setExitInterface] = useState("");

  const baseId = useId();
  const nextHopRadioId = `${baseId}-nextHop`;
  const exitInterfaceRadioId = `${baseId}-exitInterface`;

  // biome-ignore lint/style/noNonNullAssertion: assume valid routerId
  const router = network.devices.find(
    (d): d is Router => d.id === routerId && d.deviceType === "Router",
  )!;

  const handleAutoGenerate = () => {
    const originalRoutesCount = network.devices
      .filter((d): d is Router => d.deviceType === "Router")
      .reduce((acc, r) => acc + (r.config.staticRoutes?.length ?? 0), 0);

    const networkWithAutoRoutes = addAutoStaticRoutes(network);

    const newRoutesCount = networkWithAutoRoutes.devices
      .filter((d): d is Router => d.deviceType === "Router")
      .reduce((acc, r) => acc + (r.config.staticRoutes?.length ?? 0), 0);

    const addedCount = newRoutesCount - originalRoutesCount;

    if (addedCount > 0) {
      setNetwork({
        ...networkWithAutoRoutes,
        updatedAt: new Date().toISOString(),
      });

      toast.success(
        `Successfully added ${addedCount} missing static route${addedCount > 1 ? "s" : ""}.`,
      );
    } else {
      toast.info("No missing static routes to add.");
    }
  };

  const handleAddRoute = () => {
    const newRoute: StaticRoute = {
      id: short.generate(),
      destinationNetwork: destination,
      subnetMask,
      forwarding:
        forwardingType === "nextHop"
          ? { type: "nextHop", address: nextHop }
          : { type: "exitInterface", interfaceName: exitInterface },
    };

    const newNetwork = {
      ...network,
      devices: network.devices.map((device) => {
        if (device.id === routerId) {
          const updatedRouter = device as Router;
          const existingRoutes = updatedRouter.config.staticRoutes ?? [];
          return {
            ...updatedRouter,
            config: {
              ...updatedRouter.config,
              staticRoutes: [...existingRoutes, newRoute],
            },
          };
        }
        return device;
      }),
      updatedAt: new Date().toISOString(),
    };

    setNetwork(newNetwork);

    setDestination("");
    setSubnetMask("");
    setNextHop("");
    setExitInterface("");
  };

  const handleDeleteRoute = (routeId: string) => {
    const newNetwork = {
      ...network,
      devices: network.devices.map((device) => {
        if (device.id === routerId) {
          const updatedRouter = device as Router;
          return {
            ...updatedRouter,
            config: {
              ...updatedRouter.config,
              staticRoutes: (updatedRouter.config.staticRoutes ?? []).filter(
                (route) => route.id !== routeId,
              ),
            },
          };
        }
        return device;
      }),
      updatedAt: new Date().toISOString(),
    };

    setNetwork(newNetwork);
  };

  const existingRoutes = router.config.staticRoutes ?? [];
  const routerInterfaces = router.config.interfaces.map((iface) => iface.name);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-medium">Add New Static Route</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Destination Network"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <Input
            label="Subnet Mask"
            value={subnetMask}
            onChange={(e) => setSubnetMask(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <Label>Forwarding Type</Label>
          <RadioGroup
            value={forwardingType}
            // biome-ignore lint/suspicious/noExplicitAny: simple fix
            onValueChange={(val) => setForwardingType(val as any)}
            className="flex items-center gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nextHop" id={nextHopRadioId} />
              <Label htmlFor={nextHopRadioId}>Next Hop IP</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="exitInterface" id={exitInterfaceRadioId} />
              <Label htmlFor={exitInterfaceRadioId}>Exit Interface</Label>
            </div>
          </RadioGroup>
        </div>
        {forwardingType === "nextHop" ? (
          <Input
            label="Next Hop IP Address"
            value={nextHop}
            onChange={(e) => setNextHop(e.target.value)}
          />
        ) : (
          <Select value={exitInterface} onValueChange={setExitInterface}>
            <Label>Outgoing Interface</Label>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select an interface..." />
            </SelectTrigger>
            <SelectContent>
              {routerInterfaces.map((ifaceName) => (
                <SelectItem key={ifaceName} value={ifaceName}>
                  {ifaceName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={!destination || !subnetMask}
          onClick={handleAddRoute}
        >
          Add Route
        </Button>
      </div>
      <div className="space-y-3">
        <h3 className="font-medium">Configured Routes</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" onClick={handleAutoGenerate}>
            <Wand2Icon />
            Calculate Missing Routes
          </Button>
          {existingRoutes.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              No static routes configured.
            </p>
          ) : (
            <div className="rounded-md border">
              {existingRoutes.map((route) => (
                <div
                  className="flex items-center justify-between border-b p-3 last:border-b-0"
                  key={route.id}
                >
                  <div>
                    <p className="font-medium font-mono text-sm">
                      {route.destinationNetwork} {route.subnetMask}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      via{" "}
                      {route.forwarding.type === "nextHop"
                        ? route.forwarding.address
                        : route.forwarding.interfaceName}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRoute(route.id)}
                  >
                    <XIcon />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
