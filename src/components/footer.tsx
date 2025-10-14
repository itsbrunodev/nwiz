import { ArrowUpRightIcon } from "lucide-react";

import { URLS } from "@/constants/urls";

import { Link } from "./link";
import { Button } from "./ui/button";

export function Footer() {
  return (
    <footer className="flex w-full flex-col justify-between gap-3 border-t py-3 sm:flex-row sm:gap-0">
      <div className="flex flex-col items-start gap-1">
        <div className="space-x-1">
          <span className="font-medium">nwiz</span>
          <span className="text-muted-foreground text-xs">
            v{import.meta.env.APP_VERSION || "0.0.0"}
          </span>
        </div>
        <p className="max-w-72 text-muted-foreground text-sm">
          A tool for generating Cisco IOS scripts from a network topology you
          build or import.
        </p>
      </div>
      <div className="ml-auto flex flex-col items-end gap-1 sm:ml-0 sm:items-start">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/saved">Saved</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to={URLS.github} target="_blank" rel="noopener">
            GitHub <ArrowUpRightIcon />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to={URLS.howToUse} target="_blank" rel="noopener">
            How to Use <ArrowUpRightIcon />
          </Link>
        </Button>
      </div>
    </footer>
  );
}
