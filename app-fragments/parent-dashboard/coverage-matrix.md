# M09 — Parent Dashboard — Coverage Matrix

Verified against the post-alignment build (2026-06-29).

| Source feature | Source-line evidence | Recipe/codex claim | Implementation status | Test status |
|---|---|---|---|---|
| /admin renders ParentDashboard | `src/orchestrator/AppOrchestrator.tsx:88-89` route | recipe §A: parent-only admin surface | ✅ implemented | cascaded click-test: 08: Admin ✅ |
| Load pending approvals (async) | `src/components/ParentDashboard.tsx:118-127` | codex §C1: getPendingApprovals | ✅ implemented | run-validity (T-N/A — placeholder) |
| Transform approvals for display | `src/components/ParentDashboard.tsx:130-132` | recipe implicit | ✅ implemented | n/a |
| Approve task | `src/components/ParentDashboard.tsx` (calls taskBehaviour.approveTaskCompletion) | codex §C1: approveTaskCompletion placeholder | ⚠️ delegated to TaskBehaviour placeholder | n/a |
| Reject task | similar | codex §C1: rejectTaskCompletion placeholder | ⚠️ delegated to TaskBehaviour placeholder | n/a |
| PIN gate | `src/components/ParentDashboard.tsx` early return when `!isParent` | codex §C5: gate disabled per `54cd9152` | ✅ (gate disabled by design) | n/a |

## Out-of-scope

- Parent PIN gate is intentionally disabled per codex §C5 / commit `54cd9152`.
- Real approval sync requires Firebase swap (per codex §C1).
