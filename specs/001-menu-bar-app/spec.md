# Feature Specification: Slate Menu-Bar App

**Feature Branch**: `001-menu-bar-app`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "Build a macOS menu-bar app called Slate. It lives in the menu bar (not the Dock) and opens a small window when clicked. It has four fixed tabs: Today (a daily checklist), Topics (grouped checklists by category), Tracker (a simple table: item, category/track, status), and Notes (freeform list). All data is saved locally so it persists between launches. No settings, no customization, no presets in this version — tab names and structure are hardcoded for now."

## Clarifications

### Session 2026-08-26

- Q: Should Slate prevent a second instance of the app from being launched while one is already running, instead of opening two separate windows? → A: Yes — enforce single instance; a second launch attempt focuses/shows the existing window instead of opening a new one.
- Q: Should the Tracker tab's "Category/Track" values be drawn from the same categories created in Topics, or be a fully independent free-text field? → A: Independent — Tracker's Category/Track is its own free-text field, unrelated to Topics categories.
- Q: Should users be able to delete or rename an entire Topics category, not just the items inside it? → A: Both — users can delete a category (and its items) as one action, and rename a category in place. No reordering or merging of categories.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Daily Checklist in Today (Priority: P1)

A user clicks the Slate icon in the menu bar to open the app, lands on the Today tab, and manages
a checklist of things to do today: adding items, checking them off, and removing ones no longer
needed.

**Why this priority**: This is the primary daily-use loop and the reason the app lives in the menu
bar — quick, frictionless access to "what do I need to do today." It must work standalone as the
smallest viable version of Slate.

**Independent Test**: Can be fully tested by opening the app, adding a checklist item on the Today
tab, marking it complete, quitting and relaunching the app, and confirming the item and its
completion state are still there.

**Acceptance Scenarios**:

1. **Given** the Today tab is open with no items, **When** the user adds a new checklist item,
   **Then** the item appears in the list, unchecked.
2. **Given** a checklist item exists on the Today tab, **When** the user checks it off, **Then**
   it is visually marked complete and that state is retained.
3. **Given** a checklist item exists on the Today tab, **When** the user removes it, **Then** it
   no longer appears in the list.
4. **Given** the user has added and checked off items, **When** the app is quit and reopened,
   **Then** the Today checklist shows the same items in the same completion state as before quitting.

---

### User Story 2 - Grouped Checklists in Topics (Priority: P2)

A user switches to the Topics tab to manage checklists organized under named categories (e.g.,
"Groceries", "Reading List"), so that recurring or reference lists stay organized by subject
rather than mixed into a single daily list.

**Why this priority**: Extends the core checklist capability from User Story 1 with organization,
which is the next most valuable capability after having any checklist at all.

**Independent Test**: Can be fully tested by creating a category, adding checklist items under it,
checking/unchecking and removing items, and confirming the grouping and item states persist across
an app relaunch.

**Acceptance Scenarios**:

1. **Given** the Topics tab is open, **When** the user creates a new category, **Then** it appears
   as a labeled group that items can be added under.
2. **Given** a category with checklist items, **When** the user adds an item to that category,
   **Then** the item appears nested under that category only.
3. **Given** items exist under two different categories, **When** the user checks off an item in
   one category, **Then** only that item's state changes; other categories are unaffected.
4. **Given** categories and items have been created, **When** the app is quit and reopened,
   **Then** all categories and their items appear exactly as left, with completion states intact.
5. **Given** a category with items exists, **When** the user deletes that category, **Then** the
   category and all items under it are removed together.
6. **Given** a category exists, **When** the user renames it, **Then** the category displays the
   new name and all its items remain under it unchanged.

---

### User Story 3 - Status Tracking in Tracker (Priority: P3)

A user switches to the Tracker tab to see a simple table of items being tracked, each with a
category/track label and a current status, so they can scan progress across several ongoing
things at a glance.

**Why this priority**: Provides an at-a-glance overview distinct from checklists — useful, but
depends on the app already being usable for basic list management (User Stories 1-2).

