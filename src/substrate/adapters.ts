/**
 * Adapters — bridge between existing Task/ChatMessage types and the
 * new Database/DatabaseItem substrate.
 *
 * The point: keep the existing UI working while making the new substrate
 * available. Components can gradually migrate to use DatabaseItem directly;
 * adapters translate at the boundary.
 *
 * Usage (read side):
 *   const task = taskBehaviour.getTasksSync()[0];
 *   const item = taskToDatabaseItem(task);
 *   // ... use item with PropertyChip, coverResolver, etc.
 *
 * Usage (write side):
 *   const updates = setPropValue(item, 'status', 'status_in_progress');
 *   const task = databaseItemToTask(updates);
 *   await taskBehaviour.updateTask(task.id, task);
 */

import type { Task, TaskStatus, TaskPriority, TaskType, TaskSection } from '../data/types';
import {
  type DatabaseItem,
  type Database,
  type PropertyDefinition,
  type PropertyValue,
  getPropValue,
  setPropValue,
  createProperty,
  createStatusProperty,
  createSelectProperty,
} from './Database';

// ─── Property schemas (the DominicsTasks Tasks database schema) ─────────────

/** Status options for the Tasks database. Matches existing TaskStatus. */
export const TASK_STATUS_OPTIONS = [
  { id: 'status_todo',        name: 'To do',        color: '#9b9a97', state: 'active' as const },
  { id: 'status_in_progress', name: 'In progress',  color: '#3370d4', state: 'active' as const },
  { id: 'status_done',        name: 'Done',         color: '#1a9a3c', state: 'completed' as const },
  { id: 'status_cancelled',   name: 'Cancelled',    color: '#d4451a', state: 'cancelled' as const },
];

/** Priority options. */
export const TASK_PRIORITY_OPTIONS = [
  { id: 'prio_low',    name: 'Low',    color: '#9b9a97' },
  { id: 'prio_medium', name: 'Medium', color: '#3370d4' },
  { id: 'prio_high',   name: 'High',   color: '#d9730d' },
  { id: 'prio_urgent', name: 'Urgent', color: '#d4451a' },
];

/** Task type options. */
export const TASK_TYPE_OPTIONS = [
  { id: 'type_chore',      name: 'Chore',      color: '#43e97b' },
  { id: 'type_school',     name: 'School',     color: '#3370d4' },
  { id: 'type_practice',   name: 'Practice',   color: '#9065b0' },
  { id: 'type_creative',   name: 'Creative',   color: '#f093fb' },
  { id: 'type_outdoor',    name: 'Outdoor',    color: '#43e97b' },
  { id: 'type_health',     name: 'Health',     color: '#1a9a3c' },
];

/** Task section options (used for grouping). */
export const TASK_SECTION_OPTIONS = [
  { id: 'section_morning',    name: 'Morning',    color: '#fa709a' },
  { id: 'section_afternoon',  name: 'Afternoon',  color: '#4facfe' },
  { id: 'section_evening',    name: 'Evening',    color: '#a8edea' },
  { id: 'section_assignments', name: 'Assignments', color: '#d4a503' },
  { id: 'section_leftovers',  name: 'Leftovers',  color: '#9b9a97' },
];

/** The default Tasks database schema. */
export function buildTasksSchema(): PropertyDefinition[] {
  return [
    createProperty('title', 'Title', 'title', 0),
    createProperty('description', 'Description', 'text', 1),
    createStatusProperty('status', 'Status', TASK_STATUS_OPTIONS, 2),
    createSelectProperty('priority', 'Priority', TASK_PRIORITY_OPTIONS, 3),
    createSelectProperty('type', 'Type', TASK_TYPE_OPTIONS, 4),
    createSelectProperty('section', 'Section', TASK_SECTION_OPTIONS, 5),
    createProperty('assignee', 'Assignee', 'person', 6),
    createProperty('dueDate', 'Due date', 'date', 7),
    createProperty('completedAt', 'Completed at', 'created_time', 8),
    createProperty('tags', 'Tags', 'multi_select', 9),
    createProperty('cover', 'Cover', 'image', 10),
  ];
}

