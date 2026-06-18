# M06 — Resources — Codex

## C1. Behaviour inventory

No event handlers. Static.

## C2. State machine

### Stateless declaration
Static content. No state.

## C3. Side effects

None.

## C4. Input validation

None.

## C5. Failure modes

None — read-only static page.

## C6. User simulation list

### Action: Navigate to /resources
- **Trigger:** browser URL
- **Expected outcome:** list of links renders
- **DOM change:** list appears

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md
- **Expected output:** /resources renders without crash
- **Acceptance criteria:** page mounts
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

Not applicable.
