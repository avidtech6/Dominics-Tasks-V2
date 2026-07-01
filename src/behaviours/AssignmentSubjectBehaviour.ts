/**
 * AssignmentSubjectBehaviour — pure functions for grouping + sync-rendering
 * of assignment tasks by their inferred subject (Maths, Reading, Spelling…).
 *
 * No new task fields, no new taskBehaviour methods. Derives everything from
 * the existing `task.title` and `task.section`.
 *
 * Sync semantics (operator directive 2026-07-01):
 *   - A task in `section === 'assignments'` represents work that's due.
 *   - When the same subject (Maths) has at least one assignment task with a
 *     deadline today or in the future, that subject gets a synced "reference
 *     chip" in any time-slot lane (morning / afternoon) the user drags it to.
 *   - The storage section is unchanged — the chip is purely derived.
 *
 * This module is consumed by:
 *   - Tasks.tsx (section filter logic + new AssignmentCard rendering)
 *   - cascaded click-test.ts (test for sync chip)
 */
import { Task } from '../data/types';

/** Default subject catalogue. Ordered: most specific patterns first. */
export const SUBJECT_PATTERNS: Array<{ subject: string; icon: string; patterns: RegExp[] }> = [
  { subject: 'Maths',    icon: '📐', patterns: [/\bmaths?\b/i, /\bmathematics?\b/i, /\bnumeracy\b/i, /\barithmetic\b/i] },
  { subject: 'Reading',  icon: '📖', patterns: [/\breading\b/i, /\bbook\b/i] },
  { subject: 'Spelling', icon: '🔤', patterns: [/\bspelling\b/i, /\bvocab(ulary)?\b/i] },
  { subject: 'Writing',  icon: '✍️', patterns: [/\bwriting\b/i, /\bessay\b/i, /\bcomprehension\b/i] },
  { subject: 'Science',  icon: '🔬', patterns: [/\bscience\b/i, /\bbiology\b/i, /\bchemistry\b/i, /\bphysics\b/i] },
  { subject: 'History',  icon: '🏛️', patterns: [/\bhistory\b/i, /\bgeography\b/i] },
  { subject: 'Art',      icon: '🎨', patterns: [/\bart\b/i, /\bdrawing\b/i, /\bpainting\b/i] },
  { subject: 'Music',    icon: '🎵', patterns: [/\bmusic\b/i, /\bpractice\b/i] },
  { subject: 'PE',       icon: '⚽', patterns: [/\bpe\b/i, /\bsport\b/i, /\bgym\b/i] },
];

/** Infer the subject (or null) from a task title. */
export function subjectOf(t: Task): { subject: string; icon: string } | null {
  const title = ((t.title as string) ?? '').trim();
  if (!title) return null;
  for (const { subject, icon, patterns } of SUBJECT_PATTERNS) {
    for (const re of patterns) {
      if (re.test(title)) return { subject, icon };
    }
  }
  return null;
}

/** All assignment tasks (tasks in section='assignments') grouped by subject.
 *  Tasks with no detectable subject go to an "Other" bucket. */
export function groupAssignmentsBySubject(
  tasks: Task[],
): Array<{ subject: string; icon: string; tasks: Task[]; ep: number }> {
  const grouped: Record<string, { subject: string; icon: string; tasks: Task[]; ep: number }> = {};
  const others: Task[] = [];

  for (const t of tasks) {
    if ((t.section as string) !== 'assignments') continue;
    if ((t as any).deletedAt) continue;
    const meta = subjectOf(t);
    if (!meta) {
      others.push(t);
      continue;
    }
    if (!grouped[meta.subject]) {
      grouped[meta.subject] = { subject: meta.subject, icon: meta.icon, tasks: [], ep: 0 };
    }
    grouped[meta.subject].tasks.push(t);
    grouped[meta.subject].ep += ((t as any).pointsValue as number) ?? 0;
  }

  const result = Object.values(grouped);
  if (others.length > 0) {
    const ep = others.reduce((s, t) => s + (((t as any).pointsValue as number) ?? 0), 0);
    result.push({ subject: 'Other', icon: '📌', tasks: others, ep });
  }
  return result.sort((a, b) => b.tasks.length - a.tasks.length);
}

/** Sync chip list for a time-slot lane: subjects whose assignments are
 *  active today (deadline today or future, or no deadline). Each subject
 *  collapses to one chip per lane. */
export function syncChipsForLane(
  tasks: Task[],
  lane: 'morning' | 'afternoon',
): Array<{ subject: string; icon: string; count: number; ep: number; taskIds: string[] }> {
  const today = new Date();
  const grouped = groupAssignmentsBySubject(tasks);
  const out: Array<{ subject: string; icon: string; count: number; ep: number; taskIds: string[] }> = [];

  for (const group of grouped) {
    // Active = at least one task in the group is non-done and has a deadline today or later
    const activeTasks = group.tasks.filter((t) => {
      const status = ((t.status as unknown) as string);
      if (status === 'done' || status === 'cancelled') return false;
      const due = (t as any).dueDate ?? (t as any).deadlineDate;
      if (!due) return true; // no deadline → still active
      const dueDate = new Date(due);
      // Active today or in the future (including same day)
      return dueDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
    });
    if (activeTasks.length === 0) continue;
    out.push({
      subject: group.subject,
      icon: group.icon,
      count: activeTasks.length,
      ep: activeTasks.reduce((s, t) => s + (((t as any).pointsValue as number) ?? 0), 0),
      taskIds: activeTasks.map((t) => (t.id as string)),
    });
  }
  // The lane param is reserved for future filtering (e.g. "synced to morning only").
  // For now every active assignment subject appears as a chip in any lane.
  void lane;
  return out;
}