# M-Weekly — Weekly View

## A. Product Description

Read-only weekly overview of all tasks. Same data as Daily View, presented as 7 day-lanes with per-category swimlanes. Designed to feel like Apple Reminders / Notion timeline, not a spreadsheet.

- **Source:**
  - UI: `src/pages/Weekly.tsx`
  - Components: `WeeklyHero`, `DayRail`, `DayLane`, `CategoryCard`, `WeekSummaryCard`
  - Behaviour: `src/behaviours/WeeklyBehaviour.ts` (pure functions), `src/behaviours/CategoryLaneBehaviour.ts` (shared with M-Family-View)
- **Surface:** `/weekly`

## B. Structural Contract

### Inputs
- `taskBehaviour.getTasks()` — all tasks (active + done, but not soft-deleted)
- Current week (Mon → Sun, computed from today's date)

### Outputs
- **WeeklyHero** strip: total tasks, total EP earned, streak days, completion ratio
- **DayRail**: 7 sticky horizontal pills (Mon → Sun). Today highlighted.
- **DayLane × 7**: per-day row. Left column = day label. Right column = horizontal swimlane of `CategoryCard`s.
- **CategoryCard**: only rendered if the category has ≥1 task on that day. Soft pastel pill with icon, name, count, status dots, first 2 task titles faded.
- **DaySummaryStrip**: per-day summary at bottom — `✓ N done · ⭐ N EP · 🔥 streak day N`. Hidden if all zero.
- **WeekSummaryCard**: below Sunday — totals + best day + rotating encouragement.

### Layout

```
<Weekly>
  <WeeklyHero />
  <DayRail />
  {weekDays.map(d => <DayLane day={d} />)}
  <WeekSummaryCard />
</Weekly>
```

CSS grid per lane: `grid-cols-[7rem_1fr]`. Swimlane: `flex flex-row gap-3 overflow-x-auto snap-x snap-mandatory`. Each card: `snap-start shrink-0 w-52`.

### Behaviour
- All categories are **discovered from data** (no hardcoded list). Walk `task.section` over the week's tasks.
- Tap a day-pill → smooth-scroll to that day's lane.
- Tap a CategoryCard → toggles inline expansion to show task titles + checkboxes.
- Tap a task title → sets `editingTask` and opens the existing TaskModal (no new modal wiring).
- Tap a task checkbox → calls `taskBehaviour.completeTask(id)`.
- Today auto-scrolls into view on mount.

### No new task types, statuses, or storage keys
- Reuses: Task interface, TaskStatus, pointsValue, dueDate / deadlineDate / createdAt
- Reuses: CategoryLaneBehaviour from M-Family-View (groupByCategoryForDay, getCategoryMeta)
- Reuses: TaskBehaviour (read-only: `getTasks`, `getTasksSync`, `completeTask`)
- Reuses: existing TaskModal (opened via `editingTask`)

## C. Reconstruction Notes

- The page is **read-only**. No new tasks created here. (Existing "Add Task" lives on /tasks.)
- Categories per day are dynamic. Empty days show a soft placeholder card ("Nothing planned — rest day 🌿") instead of nothing.
- Streak = consecutive days with ≥1 task marked `done`, anchored at today. Hidden if <2.
- Encouragement quote rotates from a 7-entry pool keyed by `day.getDate() % 7`.
- Animations respect `prefers-reduced-motion: reduce` (CSS media query, no JS hook needed).