// ─── Status <-> TaskStatus mapping ─────────────────────────────────────────

const STATUS_TO_ID: Record<TaskStatus, string> = {
  pending: 'status_todo',
  in_progress: 'status_in_progress',
  done: 'status_done',
  cancelled: 'status_cancelled',
} as Record<TaskStatus, string>;

const ID_TO_STATUS: Record<string, TaskStatus> = {
  status_todo: 'pending',
  status_in_progress: 'in_progress',
  status_done: 'done',
  status_cancelled: 'cancelled',
} as Record<string, TaskStatus>;

// ─── Task → DatabaseItem ───────────────────────────────────────────────────

const PRIORITY_TO_ID: Record<TaskPriority, string> = {
  low: 'prio_low',
  medium: 'prio_medium',
  high: 'prio_high',
  urgent: 'prio_urgent',
} as Record<TaskPriority, string>;

const ID_TO_PRIORITY: Record<string, TaskPriority> = {
  prio_low: 'low',
  prio_medium: 'medium',
  prio_high: 'high',
  prio_urgent: 'urgent',
} as Record<string, TaskPriority>;

/**
 * Convert an existing Task to a DatabaseItem. The Task's fields map onto
 * the Tasks schema defined above.
 */
export function taskToDatabaseItem(task: Task): DatabaseItem {
  return {
    id: task.id,
    databaseId: 'db_tasks',
    title: task.title,
    properties: [
      { propertyId: 'title',       value: task.title },
      { propertyId: 'description', value: task.description || '' },
      { propertyId: 'status',      value: STATUS_TO_ID[task.status] ?? 'status_todo' },
      { propertyId: 'priority',    value: PRIORITY_TO_ID[task.priority] ?? 'prio_medium' },
      ...(task.type ? [{ propertyId: 'type', value: `type_${task.type}` }] : []),
      ...(task.section ? [{ propertyId: 'section', value: `section_${task.section}` }] : []),
      ...(task.assigneeId ? [{ propertyId: 'assignee', value: task.assigneeId }] : []),
      ...(task.dueDate ? [{ propertyId: 'dueDate', value: task.dueDate.toISOString() }] : []),
      ...(task.completedAt ? [{ propertyId: 'completedAt', value: task.completedAt.toISOString() }] : []),
      { propertyId: 'tags', value: task.tags ?? [] },
    ],
    tags: task.tags ?? [],
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

/**
 * Convert a DatabaseItem back to a Task. Used when a PropertyChip inline
 * edit changes a value and we need to push back to the legacy Task shape.
 */
export function databaseItemToTask(item: DatabaseItem, original: Task): Task {
  const statusId = getPropValue<string>(item, 'status') ?? 'status_todo';
  const priorityId = getPropValue<string>(item, 'priority') ?? 'prio_medium';
  const typeId = getPropValue<string>(item, 'type');
  const sectionId = getPropValue<string>(item, 'section');
  const assignee = getPropValue<string>(item, 'assignee');
  const dueDateStr = getPropValue<string>(item, 'dueDate');
  const completedAtStr = getPropValue<string>(item, 'completedAt');

  return {
    ...original,
    title: getPropValue<string>(item, 'title') ?? original.title,
    description: getPropValue<string>(item, 'description') ?? original.description,
    status: ID_TO_STATUS[statusId] ?? original.status,
    priority: ID_TO_PRIORITY[priorityId] ?? original.priority,
    type: typeId ? (typeId.replace('type_', '') as TaskType) : original.type,
    section: sectionId ? (sectionId.replace('section_', '') as TaskSection) : original.section,
    assigneeId: assignee ?? original.assigneeId,
    dueDate: dueDateStr ? new Date(dueDateStr) : original.dueDate,
    completedAt: completedAtStr ? new Date(completedAtStr) : original.completedAt,
    tags: getPropValue<string[]>(item, 'tags') ?? original.tags ?? [],
    updatedAt: new Date(),
  };
}

// ─── Re-export helpers for convenience ─────────────────────────────────────

export { getPropValue, setPropValue };
export type { DatabaseItem, Database, PropertyDefinition, PropertyValue };
