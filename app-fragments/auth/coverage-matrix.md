# M04 — Auth — Coverage Matrix

Verified against the post-alignment build (2026-06-29).

| Source feature | Source-line evidence | Recipe/codex claim | Implementation status | Test status |
|---|---|---|---|---|
| getCurrentUser returns persisted or default User | `src/behaviours/AuthBehaviour.ts:80-83` | recipe §B Inputs / codex §C1: getCurrentUser | ✅ implemented | run-validity (TaskBehaviour tests indirectly cover localStorage round-trip) |
| signOut clears state | `src/behaviours/AuthBehaviour.ts:48-58` (added during alignment) | codex §C1: signOut handler / §C5: sign-out clears | ✅ implemented (after alignment) | manual |
| exitParentMode placeholder | `src/behaviours/AuthBehaviour.ts:60-63` | codex §C1: exitParentMode placeholder | ✅ implemented (per codex; placeholder) | manual |
| setupParentPin placeholder | `src/behaviours/AuthBehaviour.ts:65-72` | codex §C1: setupParentPin placeholder | ✅ implemented (per codex; placeholder; persists to localStorage) | manual |
| subscribe / notify | `src/behaviours/AuthBehaviour.ts:36-44` | codex §C1: subscribe/notify | ✅ implemented | run-substrate (cross-behaviour subscribe patterns) |
| whenReady resolves after localStorage load | `src/behaviours/AuthBehaviour.ts:31-33` | recipe §C Reconstruct Notes: "Behaviour instances are scoped to the React tree via useMemo with empty deps" | ✅ implemented | orchestrator useEffect: setReady(true) only after Promise.all |

## Notes

The pre-alignment Auth code was already a stateful behaviour (in code) but the codex described it as stateless. The codex was rewritten during alignment to match the actual code semantics — the recipe codex now accurately documents `currentUser: User` and `signOut()` as real handlers, not just placeholders.
