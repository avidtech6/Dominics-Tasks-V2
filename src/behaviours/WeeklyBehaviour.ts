/**
 * WeeklyBehaviour — pure functions for the M-Weekly read-only weekly view.
 *
 * No state. No side effects. All inputs are explicit. Same data as M01 Tasks
 * (Task interface, TaskStatus enum, pointsValue / dueDate / deadlineDate).
 */
import { Task } from '../data/types';
import {
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameDay,
  isToday,
  isTomorrow,
} from 'date-fns';

export const WEEKLY_QUOTES: readonly string[] = [
  'Slow progress is still progress.',
  "Today's small steps are tomorrow's big wins.",
  'Done is better than perfect.',
  'Showing up counts. You did.',
  'Rest is part of the plan.',
  'One thing at a time. You got this.',
  'Family over finish line.',
];

/** Returns Mon 00:00 → Sun 23:59:59.999 of the week containing `today`. */
export function getWeekRange(today: Date = new Date()): { start: Date; end: Date } {
  // date-fns startOfWeek defaults to Sunday — we want Monday.
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const end = endOfWeek(today, { weekStartsOn: 1 });
  return { start, end };
}

/** Returns 7 Date objects: Mon, Tue, Wed, Thu, Fri, Sat, Sun of the given week. */
export function getWeekDays(today: Date = new Date()): Date[] {
  const { start } = getWeekRange(today);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** True if a date falls inside the week range (inclusive). */
export function inWeek(date: Date, range: { start: Date; end: Date }): boolean {
  return date >= range.start && date <= range.end;
}

/** Pick the date that "owns" a task — mirrors Daily View's grouping rule. */
export function taskOwningDate(t: Task): Date {
  return ((t as any).dueDate as Date) ?? ((t as any).deadlineDate as Date) ?? (t.createdAt as Date);
}

/** Filter out soft-deleted tasks (Daily View rule). */
export function activeTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !(t as any).deletedAt);
}

/**
 * Group active tasks by their owning date's ISO yyyy-mm-dd key.
 * Only tasks within the given week range are included.
 */
export function groupTasksByDay(
  tasks: Task[],
  range: { start: Date; end: Date },
): Record<string, Task[]> {
  const result: Record<string, Task[]> = {};
  for (const t of activeTasks(tasks)) {
    const own = taskOwningDate(t);
    if (!inWeek(own, range)) continue;
    const key = isoDay(own);
    if (!result[key]) result[key] = [];
    result[key].push(t);
  }
  return result;
}

/** Format a Date as yyyy-mm-dd (local time) — used as a stable map key. */
export function isoDay(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/** A short subtitle for a day pill. */
export function daySubtitle(d: Date, today: Date = new Date()): string {
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEEE');
}

/** EP earned (sum of pointsValue for done tasks). */
export function epEarned(tasks: Task[]): number {
  return tasks
    .filter((t) => ((t.status as unknown) as string) === 'done')
    .reduce((s, t) => s + (((t as any).pointsValue as number) ?? 0), 0);
}

/** Count of completed tasks. */
export function countCompleted(tasks: Task[]): number {
  return tasks.filter((t) => ((t.status as unknown) as string) === 'done').length;
}

/**
 * Streak = consecutive days ending today (or yesterday) with ≥1 done task.
 * Returns 0 if streak < 2 (per recipe §C).
 */
export function computeStreak(tasksByDay: Record<string, Task[]>): number {
  const today = new Date();
  let streak = 0;
  let cursor = today;
  // Allow streak ending today OR yesterday (so "haven't done today yet" doesn't reset).
  if (countCompleted(tasksByDay[isoDay(cursor)] ?? []) === 0) {
    cursor = addDays(cursor, -1);
  }
  while (countCompleted(tasksByDay[isoDay(cursor)] ?? []) > 0) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Pick a quote from the pool, deterministic by date. */
export function pickQuote(d: Date = new Date()): string {
  return WEEKLY_QUOTES[d.getDate() % WEEKLY_QUOTES.length];
}

/** Best day in the week (highest done count). Returns { iso, count } or null. */
export function bestDay(tasksByDay: Record<string, Task[]>): { iso: string; count: number } | null {
  let best: { iso: string; count: number } | null = null;
  for (const [iso, list] of Object.entries(tasksByDay)) {
    const done = countCompleted(list);
    if (done > 0 && (!best || done > best.count)) {
      best = { iso, count: done };
    }
  }
  return best;
}

/** Total tasks in the week (active, not deleted). */
export function totalActive(tasksByDay: Record<string, Task[]>): number {
  return Object.values(tasksByDay).reduce((s, list) => s + list.length, 0);
}

/** Total done in the week. */
export function totalDone(tasksByDay: Record<string, Task[]>): number {
  return Object.values(tasksByDay).reduce((s, list) => s + countCompleted(list), 0);
}

/** Completion ratio 0..1. */
export function completionRatio(tasksByDay: Record<string, Task[]>): number {
  const total = totalActive(tasksByDay);
  if (total === 0) return 0;
  return totalDone(tasksByDay) / total;
}