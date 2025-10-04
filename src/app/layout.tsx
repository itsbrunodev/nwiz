import { Outlet } from "react-router";

import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme/provider";
import { Toaster } from "@/components/ui/sonner";

export function RootLayout() {
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
