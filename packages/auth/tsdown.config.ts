import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/client-web.ts"],
  format: "esm",
  dts: true,
  outDir: "dist",
  // Don't clean in watch so ^build output stays for api#dev to resolve
  clean: process.env.TSDOWN_WATCH !== "1",
});
