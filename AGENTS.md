# AGENTS.md — engineering context (keep current, update every slice)

Purpose: persistent memory for any agent/human resuming work. Update the **Slice status** table and **Decision log** after every slice. Do not delete history, append.

## Project

Two SIH 2026 problem statements, one monorepo, both must ship:

1. **SIH 26171 (active)** — privacy-preserving browser agent: local vision/PII redaction in extension, sanitized context to server VLM, actions executed locally. Rubric: visual context accuracy 25 / PII recall+precision 20 / redaction precision 20 / client resources 20 / e2e latency 15.
2. **SIH 26147 (pre-work)** — blind signal analysis of `.iq`/`.wav`: parameter extraction, FSK/PSK/QAM demod, de-interleaving (block/conv/diagonal/pseudo-random), FEC (Viterbi, RS, concatenated, LDPC), bit correlation, GUI.

Team profile: Python/DSP-strong, TS/browser-apis learning. College round ~2 weeks (26171 MVP), SIH ~6 weeks.

## Layout

```
extension/   MV3 extension, plain Vite build (no CRXJS), TS strict
server/      FastAPI; provider pattern: MockProvider (default) ⇄ OllamaProvider (S4)
eval/        @playwright/test harness; extension loaded via launchPersistentContext; pages served by route interception (https://mock.sih/*)
signal/      26147: synthetic signal generator (ground truth = test suite + training data + demo)
docs/        PLAN.md (slice plan), later architecture + pitch material
```

## Commands

| Where | Command |
|---|---|
| `extension/` | `npm run build` (typecheck + vite build → `dist/`), `npm run typecheck` |
| `server/` | `uv sync`, `uv run pytest`, `uv run uvicorn app.main:app --port 8000` |
| `eval/` | `npm test`, `npx playwright install chromium` (see sandbox note) |
| `signal/` | `uv sync`, `uv run pytest` |

## Conventions

- No comments in code. Naming and structure should explain intent.
- Every slice ends with: build green, tests green, `AGENTS.md` + `docs/PLAN.md` updated, one git commit.
- Server env vars: `VLM_PROVIDER=mock|ollama`, `OLLAMA_URL` (default `http://localhost:11434`), `OLLAMA_MODEL` (default `qwen2.5vl:7b`).
- Extension ↔ server contract: `POST /v1/act` with `{url, title, dom[], screenshot_b64?}` → `{actions: [{type: click|type|scroll|navigate|done, selector?, value?}], meta}`.
- Content script marks readiness via `document.documentElement.dataset.sihAgent = "ready"` (eval asserts this).

## Sandbox / environment notes

- Playwright CDN `cdn.playwright.dev` is blocked by sandbox policy; use
  `PLAYWRIGHT_DOWNLOAD_HOST=https://playwright.azureedge.net npx playwright install chromium`.
- The sandbox cannot reach the user's host `localhost`; host Ollama is reachable at `host.docker.internal:11434`, and only after the user runs on their host:
  `sbx policy allow network host.docker.internal:11434`.
- Git identity: repo-local `git config` set once (see decision log); proxy injects GitHub credentials for HTTPS push.

## Decision log (append-only)

