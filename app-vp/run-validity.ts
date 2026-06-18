/**
 * Validity test runner for M01-M04 behaviour classes.
 * Runs via: npx tsx app-vp/run-validity.ts
 *
 * Uses Node's built-in test runner (node:test) so no Jest setup required.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TaskBehaviour } from '../src/behaviours/TaskBehaviour';
import { ChatBehaviour } from '../src/behaviours/ChatBehaviour';
import { FamilyBehaviour } from '../src/behaviours/FamilyBehaviour';
import { AuthBehaviour } from '../src/behaviours/AuthBehaviour';
import type { TaskStatus } from '../src/data/types';

// ============ M01 — TaskBehaviour ============

test('TaskBehaviour: starts with empty tasks', () => {
  const tb = new TaskBehaviour();
  assert.deepEqual(tb.getTasksSync(), []);
});

test('TaskBehaviour: createTask adds + notifies', async () => {
  const tb = new TaskBehaviour();
  const events: any[] = [];
  tb.subscribe(e => events.push(e));
  const t = await tb.createTask({
    title: 'Take out bins', description: '',
    status: 'pending' as TaskStatus, priority: 'medium',
    type: 'chore', section: 'assignments',
    creatorId: 'p', creatorName: 'P', tags: [],
  } as any);
  assert.match(t.id, /^task_\d+_[a-z0-9]+$/);
  assert.equal(tb.getTasksSync().length, 1);
  assert.ok(events.some(e => e.type === 'task_created'));
});

test('TaskBehaviour: completeTask sets status=done + completedAt', async () => {
  const tb = new TaskBehaviour();
  const t = await tb.createTask({
    title: 'X', description: '', status: 'pending' as TaskStatus,
    priority: 'medium', type: 'chore', section: 'assignments',
    creatorId: 'p', creatorName: 'P', tags: [],
  } as any);
  const done = await tb.completeTask(t.id);
  assert.equal(done.status, 'done');
  assert.ok(done.completedAt instanceof Date);
});

test('TaskBehaviour: completeTask throws on unknown id', async () => {
  const tb = new TaskBehaviour();
  await assert.rejects(() => tb.completeTask('nope'), /not found/);
});

test('TaskBehaviour: deleteTask is soft-delete (C2 invariant)', async () => {
  const tb = new TaskBehaviour();
  const t = await tb.createTask({
    title: 'X', description: '', status: 'pending' as TaskStatus,
    priority: 'medium', type: 'chore', section: 'assignments',
    creatorId: 'p', creatorName: 'P', tags: [],
  } as any);
  await tb.deleteTask(t.id);
  const tasks = tb.getTasksSync();
  assert.equal(tasks.length, 1, 'soft delete preserves array');
  assert.equal(tasks[0].status, 'cancelled');
});

test('TaskBehaviour: C6 user flow — create, complete, filter', async () => {
  const tb = new TaskBehaviour();
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
  assert.equal(done.length, 1);
  assert.equal(pending.length, 1);
});

// ============ M02 — ChatBehaviour ============

test('ChatBehaviour: starts with 10 seed messages', () => {
  const cb = new ChatBehaviour();
  const msgs = cb.getMessagesSync();
  assert.equal(msgs.length, 10);
  assert.equal(msgs[0].id, 'seed_1');
});

test('ChatBehaviour: sendChatMessage appends + notifies', async () => {
  const cb = new ChatBehaviour();
  const events: any[] = [];
  cb.subscribe(e => events.push(e));
  const m = await cb.sendChatMessage({
    familyId: 'demo', userId: 'u1', userName: 'Test',
    content: 'hello', type: 'text',
  } as any);
  assert.match(m.id, /^msg_\d+_[a-z0-9]+$/);
  assert.equal(cb.getMessagesSync().length, 11);
  assert.ok(events.some(e => e.type === 'message_sent'));
});

// ============ M03 — FamilyBehaviour ============

test('FamilyBehaviour: default family + empty profiles', async () => {
  const fb = new FamilyBehaviour();
  const family = await fb.getFamily();
  const profiles = await fb.getProfiles();
  assert.equal(family.id, 'family_default');
  assert.deepEqual(profiles, []);
});

test('FamilyBehaviour: createChildProfile adds profile + childId', async () => {
  const fb = new FamilyBehaviour();
  const p = await fb.createChildProfile('Alice', 'a1', '#FF0000');
  assert.equal(p.name, 'Alice');
  assert.equal((await fb.getProfiles()).length, 1);
  assert.ok((await fb.getFamily()).childIds.includes(p.id));
});

test('FamilyBehaviour: deleteChildProfile throws on unknown id', async () => {
  const fb = new FamilyBehaviour();
  await assert.rejects(() => fb.deleteChildProfile('nope'), /not found/);
});

// ============ M04 — AuthBehaviour ============

test('AuthBehaviour: getCurrentUser returns default parent user', async () => {
  const ab = new AuthBehaviour();
  const u = await ab.getCurrentUser();
  assert.equal(u.id, 'user_default');
  assert.equal(u.role, 'parent');
});

test('AuthBehaviour: subscribe returns unsubscribe fn', () => {
  const ab = new AuthBehaviour();
  const cb = () => {};
  const unsub = ab.subscribe(cb);
  assert.equal(typeof unsub, 'function');
  unsub();
});
