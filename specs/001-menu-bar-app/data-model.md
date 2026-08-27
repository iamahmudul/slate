# Data Model: Slate Menu-Bar App

Slate's entire persisted state is one JSON document, held in memory by the main process and
mirrored to `app.getPath('userData')/slate-data.json` on every change. There is no schema
migration system in v1 — the shape below is the only shape.

## Root document shape

```json
{
  "today": [ /* TodayItem[] */ ],
  "topics": [ /* Category[] */ ],
  "tracker": [ /* TrackerRow[] */ ],
  "notes": [ /* Note[] */ ]
}
```

If the file is missing or fails to parse on launch, the main process starts from this default
empty shape instead of failing to launch (FR-018).

## Entities

### TodayItem
Backs the Today tab (User Story 1).

| Field | Type | Notes |
|---|---|---|
| `id` | string | `crypto.randomUUID()`, immutable, assigned on create |
| `text` | string | Non-empty, trimmed; entries with empty/whitespace-only text are rejected (FR-016) |
| `done` | boolean | Defaults to `false` on create; toggled by the user (FR-006) |
| `createdAt` | string (ISO 8601) | Set once on create; not shown in UI in v1, kept for future sort/debug use |

No automatic daily reset (FR-007) — items persist until the user removes or unchecks them.

### Category
Backs the Topics tab (User Story 2). A Category owns a nested list of items — it is not a
separate top-level collection.

| Field | Type | Notes |
|---|---|---|
| `id` | string | `crypto.randomUUID()` |
| `name` | string | Non-empty, trimmed; user-defined, freely created (FR-009); renamable in place (FR-009b) |
| `items` | CategoryItem[] | Nested checklist items; deleting the category deletes all of them (FR-009a) |

No reordering or merging of categories in v1 (FR-009c).

### CategoryItem
Nested inside a `Category.items` array. Same shape and rules as `TodayItem` minus `createdAt`:

| Field | Type | Notes |
|---|---|---|
| `id` | string | `crypto.randomUUID()`, unique within its parent category |
| `text` | string | Non-empty, trimmed (FR-016) |
| `done` | boolean | Defaults to `false`; toggled independently per item, per category (FR-008) |

### TrackerRow
Backs the Tracker tab (User Story 3).

| Field | Type | Notes |
|---|---|---|
| `id` | string | `crypto.randomUUID()` |
| `item` | string | Free text; may be empty while a row is being filled in |
| `category` | string | Free text, independent of and unrelated to `Category.name` (FR-011a) |
| `status` | string | Free text, not a fixed enum (FR-011) |

A row with all three fields empty is a transient editing state in the UI, not a rule enforced at
the data layer — the data layer only rejects the empty-text case for Today/Topics/Notes create
actions per FR-016, since Tracker rows are edited cell-by-cell rather than created with initial
text.

### Note
Backs the Notes tab (User Story 4).

| Field | Type | Notes |
|---|---|---|
| `id` | string | `crypto.randomUUID()` |
| `text` | string | Non-empty, trimmed on create (FR-016); editable afterward |
| `updatedAt` | string (ISO 8601) | Refreshed on every edit; not shown in UI in v1 |

## Relationships

- `Category` 1—N `CategoryItem` (nesting, not a foreign key — items live inside their category's
  `items` array and are deleted with it).
- `TrackerRow.category` and `Category.name` are deliberately **not** linked (clarified during
  `/speckit-clarify`) — same word, two independent free-text concepts.
- `today`, `topics`, `tracker`, and `notes` are independent top-level collections; nothing in the
  data model connects a Today item, a Tracker row, and a Note to each other.

## State transitions

- `TodayItem.done` / `CategoryItem.done`: `false ↔ true`, user-toggled, no other states.
- `Category`: created → (renamed)* → deleted. Rename only changes `name`; delete removes the
  `Category` and all its `CategoryItem`s in one operation.
- `TrackerRow.status`: free text, edited in place — no enumerated states or transitions to enforce.
- `Note.text`: edited in place; `updatedAt` advances on each edit.

## Validation rules (data-layer, enforced in `src/main/store.js`)

- Reject creating a `TodayItem`, `CategoryItem`, or `Note` when the given text is empty or
  whitespace-only after trimming (FR-016, FR-023).
- Reject creating a `Category` with an empty/whitespace-only name.
- Deleting a `Category` cascades to delete all of its `CategoryItem`s (FR-009a).
- All `id` fields are generated server-side (main process) via `crypto.randomUUID()`; renderers
  never supply or invent an `id` when creating an entity.
- If the atomic write to `slate-data.json` fails, the in-memory document is still updated and
  becomes the source of truth for the rest of the session — the app does not crash and does not
  show an error dialog. The next mutation's write path retries persisting the full document to
  disk (FR-028).
