import { expect, test } from "./fixtures";

test("extension loads an MV3 service worker", async ({ context }) => {
  let worker = context.serviceWorkers()[0];
  if (!worker) {
    worker = await context.waitForEvent("serviceworker");
  }
  expect(worker.url()).toContain("background.js");
});

test("content script injects and marks the page ready", async ({ context }) => {
  const page = await context.newPage();
  await page.route("https://mock.sih/toy.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><body>
        <form>
          <input id="email" type="text" placeholder="Email">
          <input id="phone" type="text" placeholder="Phone">
          <button id="submit" type="button">Submit</button>
        </form>
      </body></html>`,
    }),
  );
  await page.goto("https://mock.sih/toy.html");
  await page.waitForFunction(
    () => document.documentElement.dataset.sihAgent === "ready",
  );
  const interactiveCount = await page.evaluate(
    () => document.querySelectorAll("input,button").length,
  );
  expect(interactiveCount).toBe(3);
});

test("content script answers sih/snapshot with DOM data", async ({ context }) => {
  const page = await context.newPage();
  await page.route("https://mock.sih/toy.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><body>
        <input id="email" type="text">
      </body></html>`,
    }),
  );
  await page.goto("https://mock.sih/toy.html");
  await page.waitForFunction(
    () => document.documentElement.dataset.sihAgent === "ready",
  );
  const snapshot = await page.evaluate(
    () =>
      new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "sih/snapshot" }, (resp) =>
          resolve(resp),
        );
      }),
  );
  expect(snapshot).toMatchObject({ ok: true, url: "https://mock.sih/toy.html" });
  const dom = (snapshot as { dom: { id?: string }[] }).dom;
  expect(dom.some((n) => n.id === "email")).toBe(true);
});
