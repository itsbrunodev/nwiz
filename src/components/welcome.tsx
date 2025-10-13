import { useAtom } from "jotai";
import {
  ArrowUpRightIcon,
  MessageSquareWarningIcon,
  PlusIcon,
  TerminalIcon,
  UploadIcon,
} from "lucide-react";

import { welcomeStore } from "@/stores/welcome";

import { Link } from "./link";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function WelcomeDialog() {
  const [welcomeAcknowledged, setWelcomeAcknowledged] = useAtom(welcomeStore);

  return (
    <Dialog
      open={!welcomeAcknowledged}
      onOpenChange={(open) => {
        if (!open) setWelcomeAcknowledged(true);
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Welcome to nwiz</DialogTitle>
          <DialogDescription>
            A tool for generating Cisco IOS scripts from a network topology you
            build or import.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3 [&>div>div>h2]:font-medium [&>div>div>p]:text-muted-foreground [&>div>div>p]:text-sm [&>div>div>svg]:size-4 [&>div>div]:first:rounded-sm [&>div>div]:first:bg-secondary [&>div>div]:first:p-2 [&>div]:flex [&>div]:items-start [&>div]:gap-3">
          <div>
            <div>
              <PlusIcon />
            </div>
            <div>
              <h2>Build Your Network</h2>
              <p>
                Use the "Add Device" button to place routers, switches, and PCs.
                Connect them through their interfaces.
              </p>
            </div>
          </div>
          <div>
            <div>
              <UploadIcon />
            </div>
            <div>
              <h2>Import Network</h2>
              <p>
                Click the "Import" button to load a network someone else built
                or you already created in Cisco Packet Tracer.
              </p>
            </div>
          </div>
          <div>
            <div>
              <TerminalIcon />
            </div>
            <div>
              <h2>Generate Configurations</h2>
              <p>
                The tool generates Cisco IOS commands as you work. View and copy
                the script for each device.
              </p>
            </div>
          </div>
          <div>
            <div>
              <MessageSquareWarningIcon />
            </div>
            <div>
              <h2>Network Validation</h2>
              <p>
                Your network is automatically validated, with issues clearly
                displayed and explained.
              </p>
            </div>
          </div>
          <div>
            <div>
              <MessageSquareWarningIcon />
            </div>
            <div>
              <h2>Detailed Guide</h2>
              <p>
                A complete guide is available for learning how to use the tool
                on the{" "}
                <Button
                  className="!p-0 [&_svg]:!size-3.5 h-fit gap-1"
                  size="sm"
                  variant="link"
                  asChild
                >
                  <Link
                    to="https://github.com/itsbrunodev/nwiz/wiki/How-to-Use"
                    target="_blank"
                  >
                    Github wiki
                    <ArrowUpRightIcon />
                  </Link>
                </Button>
                .
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
