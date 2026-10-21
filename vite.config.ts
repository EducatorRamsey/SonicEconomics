import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: "app",
  base: "./",
  publicDir: "../public",
  resolve: {
    alias: { "/src": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: { outDir: "../dist", emptyOutDir: true },
});
