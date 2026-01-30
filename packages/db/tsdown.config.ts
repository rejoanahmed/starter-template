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
  // Don't clean in watch so ^build output stays for api#dev to resolve
  clean: process.env.TSDOWN_WATCH !== "1",
  unbundle: true,
});
