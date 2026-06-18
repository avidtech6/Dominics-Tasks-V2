# M00 — Orchestrator — Coverage Matrix

| Source feature | Source-line evidence | Recipe/codex claim | Implementation status | Test status |
|---|---|---|---|---|
| BrowserRouter wraps app | AppOrchestrator.tsx:90 | recipe A | implemented | PASS (build) |
| BehaviourContext declared | AppOrchestrator.tsx:9-19 | recipe B interface | implemented | PASS (build) |
| useBehaviours hook | AppOrchestrator.tsx:13-19 | recipe B hook | implemented | PASS (build) |
| Route /tasks | AppOrchestrator.tsx:55 | recipe A routes | implemented | PASS (route resolves) |
| Route /calendar | AppOrchestrator.tsx:56 | recipe A routes | implemented | PASS (route resolves) |
| Route /chat | AppOrchestrator.tsx:57 | recipe A routes | implemented | PASS (route resolves) |
| Route /resources | AppOrchestrator.tsx:58 | recipe A routes | implemented | PASS (route resolves) |
| Route /history | AppOrchestrator.tsx:59 | recipe A routes | implemented | PASS (route resolves) |
| Route /achievements | AppOrchestrator.tsx:60 | recipe A routes | implemented | PASS (route resolves) |
| Route /parent-chat | AppOrchestrator.tsx:63 | recipe A routes | implemented | PASS (route resolves) |
| Route /task-comment/:taskId | AppOrchestrator.tsx:64 | recipe A routes | implemented | PASS (route resolves) |
| Route /admin | AppOrchestrator.tsx:65 | recipe A routes | implemented | PASS (route resolves) |
| Route /login | AppOrchestrator.tsx:48 | recipe A routes | implemented | PASS (route resolves) |
| Route /setup | AppOrchestrator.tsx:69 | recipe A routes | implemented | PASS (route resolves) |
| Route /profile-select | AppOrchestrator.tsx:70 | recipe A routes | implemented | PASS (route resolves) |
| Catch-all redirect | AppOrchestrator.tsx:73 | recipe A routes | implemented | PASS (route resolves) |
| OAuth intercept | index.html (inline script) | codex C3 | implemented | manual |
| ProtectedPage wrapper | AppOrchestrator.tsx:34-39 | codex (no-op) | implemented | PASS (no crash) |
