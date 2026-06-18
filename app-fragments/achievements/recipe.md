# M08 — Achievements

## A. Product Description

Achievement badges unlocked by task completion milestones. ConfettiCelebration fires on unlock.

- **Source:**
  - UI: `src/pages/Achievements.tsx`, `src/components/AchievementBadge.tsx`, `src/components/ConfettiCelebration.tsx`
  - Behaviour hooks: AchievementBadgeBehaviour, ConfettiCelebrationBehaviour

## B. Structural Contract

### Achievement rules
- "First Task" — complete 1 task
- "5 in a row" — complete 5 tasks without skipping
- "Helper" — comment on someone else's task
- (etc. — defined in AchievementBadgeBehaviour)

### Confetti trigger
- Fires on task complete when milestone reached

## C. Reconstruction Notes

- Currently the achievements are visual-only — the unlock logic is in AchievementBadgeBehaviour.
- ConfettiCelebration uses a CSS animation, no real physics.
