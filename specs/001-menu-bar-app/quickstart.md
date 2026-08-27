# Quickstart: Slate Menu-Bar App

Manual validation script for v1, per constitution Principle V (Pragmatic Testing). Run this whole
checklist before considering the feature done, and again before any release. Each section maps to
a user story in [spec.md](./spec.md); field/channel names reference
[data-model.md](./data-model.md) and [contracts/ipc-contract.md](./contracts/ipc-contract.md).

## Prerequisites

- macOS.
- Node.js and npm installed.
- Repo dependencies installed: `npm install` from the repo root.

## Start the app

```bash
npm start
```

This launches Electron with `app.dock.hide()` applied — confirm no Slate icon appears in the Dock
or in Cmd+Tab. Look for the Slate tray icon in the menu bar.

## 1. Today checklist (User Story 1)

1. Left-click the tray icon → main window opens on the Today tab.
2. Add a checklist item → it appears, unchecked.
3. Check it off → it shows as complete.
4. Add a second item, then remove it → it disappears from the list.
5. Try adding an item with only spaces → nothing is created (FR-016).
6. Quit the app (tray menu → Quit) and relaunch → the first item is still there, still checked.

**Pass condition**: item text, checked state, and count all match step 3–4's end state after
relaunch (SC-002).

## 2. Topics — grouped checklists (User Story 2)

1. Switch to the Topics tab.
2. Create a category (e.g., "Groceries") → it appears as a labeled group.
3. Add two items under it, check one off → only that item shows complete.
4. Create a second category, add an item to it → confirm the two categories' items don't mix.
5. Rename the first category → name updates, its items are unchanged and still nested under it.
6. Delete the second category → it and its item disappear together (FR-009a).
7. Quit and relaunch → remaining category, its name, and its items/checked-state all persist.

**Pass condition**: rename and delete behave as one atomic action each; nothing bleeds across
categories; state survives relaunch.

## 3. Tracker table (User Story 3)

1. Switch to the Tracker tab.
2. Add a row; fill in Item, Category/Track, and Status with independent free text (e.g., Category/
   Track = "Side Project", unrelated to any Topics category name).
3. Edit the Status field → table reflects the change immediately.
4. Remove the row → it disappears.
5. Add a new row and quit/relaunch → the row and its field values persist exactly.

**Pass condition**: Category/Track accepts arbitrary text with no relation to Topics categories
(confirms FR-011a).

## 4. Notes (User Story 4)

1. Switch to the Notes tab.
2. Add a note, edit its text, confirm the update is displayed.
3. Delete a note → it disappears.
4. Quit/relaunch → remaining note text matches the last edit.

## 5. Quick Add (User Story 5)

1. With the main window closed, right-click the tray icon → context menu shows exactly "Quick Add
   to Today", "Quick Add to Notes", "Open Slate", "Quit"; the main window does **not** open.
2. Select "Quick Add to Today" → a small floating prompt appears (not the main window).
3. Type text, press Enter → prompt closes, main window still hasn't opened.
4. Now open the main window (tray left-click or "Open Slate") → the new item appears on the Today
   tab.
5. Repeat steps 2–4 for "Quick Add to Notes".
6. Open the main window first this time, then right-click → Quick Add to Today from the tray while
   the main window is visible → confirm the Today tab updates **immediately**, without switching
   tabs or reopening the window (validates the `data:changed` push, FR-024).
7. Open Quick Add, type nothing (or only spaces), press Enter → no entry is created (FR-023).
8. Open Quick Add, type text, press Escape → prompt closes, no entry is created (FR-022).

**Pass condition**: every Quick Add entry lands in the correct tab, and step 6 shows the change
appearing live in an already-open main window (SC-007).

## 6. Single instance (Clarifications, FR-027)

1. With Slate already running (tray icon visible), attempt to launch it again (e.g., `npm start`
   in a second terminal, or double-click the app again once packaged).
2. Confirm no second tray icon or process appears — instead, the existing main window is shown/
   focused (or nothing visibly changes if the window was already closed and stays closed).

## 7. First launch / empty and corrupt-data states (Edge Cases, FR-017, FR-018)

1. Quit Slate, delete `~/Library/Application Support/<app name>/slate-data.json`, relaunch.
2. Every tab shows a usable empty state (e.g., "No items yet") — no error, no crash (SC-006).
3. Add one item anywhere, quit, corrupt the JSON file (e.g., truncate it with a text editor),
   relaunch.
4. App starts normally with an empty state rather than failing to launch (FR-018).

## 8. Offline check (Constitution Principle II, SC-005)

1. Disconnect the machine from all networks (Wi-Fi off, no Ethernet).
2. Repeat sections 1–5 above — every tab remains fully usable.
