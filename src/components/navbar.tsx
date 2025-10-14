import { ChevronsLeftRightEllipsisIcon, MenuIcon } from "lucide-react";

import { Link } from "./link";
import { ExportNetwork } from "./network/export";
import { ImportNetwork } from "./network/import";
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

export function Navbar() {
  return (
    <div className="mt-3 flex items-center justify-between py-3">
      <Link
        className="flex items-center gap-2 rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        to="/"
        title="Home"
        aria-label="Home"
      >
        <ChevronsLeftRightEllipsisIcon className="size-6" />
        <p className="font-extrabold text-xl">nwiz</p>
        <span className="mt-1.5 text-muted-foreground text-xs">
          v{import.meta.env.APP_VERSION || "0.0.0"}
        </span>
      </Link>
      <div className="hidden items-center gap-2 text-sm md:flex">
        <SavedButton />
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
              <div className="p-3 pb-0">
                <SavedButton />
              </div>
              <DrawerFooter>
                <div className="flex justify-center gap-2">
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

function SavedButton() {
  return (
    <Button variant="ghost" asChild>
      <Link to="/saved">Saved</Link>
    </Button>
  );
}
