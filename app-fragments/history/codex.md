# M07 — History — Codex

## C1. Behaviour inventory

### Handler: filter toggle
- **Source:** src/pages/History.tsx (local component handler)
- **Trigger:** click filter button
- **Effect:** changes visible filter (done / cancelled / all)
- **State change:** local filter state

## C2. State machine

### States
- `filter: 'done' | 'cancelled' | 'all'` (local)

### Initial state
- `filter = 'all'`

## C3. Side effects

None.

## C4. Input validation

None.

## C5. Failure modes

None — read-only view.

## C6. User simulation list

### Action: Navigate to /history
- **Trigger:** browser URL
- **Expected outcome:** list of completed/cancelled tasks renders
- **DOM change:** history list appears

### Action: Toggle filter
- **Trigger:** click filter button
- **Expected outcome:** list updates
- **DOM change:** filtered list re-renders
- **State change:** filter

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + TaskBehaviour
- **Expected output:** history page renders, filter works
- **Acceptance criteria:** empty history shows empty state; non-empty shows tasks
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

Not applicable.
