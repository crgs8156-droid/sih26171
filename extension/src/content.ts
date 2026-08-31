interface DomNode {
  tag: string;
  id?: string;
  role?: string;
  text?: string;
  rect?: { x: number; y: number; w: number; h: number };
}

const INTERACTIVE = "a,button,input,select,textarea,[role]";

function isVisible(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function buildSnapshot(): DomNode[] {
  const nodes: DomNode[] = [];
  for (const el of document.querySelectorAll(INTERACTIVE)) {
    if (!isVisible(el)) continue;
    const rect = el.getBoundingClientRect();
    nodes.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      role: el.getAttribute("role") || undefined,
      text: (el as HTMLElement).innerText?.slice(0, 80) || undefined,
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      },
    });
  }
  return nodes.slice(0, 200);
}

function init(): void {
  document.documentElement.dataset.sihAgent = "ready";
  console.info("[sih-26171] content script ready");
}

init();

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "sih/snapshot") {
    sendResponse({ ok: true, url: location.href, dom: buildSnapshot() });
  }
  return true;
});
