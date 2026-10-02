# TrackStats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a useful static GitHub Pages V1 that locally scans large music libraries, extracts file/audio metadata, summarizes library health, charts distributions, filters tracks, and exports results.

**Architecture:** No backend. `index.html` provides the shell, `styles.css` the shared Circuit Drift Labs UI, `core.js` pure parsing/statistics helpers, and `app.js` browser file acquisition, media probing, rendering, filtering and exports. Browser-native media metadata fills duration/codec gaps while header parsers provide deterministic WAV/FLAC/ID3 data where available.

**Tech Stack:** HTML, CSS, ES modules, File API, HTMLMediaElement metadata, Web Crypto, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-01-trackstats-design.md`

## Global Constraints

- All files remain local to the browser.
- No account/backend required.
- Missing metadata is reported, never invented.
- Large scans continue after malformed/unsupported files.
- Shared Circuit Drift Labs navigation and contextual Transposition/LoudnessBatch links are present.

## Review Focus

- Empty/partial metadata must not break aggregation.
- Very large libraries must keep progress visible and avoid one-file failure aborts.
- WAV/FLAC/MP3 metadata extraction must degrade gracefully.
- CSV/JSON exports must reflect current filtered rows.
- GitHub Pages paths must remain repository-subpath safe.

---

### Task 1: Parsing/statistics core
Create `core.js` and `tests/core.test.mjs`; test extension detection, byte/duration formatting, bitrate bucketing, aggregation, ID3 text frame parsing and WAV headers.

### Task 2: Scanner and dashboard
Create `index.html`, `styles.css`, `app.js`; implement file/folder selection, local probing, progress/cancel behavior, overview, charts, health findings, search/filtering and track table.

### Task 3: Export and ecosystem integration
Implement CSV/JSON export, contextual Transposition Calculator/LoudnessBatch cards, Circuit Drift Labs links, README and Pages workflow.

### Task 4: Verification
Run the core tests locally, syntax-check ES modules, verify empty library/demo state and confirm the static files require no backend/runtime CDN.
