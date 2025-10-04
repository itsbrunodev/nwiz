import { useSetAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";

import { decodeCompactBase64 } from "@/lib/encode";

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
import { networkAtom } from "@/stores/network";

export function ImportNetwork() {
  const setNetwork = useSetAtom(networkAtom);
  const [code, setCode] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Import</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Network</DialogTitle>
          <DialogDescription>
            Import a network shared by others by pasting the code.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Input
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <Button
            disabled={!code}
            onClick={() => {
              setNetwork(decodeCompactBase64(code));
              toast.success("Network imported successfully");
            }}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
