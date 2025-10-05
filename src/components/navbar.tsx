import { ArrowUpRightIcon, ChevronsLeftRightEllipsisIcon } from "lucide-react";

import { ExportNetwork } from "./network/export";
import { ImportNetwork } from "./network/import";
import { SettingsNetwork } from "./network/settings";
import { ThemeMenu } from "./theme/menu";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";

export function Navbar() {
  return (
    <div className="mt-3 flex items-center justify-between py-3">
      <a
        className="flex items-center gap-2 rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        href="/"
        title="Home"
        aria-label="Home"
      >
        <ChevronsLeftRightEllipsisIcon className="size-6" />
        <h1 className="font-extrabold text-xl">nwiz</h1>
        <span className="mt-1.5 text-muted-foreground text-xs">
          {import.meta.env.APP_VERSION || "0.0.0"}
        </span>
      </a>
      <div className="flex items-center gap-2 text-sm">
        <div className="space-x-1">
          <Button variant="ghost" asChild>
            <a
              href="https://github.com/itsbrunodev/nwiz#readme"
              target="_blank"
              rel="noopener"
            >
              About
              <ArrowUpRightIcon />
            </a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="/saved">Saved</a>
          </Button>
        </div>
        <SettingsNetwork />
        <ButtonGroup>
          <ImportNetwork />
          <ExportNetwork />
        </ButtonGroup>
        <ThemeMenu />
      </div>
    </div>
  );
}
