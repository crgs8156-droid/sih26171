import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as base, chromium, expect, type BrowserContext } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
export const extensionPath = path.resolve(here, "../../extension/dist");

export const test = base.extend<{ context: BrowserContext }>({
  context: async (_, use) => {
    const context = await chromium.launchPersistentContext("", {
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
