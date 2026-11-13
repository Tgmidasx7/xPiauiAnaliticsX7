import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // GitHub Pages serves this repository under /xPiauiAnaliticsX7/; local preview stays at /.
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: [".e2b.app", "localhost", "127.0.0.1"],
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: [".e2b.app", "localhost", "127.0.0.1"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "charts";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
  },
});
