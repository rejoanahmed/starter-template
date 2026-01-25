import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/client-web.ts"],
  format: "esm",
  dts: true,
  outDir: "dist",
  clean: true,
});
