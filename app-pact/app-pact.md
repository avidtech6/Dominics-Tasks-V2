# App-Pact — DominicsTasks

**App ID:** avidtech6.dominicstasks
**Version:** 0.1.0 (post-FWV-v8 refactor)
**Status:** ACTIVE
**Date:** 2026-06-18

## Invariants

These are properties the app preserves. Breaking any invariant is a bug.

1. **Behaviour singletons are stable.** Each Behaviour class instance lives for the lifetime of the app. Components subscribe and receive all subsequent events.
2. **Task IDs are unique within an app session.** Generated as `task_<timestamp>_<random>`.
3. **Soft-delete preserves data.** `deleteTask` sets `status='cancelled'`, never removes from `tasks` array.
4. **Family has at least one parent.** `family.parentId` is always set; childIds may be empty.
5. **Chat messages have monotonic timestamps within an app session.** Generated at send-time.
6. **Routes resolve to exactly one component.** No orphan routes; catch-all redirects to `/`.

## Constraints

Hard rules the app enforces.

1. **No task with empty title.** Title is required at create time (UI prevents submit; behaviour doesn't validate).
2. **Status transitions: pending → in_progress → done OR pending → cancelled OR in_progress → cancelled.** No other transitions.
3. **Section is one of: assignments | extras | leftovers.** Other values are invalid.
4. **Behaviour → Component contract: components never mutate behaviour state directly; they call methods.**
5. **Repository abstraction (M00b): behaviours may delegate persistence to repositories, but currently do not. Repository interfaces exist for future wiring.**

## Guarantees

Promises the app makes to users.

1. **No dark patterns.** No manipulative UI, no achievement-shame, no monster/horror themes.
2. **Light mode only.** Single theme; no dark mode toggle.
3. **Family data is local-first.** Tasks, chat, profiles are stored in app memory; sync is a future feature.
4. **Parent actions are visible.** Any action tagged 'parent-only' (e.g., /admin, /parent-chat) is reachable but documented as parent-only in the UI.
5. **No third-party tracking.** No analytics, no telemetry to external services.

## Rules

1. **Behaviour-Component split is mandatory.** Every component `.tsx` has a paired `*.Behaviour.ts` (where applicable). UI components do not contain state-mutating logic.
2. **Repository pattern for persistence.** All persistence goes through a Repository interface. Local and Firebase impls must both work.
3. **TypeScript strict mode.** All code is TS; no `any` in production paths.
4. **No new dependencies without explicit approval.** The current `package.json` is the source of truth.
5. **The Recipe travels with the deployed app.** Every `app-fragments/*/` folder is part of the deliverable.
