# M07 — History

## A. Product Description

Log of completed and cancelled tasks. Derived view from TaskBehaviour.

- **Source:** `src/pages/History.tsx`
- **Surface:** `/history`
- **Behaviour:** filters tasks by status='done' or 'cancelled'

## B. Structural Contract

### Inputs
- `taskBehaviour: TaskBehaviour`

### Outputs
- List of past tasks sorted by completedAt desc

### State
- Local: filter toggle (done / cancelled / all)
- Read-only access to tasks

## C. Reconstruction Notes

- Uses `getDeletedTasks()` for cancelled tasks and `getTasksSync().filter(t => t.status === 'done')` for completed.
- Sort order: most recent first.
