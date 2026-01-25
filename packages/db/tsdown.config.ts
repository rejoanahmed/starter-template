import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/schema/index.ts",
    "src/schema/auth.ts",
    "src/schema/issue.ts",
  ],
  format: "esm",
  dts: true,
  outDir: "dist",
  clean: true,
  unbundle: true,
});
