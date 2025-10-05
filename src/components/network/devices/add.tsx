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

import { useAddEndDevice } from "@/hooks/use-add-end-device";
import { useAddRouter } from "@/hooks/use-add-router";
import { useAddSwitch } from "@/hooks/use-add-switch";

import { ROUTERS, SWITCHES } from "@/constants/devices";

export function AddDeviceButton() {
  const addRouter = useAddRouter();
  const addSwitch = useAddSwitch();
  const addEndDevice = useAddEndDevice();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-fit">Add Device</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Router</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {ROUTERS.map((model) => (
                <DropdownMenuItem onClick={() => addRouter(model)} key={model}>
                  {model}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Switch</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {SWITCHES.map((model) => (
                <DropdownMenuItem onClick={() => addSwitch(model)} key={model}>
                  {model}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => addEndDevice("PC")}>
          PC
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => addEndDevice("Laptop")}>
          Laptop
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => addEndDevice("Server")}>
          Server
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
