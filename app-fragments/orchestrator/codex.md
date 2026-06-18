# M00 — Orchestrator — Codex

## C1. Behaviour inventory

### Handler: BrowserRouter (routing)
- **Source:** src/orchestrator/AppOrchestrator.tsx:90
- **Trigger:** app mount
- **Effect:** Sets up React Router, parses URL, dispatches to matching route
- **State change:** none directly

### Handler: BehaviourProvider (DI)
- **Source:** src/orchestrator/AppOrchestrator.tsx:100-118
- **Trigger:** AppOrchestrator render
- **Effect:** Creates 4 behaviour instances, memoizes them, provides via context
- **State change:** none (memoized on empty deps)

### Handler: useBehaviours hook
- **Source:** src/orchestrator/AppOrchestrator.tsx:13-19
- **Trigger:** any descendant calls useBehaviours()
- **Effect:** Returns the behaviour provider
- **State change:** none
- **Failure:** throws if called outside BehaviourContext.Provider

## C2. State machine

### Stateless declaration
This module is stateless at the React level. State lives in the four behaviour singletons (which have their own state machines documented in their respective codex.md files).

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| BrowserRouter URL parsing | app mount | routing | path → component |
| OAuth intercept reload | `index.html` inline script | pre-React OAuth handling | location.replace(pathname) |

## C4. Input validation

### Input: route param `:taskId`
- **Type:** string
- **Valid range:** non-empty URL-encoded string
- **Default:** undefined (route doesn't match)
- **Invalid input behaviour:** React Router ignores the route, falls through to `<Navigate to="/" replace />`

## C5. Failure modes

### Failure: useBehaviours called outside provider
- **Trigger:** Component rendered without BehaviourContext.Provider ancestor
- **Detection:** context is null in useContext
- **Recovery:** throws Error; React renders error boundary (M12)
- **User-visible behaviour:** error boundary fallback UI

## C6. User simulation list

### Action: navigate to /tasks
- **Trigger:** browser URL or nav click
- **Expected outcome:** Tasks page renders
- **DOM change:** <Outlet> swaps to <Tasks/>
- **State change:** none at orchestrator level
- **Should NOT change:** behaviour instances (memoized)

### Action: navigate to /chat
- **Trigger:** browser URL or nav click
- **Expected outcome:** FamilyChat page renders
- **DOM change:** <Outlet> swaps to <FamilyChat/>

### Action: navigate to /admin
- **Trigger:** browser URL
- **Expected outcome:** ParentDashboard renders (currently PIN-gate disabled)
- **DOM change:** <Outlet> swaps to <ParentDashboard/>

## C7. Reproducibility test

### Procedure
- **Minimal context for fresh implementer:** recipe.md (this file) + codex.md + React 18 + react-router-dom v6
- **Expected output:** a working app shell that renders all 12 routes
- **Acceptance criteria:** every route renders its page component without crashing; useBehaviours returns the four behaviours
- **Module class:** A (self-contained, no external dependencies beyond React + Router)

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

Not applicable — this module has no shape-polymorphism. It is a single render tree with one shape (BrowserRouter > Provider > Routes > Route).
