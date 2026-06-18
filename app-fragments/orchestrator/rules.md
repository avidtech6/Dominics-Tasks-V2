# M00 — Orchestrator — Rules

## 1. Capability declaration

I CAN:
- Define React Router routes
- Wire behaviour instances into a context
- Render route → page mappings

I CANNOT:
- Replace React (FWV v8 doctrine expects vanilla; this module accepts React per project convention)
- Replace react-router-dom (the project is committed to it)

External validation required for:
- Visual layout of routes (Playwright click-test, see app-vp/protection/)

## 2. Do-not-proceed rule

If the BrowserRouter fails to mount (e.g., missing react-router-dom), I MUST stop and write blocker.md.

## 3. Contract primacy

This module's contract is recipe.md + codex.md. The actual route table is in AppOrchestrator.tsx.

## 4. Anti-drift enforcement

1. **Recipe → Source Check:** recipe.md route table matches AppRoutes in AppOrchestrator.tsx
2. **Visual Diff Check:** every route renders without white-screen (Playwright)
3. **Behavioural Check:** useBehaviours() returns 4 behaviours; throws outside provider
4. **Contract Check:** C6 user simulation list — all 3 navigations resolve

## 5. User-simulator requirement

I CAN simulate route navigation via Playwright. I CANNOT verify visual quality — external validator required.

## 6. Plan-as-law

Plan in app-fragments/orchestrator/plan.md — atomic step: import BrowserRouter, declare routes, declare provider, render.

## 7. Workflow pipeline

1. Read recipe.md route table
2. Verify each route's component exists
3. Render, observe console
4. PASS → continue, FAIL → blocker.md

## 8. User removal

I do not require the user to navigate manually — Playwright does it.

## 9. Coverage matrix instructions

Coverage matrix at app-fragments/orchestrator/coverage-matrix.md. 14 routes × 5 columns. Empty cells = FAIL.
