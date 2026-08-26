<!--
Sync Impact Report
- Version change: (unratified template) → 1.0.0
- Rationale: Initial ratification. The prior file was an unfilled placeholder scaffold with no
  concrete project values, so this is treated as MAJOR (first substantive constitution), not an
  amendment to a pre-existing governed document.
- Modified principles: n/a (all five principle slots newly defined)
  - I. Simplicity First (YAGNI) [new]
  - II. Offline-First [new]
  - III. Minimal Stack, No Framework Creep [new]
  - IV. Interview-Explainable Code [new]
  - V. Pragmatic Testing (Manual Checklist for v1) [new]
- Added sections: Technology & Architecture Constraints; Development Workflow; Governance
- Removed sections: none
- Templates requiring follow-up: none checked in this run (scope guard restricts this command to
  the constitution file only) — dependent templates (plan/spec/tasks) read this file at runtime.
- Follow-up TODOs: none
-->

# Slate Constitution

## Core Principles

### I. Simplicity First (YAGNI)
Slate v1 ships a fixed, non-configurable feature set. Tabs, layout, and behavior are hardcoded
for v1; customization systems, user presets, themes, and plugin/extension points MUST NOT be
built until a later sprint explicitly scopes them. When a feature could be built generically or
specifically, build it specifically for the current known need. Do not add configuration options,
abstraction layers, or extensibility hooks speculatively "for later" — later gets its own sprint
and its own constitution amendment if it changes these constraints.

Rationale: This is a single-developer personal tool. Every layer of configurability is a layer of
code the developer alone must build, test, and maintain. Deferring customization keeps v1
shippable and keeps the codebase small enough to hold in one head.

### II. Offline-First
Slate MUST be fully functional with no network connection. Core features (viewing and using any
tab, persisting user data) MUST NOT depend on a network call succeeding. Any future feature that
does require network access MUST degrade gracefully to a usable offline state rather than
blocking the UI.

Rationale: Slate is a personal macOS menu-bar utility meant to be available instantly, regardless
of network state — that reliability is the core value proposition of a menu-bar tool.

### III. Minimal Stack, No Framework Creep
Slate is an Electron app with a single-file HTML/CSS/JS renderer. Do not introduce a frontend
framework (React, Vue, Angular, Svelte, etc.), a bundler/build pipeline, or a component system for
v1. Renderer code stays plain HTML/CSS/JS in a single file unless a documented, specific need
(e.g., file size becomes unmanageable) forces a split — and any such split MUST stay within plain
JS modules, not a framework adoption.

Rationale: A single-file, framework-free renderer is the simplest thing that can work for a
fixed-tab v1, avoids build-tooling overhead for a personal project, and keeps the entire rendering
layer readable in one sitting.

### IV. Interview-Explainable Code
Every piece of code MUST be simple enough that the developer can explain what it does and why, out
loud, in an interview setting, without notes. Prefer plain, direct logic over clever one-liners,
implicit magic, or deep indirection. If a design choice can't be justified in a sentence or two,
it needs to be simplified.

Rationale: This project doubles as a portfolio/interview artifact for a single developer. Code
that can't be explained clearly on the spot fails that purpose regardless of whether it works.

### V. Pragmatic Testing (Manual Checklist for v1)
Automated test suites are NOT required for v1. A manual test checklist, run before each release,
is an acceptable and sufficient verification method for v1 scope. Automated tests MAY be
introduced later if complexity, regression frequency, or scope growth justifies the investment —
that decision is made explicitly, not by default.

Rationale: For a small, fixed-scope, single-developer v1, a manual checklist catches regressions
at a fraction of the setup cost of a test harness, and matches the Simplicity First principle.

## Technology & Architecture Constraints

- Platform: macOS menu-bar app, built on Electron.
- Renderer: single-file HTML/CSS/JS; no frontend framework, no bundler required for v1.
- Navigation: fixed set of tabs only. No user-defined tabs, presets, or configuration UI in v1 —
  explicitly deferred to a later sprint.
- Connectivity: offline-first; no required network dependency for core functionality.

## Development Workflow

- Commits MUST follow the Conventional Commits format and MUST reference the task ID they
  implement (e.g., `feat(T012): add pomodoro tab timer`).
- As a single-developer project, there is no mandatory PR review gate, but every change MUST be
  self-checked against this constitution (especially Principles I and III) before being merged to
  main.
- Any feature that reintroduces customization, presets, or a frontend framework before its
  dedicated sprint requires a constitution amendment first, not a silent exception.

## Governance

This constitution supersedes ad hoc practice for Slate. Amendments are made by editing this file
and recording a Sync Impact Report at the top of it, including a version bump per semantic
versioning: MAJOR for backward-incompatible principle removals/redefinitions, MINOR for new
principles or materially expanded guidance, PATCH for clarifications and wording fixes. Because
this is a single-developer project, the developer self-ratifies amendments, but every amendment
MUST still be recorded with its rationale so the history of *why* constraints changed is
preserved. Compliance is self-reviewed at each planning phase (`/speckit-plan`'s Constitution
Check) and before merging any change to main.

**Version**: 1.0.0 | **Ratified**: 2026-08-24 | **Last Amended**: 2026-08-24
