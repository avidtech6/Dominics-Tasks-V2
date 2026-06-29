# M-tasks — Coverage Matrix

Verified against the deployed build (post-alignment, 2026-06-29).

| Source feature | Source-line evidence | Recipe/codex claim | Implementation status | Test status |
|---|---|---|---|---|
| "Add Task" button | `src/pages/Tasks.tsx:791-797` | recipe §B Inputs: "click 'New Task'" | ✅ implemented | cascaded click-test F01 |
| Drag task between sections | `src/pages/Tasks.tsx:62-90` (handleDragEnd) + `useDraggable`/`useDroppable` wrapping each card/section | recipe §B Inputs: "drag task between columns" | ✅ implemented | cascaded click-test F02 |
| Click card body opens edit modal | `src/components/TaskCard.tsx:51-55, 132-140` (handleCardClick + onClick on root) | recipe §B Inputs: "click card to open modal" | ✅ implemented | cascaded click-test F03 |
| Complete checkbox | `src/components/TaskCard.tsx:155-178` | recipe §B Inputs: "click complete checkbox" | ✅ implemented | cascaded click-test F04 |
| Delete task | `src/components/TaskCard.tsx:226-240` (3-dot menu) + `src/pages/Tasks.tsx:360` (`onDelete`) | recipe §B Inputs: "click delete" | ✅ implemented (touch + desktop) | cascaded click-test F05 |
| Update task fields | `src/components/TaskModal.tsx` (modal form), `onEdit={setEditingTask}` from `src/pages/Tasks.tsx:355` | codex §C1: `updateTask` handler | ✅ implemented | run-substrate.ts T15 |
| Create task | `src/components/TaskModal.tsx` + TaskBehaviour.createTask | codex §C1: `createTask` handler | ✅ implemented | run-substrate.ts T14 |
| Delete task | TaskBehaviour.deleteTask | codex §C1: `deleteTask` handler | ✅ implemented | run-substrate.ts T16 |
| Mirrored tasks | `src/behaviours/TaskBehaviour.ts:92` getMirroredTasks | codex §C1: `getMirroredTasks` handler | ✅ implemented | run-substrate.ts T18 |
| Pending approvals | `src/behaviours/TaskBehaviour.ts:101` getPendingApprovals | codex §C1: `getPendingApprovals` placeholder | ⚠️ placeholder (real impl is a future feature per codex §C1) | n/a |
| Approve/reject | `src/behaviours/TaskBehaviour.ts:106-114` approveTaskCompletion / rejectTaskCompletion | codex §C1: placeholders | ⚠️ placeholders (per codex §C1) | n/a |
| Drag overlay (visual feedback) | `src/pages/Tasks.tsx:900-907` (DragOverlay) | recipe §B Inputs implicit (drag requires visual feedback) | ✅ implemented | visual inspection |
| Drop target highlight | `src/pages/Tasks.tsx:441-453` (isOver → drop-target class) | recipe §B Inputs implicit | ✅ implemented | visual inspection |
| Optimistic update on drop | `src/pages/Tasks.tsx:74-83` (setTasks + persist with rollback) | codex §C4 implicit | ✅ implemented | n/a (manual) |

## Out-of-scope (recipe doesn't promise)

- Evidence submission (recipe mentions but lists as future feature per codex §C1)
- Real cross-device approval sync (Firebase swap pending)
- Real auth (Firebase swap pending)
