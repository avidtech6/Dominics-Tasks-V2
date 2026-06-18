# M05 — Calendar — Codex

## C1. Behaviour inventory

No event handlers — Calendar is a read-only view. Subscribes to TaskBehaviour for re-renders.

## C2. State machine

### States
- `currentMonth: Date` (local component state)
- Reads: `tasks` from TaskBehaviour

### Initial state
- `currentMonth = new Date()` (today's month)

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| TaskBehaviour re-render | task change event | re-render with new tasks | tasks array |

## C4. Input validation

None — display only.

## C5. Failure modes

### Failure: task with invalid dueDate
- **Trigger:** task.dueDate is malformed
- **Detection:** date-fns parsing throws
- **Recovery:** defensive parse with try/catch (if implemented) or skip
- **User-visible behaviour:** task omitted from grid

## C6. User simulation list

### Action: Navigate to /calendar
- **Trigger:** browser URL
- **Expected outcome:** month grid renders with task dots
- **DOM change:** calendar grid renders
- **State change:** none
- **Should NOT change:** tasks array

### Action: Click next/prev month
- **Trigger:** month nav buttons
- **Expected outcome:** grid updates to show new month
- **DOM change:** month label + grid cells update
- **State change:** currentMonth

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + TaskBehaviour + date-fns
- **Expected output:** month grid renders, dots on deadline dates
- **Acceptance criteria:** currentMonth change updates grid
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

### Surface: calendar
| view | mode=desktop | mode=mobile |
|---|---|---|
| calendar | shell=month-grid, view=calendar.html | shell=month-grid, view=calendar.html |
