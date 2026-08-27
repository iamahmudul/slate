# Implementation Plan: Slate Menu-Bar App

**Branch**: `001-menu-bar-app` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-menu-bar-app/spec.md`

## Summary

Slate is a macOS-only Electron menu-bar app with four fixed tabs (Today, Topics, Tracker, Notes)
plus a right-click Quick Add prompt. The main process is the sole owner of a single JSON file
under `app.getPath('userData')` and is the only process that touches the filesystem; the main
window and the Quick Add window are plain HTML/CSS/JS renderers that read and write exclusively
through IPC, never through `localStorage` or direct file access. Every mutating IPC call updates
an in-memory copy of the data, persists it atomically, and pushes the updated section to any open
renderer windows so Quick Add changes appear in the main window immediately. A single-instance
lock keeps exactly one app instance alive. Packaging/distribution is explicitly out of scope for
this plan.

## Technical Context

**Language/Version**: JavaScript (Node.js runtime bundled with Electron); no TypeScript, no
transpilation step.

**Primary Dependencies**: Electron only. No frontend framework, no bundler, no state-management
or UI component library, no third-party IPC/store helper — `electron`, Node's built-in `fs`/`path`/
`crypto` modules, and the DOM are sufficient.

**Storage**: A single JSON file at `app.getPath('userData')/slate-data.json`, owned exclusively by
the Electron main process. No browser `localStorage`, no database, no external service. If a write
to this file fails, the in-memory copy remains the source of truth for the session (no crash, no
error dialog), and the next mutation's write attempt retries persisting to disk (FR-028).

**Testing**: Manual checklist per constitution Principle V (Pragmatic Testing). `quickstart.md`
serves as the runnable manual verification script covering every user story's acceptance
scenarios; no automated test framework is introduced in v1.

**Target Platform**: macOS only (menu-bar / tray app; hidden from the Dock and Cmd+Tab switcher).

**Project Type**: Desktop app (Electron: one main process, one main renderer window, one small
Quick Add renderer window).

**Performance Goals**: Main window shows previously saved data within 1s of appearing (SC-001);
a Quick Add entry, from right-click to saved, completes in under 3s (SC-007).

**Constraints**: Fully offline (constitution Principle II — no network dependency for any core
feature); exactly one running instance at a time (`app.requestSingleInstanceLock()`); renderers
never access the filesystem or Node APIs directly — all data flows through IPC to the main
process, which is the single source of truth in memory and on disk.

**Scale/Scope**: Single user, single machine, no sync. Four tabs plus one Quick Add prompt. Data
volume is personal-scale (tens to low hundreds of items) — no pagination, indexing, or database
is warranted.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Simplicity First (YAGNI) | Fixed tabs, no settings/presets UI, no speculative abstraction layers; one JSON file instead of a database | PASS |
| II. Offline-First | No network calls anywhere in the design; all data local | PASS |
| III. Minimal Stack, No Framework Creep | Electron + plain HTML/CSS/JS renderers, no framework, no bundler, no build step | PASS |
| IV. Interview-Explainable Code | Whole-file-in-memory + atomic rewrite-on-change is a two-sentence explanation; IPC contract is a flat list of named request/response calls | PASS |
| V. Pragmatic Testing (Manual Checklist) | `quickstart.md` is the manual test script; no automated suite added | PASS |

No violations. Complexity Tracking is not applicable.

**Post-Phase 1 re-check**: `data-model.md` (one JSON file, four flat entity types, no ORM),
`contracts/ipc-contract.md` (flat named channels, no framework), and `quickstart.md` (manual
script, no test framework) introduce nothing beyond what this table already covers. Still PASS on
all five principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-menu-bar-app/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── ipc-contract.md  # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
package.json              # Electron app entry, deps (electron only), npm start script
src/
├── main/
│   ├── main.js            # App lifecycle, single-instance lock, dock hiding, tray creation
│   ├── windows.js          # Creates/positions/toggles the main window and Quick Add window
│   ├── store.js            # Loads JSON on startup; in-memory data object; atomic save-to-disk
│   └── ipc.js              # ipcMain.handle registrations for every channel in ipc-contract.md
├── preload/
│   ├── preload.js          # contextBridge: exposes window.slate.* for the main window
│   └── preload-quickadd.js # contextBridge: exposes window.slate.* subset for Quick Add
├── renderer/
│   ├── index.html          # Main window shell: four tabs (Today, Topics, Tracker, Notes)
│   ├── styles.css
│   └── app.js              # Plain JS: tab switching, rendering each tab from IPC data, event wiring
└── quickadd/
    ├── quickadd.html        # Floating prompt window content
    ├── quickadd.css
    └── quickadd.js

assets/
└── tray-iconTemplate.png   # macOS template image for the tray icon (adapts to light/dark menu bar)
```

**Structure Decision**: None of the template's default options (single CLI/library project, web
frontend+backend, mobile+API) fit an Electron desktop app, so this plan uses a bespoke
`src/main` / `src/preload` / `src/renderer` / `src/quickadd` layout. This mirrors Electron's own
process boundaries (main vs. preload vs. renderer) one-to-one, which keeps the security model
(contextIsolation on, nodeIntegration off in renderers) and the "renderers never touch the
filesystem directly" requirement easy to see just from the folder structure — and easy to explain
in an interview per constitution Principle IV.

## Complexity Tracking

*No constitution violations were identified — this section is not applicable.*
