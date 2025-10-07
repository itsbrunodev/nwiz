import {
  ArrowUpRightIcon,
  ChevronsLeftRightEllipsisIcon,
  MenuIcon,
} from "lucide-react";

import { ExportNetwork } from "./network/export";
import { ImportNetwork } from "./network/import";
import { SettingsNetwork } from "./network/settings";
import { ThemeMenu } from "./theme/menu";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { TauriLink } from "./tauri-link";

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
      <div className="hidden items-center gap-2 text-sm md:flex">
        <div className="space-x-1">
          <AboutButton />
          <SavedButton />
        </div>
        <SettingsNetwork />
        <ButtonGroup>
          <ImportNetwork />
          <ExportNetwork />
        </ButtonGroup>
        <ThemeMenu />
      </div>
      <div className="md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open Menu">
              <MenuIcon />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Navigation Menu</DrawerTitle>
                <DrawerDescription>
                  nwiz v{import.meta.env.APP_VERSION || "0.0.0"}
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col gap-3 p-3 pb-0">
                <AboutButton />
                <SavedButton />
              </div>
              <DrawerFooter>
                <div className="flex justify-center gap-2">
                  <SettingsNetwork />
                  <ButtonGroup>
                    <ImportNetwork />
                    <ExportNetwork />
                  </ButtonGroup>
                  <ThemeMenu />
                </div>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

function AboutButton() {
  return (
    <Button variant="ghost" asChild>
      <TauriLink
        href="https://github.com/itsbrunodev/nwiz#readme"
        target="_blank"
        rel="noopener"
      >
        About
        <ArrowUpRightIcon />
      </TauriLink>
    </Button>
  );
}

function SavedButton() {
  return (
    <Button variant="ghost" asChild>
      <a href="/saved">Saved</a>
    </Button>
  );
}
