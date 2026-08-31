import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 30000,
  retries: 0,
  reporter: [["list"]],
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
});
