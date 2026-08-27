# Slate — Roadmap & Design Doc

**Owner:** Md Mahmudul Islam
**Repo:** slate
**Methodology:** Spec-Driven Development (GitHub Spec Kit) + Claude Code
**Status:** Sprint 1 in progress

---

## 1. Product intent

A personal macOS menu-bar productivity app. v1 is a fixed-shape tool: a
daily checklist, grouped prep topics, a simple item tracker, and freeform
notes — always one click away in the menu bar. Configurability (custom
tabs, presets, reset-and-reuse for other purposes) is deliberately deferred
past v1 so the first version stays small enough to actually ship.

## 2. Tech direction

- **Shell:** Electron (menu-bar tray app, no Dock icon)
- **Renderer:** single-file HTML/CSS/JS, no build step for v1
- **Storage v1:** main-process-owned JSON file (app.getPath('userData')), accessed via IPC — not browser localStorage.
- **Storage v2 (later sprint):** hosted backend + sync
- **Packaging:** `electron-builder` later, unsigned for personal use early on

## 3. Sprint plan

| Sprint | Goal | Key deliverables | Status |
|---|---|---|---|
| **0 — Foundation** | Repo + Spec Kit + SDLC scaffolding | GitHub repo, `specify init`, `constitution.md`, README, `.gitignore` | Done |
| **1 — Slate v1 MVP** | Working offline app, fixed 4 tabs (Today / Topics / Tracker / Notes), packaged | `specs/001-menu-bar-app/{spec.md,plan.md,tasks.md}`; implemented via Claude Code; tagged `v0.1.0` | Implemented — Phase 8 manual verification pending |
| **2 — Customization & presets** | Configurable tabs, groups, presets, non-destructive reset | Settings UI spec; preset data model | Not started |
| **3 — Notifications** | Reminders for daily checklist | Notification spec, permission handling | Not started |
| **4 — CI/CD basics** | Automated checks on every push | GitHub Actions: lint, build check, auto-draft release on tag | Not started |
| **5 — Online/sync version** | Data follows you across devices | Backend spec (auth, storage, Terraform-provisioned infra), sync strategy | Not started |
| **6 — Packaging & distribution** | Real installable app | Code signing/notarization, auto-update, install docs | Not started |

Each sprint = its own `/speckit-specify` → `/speckit-clarify` → `/speckit-plan`
→ `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement` cycle per
feature. A feature can move to a later sprint at any time — just update its
row above; the `specs/00X-.../` folder stays untouched until you pick it
back up.

## 4. Definition of done (per sprint)

- All tasks in that sprint's `tasks.md` checked off or explicitly deferred
- App runs and does what the spec says, verified manually
- Commits reference task IDs (e.g. `feat: tray icon toggle (T003)`)
- Sprint tagged in git (`v0.1.0`, `v0.2.0`, ...) once merged
- Status column above updated

## 5. Status log

- **Sprint 0:** complete — repo live, Spec Kit initialized, constitution written.
- **Sprint 1:** constitution + spec.md written for `001-menu-bar-app`. Next: `/speckit-clarify`, then `/speckit-plan`.