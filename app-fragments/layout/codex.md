# M10 — Layout — Codex

## C1. Behaviour inventory

### Handler: nav link click
- **Source:** src/components/Layout.tsx
- **Trigger:** click nav link
- **Effect:** react-router navigates to target route
- **State change:** none (router handles)

## C2. State machine

### Stateless declaration
No state. Pure layout shell.

## C3. Side effects

None at layout level — children manage their own side effects.

## C4. Input validation

None.

## C5. Failure modes

None — pure render.

## C6. User simulation list

### Action: Click nav link
- **Trigger:** click "Calendar" in nav
- **Expected outcome:** URL changes to /calendar, content swaps
- **DOM change:** outlet swaps to <Calendar/>
- **State change:** none at layout level

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + react-router-dom
- **Expected output:** layout renders with nav + outlet
- **Acceptance criteria:** nav links navigate correctly
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

### Surface: layout
| view | mode=desktop | mode=mobile |
|---|---|---|
| layout | shell=top-nav+outlet, view=layout.html | shell=hamburger+outlet, view=layout.html |
