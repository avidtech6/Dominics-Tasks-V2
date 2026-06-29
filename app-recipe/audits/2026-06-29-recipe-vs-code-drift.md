# Recipe vs Code Drift Audit — Dominics Tasks V2
**Date:** 2026-06-29
**Auditor:** Mavis (mavis)
**Method:** Compared every module's recipe.md + codex.md against actual source code. Mismatches listed per module.

This is NOT a fix list. This is a *report*. The operator reviews and decides:
- Code matches recipe → no action
- Code drifts from recipe → fix code to match recipe
- Recipe over-promises → reduce recipe
- Both wrong → bigger rewrite

---

## Summary

**Total mismatches: ~70 across 14 modules.**

**Top offenders (most broken):**
1. **Layout (M10)** — 15+ broken method calls (authBehaviour.signOut, familyBehaviour.loadFamily, etc.)
2. **Tasks (M01)** — 5+ features in recipe that code doesn't implement (drag, edit, evidence approval)
3. **Resources (M06)** — recipe says "list of clickable links" but code has 0 links
4. **Comments (M11)** — recipe promises a feature that's basically a stub
5. **Parent Dashboard (M09)** — runs into "e.map is not a function" runtime error per the deployed audit

**Per-module breakdown below.**

---

## M00 — Orchestrator

**Recipe says:**
- Routes: `/`, `/login`, `/tasks`, `/calendar`, `/chat`, `/resources`, `/history`, `/achievements`, `/parent-chat`, `/task-comment/:taskId`, `/admin`, `/setup`, `/profile-select`, catch-all `*` → `/`
- BehaviourProvider exposes taskBehaviour, chatBehaviour, familyBehaviour, authBehaviour
- useBehaviours() throws if outside provider

