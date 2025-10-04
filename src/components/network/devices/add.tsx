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

import { useAddPc } from "@/hooks/use-add-pc";
import { useAddRouter } from "@/hooks/use-add-router";
import { useAddServer } from "@/hooks/use-add-server";
import { useAddSwitch } from "@/hooks/use-add-switch";

import { ROUTERS, SWITCHES } from "@/constants/devices";

export function AddDeviceButton() {
  const addRouter = useAddRouter();
  const addSwitch = useAddSwitch();
  const addPc = useAddPc();
  const addServer = useAddServer();

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
        <DropdownMenuItem onClick={() => addPc()}>PC</DropdownMenuItem>
        <DropdownMenuItem onClick={() => addServer()}>Server</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
