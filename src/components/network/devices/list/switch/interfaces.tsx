import { ChevronDownIcon } from "lucide-react";

import { DeviceInterfaceManager } from "@/components/network/tabs/interfaces";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import type { SwitchInterface } from "@/types/network/config/switch";
import type { Switch } from "@/types/network/device";

export function InterfacesTab({ switchId }: { switchId: string }) {
  return (
    <DeviceInterfaceManager<Switch>
      deviceId={switchId}
      renderInterfaceFields={(interfaceConfig, updateInterface) => {
        const config = interfaceConfig as SwitchInterface;

        return (
          <>
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
          </>
        );
      }}
    />
  );
}
