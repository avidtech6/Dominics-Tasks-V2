# M00 — Orchestrator — Plan

## Atomic steps

1. Create `BehaviourContext` with type `{ taskBehaviour, chatBehaviour, familyBehaviour, authBehaviour }`
2. Export `useBehaviours()` hook — throws if context null
3. Declare `<AppRoutes>` with 14 route definitions
4. Declare `<AppOrchestrator>` — instantiates 4 behaviours via useMemo, wraps in BrowserRouter > Provider
5. Render

## Per-step

| Step | Capability | Expected output | Fallback |
|---|---|---|---|
| 1 | createContext | typed context | type-cast any |
| 2 | useContext + throw | hook | silent undefined |
| 3 | JSX routes | 14 <Route/> | catch-all redirect |
| 4 | useMemo | 4 instances | new each render (BAD) |
| 5 | render | shell mounted | error boundary |
