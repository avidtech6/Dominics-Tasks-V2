# M05 — Calendar

## A. Product Description

Calendar view of tasks with deadlines, grouped by date. Read-only consumer of TaskBehaviour.

- **Source:** `src/pages/Calendar.tsx`
- **Surface:** `/calendar`
- **Behaviour:** derives from `taskBehaviour.getTasksSync()`

## B. Structural Contract

### Inputs
- `taskBehaviour: TaskBehaviour`

### Outputs
- Month grid with task dots on deadline dates

### State
- Local: `currentMonth` (Date)
- Read-only access to task list

## C. Reconstruction Notes

- Calendar is purely a derived view of tasks. No mutations.
- Uses date-fns for date math.
- Tasks without `dueDate` are excluded from the calendar grid.
