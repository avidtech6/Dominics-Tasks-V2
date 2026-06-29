# M-Weekly — Coverage Matrix

Verified against the post-alignment build (2026-06-30).

| Source feature | Source-line evidence | Recipe/codex claim | Implementation status | Test status |
|---|---|---|---|---|
| `/weekly` route | `src/orchestrator/AppOrchestrator.tsx` (route added) | recipe §A: Surface `/weekly` | ✅ implemented | cascaded click-test: 11: Weekly page ✅ |
| Sidebar nav link | `src/components/Layout.tsx` (Weekly entry added) | recipe §C: "Sidebar 'Weekly' link" | ✅ implemented | manual / cascaded click-test |
| WeeklyHero strip | `src/components/WeeklyHero.tsx` | recipe §B Outputs: WeeklyHero | ✅ implemented | manual |
| DayRail sticky pills | `src/components/DayRail.tsx` | recipe §B Outputs: DayRail, today highlighted | ✅ implemented | manual / cascaded click-test (verify `data-day-iso` per pill) |
| DayLane × 7 stacked | `src/components/DayLane.tsx` | recipe §B Outputs: DayLane, day label + swimlane | ✅ implemented | cascaded click-test (verify 7 lanes with `data-day-iso`) |
| CategoryCard auto-discover | `src/components/CategoryCard.tsx` + `CategoryLaneBehaviour.groupByCategoryForDay` | recipe §B: "categories discovered from data, no hardcoded list" | ✅ implemented | manual |
| CategoryCard visual (icon + name + count + status dots + first 2 titles) | `src/components/CategoryCard.tsx` | recipe §B Outputs: CategoryCard structure | ✅ implemented | manual |
| Empty-day placeholder | `src/components/DayLane.tsx` ("Nothing planned — rest day") | recipe §C: empty days show placeholder | ✅ implemented | cascaded click-test (one day expected empty by default) |
| Day summary strip | `src/components/DayLane.tsx` | recipe §B Outputs: DaySummaryStrip | ✅ implemented | manual |
| WeekSummaryCard | `src/components/WeekSummaryCard.tsx` | recipe §B Outputs: WeekSummaryCard | ✅ implemented | cascaded click-test (verify totals + best day + quote) |
| Tap day-pill → scroll | `src/components/DayRail.tsx` (scrollIntoView) | recipe §C: Navigation | ✅ implemented | manual |
| Tap CategoryCard → expand | `src/components/CategoryCard.tsx` (expanded state) | recipe §C: Navigation | ✅ implemented | cascaded click-test (verify expand-collapse) |
| Tap task title → open TaskModal | `src/pages/Weekly.tsx` (onOpenTask → setEditingTask) | recipe §C: reuses existing TaskModal | ✅ implemented | manual |
| Tap checkbox → completeTask | `src/pages/Weekly.tsx` (onToggleComplete → taskBehaviour.completeTask) | recipe §C: reuses TaskBehaviour.completeTask | ✅ implemented | cascaded click-test (verify status flips to done) |
| Today auto-scrolls into view on mount | `src/pages/Weekly.tsx` (useEffect) | recipe §C: "Today auto-scrolls" | ✅ implemented | manual |
| Streak counter | `src/behaviours/WeeklyBehaviour.ts` `computeStreak` | recipe §C: "Streak = consecutive days with ≥1 done" | ✅ implemented | manual |
| Encouragement quote rotation | `src/behaviours/WeeklyBehaviour.ts` `pickQuote` | recipe §C: 7-entry pool keyed by date | ✅ implemented | manual |
| ADHD: no red | All components use green/amber/gray (no red) | recipe §C: ADHD-friendly principles | ✅ implemented | visual |
| ADHD: empty day is "rest day 🌿" not "you failed" | `src/components/DayLane.tsx` empty state | recipe §C: "Quiet days are valid" | ✅ implemented | visual |
| prefers-reduced-motion respected | CSS-only animations (Tailwind transition classes) | recipe §C: respect reduced-motion | ✅ implemented (CSS auto-handles) | manual |
| Reuses CategoryLaneBehaviour | `import { groupByCategoryForDay } from '../behaviours/CategoryLaneBehaviour'` | recipe §C: "Reuses CategoryLaneBehaviour from M-Family-View" | ✅ implemented | unit (validity test) |
| No new task types / statuses | Zero changes to `src/data/types.ts` | recipe §C: no new task types | ✅ verified by code review | n/a |
| No new storage keys | Zero changes to StorageAdapter / TaskBehaviour | recipe §C: no new storage keys | ✅ verified by code review | n/a |

## Out-of-scope

- **Drag-drop on Weekly cards** — recipe §C says read-only; drag is Daily View's job (M01)
- **Editing in place** — all edits route through the existing TaskModal
- **Custom date range** — recipe §C: only "this week" (Mon→Sun containing today)