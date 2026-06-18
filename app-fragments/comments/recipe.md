# M11 — Comments

## A. Product Description

Per-task comment thread. Opens via CommentsModal from a TaskCard, or full-page at `/task-comment/:taskId`.

- **Source:**
  - UI: `src/pages/TaskComment.tsx`, `src/components/CommentsModal.tsx`
  - Behaviour: CommentsModalBehaviour

## B. Structural Contract

### Behaviour
- Read comments for a task
- Post a new comment
- Edit own comment

### State
- `comments: TaskComment[]` per task

## C. Reconstruction Notes

- Comments are stored in-memory per task (no separate collection).
- Each comment has author, content, timestamps.
