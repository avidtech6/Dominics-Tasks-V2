/**
 * Validity tests for M01-tasks — TaskBehaviour
 *
 * Source: src/behaviours/TaskBehaviour.ts
 * Recipe: app-fragments/tasks/
 * Codex C1-C8 contract verification
 */

import { TaskBehaviour } from '../../src/behaviours/TaskBehaviour';
import type { Task, TaskStatus } from '../../src/data/types';

describe('TaskBehaviour — validity', () => {
  let tb: TaskBehaviour;

  beforeEach(() => {
    tb = new TaskBehaviour();
  });

  // C2: State machine — initial state
  describe('initial state', () => {
    it('starts with empty tasks array', () => {
      expect(tb.getTasksSync()).toEqual([]);
    });
  });

  // C1 + C2: createTask
  describe('createTask', () => {
    it('adds a task and notifies subscribers', async () => {
      const events: any[] = [];
      tb.subscribe(e => events.push(e));

      const t = await tb.createTask({
        title: 'Take out bins',
        description: '',
        status: 'pending' as TaskStatus,
        priority: 'medium',
        type: 'chore',
        section: 'assignments',
        creatorId: 'parent_1',
        creatorName: 'Parent',
        tags: [],
      } as any);

      expect(t.id).toMatch(/^task_\d+_[a-z0-9]+$/);
      expect(tb.getTasksSync()).toHaveLength(1);
      expect(events).toContainEqual(expect.objectContaining({ type: 'task_created' }));
    });
  });

  // C1 + C2: completeTask
  describe('completeTask', () => {
    it('marks task done with completedAt', async () => {
      const t = await tb.createTask({
        title: 'Test',
        description: '',
        status: 'pending' as TaskStatus,
        priority: 'medium',
        type: 'chore',
        section: 'assignments',
        creatorId: 'p',
        creatorName: 'P',
        tags: [],
      } as any);

      const done = await tb.completeTask(t.id);
      expect(done.status).toBe('done');
      expect(done.completedAt).toBeInstanceOf(Date);
    });

    it('throws on unknown id (C5 failure mode)', async () => {
      await expect(tb.completeTask('nonexistent')).rejects.toThrow(/not found/);
    });
  });

  // C1 + C2: deleteTask (soft delete — C2 invariant)
  describe('deleteTask (soft)', () => {
    it('sets status to cancelled, does NOT remove from array', async () => {
      const t = await tb.createTask({
        title: 'Test', description: '', status: 'pending' as TaskStatus,
        priority: 'medium', type: 'chore', section: 'assignments',
        creatorId: 'p', creatorName: 'P', tags: [],
      } as any);

      await tb.deleteTask(t.id);
      const tasks = tb.getTasksSync();
      expect(tasks).toHaveLength(1); // INVARIANT: soft-delete preserves
      expect(tasks[0].status).toBe('cancelled');
    });
  });

  // C6: User simulation
  describe('user simulation (C6)', () => {
    it('complete flow: create → complete → history filter', async () => {
      const t1 = await tb.createTask({
        title: 'A', description: '', status: 'pending' as TaskStatus,
        priority: 'medium', type: 'chore', section: 'assignments',
        creatorId: 'p', creatorName: 'P', tags: [],
      } as any);
      const t2 = await tb.createTask({
        title: 'B', description: '', status: 'pending' as TaskStatus,
        priority: 'medium', type: 'chore', section: 'assignments',
        creatorId: 'p', creatorName: 'P', tags: [],
      } as any);

      await tb.completeTask(t1.id);

      const done = tb.getTasksSync().filter(t => t.status === 'done');
      const pending = tb.getTasksSync().filter(t => t.status === 'pending');
      expect(done).toHaveLength(1);
      expect(pending).toHaveLength(1);
    });
  });
});
