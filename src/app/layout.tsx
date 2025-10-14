import { Outlet } from "react-router";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme/provider";
import { Toaster } from "@/components/ui/sonner";
import { WelcomeDialog } from "@/components/welcome";

export function RootLayout() {
  return (
    <ThemeProvider>
      <div className="mx-auto mb-6 flex w-full max-w-3xl flex-col gap-6 px-4 lg:px-0">
        <Navbar />
        <Outlet />
        <Footer />
        <WelcomeDialog />
      </div>
      <Toaster position="bottom-center" richColors />
    </ThemeProvider>
  );
}
