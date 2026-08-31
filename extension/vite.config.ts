import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const entry = (name: string) =>
  fileURLToPath(new URL(`src/${name}.ts`, import.meta.url));

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: entry("content"),
        background: entry("background"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
