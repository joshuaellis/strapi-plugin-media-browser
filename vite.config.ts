import { defineConfig } from "vite";

export default defineConfig({
  entry: ["admin/src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: !options.watch,
  outDir: "dist/admin",
  format: "esm",
});
