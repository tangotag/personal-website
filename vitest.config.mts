import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // lib/* modules import "server-only"; stub it so they can be unit-tested in Node.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    // Unit tests cover lib/ and types/ (content loader, schemas, SEO builders).
    // Components and pages are covered by Playwright e2e against the production build.
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});
