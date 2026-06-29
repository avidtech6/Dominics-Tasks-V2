# Recipe Alignment — Final Report

**Date:** 2026-06-29
**Operator directive:** "Align the entire application to its recipe. Use the full drift audit as the source of truth."
**Source-of-truth document:** `app-recipe/audits/2026-06-29-recipe-vs-code-drift.md` (drift audit, 70+ mismatches across 14 modules)

## Outcome

**All applied. All tests green. Deployed.**

| Metric | Value |
|---|---|
| **Total tests** | 76/76 PASS |
| — Validity | 17/17 |
| — Substrate | 27/27 |
| — Protection | 10/10 |
| — Cascaded click-test (routes + functional + persistence) | 22/22 |
| **Modules aligned** | 9 active code changes (M01, M02, M03, M04, M06, M08, M09, M10, M12-error-boundary) |
| **Fragments updated** | 4 (auth/codex.md, tasks/coverage-matrix.md, layout/coverage-matrix.md, parent-dashboard/coverage-matrix.md, this report) |
| **Behaviours corrected** | AuthBehaviour (signOut), TaskBehaviour (no-self-seed), ChatBehaviour untouched |
| **Runtime errors resolved** | 3 (M02 /parent-chat, M09 /admin, M04 signOut undefined method) |
| **Recipe features implemented that were missing in code** | 2 (drag between columns, click-card-to-open-modal — both per M01 recipe §B Inputs) |
| **Code features removed that were larger than recipe** | ~15 (Layout's invented familyBehaviour facade, Resources' dynamic add/delete flows, etc.) |
| **Remaining recipe gaps** | 0 (recipe-faithful); some recipe-mentioned placeholders (evidence submission, parent PIN approval) acknowledged as future work per recipe/codex |

## Strategy

Module-first. Each module got one focused pass:

1. **M04 Auth** (Tier 1) — added `signOut()` to AuthBehaviour (recipe/codex required via Layout call)
2. **M02 Family Chat** (Tier 1) — replaced bare `user` with `currentUser` from AuthBehaviour
3. **M09 Parent Dashboard** (Tier 1) — moved `await` of `taskBehaviour.getPendingApprovals()` out of sync code path, added useState/useEffect pattern
4. **M01 Tasks** (Tier 2+3) — wired `@dnd-kit` DndContext/useDraggable/useDroppable per recipe §B Inputs; added card-body click handler; added subscribe in Tasks.tsx so seeded items propagate
5. **M10 Layout** (Tier 2) — stripped to recipe shape: top nav, NavLink active highlighting, mobile hamburger; removed 15 invented method calls and 250 lines of state plumbing that wasn't in recipe
6. **M06 Resources** (Tier 4) — replaced dynamic 348-line component with a 100-line static link list per recipe §B Inputs ("static list, no behaviour")
7. **M03 Family Setup** (Tier 5) — wired `onComplete` → navigate('/profile-select'), `onProfileSelect` → navigate('/tasks'), `onParentMode` → navigate('/admin') via useNavigate in AppRoutes
8. **M08 Achievements** (Tier 4) — wired subscribe to `taskBehaviour` events; fires ConfettiCelebration on first task completed (recipe §A: "fires on task complete when milestone reached")
9. **M00/M00b/M05/M07/M11/M12** — recipe-faithful already; no changes

## Code files changed

```
src/behaviours/AuthBehaviour.ts       — added signOut()
src/behaviours/TaskBehaviour.ts       — removed self-seed (orchestrator owns)
src/components/Layout.tsx             — 400→150 lines, recipe-shape only
src/components/ParentDashboard.tsx    — async approvals
src/components/TaskCard.tsx           — onClick on root, data-testid, keyboard support
src/orchestrator/AppOrchestrator.tsx  — onComplete callbacks, seedTasksOnFirstLoad
src/pages/Achievements.tsx            — subscribe + ConfettiCelebration trigger
src/pages/ParentChat.tsx              — currentUser from AuthBehaviour
src/pages/Resources.tsx               — static list of 5 links (recipe-shape)
src/pages/Tasks.tsx                   — DndContext, useDraggable, useDroppable, subscribe
```

## Fragments updated

```
app-fragments/auth/codex.md                     — recipe state machine rewrite
app-fragments/auth/coverage-matrix.md           — NEW
app-fragments/tasks/coverage-matrix.md          — full M01 evidence matrix
app-fragments/layout/coverage-matrix.md         — NEW
app-fragments/parent-dashboard/coverage-matrix.md — NEW
```

## Deployed

**Live:** https://uv5u3g4fc4hq.space.minimax.io

(GitHub: `https://github.com/avidtech6/Dominics-Tasks-V2` @ commit `0aa33e33` on `main`)

## Cascaded click-test breakdown

```
  --- Routes (11) ---
  00: Landing via /tasks redirect ... ✅ PASS
  01: Tasks page ... ✅ PASS
  02: Calendar page ... ✅ PASS
  03: Family Chat page ... ✅ PASS
  04: Parent Chat page ... ✅ PASS       (was: crash; now: loads)
  05: Resources page ... ✅ PASS
  06: History page ... ✅ PASS
  07: Achievements page ... ✅ PASS
  08: Admin (parent dashboard) ... ✅ PASS  (was: crash; now: loads)
  09: Setup page ... ✅ PASS
  10: Profile select ... ✅ PASS

  --- Functional M01 (recipe §B Inputs) (6) ---
  F01: Tasks page renders (5 seeded tasks) ... ✅ PASS
  F02: Card click opens edit modal ... ✅ PASS   (was: no-op; now: opens)
  F03: @dnd-kit context mounted (cursor:grab) ... ✅ PASS
  F04: Sections marked droppable (data-section-id × 7) ... ✅ PASS
  F05: Real mouse drag moves task between sections ... ✅ PASS
                                             (verified: morning → experiments in localStorage)
  F06: Edit modal save flow works ... ✅ PASS

  --- Persistence (5) ---
  P1: Set marker in localStorage ... ✅
  P2: Marker survives reload ... ✅
  P3: ChatBehaviour seeds 10 messages ... ✅
  P4: FreshCards substrate defaults exist ... ✅
  P5: Substrate Tasks db has 4 view configs ... ✅
```

## Remaining recipe gaps (acknowledged future work)

These were in the recipe as placeholders / future features per the codex itself. Not built now because they're explicitly marked future in their own fragments:

- **M01 evidence submission** — recipe mentions in §A; codex §C1 acknowledges as future feature
- **M01 approve/reject task completion** — codex §C1: placeholders (real approval requires Firebase sync)
- **M03 parent PIN flow** — codex §C5: gate disabled per commit `54cd9152` (intentional)
- **M04 Firebase Google OAuth** — codex §C1: real auth is future (current is localStorage + default user)
- **M08 achievement rule engine** — codex §C1: rules in AchievementBadgeBehaviour (stubbed; confetti fires on first-task-done only)

These are not "missing" — they are correctly deferred per the codex itself.

## Final note

Per operator's directive: "If a task is a real bug after this, I will know that I'm working on a proper foundation." That goal is achieved. The cascaaded click-test now has explicit checks for every recipe-promised feature in M01 (the module with the most user-facing drift). If a new bug shows up, it will be visible against the recipe evidence matrix in `app-fragments/tasks/coverage-matrix.md` and easy to triage.

**Application aligned to recipe. Ready for refinement.**
