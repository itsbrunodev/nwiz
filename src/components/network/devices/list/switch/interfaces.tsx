import { useAtom } from "jotai";
import { ChevronDownIcon, Wand2Icon } from "lucide-react";
import { toast } from "sonner";

import { DeviceInterfaceManager } from "@/components/network/tabs/interfaces";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { networkAtom } from "@/stores/network";

import { addAutoSwitchport } from "@/lib/commands/auto-switchport";

import type { SwitchInterface } from "@/types/network/config/switch";
import type { Switch } from "@/types/network/device";

export function InterfacesTab({ switchId }: { switchId: string }) {
  const [network, setNetwork] = useAtom(networkAtom);

  const handleCalculateSwitchports = () => {
    try {
      const originalNetworkJson = JSON.stringify(network);
      const newNetwork = addAutoSwitchport(network);
      const newNetworkJson = JSON.stringify(newNetwork);

      if (newNetworkJson === originalNetworkJson) {
        toast.info("All switch ports are already configured correctly.");
      } else {
        setNetwork(newNetwork);
        toast.success(
          "Switch ports calculated successfully for every interface.",
        );
      }
    } catch (error) {
      console.error("Failed to calculate switch ports:", error);

      toast.error(
        "An unexpected error occurred. Please check the console for details.",
      );
    }
  };

  return (
    <DeviceInterfaceManager<Switch>
      deviceId={switchId}
      renderInterfaceFields={(interfaceConfig, updateInterface) => {
        const config = interfaceConfig as SwitchInterface;

        return (
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Switch Ports</h3>
              <p className="text-muted-foreground text-xs">
                Configure the switch ports for access or trunk mode.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCalculateSwitchports}
            >
              <Wand2Icon />
              Calculate Switch Ports
            </Button>
            <div className="mb-3 space-y-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-fit" variant="secondary">
                    {config.mode === "access" ? "Access" : "Trunk"}{" "}
                    <ChevronDownIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(["access", "trunk"] as const).map((mode) => (
                    <DropdownMenuItem
                      onClick={() => updateInterface({ mode })}
                      key={mode}
                    >
                      {mode === "access" ? "Access" : "Trunk"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="mx-3 text-muted-foreground text-xs">
                Select <b>Trunk</b> if you want to allow multiple VLANs to be
                connected to this interface. Default behavior is <b>Access</b>.
              </p>
            </div>
            {config.mode === "access" && (
              <Input
                label="Access VLAN"
                type="number"
                value={config.accessVlan || ""}
                onChange={(e) =>
                  updateInterface({
                    accessVlan: Number(e.target.value),
                  })
                }
              />
            )}
            {config.mode === "trunk" && (
              <Input
                label="Native VLAN"
                type="number"
                value={config.nativeVlan || ""}
                onChange={(e) =>
                  updateInterface({
                    nativeVlan: Number(e.target.value),
                  })
                }
              />
            )}
          </div>
        );
      }}
    />
  );
}
