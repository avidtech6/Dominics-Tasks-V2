# M08 — Achievements — Codex

## C1. Behaviour inventory

### Handler: checkAchievement (per completion)
- **Source:** src/components/AchievementBadgeBehaviour.ts
- **Trigger:** TaskBehaviour notify event with type='task_updated' status='done'
- **Effect:** evaluates rules, sets unlocked flags, fires confetti
- **State change:** local unlocked Set

### Handler: triggerConfetti
- **Source:** src/components/ConfettiCelebrationBehaviour.ts
- **Trigger:** achievement unlock
- **Effect:** shows confetti for N seconds
- **State change:** local showConfetti state

## C2. State machine

### States
- `unlocked: Set<achievementId>` (local component state)
- `showConfetti: boolean`

### Initial state
- `unlocked = empty`, `showConfetti = false`

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| Confetti render | achievement unlock | DOM render | confetti particles |
| Confetti cleanup | timer expires | DOM unmount | particles removed |

## C4. Input validation

None.

## C5. Failure modes

None — visual only.

## C6. User simulation list

### Action: Navigate to /achievements
- **Trigger:** browser URL
- **Expected outcome:** grid of badges (some locked, some unlocked based on history)
- **DOM change:** badges render

### Action: Complete a task (cross-module trigger)
- **Trigger:** complete a task on /tasks
- **Expected outcome:** if milestone reached, confetti fires; new badge unlocks
- **DOM change:** confetti overlay, badge unlock animation
- **State change:** unlocked Set, showConfetti

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + TaskBehaviour event source
- **Expected output:** achievements page renders, confetti fires on task complete
- **Acceptance criteria:** visible confetti + unlocked badge state
- **Module class:** B (depends on TaskBehaviour event source)

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

### Surface: achievements
| view | mode=desktop | mode=mobile |
|---|---|---|
| achievements | shell=badge-grid, view=achievements.html | shell=badge-grid, view=achievements.html |