- 2026-08-31 — Monorepo name `sih-26171-browser-agent`; private-first, public before final pitch.
- 2026-08-31 — Build 26171 first (2-week college MVP); 26147 pre-work parallel, front-loaded weeks 3–6.
- 2026-08-31 — VLM = host Ollama (OpenAI-compatible `/v1`), model tier `qwen2.5vl:7b` / `qwen3-vl:8b` (user has decent GPU / Apple Silicon). JSON-schema-constrained actions via Ollama `format`.
- 2026-08-31 — Mock-VLM-first so the full agent loop is testable offline; real Ollama swapped in S4 behind `VLM_PROVIDER` env var.
- 2026-08-31 — Plain Vite multi-entry build for the extension instead of CRXJS (fewer deps, beta-plugin risk avoided); revisit HMR in S1 only if needed.
- 2026-08-31 — Eval pages served via Playwright `page.route` interception (no static server needed); PII test corpus grows from S2 onward.
- 2026-08-31 — S0 chose `azureedge` fallback for Playwright browsers (CDN blocked).
- 2026-08-31 — All Playwright browser downloads 307-redirect to `playwright.download.prss.microsoft.com`; that domain is default-deny blocked in the sandbox. User attempted allow; still blocked at first retry — must verify rule took effect (`curl -sI https://playwright.download.prss.microsoft.com/` should NOT return "Blocked by network policy").
- 2026-08-31 — Git identity: repo-local placeholder `opencode-bot <opencode@local>` (user opted; can be amended later).
- 2026-08-31 — Playwright pinned **1.49.1** (extensions in headless need 1.49+ new-headless; 1.48 silently ignores `--load-extension`).
- 2026-08-31 — **Extensions fail to load when `launchPersistentContext("")` gets an empty userDataDir** (0 extension targets via CDP); an explicit workspace-local profile dir (`.playwright-profile/`, wiped per test) loads them reliably. Diagnosed via CDP `Target.getTargets` (authoritative: count `service_worker` targets).
- 2026-08-31 — Isolated-world postMessage bridge rules learned: (1) do NOT guard with `event.source !== window` — WindowProxy identity across worlds is unreliable and silently rejects; filter on `event.origin` + message type instead; (2) a `{once:true}` responder consumes the page's OWN outgoing request (page receives its own postMessage) — use a named handler + explicit `removeEventListener`.
- 2026-08-31 — Sandbox now allows `playwright.download.prss.microsoft.com` (user added); `PLAYWRIGHT_DOWNLOAD_HOST=https://playwright.azureedge.net` used for downloads; `playwright install-deps chromium` run (xvfb included).
- 2026-08-31 — GitHub remote: `https://github.com/crgs8156-droid/sih26171.git` (private).
- 2026-09-01 — Strategy pivot: BrowSer_AI (teammate's repo, public) reviewed and adopted as the 26171 build base via fork+PR; our repo continues as canonical for 26147 + S0 harness lessons.
- 2026-09-01 — M6 implemented on `feature/agent-loop` in the fork workspace (`opencode-test/BrowSer_AI`, commit `9651062` + `cbb5c04`): agent loop, action bridge, firewall, backend `/v1/plan` (+`/v1/act` alias), 37 tests, CI. Gates: vitest 308/308, e2e 13/13, backend 10/10.
- 2026-09-01 — GitHub secret fixed (fine-grained PAT, both repos, Contents RW). Pushes done: `sih26171` main rebased onto the GitHub-created initial commit (`bf9d499`, stub README/.gitignore — resolved keeping ours) → `e4b538b`; fork `feature/agent-loop` at `cbb5c04`. PR to open: `github.com/codesR-cs/BrowSer_AI/compare/main...crgs8156-droid:BrowSer_AI:feature/agent-loop`.

## Slice status

| Slice | Scope | Status |
|---|---|---|
| S0 | Monorepo scaffold, extension builds + injects, mock server, Playwright loads extension, CI | **done — eval 3/3 green, pushed** |
| S1 | Agent loop closed: DOM snapshot → mock VLM → executed click/type/scroll on toy page | pending |
| S2 | DOM PII redaction (regex + `[EMAIL_1]` placeholders); harness asserts zero raw PII egress | pending |
| S3 | Screenshot path: captureVisibleTab → canvas blur/pixelate bboxes; face-det (WASM, WebGPU flag) | pending |
| S4 | Real Ollama (`qwen2.5vl:7b`), schema-validated actions, retries/timeouts | pending |
| S5 | Telemetry + auto metrics report (redaction P/R, per-stage latency/memory) | pending |
| S6 | Firefox build + demo polish | pending |
| 26147-P1 | Synthetic generator (BPSK seed) + file I/O heuristics | in progress (generator seeded in S0) |
| 26147-P2 | STFT waterfall/spectrogram view | pending |

## User role / pending asks

- Load unpacked `extension/dist/` in Chrome for visual checks each slice (30 s). **S0 visual check:** icon appears, console shows `[sih-26171] content script ready` on any page.
- Before S4: `ollama pull qwen2.5vl:7b` on host + `sbx policy allow network host.docker.internal:11434`.
