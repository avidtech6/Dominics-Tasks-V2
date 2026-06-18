# M11 — Comments — Codex

## C1. Behaviour inventory

### Handler: postComment
- **Source:** src/components/CommentsModalBehaviour.ts
- **Trigger:** CommentsModal "Post"
- **Effect:** adds comment to task.comments, notifies
- **State change:** task.comments array

### Handler: editComment
- **Source:** src/components/CommentsModalBehaviour.ts
- **Trigger:** CommentsModal "Edit"
- **Effect:** updates comment content + updatedAt
- **State change:** task.comments[index]

## C2. State machine

### States
- `comments: TaskComment[]` per task
- `editingId: string | null` (modal local)

### Initial state
- `comments = []`, `editingId = null`

## C3. Side effects

None — in-memory only.

## C4. Input validation

### Input: comment content
- **Type:** string
- **Valid range:** non-empty
- **Default:** none
- **Invalid input behaviour:** disable Post button

## C5. Failure modes

### Failure: comment lost on reload
- **Trigger:** page reload
- **Detection:** comments array empty
- **Recovery:** none — known limitation

## C6. User simulation list

### Action: Open CommentsModal
- **Trigger:** click "Comments" on TaskCard
- **Expected outcome:** modal opens with existing comments
- **DOM change:** modal overlay appears
- **State change:** none

### Action: Post comment
- **Trigger:** type + click Post
- **Expected outcome:** new comment appears
- **DOM change:** comment bubble prepended
- **State change:** task.comments

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md
- **Expected output:** CommentsModal opens, posts, edits
- **Acceptance criteria:** all C6 actions work
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

Not applicable.
