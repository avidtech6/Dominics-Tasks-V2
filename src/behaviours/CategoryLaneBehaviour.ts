/**
 * CategoryLaneBehaviour — pure helpers for the Family / Weekly card-lane views.
 *
 * Discovers categories from live task data (never hard-coded) and groups
 * tasks per day per section. Reused by DailyViewFamily and WeeklyView so
 * they stay visually + semantically consistent.
 */
import { Task } from '../data/types';
import { startOfDay, endOfDay, isSameDay } from 'date-fns';

/** Standard category icons + soft pastel backgrounds.
 *  Used as visual cues; section names come from the actual `task.section`. */
export const CATEGORY_META: Record<string, { icon: string; bgClass: string; accentClass: string; label: string }> = {
  morning:     { icon: '🌅', bgClass: 'bg-amber-50',   accentClass: 'text-amber-700 border-amber-200',   label: "Morning" },
  afternoon:   { icon: '☀️', bgClass: 'bg-yellow-50',  accentClass: 'text-yellow-700 border-yellow-200', label: 'Afternoon' },
  catchup:     { icon: '⚠️', bgClass: 'bg-rose-50',    accentClass: 'text-rose-700 border-rose-200',     label: 'Catch Up' },
  assignments: { icon: '📝', bgClass: 'bg-blue-50',    accentClass: 'text-blue-700 border-blue-200',     label: 'Assignments' },
  leftovers:   { icon: '📦', bgClass: 'bg-orange-50',  accentClass: 'text-orange-700 border-orange-200', label: 'Leftovers' },
  experiments: { icon: '🔬', bgClass: 'bg-emerald-50', accentClass: 'text-emerald-700 border-emerald-200', label: 'Experiments' },
  support:     { icon: '💛', bgClass: 'bg-pink-50',    accentClass: 'text-pink-700 border-pink-200',     label: 'Support' },
  reading:     { icon: '📖', bgClass: 'bg-violet-50',  accentClass: 'text-violet-700 border-violet-200', label: 'Reading' },
  music:       { icon: '🎵', bgClass: 'bg-indigo-50',  accentClass: 'text-indigo-700 border-indigo-200', label: 'Music' },
  creative:    { icon: '🎨', bgClass: 'bg-fuchsia-50', accentClass: 'text-fuchsia-700 border-fuchsia-200', label: 'Creative' },
  gaming:      { icon: '🎮', bgClass: 'bg-sky-50',     accentClass: 'text-sky-700 border-sky-200',       label: 'Gaming' },
  evening:     { icon: '🌙', bgClass: 'bg-slate-50',   accentClass: 'text-slate-700 border-slate-200',   label: 'Evening' },
};

const FALLBACK_META = {
  icon: '✨',
  bgClass: 'bg-gray-50',
  accentClass: 'text-gray-700 border-gray-200',
  label: '',
};

/** Get visual meta for any section, with a graceful fallback. */
export function getCategoryMeta(section: string): { icon: string; bgClass: string; accentClass: string; label: string } {
  const known = CATEGORY_META[section];
  if (known) return known;
  return {
    ...FALLBACK_META,
    label: section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' '),
  };
}

/** Pick the date that "owns" a task for grouping purposes.
 *  Mirrors the Daily View's grouping logic: dueDate → deadlineDate → createdAt. */
export function taskOwningDate(t: Task): Date {
  return (t.dueDate as Date) ?? (t.deadlineDate as Date) ?? t.createdAt;
}

/** Filter out soft-deleted tasks (Daily View rule). */
export function activeTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.deletedAt);
}

/** Returns { 'morning': [tasks], 'afternoon': [tasks] ... } for the given day. */
export function groupByCategoryForDay(tasks: Task[], day: Date): Record<string, Task[]> {
  const result: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (!isSameDay(taskOwningDate(t), day)) continue;
    const sec = (t.section as string) || 'other';
    if (!result[sec]) result[sec] = [];
    result[sec].push(t);
  }
  // Sort each bucket by priority desc then pointsValue desc
  const PRIORITY_RANK: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  for (const sec of Object.keys(result)) {
    result[sec].sort((a, b) => {
      const pa = PRIORITY_RANK[(a.priority as string) ?? 'medium'] ?? 2;
      const pb = PRIORITY_RANK[(b.priority as string) ?? 'medium'] ?? 2;
      if (pa !== pb) return pa - pb;
      return ((b.pointsValue ?? 0) - (a.pointsValue ?? 0));
    });
  }
  return result;
}

/** EP earned by completed tasks (status === 'done'). */
export function epEarned(tasks: Task[]): number {
  return tasks
    .filter((t) => (t.status as string) === 'done')
    .reduce((sum, t) => sum + ((t.pointsValue as number) ?? 0), 0);
}

/** Count of completed tasks. */
export function countCompleted(tasks: Task[]): number {
  return tasks.filter((t) => (t.status as string) === 'done').length;
}

/** Day boundaries (inclusive). */
export function dayRange(day: Date): { start: Date; end: Date } {
  return { start: startOfDay(day), end: endOfDay(day) };
}