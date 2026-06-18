# M-parent-dashboard — Rules

## 1. Capability declaration

I CAN render this module's UI; I CAN read state from its behaviour class.

I CANNOT verify visual quality — external validator (Playwright) required.

## 2. Do-not-proceed rule

If the behaviour class is missing or fails to instantiate, STOP and write blocker.md.

## 3. Contract primacy

This module's contract is recipe.md + codex.md. Source files are reference.

## 4. Anti-drift enforcement

1. Recipe → Source Check: recipe.md sources match actual files
2. Visual Diff Check: Playwright renders match recipe geometry
3. Behavioural Check: C6 actions work
4. Contract Check: codex.md items match behaviour signatures

## 5. User-simulator requirement

Playwright drives navigation. C6 lists user actions.

## 6. Plan-as-law

Plan at app-fragments/parent-dashboard/plan.md. Atomic step per UI surface.

## 7. Workflow pipeline

1. Read recipe.md
2. Verify sources exist
3. Render via Playwright
4. PASS / FAIL → blocker.md if FAIL

## 8. User removal

User not required for verification.

## 9. Coverage matrix instructions

Coverage matrix at app-fragments/parent-dashboard/coverage-matrix.md. 5 columns. Empty = FAIL.
