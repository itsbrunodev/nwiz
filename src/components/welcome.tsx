import { useAtom } from "jotai";
import {
  ArrowUpRightIcon,
  MessageSquareWarningIcon,
  PlusIcon,
  TerminalIcon,
  UploadIcon,
} from "lucide-react";

import { welcomeStore } from "@/stores/welcome";

import { isCrawler } from "@/lib/utils";

import { URLS } from "@/constants/urls";

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

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  link?: {
    url: string;
    text: string;
  };
}

const FEATURES: Feature[] = [
  {
    icon: PlusIcon,
    title: "Build Your Network",
    description:
      "Use the 'Add Device' button to place routers, switches, and PCs. Connect them through their interfaces.",
  },
  {
    icon: UploadIcon,
    title: "Import Network",
    description:
      "Click the 'Import' button to load a network someone else built or you already created in Cisco Packet Tracer.",
  },
  {
    icon: TerminalIcon,
    title: "Generate Configurations",
    description:
      "The tool generates Cisco IOS commands as you work. View and copy the script for each device.",
  },
  {
    icon: MessageSquareWarningIcon,
    title: "Network Validation",
    description:
      "Your network is automatically validated, with issues clearly displayed and explained.",
  },
  {
    icon: MessageSquareWarningIcon,
    title: "Detailed Guide",
    description:
      "A complete guide is available for learning how to use the tool on the ",
    link: {
      url: URLS.howToUse,
      text: "Github wiki",
    },
  },
];

export function WelcomeDialog() {
  const [welcomeAcknowledged, setWelcomeAcknowledged] = useAtom(welcomeStore);

  if (isCrawler(navigator.userAgent.toLowerCase())) {
    return null;
  }

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
        <div className="space-y-3 py-3">
          {FEATURES.map((feature) => (
            <div className="flex items-start gap-3" key={feature.title}>
              <div className="rounded-sm bg-secondary p-2">
                <feature.icon className="size-4" />
              </div>
              <div>
                <h2 className="font-medium">{feature.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                  {feature.link && (
                    <Button
                      className="!p-0 [&_svg]:!size-3.5 h-fit gap-1"
                      size="sm"
                      variant="link"
                      asChild
                    >
                      <Link
                        to={feature.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {feature.link.text}
                        <ArrowUpRightIcon />
                      </Link>
                    </Button>
                  )}
                </p>
              </div>
            </div>
          ))}
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
