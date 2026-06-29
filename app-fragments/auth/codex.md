# M04 — Auth — Codex

## C1. Behaviour inventory

### Handler: subscribe
- **Source:** src/behaviours/AuthBehaviour.ts
- **Trigger:** component mount
- **Effect:** adds callback to subscribers Set, returns unsubscribe fn
- **State change:** subscribers Set

### Handler: notify (private)
- **Source:** src/behaviours/AuthBehaviour.ts
- **Trigger:** signOut / exitParentMode / setupParentPin
- **Effect:** calls all subscribers with event object
- **State change:** none

### Handler: getCurrentUser
- **Source:** src/behaviours/AuthBehaviour.ts
- **Trigger:** Layout effect (M10) on mount
- **Effect:** returns a copy of the current user (default or persisted)
- **State change:** none
- **Async:** awaits `ready` promise

### Handler: signOut
- **Source:** src/behaviours/AuthBehaviour.ts
- **Trigger:** Layout 'Sign Out' button click (M10 nav footer)
- **Effect:** clears persisted user, falls back to DEFAULT_USER, clears parent PIN
- **State change:** currentUser reset to DEFAULT_USER; localStorage keys removed
- **Side effects:** notifies subscribers with `{ type: 'signed_out' }`

### Handler: exitParentMode
- **Source:** src/behaviours/AuthBehaviour.ts
- **Trigger:** no UI consumer currently (placeholder)
- **Effect:** console.log + notify
- **State change:** none

### Handler: setupParentPin
- **Source:** src/behaviours/AuthBehaviour.ts
- **Trigger:** no UI consumer currently (PIN gate disabled per commit `54cd9152`)
- **Effect:** persists PIN to localStorage; notifies
- **State change:** localStorage `dominicstasks.parentpin.v2`

## C2. State machine

### States
- `currentUser: User` — source of truth (persisted to `dominicstasks.user.v2`)
- `subscribers: Set<(event) => void>` — pub/sub for change notifications

### Transitions
- `currentUser: DEFAULT_USER` → `currentUser: persisted` on construct (when localStorage has a value)
- `currentUser: persisted` → `currentUser: DEFAULT_USER` on `signOut()`

### Initial state
- `currentUser: DEFAULT_USER`; restored from localStorage on construct via `ready` promise

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| localStorage read `dominicstasks.user.v2` | construct | restore persisted user | User object |
| localStorage write `dominicstasks.parentpin.v2` | setupParentPin | persist PIN | pin string |
| localStorage remove (user + parentpin) | signOut | clear session | — |
| Subscribers notified | signOut / exitParentMode / setupParentPin | change event | `{ type, ... }` |

## C4. Input validation

### Input: pin string in setupParentPin
- **Type:** string
- **Valid range:** any (placeholder — real impl would validate length and digits)
- **Default:** none
- **Invalid input behaviour:** none — trusts caller

## C5. Failure modes

### Failure: localStorage read fails (corrupt JSON)
- **Trigger:** construct, JSON.parse throws
- **Detection:** try/catch around the parse
- **Recovery:** falls back to DEFAULT_USER; logs error
- **User-visible behaviour:** app renders with default user

### Failure: localStorage write fails (quota)
- **Trigger:** signOut / setupParentPin, setItem throws
- **Detection:** try/catch
- **Recovery:** logs error; in-memory state may not match persisted state
- **User-visible behaviour:** sign-out completes in memory but state may resurface on reload

## C6. User simulation list

### Action: Navigate to /login
- **Trigger:** browser URL
- **Expected outcome:** LandingPage renders (currently the main entry redirect target per AppRoutes)
- **DOM change:** landing page renders
- **State change:** none

### Action: Sign out
- **Trigger:** click 'Sign Out' in Layout nav footer (M10)
- **Expected outcome:** current user reset to DEFAULT_USER; PIN cleared; UI re-renders
- **DOM change:** UI re-renders without user-specific data
- **State change:** currentUser reset; localStorage cleared

### Action: Set parent PIN
- **Trigger:** PIN setup form (no UI consumer currently; method exists for future)
- **Expected outcome:** PIN persisted; future sign-in checks against it
- **DOM change:** none
- **State change:** localStorage `dominicstasks.parentpin.v2`

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + AuthBehaviour class signature + User interface
- **Expected output:** a session that signs in with default user, optionally sets a PIN, and signs out
- **Acceptance criteria:** getCurrentUser returns a parent user; signOut clears state; setupParentPin persists
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

Not applicable.