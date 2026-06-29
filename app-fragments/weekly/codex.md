# M-Weekly — Codex

## C1. Behaviour inventory

### Handler: getWeekRange
- **Source:** `src/behaviours/WeeklyBehaviour.ts`
- **Trigger:** Weekly page mount
- **Effect:** returns `{ start: Mon 00:00, end: Sun 23:59:59.999 }` for the week containing `today`
- **State change:** none (pure)

### Handler: groupTasksByDay
- **Source:** `src/behaviours/WeeklyBehaviour.ts`
- **Trigger:** whenever `tasks` or `weekRange` changes
- **Effect:** returns `Record<isoDate, Task[]>` — active (non-deleted) tasks grouped by their owning date within the week
- **State change:** none

### Handler: groupByCategoryForDay
- **Source:** `src/behaviours/CategoryLaneBehaviour.ts` (shared with M-Family-View)
- **Trigger:** derived per-day within each DayLane
- **Effect:** returns `Record<section, Task[]>` for the given day, sorted by priority desc then pointsValue desc
- **State change:** none

### Handler: computeStreak
- **Source:** `src/behaviours/WeeklyBehaviour.ts`
- **Trigger:** Weekly page render
- **Effect:** returns the count of consecutive days (anchored at today) where ≥1 task is `done`
- **State change:** none

### Handler: pickQuote
- **Source:** `src/behaviours/WeeklyBehaviour.ts`
- **Trigger:** Weekly page render
- **Effect:** returns one of 7 ADHD-friendly encouragement messages keyed by `day.getDate() % 7`
- **State change:** none

### Handler: scrollToDay
- **Source:** `src/components/DayRail.tsx` (inline)
- **Trigger:** tap on day-pill
- **Effect:** `document.getElementById('day-${iso}').scrollIntoView({ behavior: 'smooth', block: 'start' })`
- **State change:** none (DOM only)

## C2. State machine

### States
- `tasks: Task[]` — derived from `taskBehaviour.getTasks()` + `subscribe` for live updates
- `today: Date` — `new Date()` once on mount
- (No local toggle state — the page is single-lens, read-only)

### Transitions
- `tasks: []` → `tasks: [seed, ...]` on `subscribe` event
- (No user-driven state transitions — page is read-only)

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| `taskBehaviour.subscribe` | mount | update `tasks` on every notify | `{ type, ... }` |
| `taskBehaviour.unsubscribe` | unmount | cleanup | — |
| `document.scrollIntoView` | day-pill tap | smooth-scroll to day-lane | — |
| `taskBehaviour.completeTask(id)` | task checkbox tap | mark task done | Task |

## C4. Input validation

None — page is read-only. Validation lives on the underlying TaskBehaviour (which is unchanged).

## C5. Failure modes

### Failure: empty week (no tasks at all)
- **Trigger:** first-ever load before seed, or all tasks deleted
- **Detection:** `Object.keys(groupTasksByDay).every(k => groupTasksByDay[k].length === 0)`
- **Recovery:** render empty-state placeholder per day; WeekSummaryCard shows "Fresh week." instead of stats
- **User-visible behaviour:** clean page, no error

### Failure: taskBehaviour.subscribe throws
- **Trigger:** storage corruption
- **Detection:** error in useEffect catch
- **Recovery:** console.error; page still renders initial tasks
- **User-visible behaviour:** page works but doesn't auto-update

## C6. User simulation list

### Action: Navigate to /weekly
- **Trigger:** click "Weekly" in sidebar OR direct URL
- **Expected outcome:** Weekly page renders with 7 day-lanes, hero strip, end-of-week summary
- **DOM change:** page content swaps to weekly layout
- **State change:** none

### Action: Tap a day-pill in DayRail
- **Trigger:** click on Mon/Tue/.../Sun pill
- **Expected outcome:** browser scrolls to that day-lane at the top of the viewport
- **DOM change:** window scroll position changes
- **State change:** none

### Action: Tap a CategoryCard
- **Trigger:** click on a category pill
- **Expected outcome:** card expands inline to show task titles + checkboxes
- **DOM change:** category card grows in height, task list revealed
- **State change:** local `expanded: Record<dayIso-section, boolean>`

### Action: Tap a task title in expanded card
- **Trigger:** click task title
- **Expected outcome:** TaskModal opens in edit mode (existing wiring from M01 Tasks)
- **DOM change:** modal overlay appears
- **State change:** `editingTask: Task | null` set at page level

### Action: Tap task checkbox in expanded card
- **Trigger:** click circle icon
- **Expected outcome:** task marked done, summary strip updates on next render
- **DOM change:** checkbox turns green; strike-through on title
- **State change:** task.status → 'done' via TaskBehaviour

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + WeeklyBehaviour + Weekly page
- **Expected output:** a route at `/weekly` showing 7 day-lanes with category-cards, hero summary, and end-of-week card
- **Acceptance criteria:** all 22 cascaded click-test entries still pass + new weekly-specific entries pass
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-29 by Mavis (mavis)

## C8. Shape matrix

Not applicable — page is read-only, no shape polymorphism.