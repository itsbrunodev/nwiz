import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import packageJson from "./package.json";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,

    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  define: {
    "import.meta.env.APP_VERSION": JSON.stringify(packageJson.version),
  },
  build: {
    target:
      process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: "d3",
              test: (moduleId) => moduleId.includes("d3"),
            },
            {
              name: "radix",
              test: (moduleId) => moduleId.includes("@radix-ui"),
            },
            {
              name: "utils",
              test: (moduleId) =>
                moduleId.includes("clsx") ||
                moduleId.includes("tailwind-merge") ||
                moduleId.includes("class-variance-authority") ||
                moduleId.includes("date-fns"),
            },
            {
              name: "react-vendor",
              test: (moduleId) =>
                moduleId.includes("react") ||
                moduleId.includes("react-dom") ||
                moduleId.includes("react-router"),
            },
          ],
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
