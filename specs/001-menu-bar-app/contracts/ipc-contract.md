# IPC Contract: Slate Menu-Bar App

Slate's only "external interface" is the boundary between renderer processes (main window, Quick
Add window) and the Electron main process. Renderers never touch the filesystem or Node APIs
directly (research.md #6) — everything below is exposed to renderer code as `window.slate.*`
methods via each window's preload script, each returning a Promise.

Channel names follow `<domain>:<action>`. All `invoke` channels are handled with
`ipcMain.handle` and called with `ipcRenderer.invoke` (research.md #1).

## Invoke channels (renderer → main, request/response)

### Today
| Channel | Request payload | Response | Notes |
|---|---|---|---|
| `today:list` | — | `TodayItem[]` | Full current list |
| `today:add` | `{ text: string }` | `TodayItem` | Rejects (throws) if `text` is empty/whitespace |
| `today:toggle` | `{ id: string }` | `TodayItem` | Flips `done` |
| `today:remove` | `{ id: string }` | `{ id: string }` | No-op success if `id` already absent |

### Topics
| Channel | Request payload | Response | Notes |
|---|---|---|---|
| `topics:list` | — | `Category[]` | Full list, each with nested `items` |
| `topics:addCategory` | `{ name: string }` | `Category` | Rejects if `name` empty/whitespace |
| `topics:renameCategory` | `{ id: string, name: string }` | `Category` | Rejects if `name` empty/whitespace |
| `topics:deleteCategory` | `{ id: string }` | `{ id: string }` | Cascades to delete all items in it |
| `topics:addItem` | `{ categoryId: string, text: string }` | `CategoryItem` | Rejects if `text` empty/whitespace |
| `topics:toggleItem` | `{ categoryId: string, itemId: string }` | `CategoryItem` | Flips `done` |
| `topics:removeItem` | `{ categoryId: string, itemId: string }` | `{ itemId: string }` | — |

### Tracker
| Channel | Request payload | Response | Notes |
|---|---|---|---|
| `tracker:list` | — | `TrackerRow[]` | Full current list |
| `tracker:addRow` | — | `TrackerRow` | Creates a row with all fields empty strings |
| `tracker:updateRow` | `{ id: string, field: 'item'\|'category'\|'status', value: string }` | `TrackerRow` | Updates one field |
| `tracker:removeRow` | `{ id: string }` | `{ id: string }` | — |

### Notes
| Channel | Request payload | Response | Notes |
|---|---|---|---|
| `notes:list` | — | `Note[]` | Full current list |
| `notes:add` | `{ text: string }` | `Note` | Rejects if `text` empty/whitespace |
| `notes:update` | `{ id: string, text: string }` | `Note` | Rejects if `text` empty/whitespace |
| `notes:remove` | `{ id: string }` | `{ id: string }` | — |

### Quick Add (called only from the Quick Add window)
| Channel | Request payload | Response | Notes |
|---|---|---|---|
| `quickAdd:submit` | `{ target: 'today'\|'notes', text: string }` | `{ entry: TodayItem \| Note }` | Rejects if `text` empty/whitespace (FR-023); internally calls the same create path as `today:add`/`notes:add` |

### App / window control
| Channel | Request payload | Response | Notes |
|---|---|---|---|
| `app:openMain` | — | — | Shows/focuses the main window (used by "Open Slate" and tray left-click) |
| `app:quit` | — | — | Quits the app (used by "Quit" in the tray menu) |

All rejected (invalid-input) calls reject the Promise with a plain `Error` carrying a short
message (e.g., `"text is required"`); there is no structured error-code scheme in v1.

## Push channel (main → renderer, one-way)

| Channel | Payload | Sent to | Notes |
|---|---|---|---|
| `data:changed` | `{ section: 'today'\|'topics'\|'tracker'\|'notes', data: <full section array> }` | Every currently-open renderer window (`webContents.send`) | Fired after every successful mutation on that section, including ones originating from the Quick Add window (FR-024) |

The main window listens for `data:changed` and replaces the in-memory data for the named section,
then re-renders only that tab — it never needs to call the matching `:list` channel in response,
since the full updated section is already in the payload.

## Contract test coverage note

Per constitution Principle V, v1 verification of this contract is manual: `quickstart.md` walks
through every channel above indirectly by exercising each user story through the actual UI.
