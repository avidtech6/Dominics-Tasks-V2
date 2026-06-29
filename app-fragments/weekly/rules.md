# M-Weekly — Rules

Operational rules and invariants the Weekly View must honour.

## R1. Read-only
- No new task creation. No drag-drop. No in-place edit.
- All edits route to the existing TaskModal on `/tasks` via `?edit=<id>` query param.

## R2. Categories are data, not config
- Walk `task.section` over active tasks in the week. Never hard-code a category list.

## R3. Time windows
- Week = Mon 00:00 → Sun 23:59:59.999 (local time), `weekStartsOn: 1` in date-fns.
- Tasks owned outside the week are excluded from the view.

## R4. "Done" definition
- A task is "done" iff `task.status === TaskStatus.Done` ('done'). Cancelled tasks are NOT done.

## R5. Streak rule
- Streak = consecutive days (anchored at today) where ≥1 task is `done`.
- If today has no done tasks, anchor at yesterday (so the streak doesn't punish an unwritten morning).
- Hidden from the UI when streak < 2 (per recipe §C).

## R6. ADHD-safe palette
- No red anywhere. Done = emerald, EP = amber, warning = rose (only for "Catch Up" category background).
- Encouragement quote rotates through 7 entries; never scolding.

## R7. Reduced motion
- All transitions are CSS-only (Tailwind `transition-*`). CSS engine respects `prefers-reduced-motion: reduce` automatically. No JS hooks needed.

## R8. Tests
- Cascaded click-test must cover: route renders, hero, 7 day-lanes, today highlighted, expand/collapse a category card, toggle completion.
- Adding a new feature requires a coverage-matrix entry + a codex §C entry.