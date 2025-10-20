import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
