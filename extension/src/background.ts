console.info("[sih-26171] background service worker started");

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "sih/ping") {
    sendResponse({ ok: true, from: "background" });
  }
  return false;
});
