import { useAtom } from "jotai";
import { ChevronDownIcon, Wand2Icon } from "lucide-react";
import { useId } from "react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { networkAtom } from "@/stores/network";

import { addAutoSwitchport } from "@/lib/commands/auto-switchport";

import type { SwitchInterface } from "@/types/network/config/switch";
import type { Switch as SwitchDevice } from "@/types/network/device";

const MODE_LABELS: Record<SwitchInterface["mode"], string> = {
  access: "Access",
  trunk: "Trunk",
  "dynamic auto": "Dynamic Auto",
  "dynamic desirable": "Dynamic Desirable",
};

export function InterfacesTab({ switchId }: { switchId: string }) {
  const [network, setNetwork] = useAtom(networkAtom);

  const negotiateId = useId();

  const handleCalculateSwitchPorts = () => {
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
    <DeviceInterfaceManager<SwitchDevice>
      deviceId={switchId}
      renderInterfaceFields={(interfaceConfig, updateInterface) => {
        const config = interfaceConfig as SwitchInterface;

        return (
          <div className="space-y-4">
            <div>
              <h2 className="font-medium">Switch Ports</h2>
              <p className="text-muted-foreground text-xs">
                Configure the switch ports for access, trunk, or dynamic mode.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCalculateSwitchPorts}
            >
              <Wand2Icon />
              Calculate Switch Ports
            </Button>
            <div className="mb-3 space-y-3">
              <div>
                <Label>Interface Mode</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="mt-2 w-fit" variant="secondary">
                      {MODE_LABELS[config.mode]} <ChevronDownIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {(
                      [
                        "access",
                        "trunk",
                        "dynamic auto",
                        "dynamic desirable",
                      ] as const
                    ).map((mode) => (
                      <DropdownMenuItem
                        onClick={() => updateInterface({ mode })}
                        key={mode}
                      >
                        {MODE_LABELS[mode]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {(config.mode === "access" || config.mode === "trunk") && (
                <div className="flex items-center gap-2">
                  <Switch
                    id={negotiateId}
                    checked={config.negotiate ?? true}
                    onCheckedChange={(checked) =>
                      updateInterface({ negotiate: checked })
                    }
                  />
                  <Label htmlFor={negotiateId}>Enable DTP Negotiation</Label>
                </div>
              )}
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