**Independent Test**: Can be fully tested by adding a row to the Tracker table with an item name,
category/track, and status, editing the status, and confirming the row and its updated status
persist across an app relaunch.

**Acceptance Scenarios**:

1. **Given** the Tracker tab is open, **When** the user adds a new row, **Then** it appears in the
   table with editable Item, Category/Track, and Status fields.
2. **Given** an existing tracker row, **When** the user updates its status, **Then** the table
   reflects the new status immediately.
3. **Given** an existing tracker row, **When** the user removes it, **Then** it no longer appears
   in the table.
4. **Given** rows exist in the Tracker table, **When** the app is quit and reopened, **Then** all
   rows and their current status values appear exactly as left.

---

### User Story 4 - Freeform Notes (Priority: P4)

A user switches to the Notes tab to jot down freeform text notes that don't fit a checklist or
table format, for quick capture of thoughts, links, or reminders.

**Why this priority**: Useful complementary capability, but least structurally dependent on the
rest of the app and lowest-impact if delayed relative to the other three tabs.

**Independent Test**: Can be fully tested by adding a note, editing its text, deleting a note, and
confirming remaining notes persist across an app relaunch.

**Acceptance Scenarios**:

1. **Given** the Notes tab is open, **When** the user adds a new note, **Then** it appears in the
   notes list as an editable free-text entry.
2. **Given** an existing note, **When** the user edits its text, **Then** the updated text is
   saved and displayed.
3. **Given** an existing note, **When** the user deletes it, **Then** it no longer appears in the
   list.
4. **Given** notes exist, **When** the app is quit and reopened, **Then** all remaining notes
   appear with their latest saved text.

---

### User Story 5 - Quick Add via Menu Bar (Priority: P5)

A user right-clicks the Slate icon in the menu bar and adds an item to Today or a note to Notes
directly from the context menu, without opening the main window, so that capturing a fleeting
thought takes one click instead of a full context switch.

**Why this priority**: Depends on the Today (P1) and Notes (P4) tabs already existing, since Quick
Add writes into the same lists those tabs display. It's a convenience layer on top of stories
already built, not a foundation for anything else.

**Independent Test**: Can be fully tested by right-clicking the menu-bar icon without opening the
main window, selecting "Quick Add to Today," typing text, pressing Enter, then opening the main
window and confirming the item appears in the Today checklist. Repeat for "Quick Add to Notes."

**Acceptance Scenarios**:

1. **Given** the main window is closed, **When** the user right-clicks the menu-bar icon, **Then**
   a context menu appears offering "Quick Add to Today," "Quick Add to Notes," "Open Slate," and
   "Quit" — and the main window does not open.
2. **Given** the context menu is open, **When** the user selects "Quick Add to Today" or "Quick
   Add to Notes," **Then** a small floating text-entry prompt appears near the menu bar.
3. **Given** the Quick Add prompt is open with text entered, **When** the user presses Enter,
   **Then** the text is appended as a new entry to the corresponding list, the prompt closes, and
   the main window does not open.
4. **Given** the Quick Add prompt is open, **When** the user presses Escape, **Then** the prompt
   closes without creating any entry.
5. **Given** an item was added via Quick Add, **When** the user later opens the main window,
   **Then** the item appears in the corresponding tab exactly as entered.

---

### Edge Cases

- What happens when a user tries to add a checklist item, tracker row, or note with empty text?
  The app must not create a blank entry.
- What happens on the very first launch, before any data exists? Each tab must show an empty,
  usable state (e.g., "No items yet") rather than an error.
- What happens if the app is force-quit (e.g., via Activity Monitor) instead of quit normally?
  Previously saved data must still be intact on next launch; only changes made after the last
  successful save may be lost.
- What happens if the local data file is missing or corrupted on launch? The app must start with
  an empty state per tab rather than crashing.
- How does the app behave when the user clicks the menu-bar icon while the window is already open?
  The window toggles closed (click again to hide).
