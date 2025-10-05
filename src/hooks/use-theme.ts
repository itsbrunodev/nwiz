import { useContext } from "react";

import { ThemeProviderContext } from "@/context/theme";

export function useTheme() {
  const ctx = useContext(ThemeProviderContext);

  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");

  return ctx;
}
