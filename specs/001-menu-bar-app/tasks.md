---

description: "Task list template for feature implementation"
---

# Tasks: Slate Menu-Bar App

**Input**: Design documents from `/specs/001-menu-bar-app/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ipc-contract.md, quickstart.md

**Tests**: Not included — per constitution Principle V (Pragmatic Testing), v1 verification is the
manual checklist in `quickstart.md`, not an automated test suite.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Paths below are exact and match `plan.md`'s Project Structure

## Path Conventions

Bespoke Electron layout from plan.md (not one of the generic single-project/web/mobile options):

```text
src/main/       # main process: lifecycle, windows/tray, data store, IPC handlers
src/preload/    # contextBridge scripts, one per window
src/renderer/   # main window UI (plain HTML/CSS/JS)
src/quickadd/   # Quick Add prompt window UI (plain HTML/CSS/JS)
assets/         # tray icon
```

---

## Phase 1: Setup

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure: `src/main/`, `src/preload/`, `src/renderer/`, `src/quickadd/`, `assets/` per plan.md Project Structure
- [X] T002 Initialize `package.json` at repo root with `electron` as the sole dependency, `main` pointing to `src/main/main.js`, and a `start` script that runs Electron
- [X] T003 [P] Add the tray icon template image at `assets/tray-iconTemplate.png` (macOS template image so it adapts to light/dark menu bars)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Implement the data store in `src/main/store.js`: load `slate-data.json` from `app.getPath('userData')` on startup, default to the empty root shape from data-model.md if the file is missing or fails to parse (FR-018); provide an in-memory data object plus a save function that writes atomically (write to a temp file, then rename); on write failure, keep the in-memory change as the source of truth for the session, do not throw/crash, and retry on the next mutation's save call (FR-028)
- [X] T005 [P] Implement Tray creation and main-window show/hide/toggle in `src/main/windows.js`: build the `Tray` from `assets/tray-iconTemplate.png`, left-click toggles the main `BrowserWindow` open/closed anchored near the tray icon, and the window closes when it loses focus (FR-002, FR-003). Closing the main window calls `win.hide()`, never `win.destroy()` or `win.close()` with default behavior — the window instance must persist so `data:changed` pushes still reach it while hidden.
- [X] T006 [P] Implement the main window shell in `src/renderer/index.html`, `src/renderer/styles.css`, `src/renderer/app.js`: four fixed tab buttons in order (Today, Topics, Tracker, Notes) with empty panels and tab-switching logic, no data wiring yet (FR-004, FR-005)
- [X] T007 [P] Implement the main-window preload script in `src/preload/preload.js`: `contextBridge.exposeInMainWorld('slate', {})` with an empty namespace, to be extended per user story below
- [X] T008 Implement app bootstrap in `src/main/main.js`: call `app.requestSingleInstanceLock()` and quit immediately if not acquired; handle `second-instance` by showing/focusing the existing main window; call `app.dock.hide()` on macOS; on `app.whenReady()`, load the store (T004) and create the tray/main window (T005) (FR-027) (depends on T004, T005)
- [X] T009 Wire `src/preload/preload.js` and `src/renderer/index.html` into the main `BrowserWindow`'s `webPreferences` in `src/main/windows.js`, with `contextIsolation: true` and `nodeIntegration: false` (depends on T005, T006, T007)

**Checkpoint**: App launches, tray icon appears, no Dock/Cmd+Tab icon, window toggles open/closed showing four empty tabs, data store is loaded — no per-tab data operations wired yet.

---

## Phase 3: User Story 1 - Daily Checklist in Today (Priority: P1) 🎯 MVP

**Goal**: Users can add, check off, and remove items on the Today tab, and everything persists across a quit/relaunch.

**Independent Test**: Open the app, add a checklist item on the Today tab, mark it complete, quit and relaunch, confirm the item and its completion state are still there.

### Implementation for User Story 1

- [X] T010 [US1] Implement `today:list`, `today:add`, `today:toggle`, `today:remove` IPC handlers in `src/main/ipc.js`, rejecting empty/whitespace-only text on add, and calling the store's save function after every mutation (FR-006, FR-007, FR-016)
- [X] T011 [US1] Expose `slate.today.list/add/toggle/remove` methods via `contextBridge` in `src/preload/preload.js`
- [X] T012 [US1] Implement Today tab rendering and interactions (add input, checklist items, checkbox toggle, remove control) in `src/renderer/app.js`
- [X] T013 [US1] Add a "No items yet" empty state for the Today tab in `src/renderer/app.js` and `src/renderer/styles.css` (FR-017)

**Checkpoint**: Today tab is fully usable and persists independently — MVP complete.

---

## Phase 4: User Story 2 - Grouped Checklists in Topics (Priority: P2)

**Goal**: Users can create, rename, and delete categories on the Topics tab, and add/check/remove checklist items nested under each one.

**Independent Test**: Create a category, add checklist items under it, check/uncheck and remove items, rename the category, delete a different category, confirm everything persists across a relaunch.

### Implementation for User Story 2

- [X] T014 [P] [US2] Implement `topics:list`, `topics:addCategory`, `topics:renameCategory`, `topics:deleteCategory`, `topics:addItem`, `topics:toggleItem`, `topics:removeItem` IPC handlers in `src/main/ipc.js`, rejecting empty/whitespace-only category names or item text, cascading item deletion when a category is deleted, and saving after every mutation (FR-008, FR-009, FR-009a, FR-009b, FR-009c, FR-016)
- [X] T015 [US2] Expose `slate.topics.*` methods via `contextBridge` in `src/preload/preload.js`
- [X] T016 [US2] Implement Topics tab rendering in `src/renderer/app.js`: category groups with rename and delete controls, and nested item add/check/remove per category
- [X] T017 [US2] Add a "No categories yet" empty state for the Topics tab in `src/renderer/app.js` and `src/renderer/styles.css`

**Checkpoint**: Topics tab is fully usable and persists independently, without affecting Today.

---

## Phase 5: User Story 3 - Status Tracking in Tracker (Priority: P3)

**Goal**: Users can add, edit, and remove rows in the Tracker table (Item, Category/Track, Status), with Category/Track kept independent of Topics categories.

**Independent Test**: Add a Tracker row with item/category/status text, edit the status, remove a row, confirm state persists across a relaunch.

### Implementation for User Story 3

- [X] T018 [P] [US3] Implement `tracker:list`, `tracker:addRow`, `tracker:updateRow`, `tracker:removeRow` IPC handlers in `src/main/ipc.js`, treating Item/Category/Status as independent free text with no link to Topics categories, saving after every mutation (FR-010, FR-011, FR-011a)
- [X] T019 [US3] Expose `slate.tracker.*` methods via `contextBridge` in `src/preload/preload.js`
- [X] T020 [US3] Implement Tracker tab rendering in `src/renderer/app.js`: editable table with add-row and remove-row controls
- [X] T021 [US3] Add a "No tracked items yet" empty state for the Tracker tab in `src/renderer/app.js` and `src/renderer/styles.css`

**Checkpoint**: Tracker tab is fully usable and persists independently.

---

## Phase 6: User Story 4 - Freeform Notes (Priority: P4)

**Goal**: Users can add, edit, and delete freeform text notes on the Notes tab.

**Independent Test**: Add a note, edit its text, delete a note, confirm remaining notes persist across a relaunch.

### Implementation for User Story 4

- [X] T022 [P] [US4] Implement `notes:list`, `notes:add`, `notes:update`, `notes:remove` IPC handlers in `src/main/ipc.js`, rejecting empty/whitespace-only text, saving after every mutation (FR-012, FR-016)
- [X] T023 [US4] Expose `slate.notes.*` methods via `contextBridge` in `src/preload/preload.js`
- [X] T024 [US4] Implement Notes tab rendering in `src/renderer/app.js`: list with add, inline edit, and delete
- [X] T025 [US4] Add a "No notes yet" empty state for the Notes tab in `src/renderer/app.js` and `src/renderer/styles.css`

**Checkpoint**: Notes tab is fully usable and persists independently.

---

## Phase 7: User Story 5 - Quick Add via Menu Bar (Priority: P5)

**Goal**: Users can right-click the tray icon and add a Today item or a Note from a small floating prompt without opening the main window, and see it reflected immediately if the main window is already open.

**Independent Test**: With the main window closed, right-click the tray icon, choose "Quick Add to Today", type text, press Enter, then open the main window and confirm the item appears. Repeat for Notes. Then, with the main window already open, Quick Add an item and confirm it appears live without switching tabs.

### Implementation for User Story 5

- [X] T026 [US5] Implement the tray right-click `Menu` with exactly "Quick Add to Today", "Quick Add to Notes", "Open Slate", "Quit" in `src/main/windows.js` (FR-019, FR-025, FR-026)
- [X] T027 [US5] Implement on-demand Quick Add window creation in `src/main/windows.js`: small, frameless, always-on-top, positioned near the tray icon's bounds, destroyed/hidden after submit, Escape, or blur (FR-020)
- [X] T028 [P] [US5] Implement the Quick Add prompt UI in `src/quickadd/quickadd.html`, `src/quickadd/quickadd.css`, `src/quickadd/quickadd.js`: text input, Enter submits, Escape cancels without creating an entry (FR-022)
- [X] T029 [P] [US5] Implement the Quick Add preload script in `src/preload/preload-quickadd.js`: `contextBridge.exposeInMainWorld('slate', { quickAdd: { submit } })`
- [X] T030 [US5] Implement the `quickAdd:submit` IPC handler in `src/main/ipc.js`: routes to the Today or Notes create path based on `target`, rejects empty/whitespace-only text, saves, and signals the prompt to close on success (FR-021, FR-023)
- [X] T031 [US5] Implement the `data:changed` push from main to every open renderer window after each mutation in `src/main/ipc.js`, and a listener in `src/renderer/app.js` that replaces the affected tab's data and re-renders it live (FR-024, SC-008)

**Checkpoint**: Quick Add works standalone and updates an already-open main window immediately, without breaking Stories 1-4.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Whole-app verification that spans all user stories

- [X] T032 [P] Run `quickstart.md` §6 (single-instance) manual check
- [X] T033 [P] Run `quickstart.md` §7 (first-launch and corrupted-data-file empty states) manual check (FR-017, FR-018)
- [X] T034 [P] Run `quickstart.md` §8 (offline) manual check (Constitution Principle II, SC-005)
- [X] T035 Run the full `quickstart.md` script end-to-end as final v1 sign-off
- [X] T036 [P] Manual check: with existing data already saved, click the tray icon and confirm the main window renders that data within approximately 1 second (SC-001)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational completion; independently testable in priority order (P1 → P5), though each can technically start in parallel once Phase 2 is done since they touch largely disjoint IPC channels
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories
- **User Story 2 (P2)**: No dependency on other stories
- **User Story 3 (P3)**: No dependency on other stories
- **User Story 4 (P4)**: No dependency on other stories
- **User Story 5 (P5)**: Reads/writes the same Today and Notes data as US1/US4 (see FR-024, SC-008) — functionally it wraps US1/US4, so implement it last even though it has no separate data model of its own

### Within Each User Story

- IPC handlers before preload exposure before renderer UI (each depends on the previous existing)
- Story complete and checkpointed before moving to the next priority

### Parallel Opportunities

- Phase 1: T003 is parallel to T001/T002
- Phase 2: T004, T005, T006, T007 can run in parallel (different files, no cross-dependency); T008 and T009 are sequential after them
- Once Phase 2 is complete, the IPC-handler task that starts each of US2/US3/US4 (T014, T018, T022) can run in parallel with each other and with US1's T010, since each touches a distinct set of channels in `src/main/ipc.js` — coordinate merges if working in the same file concurrently
- Phase 8: T032, T033, T034, T036 can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
Task: "Implement the data store in src/main/store.js"
Task: "Implement Tray creation and main-window toggle in src/main/windows.js"
Task: "Implement the main window shell in src/renderer/index.html, styles.css, app.js"
Task: "Implement the main-window preload script in src/preload/preload.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Today)
4. **STOP and VALIDATE**: run `quickstart.md` §1 independently
5. This is a usable, shippable MVP menu-bar checklist

### Incremental Delivery

1. Setup + Foundational → app launches with an empty four-tab window
2. Add User Story 1 → validate via `quickstart.md` §1 → MVP
3. Add User Story 2 → validate via `quickstart.md` §2
4. Add User Story 3 → validate via `quickstart.md` §3
5. Add User Story 4 → validate via `quickstart.md` §4
6. Add User Story 5 → validate via `quickstart.md` §5 (including the live-refresh case)
7. Phase 8: single-instance, empty/corrupt-data, and offline checks, then the full script

---

## Notes

- Single developer, no team-parallelization scenario — [P] markers indicate tasks that are safe
  to reorder or interleave, not a multi-person assignment.
- Every mutating IPC handler must call the store's save function (T004) — there is no separate
  "save" task per story; it's part of each handler task.
- No automated test tasks per constitution Principle V — `quickstart.md` is the test suite.
- Commit after each task or logical group, using Conventional Commits referencing the task ID
  (e.g., `feat(T012): render Today tab checklist`), per constitution Development Workflow.
