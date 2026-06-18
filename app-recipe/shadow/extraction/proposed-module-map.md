# Proposed Module Map — DominicsTasks

**Source:** `src/` extracted in Phase 1
**Refactorer:** Mavis (mavis)
**Date:** 2026-06-18

## Module inventory

Each module is a feature area, with its UI components, behaviour class, and data repository.

### M01 — Tasks (core feature)

- **Purpose:** Task creation, kanban-board display, completion, evidence, deadlines, recurrence
- **UI components:** `pages/Tasks.tsx`, `components/TaskCard.tsx`, `components/TaskColumn.tsx`, `components/TaskModal.tsx`, `components/CommentsModal.tsx`
- **Behaviour:** `behaviours/TaskBehaviour.ts`, `components/TaskCardBehaviour.ts`, `components/TaskModalBehaviour.ts`, `components/CommentsModalBehaviour.ts`
- **State:** task array (id, title, description, status, assigneeId, deadlineDate, recurrence, level, evidence)
- **Routes:** `/tasks`
- **Repository:** `data/TaskRepository.ts` (interface), `data/LocalTaskRepository.ts` + `data/FirebaseTaskRepository.ts`

### M02 — Family Chat

- **Purpose:** Family member-to-member chat, parent-private channel, message seeding
- **UI components:** `pages/FamilyChat.tsx`, `pages/ParentChat.tsx`
- **Behaviour:** `behaviours/ChatBehaviour.ts`
- **State:** messages array, currentChannel ('family' | 'parent')
- **Routes:** `/chat`, `/parent-chat`
- **Repository:** `data/ChatRepository.ts` + Local/Firebase impls

### M03 — Family Setup & Profiles

- **Purpose:** First-run family creation, profile selection (child/parent), member roster
- **UI components:** `components/FamilySetupScreen.tsx`, `components/ProfileSelectionScreen.tsx`
- **Behaviour:** `behaviours/FamilyBehaviour.ts`, paired Behaviour hooks
- **State:** family object (name, members[], pin), currentProfileId
- **Routes:** `/setup`, `/profile-select`
- **Repository:** `data/FamilyRepository.ts` + impls

### M04 — Authentication

- **Purpose:** Login (Google OAuth via Firebase), auth state, current user
- **UI components:** `pages/LandingPage.tsx`, `pages/Login.tsx`
- **Behaviour:** `behaviours/AuthBehaviour.ts`
- **State:** user object, isAuthenticated, isParent
- **Routes:** `/login`
- **Repository:** `data/AuthRepository.ts` + `data/FirebaseAuthRepository.ts`

### M05 — Calendar

- **Purpose:** Month view of tasks with deadlines
- **UI components:** `pages/Calendar.tsx`
- **Behaviour:** reads from TaskBehaviour
- **State:** currentMonth, derived from TaskBehaviour.tasks
- **Routes:** `/calendar`

### M06 — Resources

- **Purpose:** Family resource links
- **UI components:** `pages/Resources.tsx`
- **Behaviour:** static
- **Routes:** `/resources`

### M07 — History

- **Purpose:** Completed-task log
- **UI components:** `pages/History.tsx`
- **Behaviour:** reads from TaskBehaviour (filtered by status=done)
- **Routes:** `/history`

### M08 — Achievements

- **Purpose:** Achievement badges unlocked by task completion
- **UI components:** `pages/Achievements.tsx`, `components/AchievementBadge.tsx`, `components/ConfettiCelebration.tsx`
- **Behaviour:** achievement unlock logic, confetti trigger
- **Routes:** `/achievements`

### M09 — Parent Dashboard

- **Purpose:** Parent-only admin surface
- **UI components:** `components/ParentDashboard.tsx`, `components/ParentPinModal.tsx`, `components/PinPad.tsx`
- **Behaviour:** PIN-gate logic (currently disabled per commit `54cd9152`)
- **Routes:** `/admin`

### M10 — Layout & Navigation

- **Purpose:** App shell, top nav, route outlet
- **UI components:** `components/Layout.tsx`
- **Behaviour:** nav state, current route
- **Routes:** all (wraps everything)

### M11 — Comments on Tasks

- **Purpose:** Per-task comment thread
- **UI components:** `pages/TaskComment.tsx`, `components/CommentsModal.tsx`
- **Behaviour:** read + write comments on a task
- **Routes:** `/task-comment/:taskId`

### M12 — Error Boundary

- **Purpose:** Catch-all error display
- **UI components:** `components/ErrorBoundary.tsx`
- **Behaviour:** static fallback

## Cross-cutting modules

- **M00 — AppOrchestrator:** `src/orchestrator/AppOrchestrator.tsx` — wires all behaviours into a React context, sets up router
- **M00b — Data layer:** `src/data/*` — Repository pattern, abstracts LocalStorage vs Firebase
- **M00c — Types & constants:** `src/data/types.ts`, `src/data/constants.ts`, `src/data/utils.ts`
- **M00d — Achievement widget:** `components/AchievementBadge.tsx` + Behaviour — used by Tasks (M01) and Achievements (M08)

## State — singleton instances

Per `behaviours/*.ts`, each Behaviour class exports a singleton:

```ts
export const authBehaviour = new AuthBehaviour();
export const chatBehaviour = new ChatBehaviour();
export const familyBehaviour = new FamilyBehaviour();
export const taskBehaviour = new TaskBehaviour();
```

AppOrchestrator instantiates fresh copies in its useMemo (re-declared singletons).

## Decision

The codebase is **already modular**. The refactor goal is not to invent modules from scratch — it's to:

1. Document each module's contract (recipe + codex + rules)
2. Verify the Behaviour-Component split is complete (every component has a paired Behaviour)
3. Build the Trace Atlas (component → behaviour → repository)
4. Capture the App-Pact (invariants, constraints)
5. Write validity tests
6. Make the Recipe portable
