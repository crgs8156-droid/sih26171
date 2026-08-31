# sih-26171-browser-agent

Monorepo for two Smart India Hackathon 2026 problem statements, built `sih-26171` first:

- **SIH 26171** — On-device visual perception for lightweight browser agents (privacy-preserving Chrome/Firefox extension + VLM server). **Active build.**
- **SIH 26147** — Automated `.iq`/`.wav` signal analysis and parameter extraction (DSP engine + GUI). Pre-work starts in `signal/`.

See [`AGENTS.md`](AGENTS.md) for engineering conventions and current status, and [`docs/PLAN.md`](docs/PLAN.md) for the full slice-by-slice plan.

## Layout

```
extension/   Chrome MV3 extension (Vite + TypeScript)        [SIH 26171]
server/      FastAPI agent server (mock VLM ⇄ Ollama)       [SIH 26171]
eval/        Playwright harness + planted-PII test pages    [SIH 26171]
signal/      Synthetic signal generator + DSP core          [SIH 26147]
```

## Quickstart

```bash
cd extension && npm install && npm run build   # outputs extension/dist/
cd server    && uv sync && uv run pytest       # mock VLM by default
cd eval      && npm install && npx playwright install chromium && npm test
```

Run the server locally: `cd server && uv run uvicorn app.main:app --port 8000`

## License

TBD before making the repository public.
