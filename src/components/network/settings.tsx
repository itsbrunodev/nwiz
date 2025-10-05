import { useLiveQuery } from "dexie-react-hooks";
import { useAtom } from "jotai";
import { SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { networkAtom } from "@/stores/network";

import { dexie } from "@/lib/dexie";
import { encodeCompactBase64 } from "@/lib/encode";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";

export function SettingsNetwork() {
  const [network, setNetwork] = useAtom(networkAtom);

  const networkCodes = useLiveQuery(() => dexie.networkCodes.toArray());

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" aria-label="Settings">
          <SettingsIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Edit the settings of your network.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            label="Network Name"
            value={network.name}
            onChange={(e) => setNetwork({ ...network, name: e.target.value })}
          />
          <Input
            label="Network Description"
            value={network.description}
            onChange={(e) =>
              setNetwork({ ...network, description: e.target.value })
            }
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <Button
            onClick={() => {
              try {
                if (
                  networkCodes?.find(
                    (c) =>
                      c.id === network.id ||
                      c.code === encodeCompactBase64(network),
                  )
                ) {
                  dexie.networkCodes.update(network.id, {
                    id: network.id,
                    code: encodeCompactBase64(network),
                  });

                  return toast.success("Successfully updated network.");
                }

                dexie.networkCodes.add({
                  id: network.id,
                  code: encodeCompactBase64(network),
                });

                toast.success("Successfully saved network.");
              } catch (error) {
                console.error(error);

                toast.error("Failed to save network.");
              }
            }}
          >
            Save Network
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
