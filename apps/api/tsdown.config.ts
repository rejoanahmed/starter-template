import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/export-types.ts"],
  format: "esm",
  dts: true,
  outDir: "dist",
  clean: true,
  alias: {
    "@api/lib/auth": "./src/lib/auth",
    "@api/lib/types": "./src/lib/types",
    "@api/routes/issues": "./src/routes/issues",
  },
});
