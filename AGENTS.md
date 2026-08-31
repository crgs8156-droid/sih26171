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

## Slice status

| Slice | Scope | Status |
|---|---|---|
| S0 | Monorepo scaffold, extension builds + injects, mock server, Playwright loads extension, CI | **90% — extension/server/signal green; eval blocked on browser download (policy)** |
| S1 | Agent loop closed: DOM snapshot → mock VLM → executed click/type/scroll on toy page | pending |
| S2 | DOM PII redaction (regex + `[EMAIL_1]` placeholders); harness asserts zero raw PII egress | pending |
| S3 | Screenshot path: captureVisibleTab → canvas blur/pixelate bboxes; face-det (WASM, WebGPU flag) | pending |
| S4 | Real Ollama (`qwen2.5vl:7b`), schema-validated actions, retries/timeouts | pending |
| S5 | Telemetry + auto metrics report (redaction P/R, per-stage latency/memory) | pending |
| S6 | Firefox build + demo polish | pending |
| 26147-P1 | Synthetic generator (BPSK seed) + file I/O heuristics | in progress (generator seeded in S0) |
| 26147-P2 | STFT waterfall/spectrogram view | pending |

## User role / pending asks

- **BLOCKED ITEM:** allow `playwright.download.prss.microsoft.com` in sandbox network policy (first attempt did not take effect — verify with `sbx policy ls` on host). Then: `cd eval && PLAYWRIGHT_DOWNLOAD_HOST=https://playwright.azureedge.net npx playwright install chromium && npm test`.
- Create private GitHub repo `sih-26171-browser-agent`, paste URL → agent adds remote + pushes (user confirmed repo created but URL not yet received).
- Git identity: placeholder `opencode-bot <opencode@local>` set repo-locally; user may swap later via `git config user.name/user.email` + `git commit --amend --reset-author`.
- Load unpacked `extension/dist/` in Chrome for visual checks each slice (30 s).
- Before S4: `ollama pull qwen2.5vl:7b` on host + `sbx policy allow network host.docker.internal:11434`.
