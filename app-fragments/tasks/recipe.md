# M01 — Tasks

## A. Product Description

The Tasks module is the heart of the app. It renders a kanban-style board with columns (Sections), displays TaskCards, and handles creation, completion, deletion, and evidence submission.

- **Source:**
  - UI: `src/pages/Tasks.tsx`, `src/components/TaskCard.tsx`, `src/components/TaskColumn.tsx`, `src/components/TaskModal.tsx`, `src/components/CommentsModal.tsx`
  - Behaviour: `src/behaviours/TaskBehaviour.ts`, `src/components/TaskCardBehaviour.ts`, `src/components/TaskModalBehaviour.ts`, `src/components/CommentsModalBehaviour.ts`
- **Surface:** `/tasks` route
- **Geometry:** 3-column kanban (assignments / extras / leftovers) at desktop, single-column at mobile

## B. Structural Contract

### Inputs

- `taskBehaviour: TaskBehaviour` (from useBehaviours)
- User actions: click "New Task", drag task between columns, click card to open modal, click complete checkbox, click delete

### Outputs

- `<Tasks/>` page renders columns
- `<TaskColumn/>` renders cards
- `<TaskCard/>` renders one card
- `<TaskModal/>` opens for create/edit

### Behaviour interface

```ts
class TaskBehaviour {
  subscribe(cb: (event: any) => void): () => void;
  getTasksSync(): Task[];
  getTasks(): Promise<Task[]>;
  createTask(task: Omit<Task, 'id'|'createdAt'|'updatedAt'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;  // soft-delete, sets status='cancelled'
  completeTask(id: string): Promise<Task>;
  getMirroredTasks(): Promise<MirroredTask[]>;
  getPendingApprovals(): Promise<any[]>;
  approveTaskCompletion(id: string): Promise<void>;
  rejectTaskCompletion(id: string, reason?: string): Promise<void>;
  restoreDeletedTasks(): Promise<number>;
  getDeletedTasks(): Task[];
}
```

### Swap-test

Replace TaskBehaviour with a stub that returns 3 hard-coded tasks. UI should render 3 cards across the right columns.

## C. Reconstruction Notes

- `TaskSection` has 3 values: `assignments`, `extras`, `leftovers`
- `TaskStatus` has 4 values: `pending`, `in_progress`, `done`, `cancelled`
- Delete is a **soft delete** — sets status to 'cancelled', never removes from array
- `getMirroredTasks` filters by section and tags them `isMirrored: true`
- The behaviour has placeholder methods for `approveTaskCompletion`/`rejectTaskCompletion` (logs only) — these are placeholders for the evidence-approval flow documented in Dominic Stars but not yet implemented here
