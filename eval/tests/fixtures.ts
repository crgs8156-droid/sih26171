import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as base, chromium, expect, type BrowserContext } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
export const extensionPath = path.resolve(here, "../../extension/dist");
export const profilePath = path.resolve(here, "../.playwright-profile");

export const test = base.extend<{ context: BrowserContext }>({
  context: async ({ }, use) => {
    fs.rmSync(profilePath, { recursive: true, force: true });
    const context = await chromium.launchPersistentContext(profilePath, {
      channel: "chromium",
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    await use(context);
    await context.close();
  },
});

export { expect };
