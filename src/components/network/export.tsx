import { useAtomValue } from "jotai";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { networkAtom } from "@/stores/network";

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
import { Label } from "../ui/label";
import { Pre } from "../ui/pre";

export function ExportNetwork() {
  const network = useAtomValue(networkAtom);

  const code = encodeCompactBase64(network);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Export</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Network</DialogTitle>
          <DialogDescription>
            Share this network with others by copying the code or by sharing the
            link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="relative flex flex-col gap-2">
            <Label>Code</Label>
            <Pre className="max-h-40 w-full select-all whitespace-pre-wrap break-all">
              {code}
            </Pre>
            <p className="mx-3 text-muted-foreground text-xs">
              Other users can paste this code to <b>import</b> the network.
            </p>
            <Button
              className="absolute top-8 right-2"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast.success("Copied to clipboard.");
              }}
            >
              <CopyIcon />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Share</Label>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("network", code);
                  navigator.clipboard.writeText(url.href);
                  toast.success("Copied to clipboard.");
                }}
              >
                Copy URL
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
