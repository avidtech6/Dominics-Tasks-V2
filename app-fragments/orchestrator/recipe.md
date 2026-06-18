# M00 — Orchestrator

## A. Product Description

The orchestrator wires all four behaviour singletons (Task, Chat, Family, Auth) into a React context and routes URLs to pages. It is the single entry point of the app.

- **Source:** `src/orchestrator/AppOrchestrator.tsx`
- **Surface:** wraps the entire app
- **Geometry:** `<BrowserRouter>` → `<BehaviourContext.Provider>` → `<AppRoutes>`
- **Routes:**
  - `/` → redirect to `/tasks`
  - `/login` → LandingPage (M04)
  - `/tasks`, `/calendar`, `/chat`, `/resources`, `/history`, `/achievements` → wrapped in `<Layout><Outlet/></Layout>` (M10)
  - `/parent-chat`, `/task-comment/:taskId`, `/admin` → parent-only routes (same wrapper, semantically parent-only)
  - `/setup` → FamilySetupScreen (M03)
  - `/profile-select` → ProfileSelectionScreen (M03)
  - `*` → redirect to `/`

## B. Structural Contract

### Interface

```ts
interface BehaviourProvider {
  taskBehaviour: TaskBehaviour;
  chatBehaviour: ChatBehaviour;
  familyBehaviour: FamilyBehaviour;
  authBehaviour: AuthBehaviour;
}
```

### Hook

```ts
export const useBehaviours = () => BehaviourProvider;
```

Throws `Error('useBehaviours must be used within a BehaviourProvider')` if called outside provider.

### Behaviour instantiation

```ts
const taskBehaviour   = useMemo(() => new TaskBehaviour(),   []);
const chatBehaviour   = useMemo(() => new ChatBehaviour(),   []);
const familyBehaviour = useMemo(() => new FamilyBehaviour(), []);
const authBehaviour   = useMemo(() => new AuthBehaviour(),   []);
```

These are **independent** of the singleton exports in `behaviours/*.ts`. Both sets exist; the orchestrator uses the useMemo'd ones.

### Swap-test

Replace any behaviour with a stub returning `{ subscribe: () => () => {} }` and an empty state — the app must still render its shell without crashing.

## C. Reconstruction Notes

- Behaviour instances are scoped to the React tree via useMemo with empty deps — they survive re-renders but are per-app-instance.
- `ProtectedPage` and `AdminPage` are no-op wrappers (gating is currently disabled per commit `54cd9152`).
- The OAuth intercept script in `index.html` redirects with code= / state= back to a clean URL after authentication.
