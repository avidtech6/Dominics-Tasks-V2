# M04 — Auth — Codex

## C1. Behaviour inventory

### Handler: exitParentMode
- **Source:** src/behaviours/AuthBehaviour.ts:24-26
- **Trigger:** UI button (not currently wired)
- **Effect:** console.log only
- **State change:** none

### Handler: setupParentPin
- **Source:** src/behaviours/AuthBehaviour.ts:28-31
- **Trigger:** UI form (not currently wired)
- **Effect:** console.log only
- **State change:** none

## C2. State machine

### Stateless declaration
AuthBehaviour is currently stateless — all methods are placeholders. Real auth state lives in FirebaseAuthRepository (when wired).

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| console.log | exitParentMode / setupParentPin | placeholder | string |

## C4. Input validation

None — no real inputs are processed.

## C5. Failure modes

### Failure: real auth never wired
- **Trigger:** app loads
- **Detection:** ProtectedPage is a no-op
- **Recovery:** none
- **User-visible behaviour:** app renders without auth check

## C6. User simulation list

### Action: Navigate to /login
- **Trigger:** browser URL
- **Expected outcome:** LandingPage renders (currently shown as the main entry redirect target per AppRoutes)
- **DOM change:** landing page renders
- **State change:** none

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + AuthBehaviour class
- **Expected output:** auth-gated routes render without auth check (because gating is disabled)
- **Acceptance criteria:** /admin renders ParentDashboard without PIN prompt
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

Not applicable.
