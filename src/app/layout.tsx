import { Outlet } from "react-router";

import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme/provider";
import { Toaster } from "@/components/ui/sonner";
import { useAtomValue } from "jotai";
import { networkAtom } from "@/stores/network";
import { useEffect } from "react";

export function RootLayout() {
  const network = useAtomValue(networkAtom);

  useEffect(() => {
    if (network?.name) {
      document.title = `nwiz - ${network.name || "New Network"}`;
    }
  }, [network.name]);

  return (
    <ThemeProvider>
      <div className="mx-auto mb-6 flex w-full max-w-3xl flex-col gap-6">
        <Navbar />
        <Outlet />
      </div>
      <Toaster position="bottom-center" richColors />
    </ThemeProvider>
  );
}
