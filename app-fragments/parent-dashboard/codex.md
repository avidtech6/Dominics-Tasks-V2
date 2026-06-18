# M09 — Parent Dashboard — Codex

## C1. Behaviour inventory

### Handler: PIN entry
- **Source:** src/components/PinPad.tsx
- **Trigger:** user types digits on PinPad
- **Effect:** on 4-digit entry, validates against stored PIN
- **State change:** local pin buffer

### Handler: validate PIN (disabled)
- **Source:** src/components/ParentPinModal.tsx (currently returns null)
- **Trigger:** PIN submission
- **Effect:** would compare to family.parentPin
- **State change:** none (modal disabled)

## C2. State machine

### States
- `pinBuffer: string[]` (PinPad local)
- `pinError: string | null` (PinPad local)

### Initial state
- `pinBuffer = []`, `pinError = null`

## C3. Side effects

None currently — PIN gate is disabled.

## C4. Input validation

### Input: PIN
- **Type:** 4-digit numeric string
- **Valid range:** exactly 4 digits
- **Default:** empty
- **Invalid input behaviour:** when enabled, show error; currently no validation

## C5. Failure modes

### Failure: PIN gate disabled
- **Trigger:** app loads
- **Detection:** ParentPinModal returns null
- **Recovery:** none
- **User-visible behaviour:** /admin renders without PIN

## C6. User simulation list

### Action: Navigate to /admin
- **Trigger:** browser URL
- **Expected outcome:** ParentDashboard renders (no PIN prompt)
- **DOM change:** dashboard renders
- **State change:** none

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md
- **Expected output:** /admin renders dashboard without auth
- **Acceptance criteria:** ParentDashboard visible
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

Not applicable.
