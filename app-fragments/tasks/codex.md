# M01 — Tasks — Codex

## C1. Behaviour inventory

### Handler: subscribe
- **Source:** src/behaviours/TaskBehaviour.ts:7-10
- **Trigger:** component mount
- **Effect:** adds callback to subscribers Set, returns unsubscribe fn
- **State change:** subscribers Set

### Handler: notify (private)
- **Source:** src/behaviours/TaskBehaviour.ts:12-14
- **Trigger:** every createTask/updateTask/deleteTask/completeTask
- **Effect:** calls all subscribers with event object
- **State change:** none

### Handler: createTask
- **Source:** src/behaviours/TaskBehaviour.ts:22-32
- **Trigger:** TaskModal "Save"
- **Effect:** generates id (`task_<ts>_<rand>`), prepends to tasks array, notifies
- **State change:** tasks array (unshift)

### Handler: updateTask
- **Source:** src/behaviours/TaskBehaviour.ts:34-47
- **Trigger:** TaskModal "Save" (edit mode) / inline edit
- **Effect:** spreads updates, sets updatedAt, notifies
- **State change:** tasks[index] = updatedTask
- **Failure:** throws `Task ${id} not found` if id not in array

### Handler: deleteTask
- **Source:** src/behaviours/TaskBehaviour.ts:49-58
- **Trigger:** TaskCard delete button
- **Effect:** sets status='cancelled', notifies with type='task_deleted'
- **State change:** task.status (does NOT remove from array)
- **Failure:** throws `Task ${id} not found` if id not in array

### Handler: completeTask
- **Source:** src/behaviours/TaskBehaviour.ts:60-74
- **Trigger:** TaskCard complete checkbox
- **Effect:** sets status='done', sets completedAt, notifies with type='task_updated'
- **State change:** tasks[index].status, tasks[index].completedAt
- **Failure:** throws `Task ${id} not found` if id not in array

### Handler: getMirroredTasks
- **Source:** src/behaviours/TaskBehaviour.ts:76-79
- **Trigger:** render of "mirrored" sections
- **Effect:** filters by section=assignments|leftovers, tags isMirrored
- **State change:** none

## C2. State machine

### States
- `tasks: Task[]` — source of truth, in-memory only (not persisted)
- `subscribers: Set<(event) => void>` — pub/sub for change notifications

### Transitions
- `tasks: []` → `tasks: [t1]` on `createTask(t1)` — notifies subscribers
- `tasks: [t1]` → `tasks: [t1']` on `updateTask(t1.id, partial)` — notifies
- `tasks: [t1]` → `tasks: [t1(cancelled)]` on `deleteTask(t1.id)` — notifies (soft delete)
- `tasks: [t1(pending)]` → `tasks: [t1(done)]` on `completeTask(t1.id)` — notifies

### Initial state
- `tasks: []` (empty array, no persistence across page reloads)

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| Subscribers notified | createTask/updateTask/deleteTask/completeTask | change event | `{ type, task }` |
| console.log | approveTaskCompletion / rejectTaskCompletion (placeholders) | placeholder | approval id, reason |

## C4. Input validation

### Input: task object in createTask
- **Type:** Omit<Task, 'id'|'createdAt'|'updatedAt'>
- **Valid range:** title non-empty string; status in 4 values; priority in enum; type in enum; section in 3 values
- **Default:** none
- **Invalid input behaviour:** no validation — trusts caller

### Input: id string in updateTask/deleteTask/completeTask
- **Type:** string
- **Valid range:** must exist in tasks array
- **Default:** none
- **Invalid input behaviour:** throws `Task ${id} not found`

## C5. Failure modes

### Failure: id not found
- **Trigger:** updateTask/deleteTask/completeTask with bad id
- **Detection:** findIndex returns -1
- **Recovery:** none — throws
- **User-visible behaviour:** error boundary (M12) catches; current code does NOT have try/catch in UI

### Failure: page reload
- **Trigger:** F5 / browser close
- **Detection:** behaviour instance recreated with empty tasks
- **Recovery:** none — all tasks lost
- **User-visible behaviour:** empty board after reload (known limitation — repository wiring is the fix)

## C6. User simulation list

### Action: Create new task
- **Trigger:** click "+ New Task" button on Tasks page
- **Expected outcome:** TaskModal opens with empty fields
- **DOM change:** modal overlay appears
- **State change:** none at modal level
- **Should NOT change:** tasks array

### Action: Save task
- **Trigger:** fill title + click "Save" in modal
- **Expected outcome:** modal closes, new card appears in target column
- **DOM change:** card prepended to column
- **State change:** tasks array updated
- **Should NOT change:** other tasks

### Action: Complete task
- **Trigger:** click complete checkbox on a card
- **Expected outcome:** card moves to done state, checkmark visible
- **DOM change:** checkbox fills, card style updates
- **State change:** task.status='done', task.completedAt=now

### Action: Delete task
- **Trigger:** click delete on a card
- **Expected outcome:** card disappears from active columns, may appear in History
- **DOM change:** card removed from column
- **State change:** task.status='cancelled' (soft delete)

### Action: Drag task between columns
- **Trigger:** drag a TaskCard from one TaskColumn to another
- **Expected outcome:** task moves to new column
- **DOM change:** card reparented in DOM
- **State change:** task.section updated

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + codex.md + React 18 + TaskBehaviour class signature + Task type
- **Expected output:** a Tasks page that renders 3 columns, accepts new tasks, completes/deletes
- **Acceptance criteria:** C6 actions all work; reload clears state (known)
- **Module class:** B (depends on TaskBehaviour class signature + Task type — both documented)

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis) via Playwright

## C8. Shape matrix

### Surface: tasks.page
| view | mode=desktop | mode=tablet | mode=mobile |
|---|---|---|---|
| tasks.page | shell=3col, view=tasks.html | shell=3col, view=tasks.html | shell=1col, view=tasks.html |

Mode is determined by Tailwind responsive classes (`md:grid-cols-3` etc.). No state-mode polymorphism — the columns always show, just reflow.
