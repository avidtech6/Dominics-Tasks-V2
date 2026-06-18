# M12 — Error Boundary — Codex

## C1. Behaviour inventory

### Handler: componentDidCatch
- **Source:** src/components/ErrorBoundary.tsx
- **Trigger:** any child component throws during render
- **Effect:** logs error to console
- **State change:** none directly (handled by getDerivedStateFromError)

### Handler: getDerivedStateFromError
- **Source:** src/components/ErrorBoundary.tsx
- **Trigger:** render error in child
- **Effect:** sets hasError=true, returns new state
- **State change:** state.hasError

## C2. State machine

### States
- `hasError: boolean`

### Initial state
- `hasError = false`

### Transitions
- `hasError: false` → `hasError: true` on child render error

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| console.error | child render error | log | error + stack |

## C4. Input validation

None — lifecycle-only component.

## C5. Failure modes

### Failure: error in error boundary itself
- **Trigger:** ErrorBoundary throws
- **Detection:** React unmounts entire tree
- **Recovery:** none
- **User-visible behaviour:** blank page

## C6. User simulation list

### Action: Trigger error in child
- **Trigger:** child component throws (synthetic)
- **Expected outcome:** fallback UI renders
- **DOM change:** error UI replaces children
- **State change:** hasError

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + React error boundary pattern
- **Expected output:** children render normally; on throw, fallback shows
- **Acceptance criteria:** trigger error → see fallback
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

Not applicable.
