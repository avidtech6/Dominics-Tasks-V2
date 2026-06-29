# M-Weekly — Plan

## Implementation order (FWV v8 module-first)

1. ✅ Write recipe.md (intent)
2. ✅ Write codex.md (handlers + state + tests)
3. ✅ Write rules.md (invariants)
4. ✅ Write coverage-matrix.md (acceptance evidence)
5. ✅ Write WeeklyBehaviour (pure functions)
6. ✅ Write WeeklyHero, DayRail, DayLane, CategoryCard, WeekSummaryCard (5 components)
7. ✅ Write Weekly.tsx page (composes all)
8. ✅ Add /weekly route to AppOrchestrator
9. ✅ Add Weekly to Layout sidebar nav
10. ✅ Add `?edit=<id>` query param reader in Tasks.tsx (so Weekly edits route back)
11. ⏳ Add cascaded click-test entries
12. ⏳ Build + push + verify deploy + cascaded test
13. ⏳ Final report

## Acceptance criteria

- [x] `app-fragments/weekly/{recipe,codex,rules,coverage-matrix,module-meta,ingredients,plan}.md|json` all present (7 files)
- [ ] 76+ existing tests still PASS
- [ ] Cascaded click-test shows Weekly page renders + 7 day-lanes + expand/collapse works
- [x] `/weekly` route mounted in AppOrchestrator
- [x] Sidebar nav has "Weekly" link
- [x] No new task types / statuses / storage keys (verified by grep)
- [x] Reuses CategoryLaneBehaviour (shared with M-Family-View)

## Out of scope (deferred)

- Drag-drop on weekly cards (recipe says read-only)
- Multi-week navigation (prev/next week picker)
- Custom date ranges
- Notifications