- How does the app behave when the user clicks outside the open window?
  The window closes, mirroring standard macOS menu-bar app behavior.
- How does the app behave when the user right-clicks the menu-bar icon?
  A context menu appears instead of the toggle window, offering: "Quick Add to Today", "Quick Add to Notes", "Open Slate", and "Quit".
- How does Quick Add work?
  Selecting "Quick Add to Today" or "Quick Add to Notes" opens a small floating text-entry prompt near the menu bar (not the full app window). Typing text and pressing Enter appends it to the corresponding list and closes the prompt. Pressing Escape cancels without adding anything.
- What happens if the user tries to launch Slate while it is already running? The app enforces a
  single running instance; the second launch attempt brings the existing window to the front
  instead of starting a new process or window.
- What happens if the main window is already open when the user adds an item via Quick
  Add? The relevant tab (Today or Notes) in the already-open window updates to show the
  new entry immediately, without the user needing to close/reopen the window or switch
  tabs away and back.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST run as a macOS menu-bar (status bar) application and MUST NOT appear in
  the Dock or the Cmd+Tab application switcher.
- **FR-002**: Left-clicking the menu-bar icon MUST toggle a small window open or closed, anchored
  near the menu bar.
- **FR-003**: Clicking outside the open window MUST close it.
- **FR-004**: The window MUST present exactly four tabs, in this fixed order: Today, Topics,
  Tracker, Notes.
- **FR-005**: Tab names, tab order, and overall tab structure MUST be hardcoded. The app MUST NOT
  provide any UI for adding, removing, renaming, or reordering tabs in this version.
- **FR-006**: The Today tab MUST let users add a checklist item, mark an item complete or
  incomplete, and remove an item.
- **FR-007**: The Today checklist MUST NOT automatically clear or reset itself between days;
  items and their completion state persist until the user removes them or unchecks them manually.
- **FR-008**: The Topics tab MUST let users create a named category, add checklist items under a
  specific category, mark items complete or incomplete, and remove items.
- **FR-009**: The Topics tab MUST let users create new categories freely; categories are
  user-defined content, not a fixed/hardcoded list.
- **FR-009a**: The Topics tab MUST let users delete an entire category as a single action, which
  also removes all checklist items nested under it.
- **FR-009b**: The Topics tab MUST let users rename an existing category in place; the category's
  items remain unchanged and still grouped under it after the rename.
- **FR-009c**: The Topics tab MUST NOT support reordering or merging categories in this version.
- **FR-010**: The Tracker tab MUST display a table with exactly three columns — Item,
  Category/Track, and Status — and MUST let users add a row, edit any of the three fields on a
  row, and remove a row.
- **FR-011**: The Status field on a Tracker row MUST be free-form text entered by the user, not
  restricted to a fixed set of predefined values.
- **FR-011a**: The Category/Track field on a Tracker row MUST be free-form text entered by the
  user, independent of and unrelated to the categories created in the Topics tab. The two are
  separate concepts that happen to share the word "category."
- **FR-012**: The Notes tab MUST let users add a freeform text note, edit an existing note's text,
  and delete a note.
- **FR-013**: The app MUST persist all data (Today checklist items, Topics categories and items,
  Tracker rows, Notes entries) to local storage on the device.
- **FR-014**: The app MUST automatically restore all persisted data when relaunched, with no
  manual "load" or "import" action required from the user.
- **FR-015**: The app MUST remain fully functional (all four tabs usable, all data readable and
  editable) with no network/internet connection available.
- **FR-016**: The app MUST NOT create a new checklist item, tracker row, or note when the entered
  text is empty or whitespace-only.
- **FR-017**: Each tab MUST show a clear, non-error empty state when it has no data yet (e.g., on
  first launch).
- **FR-018**: If the local data file is missing or unreadable on launch, the app MUST start with
  an empty state instead of failing to launch.
- **FR-019**: Right-clicking the menu-bar icon MUST show a context menu instead of toggling the
  main window, containing exactly: "Quick Add to Today", "Quick Add to Notes", "Open Slate", and
  "Quit".
