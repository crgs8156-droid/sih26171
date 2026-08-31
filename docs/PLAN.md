# SIH 2026 — Approved Execution Plan

Team: Python/DSP-strong. College round ≈ 2 weeks (26171 MVP). SIH pitch ≈ 6 weeks. Both PSs must ship; **26171 first**.

## Locked decisions

| Decision | Choice |
|---|---|
| Scope | Both PSs. 26171 first; 26147 pre-work in parallel, front-loaded Wk 3–6 |
| VLM | Host Ollama → `qwen2.5vl:7b` (tier: decent GPU / Apple Silicon), OpenAI-compatible `/v1`, JSON-schema-constrained actions |
| Testing | Mock-VLM-first + Playwright e2e + planted-PII pages → automated precision/recall/latency numbers |
| Repo | `sih-26171-browser-agent`, monorepo, private-first → public before pitch, CI from S0 |

## Architecture — SIH 26171

```
Chrome/Firefox extension (TS, MV3)
 ├─ DOM extractor  → structured snapshot (tag/role/text/bbox)
 ├─ Local PII filter: regex/NER on DOM text → [EMAIL_1]-style placeholders
 ├─ Screenshot path: captureVisibleTab → bbox blur/pixelate (canvas), face-det ONNX (WASM→WebGPU)
 └─ Action executor (click/type/scroll/navigate, step budget) — agent loop
        ⇅ sanitized context only (asserted by eval harness)
FastAPI server → provider: mock (offline/CI) ⇄ Ollama qwen2.5vl:7b (host)
        → JSON actions, schema-constrained, retries/timeouts
```

## Architecture — SIH 26147

```
.wav/.iq ingest → format & param estimator (Fs/baud/CFO w/ confidence)
 → detection/segmentation → modulation classifier (cumulants + small CNN, ONNX)
 → demod (BFSK/MFSK, BPSK/QPSK/8PSK w/ Costas+Gardner+CMA, QAM 4–256)
 → de-interleaver (block/conv/diagonal/PR-search) → FEC (Viterbi, RS, concat, LDPC presets)
 → bitstream correlator (preamble/header) → payload export
GUI: PySide6 + pyqtgraph (waterfall, spectrogram, constellation, eye, bit viewer)
Synthetic signal generator = test suite + training data + demo material
```

## Slices — 26171

- [ ] **S0 — Harness before product:** scaffold all dirs; extension builds & injects; Playwright loads extension; mock server answers; CI. *(90% — extension/server/signal green; eval pending Chromium download, blocked on sandbox policy)*
- [ ] **S1 — Agent loop closed:** DOM snapshot → mock VLM → executed `click`/`type`/`scroll` on toy page.
- [ ] **S2 — DOM PII redaction:** regex + placeholders; harness asserts zero raw PII leaves client; planted-PII corpus v1 + precision/recall numbers.
- [ ] **S3 — Screenshot redaction:** captureVisibleTab → canvas blur/pixelate; face-det (WASM first, WebGPU behind flag).
- [ ] **S4 — Real Ollama swap:** `qwen2.5vl:7b`, schema-validated actions, retries; needs host-side `sbx policy allow network host.docker.internal:11434`.
- [ ] **S5 — Telemetry + metrics report:** per-stage ms/memory; rubric-number table auto-generated.
- [ ] **S6 — Firefox build + demo polish:** overlay toggle, demo video script.

## 26147 pre-work (parallel, S1–S3 timeframe)

- [ ] **P1 — Synthetic generator:** BPSK seeded (done in S0); add FSK/QAM/PSK family, CFO, timing offset, known FEC chain.
- [ ] **P2 — `.wav`/`.iq` I/O + format heuristics** (int8/int16/float32, endianness, DC-spike center marker).
- [ ] **P3 — STFT waterfall/spectrogram view** (PySide6 + pyqtgraph skeleton).

## Weeks 3–6 (post-college round)

- Wk 3–4: 26147 front-loaded (cumulant AMC, BPSK/QPSK demod + loops, Viterbi + RS); 26171 gets Firefox build + telemetry (one dev).
- Wk 5: 26147 de-interleavers + blind FEC search + scoring; 26171 eval harness with rubric numbers.
- Wk 6: polish, pitch videos, docs for both.

## Rubric mapping (26171)

| Metric | Weight | Where produced |
|---|---|---|
| Visual context accuracy | 25% | S1 snapshot + S4 VLM harness |
| PII detection recall/precision | 20% | S2 planted-PII corpus |
| Redaction precision | 20% | S2/S3 redaction assertions |
| Client resource utilization | 20% | S5 telemetry |
| End-to-end latency | 15% | S5 per-stage timings |