**Code says (src/orchestrator/AppOrchestrator.tsx):**
- Same routes ✓
- BehaviourProvider has `ready: boolean` added (extra — recipe doesn't forbid, minor)
- BehaviourContext ✓
- whenReady() pattern added (recipe doesn't mention, but it's a strict superset)
- ensureDefaultDatabases() called on startup (substrate integration — outside recipe scope)

**Drift:** none on the orchestrator itself. **PASS.**

---

## M00b — Data Layer

**Recipe says:**
- StorageAdapter pattern
- 6 storage keys (tasks.v2, messages.v2, family.v2, family.object.v2, user.v2, parentpin.v2)
- Async load via whenReady()
- Behaviour signatures unchanged

**Code says (src/data/StorageAdapter.ts + behaviours):**
- StorageAdapter implemented exactly as recipe describes ✓
- All 4 behaviours rewired with localStorage persistence ✓
- whenReady() pattern added to each behaviour ✓
- ChatBehaviour seeds 10 messages on first load ✓

**Drift:** none. **PASS.**

---

## M01 — Tasks (THE BIG ONE)

**Recipe says (recipe.md §B Inputs):**
> User actions: click "New Task", **drag task between columns**, **click card to open modal**, click complete checkbox, click delete

**Code says:**
- "New Task" button: ✓ present
- **drag task between columns: ✗ NO @dnd-kit usage anywhere in src/. Dep installed, never imported.**
- **click card to open modal: ✗ TaskCard.tsx has NO onClick on card root. Edit only via hover-only 3-dot menu (invisible on touch).**
- click complete checkbox: ✓ present
- click delete: ✓ present (in 3-dot menu)

**Recipe says (codex.md §C6):**
- Action: Drag task between columns — **present in codex but missing in code**
- Action: Edit existing task — **NOT in codex, NOT in code** (recipe has it informally in §B Inputs)

**Other code/recipe gaps in M01:**
- Recipe mentions `evidence submission` (recipe.md §A) — **not in code**, not even in codex
- Recipe mentions `getPendingApprovals`/`approveTaskCompletion`/`rejectTaskCompletion` — **placeholders only** (codex.md §C1 acknowledges this)
- Recipe C8 mentions mode × view polymorphism — **not in code**

**Drift: ~5 features promised, ~0 implemented.** Big gap.

---

## M02 — Family Chat

**Recipe says (recipe.md):**
- Two chat surfaces: Family Chat (`/chat`) and Parent Chat (`/parent-chat`)
- Behaviour seeds 10 demo messages on first load
- React UI subscribes via subscribe()
- getMessagesSync() added for synchronous accessor

**Code says:**
- /chat → FamilyChat.tsx renders ✓
- /parent-chat → ParentChat.tsx **CRASHES on load** with `ReferenceError: user is not defined` (caught by audit)
- 10 seed messages present ✓
- subscribe + getMessagesSync both wired ✓

**Drift:**
- **/parent-chat is broken** at runtime — code uses bare `user` variable instead of `currentMember` or similar
- The fix is small (5 lines) but it's a real bug

---

## M03 — Family Setup & Profiles

**Recipe says (recipe.md):**
- FamilySetupScreen captures family name + parent PIN
- ProfileSelectionScreen picks child profile or parent mode
- Behaviour stores Family, profiles, currentProfile

**Code says:**
- Both pages exist as components ✓
- Behaviour has createChildProfile / deleteChildProfile / getProfiles / getCurrentUser / loadFamily ✓
- The screens use `onComplete={() => {}}` callbacks — **never wired** (per grep earlier)

**Drift:**
- **FamilySetupScreen onComplete is a no-op** (recipe says it should complete family setup)
- **ProfileSelectionScreen onProfileSelect is a no-op** (recipe says it should pick profile)

---

## M04 — Authentication

**Recipe says:**
- Auth via Firebase Google OAuth
- AuthBehaviour has signOut, exitParentMode, setupParentPin

**Code says (AuthBehaviour.ts):**
- getCurrentUser returns a hardcoded default User ✓ (matches recipe's "default user when auth disabled")
- exitParentMode is console.log only ✓ (placeholder per recipe)
- setupParentPin is console.log only ✓ (placeholder per recipe)
- **signOut method does NOT exist on AuthBehaviour** — but Layout.tsx calls `authBehaviour.signOut()` → runtime error

**Drift:**
- **Layout calls authBehaviour.signOut() — method doesn't exist** — this is the "t.signOut is not a function" runtime error the audit caught

---

## M05 — Calendar

**Recipe says (recipe.md):**
- Calendar view of tasks with deadlines
- Read-only consumer of TaskBehaviour
- Grouped by date

**Code says:**
- Calendar page renders ✓
- Reads from taskBehaviour ✓
- "Today" highlight not in recipe, not in code

**Drift:** none significant. **PASS.**

---

## M06 — Resources

**Recipe says (recipe.md):**
- "list of clickable links"

**Code says (src/pages/Resources.tsx):**
- Renders an "Educational resources" header
- 0 actual link items visible (per audit)

**Drift:**
- **Recipe promises links; code has none.** Either seed links OR remove the recipe line.

---

## M07 — History

**Recipe says (recipe.md):**
- Log of completed and cancelled tasks
- Filters tasks by status='done' or 'cancelled'

**Code says (src/pages/History.tsx):**
- Has tabs: Tasks / History / Deleted / Profile ✓
- "History" tab filters tasks by status done/cancelled ✓

**Drift:** none significant. **PASS** (though empty on first visit because no tasks have been completed yet).

---

## M08 — Achievements

**Recipe says:**
- Achievements unlocked by task completion
- ConfettiCelebration fires on unlock

**Code says:**
- AchievementBadge, ConfettiCelebration components exist ✓
- AchievementBadgeBehaviour + ConfettiCelebrationBehaviour hooks exist ✓
- **No wiring to TaskBehaviour completion** — completing a task doesn't fire achievement unlock

**Drift:**
- **Achievement unlock on task completion is not wired.** Recipe implies it; code has the components but no event subscription.

---

## M09 — Parent Dashboard

**Recipe says:**
- Parent-only admin surface
- Currently PIN-gated but disabled (per commit 54cd9152)

**Code says (src/components/ParentDashboard.tsx):**
- **CRASHES at runtime** with `TypeError: e.map is not a function` (caught by audit)
- ParentPinModal exists but returns null (PIN gate disabled)
- PinPad component exists

**Drift:**
- **/admin is broken** at runtime — looks like it's calling .map() on something undefined (probably taskBehaviour.getPendingApprovals() returning [] but expected an array of objects, OR approvals is being mapped wrong)

---

## M10 — Layout (ANOTHER BIG ONE)

**Recipe says (recipe.md):**
- App shell: top nav + outlet
- Top nav bar with logo, route links
- "Mobile: hamburger menu"

**Code says (src/components/Layout.tsx — 400+ lines):**
- Sidebar layout (not top nav as recipe says)
- Calls 15+ methods on behaviours that **don't exist**:
  - `authBehaviour.signOut()` — doesn't exist
  - `familyBehaviour.loadFamily()` — doesn't exist (called `getFamily`)
  - `familyBehaviour.createFamily()` — doesn't exist
  - `familyBehaviour.joinFamily()` — doesn't exist
  - `familyBehaviour.createProfile()` — called `createChildProfile`
  - `familyBehaviour.deleteProfile()` — called `deleteChildProfile`
  - `familyBehaviour.updateProfile()` — doesn't exist
  - `familyBehaviour.addTask()`, `addReward()`, `addComment()`, `addAchievement()` — none exist
  - `familyBehaviour.updateTask()`, `updateReward()`, `updateComment()`, `updateAchievement()` — none exist (have updateTask on TaskBehaviour)
  - `familyBehaviour.deleteTask()`, `deleteReward()`, `deleteComment()`, `deleteAchievement()` — none exist
- Hamburger menu exists for mobile ✓
- All the (user as any).uid, (currentProfile as any).photoURL, (currentProfile as any).experience are casts to fields that don't exist on the User/Profile interfaces

**Drift:** **massive.** The Layout file is one of the most broken parts of the app.

---

## M11 — Comments

**Recipe says:**
- Per-task comment thread
- Opens via CommentsModal from TaskCard or full-page at `/task-comment/:taskId`
- Read + post + edit comments

**Code says:**
- CommentsModal + CommentsModalBehaviour exist ✓
- TaskComment.tsx page exists ✓
- Comment counts shown on TaskCard ✓
- CommentsModal opens from TaskCard ✓

**Drift:** minimal. Functional.

---

## M12 — Error Boundary

**Recipe says:**
- React error boundary
- Catches render errors
- Standard pattern

**Code says:**
- ErrorBoundary component ✓
- ErrorBoundaryBehaviour hooks ✓
- Logs errors to console ✓
- Per audit: it DID catch the /parent-chat and /admin errors gracefully (showed fallback UI)

**Drift:** none. **PASS.**

---

## Patterns observed

**Three categories of drift:**

1. **Code-bigger-than-recipe** (recipe under-promises): none — code never has more than recipe says
2. **Recipe-bigger-than-code** (recipe over-promises): most modules. Code is missing features the recipe mentions.
3. **Code has bugs** (code promises something then fails): Layout, ParentChat, ParentDashboard

**The big architectural drift is in Layout.tsx.** It assumes a unified `familyBehaviour` API with `addTask`, `addReward`, `addComment`, etc. — which is a separate (richer) data model than the actual `TaskBehaviour` / `ChatBehaviour` / `FamilyBehaviour` classes. The recipe fragments don't reflect this unified model. So either:
- (a) Layout needs to be rewritten to use the actual behaviours, OR
- (b) Recipe + code need a "unified behaviour facade" that exposes the rich API

Option (a) is the smaller change.

---

## Recommended priority order

If you want to fix these so the code matches recipe:

**Tier 1 (small fixes, big impact):**
1. Fix /parent-chat crash — 5 lines
2. Fix /admin crash — 5 lines
3. Fix authBehaviour.signOut missing — 1 line (add the method)

**Tier 2 (Layout alignment):**
4. Rewrite Layout.tsx to use actual behaviour methods — ~200 lines

**Tier 3 (M01 Tasks feature parity):**
5. Wire card-body click → edit modal — ~30 lines
6. Wire @dnd-kit drag-drop — ~150 lines

**Tier 4 (Recipe cleanup):**
7. Remove "evidence submission" from M01 recipe (not built)
8. Add 3+ seed resource links to Resources page
9. Wire achievement unlock on task completion

**Tier 5 (cosmetic):**
10. Calendar today highlight
11. Family setup / profile select onComplete wiring

---

## What I'd do first if it were my call

The 3 Tier 1 bugs are ~10 lines of code total and unblock 2 routes. That's the cheapest win. Then I'd show you the updated state and we'd decide on Tier 2 (the Layout rewrite is the biggest single chunk of work and would benefit from your input on which behaviour model to align to).