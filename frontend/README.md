# Veridoc — AI-Based Fake Identity & Document Screening System

> SIH 2026 · Problem ID SIH26188 · Ministry of Home Affairs (SSB)

An AI platform that scans passports, visas, national IDs, driving licenses and permits at border
checkpoints and outputs a **risk score** to the screening officer through a 4-stage pipeline:

**OCR extraction → document validation → tampering/forgery detection → face verification**

## Tech stack

- **React 19 + TypeScript + Vite** — officer dashboard & scanning UI
- **Tailwind CSS v4 + custom shadcn-style UI kit** — fast, govt-grade interface
- **TanStack Query / React Query** — data fetching & polling (configured in `src/App.tsx`)
- **React Router v7** — role-aware routing
- **WebRTC / getUserMedia** — live camera capture of documents & faces at the counter
- **Radix UI primitives** — accessible dialog, select, tabs, avatar, etc.

## What's implemented

### Officer flow
1. **Login** — role-based auth (officer / admin / analyst), tied to a checkpoint ID so every log is traceable.
2. **Capture screen** — live camera preview with an auto-crop guide box for documents (passport-style
   banking-app overlay) plus a separate face/liveness capture step with an oval guide. Falls back to
   file upload, or a "Simulate capture" button when no camera is available (ideal for demos on laptops).
3. **Processing screen** — per-module progress stepper (OCR → Validation → Tampering → Face Match)
   instead of a single spinner, giving the officer transparency into what is being checked.
4. **Results / risk dashboard** — colour-coded 0–100 risk gauge as the hero element, expandable
   "why this score?" breakdown showing each module's contribution to the final score
   (the explainability judges look for).
5. **Flagged view** — side-by-side original vs. suspected-tampered comparison, with clickable
   bounding boxes on manipulated areas, a forensic ELA-style heatmap, and per-region technique +
   confidence details.
6. **Officer decision + audit trail** — every action (approve / escalate / deny / override) is logged
   immutably with officer, checkpoint, timestamp, notes, and prior decision state — the digital trail
   for investigations requirement from the problem statement.

### Admin / analyst
- Command-wide dashboard with KPIs, decision feed, scan history, and an analytics page
  (risk distribution, document-type volume, scan risk trend).

## Running it

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Sign in with any of the four demo profiles (top-left card lists them).
Pick a **demo scenario** on the scan form (`Genuine document`, `Subtle tampering`, or `Clear forgery`)
to control what the pipeline detects — great for a judge demo.

Production build + typecheck:

```bash
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```

## Notes

- All data is **simulated client-side** and persisted to `localStorage` — no documents leave the device.
- Camera access requires a secure context; `localhost` is treated as secure, and the capture screen
  auto-falls back to upload/simulation if the camera is unavailable.
- The AI pipeline in `src/lib/mockEngine.ts` is a deterministic mock: OCR, validation, tamper forensics
  and face matching each produce per-module results that aggregate into the explainable risk score.
  Swap `generateScan()` for the real backend (FastAPI/TensorRT serving Tesseract + DFace/InsightFace +
  an ELA-based forgery model) when a backend exists.