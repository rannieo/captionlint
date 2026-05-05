import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: false,
    include: ["lib/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": __dirname,
      "@repo/caption-parser": path.resolve(__dirname, "../../packages/caption-parser/src/index.ts"),
      "@repo/config": path.resolve(__dirname, "../../packages/config/src/index.ts"),
      "@repo/lint-engine": path.resolve(__dirname, "../../packages/lint-engine/src/index.ts"),
      "@repo/shared-types": path.resolve(__dirname, "../../packages/shared-types/src/index.ts"),
    },
  },
});