- **FR-020**: Selecting "Quick Add to Today" or "Quick Add to Notes" MUST open a small floating
  text-entry prompt near the menu bar, distinct from the main window.
- **FR-021**: Submitting non-empty text in the Quick Add prompt via Enter MUST append it as a new
  entry to the corresponding list (an unchecked item for Today, a note for Notes) and close the
  prompt without opening the main window.
- **FR-022**: Pressing Escape while the Quick Add prompt is open MUST close it without creating
  any entry.
- **FR-023**: The Quick Add prompt MUST NOT create an entry from empty or whitespace-only text
  (same rule as FR-016).
- **FR-024**: Data added via Quick Add MUST be reflected in the main window's
  corresponding tab immediately if that window is already open, and automatically on
  next open if it was closed — since both read from and write through the same
  persisted data store.
- **FR-025**: Selecting "Open Slate" from the context menu MUST open the main window, equivalent
  to a left-click when the window is closed.
- **FR-026**: Selecting "Quit" from the context menu MUST quit the application.
- **FR-027**: The app MUST enforce a single running instance. If the user attempts to launch Slate
  while it is already running, the app MUST bring the existing window to the front (or leave it as
  the single menu-bar process) instead of starting a second instance.

### Key Entities

- **Checklist Item**: A single to-do entry with text content and a completion state (checked/
  unchecked). Used by both the Today tab (ungrouped) and the Topics tab (grouped under a category).
- **Category**: A user-created named group under the Topics tab that checklist items belong to.
  Users can create, rename, and delete categories (deleting removes its items too); categories
  cannot be reordered or merged in this version.
- **Tracker Row**: An entry with three free-text fields — Item, Category/Track, and Status —
  representing one thing being tracked. Category/Track is independent free text, not a reference
  to a Topics Category.
- **Note**: A freeform text entry shown in the Notes tab, independent of any checklist or table
  structure.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open Slate from the menu bar and see their previously saved data on
  screen within 1 second of the window appearing.
- **SC-002**: 100% of data entered in any tab (checklist items, categories, tracker rows, notes)
  is still present, with correct state, after quitting and relaunching the app.
- **SC-003**: A user can add a new item to the Today checklist and mark it complete in under 5
  seconds from opening the app, without leaving the Today tab.
- **SC-004**: The app never appears in the Dock or Cmd+Tab switcher, verified across 100% of
  manual launch checks.
- **SC-005**: All four tabs remain fully usable (view, add, edit, remove data) with the device's
  network connection disabled.
- **SC-006**: On first launch with no prior data, every tab displays a usable empty state rather
  than an error or blank crash screen.
- **SC-007**: A user can add an item via the right-click Quick Add menu — from right-click to the
  entry being saved — in under 3 seconds, without the main window ever opening.
- **SC-008**: If the main window is open when an item is added via Quick Add, the
  corresponding tab shows the new entry within 1 second, with no manual refresh action
  from the user.

## Assumptions

- Target platform is macOS only; no Windows/Linux support is in scope for this version.
- The app window is a single, standard window (not resizable panels or multiple windows); exact
  pixel dimensions are an implementation detail decided during planning.
- Standard menu-bar app dismissal behavior applies: clicking outside the open window closes it,
  and clicking the menu-bar icon again toggles it closed.
- No login, accounts, or multi-user support — the app manages a single local user's data on a
  single machine, with no sync between machines in this version.
- No settings, preferences, customization, or presets UI exists in this version, per explicit
  scope from the feature description and the project constitution.
- "Local" persistence means data is stored on the same machine and is not backed up or synced
  elsewhere automatically in this version.
- Launch-at-login behavior is out of scope for this version; the user starts the app manually.
- Quick Add supports only the Today checklist and the Notes list. Topics (which requires choosing
  a category) and Tracker (which requires three fields) are not reachable via Quick Add and are
  managed only from the main window.
- The Quick Add prompt and the main window read from and write to the same local data store —
  there is no separate or cached copy; a change made in one is immediately visible in the other.