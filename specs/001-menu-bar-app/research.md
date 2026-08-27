# Phase 0 Research: Slate Menu-Bar App

All items below were either fully specified by the user's plan input or had a single
Simplicity-First-compliant answer; none required external research beyond Electron's own APIs.
No `NEEDS CLARIFICATION` markers remain.

## 1. IPC pattern between renderers and main process

- **Decision**: Use `ipcMain.handle` / `ipcRenderer.invoke` (promise-based request/response) for
  every renderer-initiated read or mutation. Use one-way `webContents.send('data:changed', ...)`
  from main to push updated data into any currently-open renderer window after a mutation.
- **Rationale**: `invoke`/`handle` is Electron's modern, built-in async RPC pattern — no manual
  reply-channel bookkeeping, and it maps directly onto the flat list of named operations in
  `contracts/ipc-contract.md`. The push channel is the only way to satisfy the requirement that a
  Quick Add change appears in the main window immediately rather than on next launch.
- **Alternatives considered**: `ipcRenderer.send` + `ipcMain.on` with hand-rolled reply channels —
  rejected, strictly more boilerplate for the same result. Renderer polling the main process on an
  interval — rejected, adds latency, wastes cycles, and still needs the same IPC surface.

## 2. Data persistence strategy

- **Decision**: On startup, the main process reads `slate-data.json` from `app.getPath('userData')`
  into a single in-memory JS object (empty-shape default if missing/corrupt). Every mutating IPC
  call updates that object, then immediately persists it with an atomic write: write to a temp
  file in the same directory, then rename over the real file.
- **Rationale**: Personal-scale data (tens to low hundreds of small records) makes "whole object in
  memory, rewrite whole file on every change" simple enough to explain in one sentence, which is
  the point of Principle IV. Write-then-rename is the standard way to avoid a half-written,
  corrupted JSON file if the app crashes mid-save, without adding a database dependency.
- **Alternatives considered**: `better-sqlite3` or another embedded database — rejected as
  unjustified complexity/dependency for this data size (violates Simplicity First). Debounced or
  batched writes — rejected: adds timing complexity and risk of losing the most recent change on a
  crash, with no real performance need at this scale.

## 3. Single-instance enforcement

- **Decision**: Call `app.requestSingleInstanceLock()` at startup. If the lock is not acquired,
  call `app.quit()` immediately. Register a `second-instance` listener on the first instance that
  shows and focuses the existing main window.
- **Rationale**: This is exactly the mechanism the user's plan input specified and exactly what
  Electron provides for this use case (FR-027).
- **Alternatives considered**: None — a lock file or PID check would duplicate what
  `requestSingleInstanceLock` already does correctly.

## 4. Hiding from the Dock and Cmd+Tab

- **Decision**: Call `app.dock.hide()` on macOS at launch, and present the app exclusively through
  a `Tray` icon built from a template image (so it adapts to light/dark menu bars). Left-click on
  the tray icon toggles the main window; right-click shows a `Menu` with "Quick Add to Today",
  "Quick Add to Notes", "Open Slate", and "Quit".
- **Rationale**: `app.dock.hide()` plus a `Tray`-only presentation is the standard, minimal-code
  way to build a menu-bar-only macOS Electron app, and works in development without needing the
  packaging step (`LSUIElement` in a packaged app's `Info.plist`) that this plan explicitly defers.
- **Alternatives considered**: Relying solely on packaging-time `LSUIElement` — rejected for this
  plan since packaging/distribution is out of scope; `app.dock.hide()` covers the same behavior
  during development and remains correct once packaging is addressed later.

## 5. Quick Add window lifecycle

- **Decision**: Create the Quick Add `BrowserWindow` on demand when the user selects "Quick Add to
  Today" or "Quick Add to Notes" from the tray context menu — small, frameless, always-on-top,
  positioned near the tray icon's bounds. Destroy (or hide) it on submit, on Escape, or on losing
  focus.
- **Rationale**: Matches the spec's "small floating text-entry prompt distinct from the main
  window" requirement (FR-020) with the least code: no persistent hidden window to manage state
  for.
- **Alternatives considered**: Keeping a persistently-created hidden window for faster reopen —
  rejected for v1 as an unneeded optimization for a prompt used briefly and infrequently; can be
  revisited later if reopen latency is ever a problem.

## 6. Renderer-to-main security boundary

- **Decision**: Both renderer windows run with `contextIsolation: true` and `nodeIntegration:
  false`. Each has its own preload script that uses `contextBridge.exposeInMainWorld` to publish a
  small `window.slate` object whose methods map one-to-one onto the IPC channels in
  `contracts/ipc-contract.md`, each returning a Promise.
- **Rationale**: This is the current recommended-secure Electron pattern and is also the only way
  to honor the plan input's "never directly to the file" requirement — renderer code has no path
  to `fs` at all, only to the whitelisted `window.slate` methods.
- **Alternatives considered**: Enabling `nodeIntegration` so renderer code could call `fs`
  directly — rejected outright: violates the explicit plan requirement and is a well-known
  Electron security anti-pattern.

## 7. Electron version

- **Decision**: Depend on the latest stable Electron release available at implementation time,
  pinned as an exact version in `package.json`.
- **Rationale**: No feature in this plan needs anything beyond long-stable Electron APIs (`Tray`,
  `BrowserWindow`, `ipcMain.handle`, `app.requestSingleInstanceLock`); taking the current stable
  release simply means current security patches with no compatibility cost.
- **Alternatives considered**: Pinning an older major version — rejected, no compatibility
  constraint exists that would justify it.
