# App-Codex (Index) — DominicsTasks

**App ID:** avidtech6.dominicstasks
**Date:** 2026-06-18
**Status:** v1.0.0-draft

This codex is the index of all behavioural contracts in the app. Each module has its own `codex.md` in its fragment folder.

## Module index

| ID | Module | recipe | codex | status |
|---|---|---|---|---|
| M01 | Tasks | [recipe](../../app-fragments/tasks/recipe.md) | [codex](../../app-fragments/tasks/codex.md) | documented |
| M02 | Family Chat | [recipe](../../app-fragments/family-chat/recipe.md) | [codex](../../app-fragments/family-chat/codex.md) | documented |
| M03 | Family Setup | [recipe](../../app-fragments/family-setup/recipe.md) | [codex](../../app-fragments/family-setup/codex.md) | documented |
| M04 | Authentication | [recipe](../../app-fragments/auth/recipe.md) | [codex](../../app-fragments/auth/codex.md) | documented |
| M05 | Calendar | [recipe](../../app-fragments/calendar/recipe.md) | [codex](../../app-fragments/calendar/codex.md) | documented |
| M06 | Resources | [recipe](../../app-fragments/resources/recipe.md) | [codex](../../app-fragments/resources/codex.md) | documented |
| M07 | History | [recipe](../../app-fragments/history/recipe.md) | [codex](../../app-fragments/history/codex.md) | documented |
| M08 | Achievements | [recipe](../../app-fragments/achievements/recipe.md) | [codex](../../app-fragments/achievements/codex.md) | documented |
| M09 | Parent Dashboard | [recipe](../../app-fragments/parent-dashboard/recipe.md) | [codex](../../app-fragments/parent-dashboard/codex.md) | documented |
| M10 | Layout | [recipe](../../app-fragments/layout/recipe.md) | [codex](../../app-fragments/layout/codex.md) | documented |
| M11 | Comments | [recipe](../../app-fragments/comments/recipe.md) | [codex](../../app-fragments/comments/codex.md) | documented |
| M12 | ErrorBoundary | [recipe](../../app-fragments/error-boundary/recipe.md) | [codex](../../app-fragments/error-boundary/codex.md) | documented |
| M00 | Orchestrator | [recipe](../../app-fragments/orchestrator/recipe.md) | [codex](../../app-fragments/orchestrator/codex.md) | documented |
| M00b | Data Layer | [recipe](../../app-fragments/data-layer/recipe.md) | [codex](../../app-fragments/data-layer/codex.md) | documented |

## Surfaces (top-level pages and components)

| Surface | Path | Module |
|---|---|---|
| LandingPage | /login | M04 |
| Tasks | /tasks | M01 |
| Calendar | /calendar | M05 |
| FamilyChat | /chat | M02 |
| ParentChat | /parent-chat | M02 |
| Resources | /resources | M06 |
| History | /history | M07 |
| Achievements | /achievements | M08 |
| TaskComment | /task-comment/:taskId | M11 |
| ProfileSelection | /profile-select | M03 |
| FamilySetup | /setup | M03 |
| ParentDashboard | /admin | M09 |

## Behaviour inventory

Per `app-recipe/shadow/extraction/behaviours/*.md`:

- AuthBehaviour: auth state, OAuth flow, sign in/out, currentUser
- ChatBehaviour: messages CRUD, channel switching, seed data
- FamilyBehaviour: family CRUD, member CRUD, currentProfile, PIN check
- TaskBehaviour: tasks CRUD, status transitions, deadline calc, recurrence, evidence

## State inventory

Per `app-recipe/shadow/extraction/state/singletons.md`:

- 4 singleton behaviour instances (Auth/Chat/Family/Task)
- AppOrchestrator also creates fresh ones in useMemo (effectively a second singleton set per app instance)
