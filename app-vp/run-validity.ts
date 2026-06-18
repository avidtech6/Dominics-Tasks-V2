/**
 * Validity test runner for M01-M04 behaviour classes.
 * Runs via: npx tsx app-vp/run-validity.ts
 *
 * Uses Node's built-in test runner (node:test) so no Jest setup required.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Polyfill localStorage for Node — behaviours use it on construction.
// This polyfill keeps a Map<string,string> in memory.
const _store = new Map<string, string>();
const localStoragePolyfill = {
  getItem(k: string): string | null { return _store.has(k) ? _store.get(k)! : null; },
  setItem(k: string, v: string) { _store.set(k, String(v)); },
  removeItem(k: string) { _store.delete(k); },
  clear() { _store.clear(); },
  key(i: number): string | null { return Array.from(_store.keys())[i] ?? null; },
  get length() { return _store.size; },
};
// @ts-expect-error — polyfill on globalThis
globalThis.localStorage = localStoragePolyfill;

// Clear localStorage between tests so each behaviour starts fresh
beforeEach(() => {
  _store.clear();
});

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

test('ChatBehaviour: starts with 10 seed messages', async () => {
  const cb = new ChatBehaviour();
  await cb.whenReady();
  const msgs = cb.getMessagesSync();
  assert.equal(msgs.length, 10);
  assert.equal(msgs[0].id, 'seed_1');
});

test('ChatBehaviour: sendChatMessage appends + notifies', async () => {
  const cb = new ChatBehaviour();
  await cb.whenReady();
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

// ============ Persistence tests (FWV v8 wire-up) ============

test('Persistence: TaskBehaviour survives reload (localStorage round-trip)', async () => {
  // First "session" — create a task
  const tb1 = new TaskBehaviour();
  await tb1.whenReady();
  const t = await tb1.createTask({
    title: 'Persistence test', description: '',
    status: 'pending' as TaskStatus, priority: 'medium',
    type: 'chore', section: 'assignments',
    creatorId: 'p', creatorName: 'P', tags: [],
  } as any);

  // Simulate page reload — new instance, same localStorage
  const tb2 = new TaskBehaviour();
  await tb2.whenReady();
  const tasksAfterReload = tb2.getTasksSync();
  assert.equal(tasksAfterReload.length, 1, 'task should survive reload');
  assert.equal(tasksAfterReload[0].id, t.id);
  assert.equal(tasksAfterReload[0].title, 'Persistence test');
});

test('Persistence: ChatBehaviour survives reload', async () => {
  const cb1 = new ChatBehaviour();
  await cb1.whenReady();
  await cb1.sendChatMessage({
    familyId: 'demo', userId: 'u1', userName: 'T',
    content: 'survives reload', type: 'text',
  } as any);

  const cb2 = new ChatBehaviour();
  await cb2.whenReady();
  const messages = cb2.getMessagesSync();
  // 10 seeds + 1 sent = 11
  assert.equal(messages.length, 11);
  assert.ok(messages.some(m => (m as any).content === 'survives reload' || (m as any).text === 'survives reload'));
});

test('Persistence: FamilyBehaviour survives reload', async () => {
  const fb1 = new FamilyBehaviour();
  await fb1.whenReady();
  await fb1.createChildProfile('Survivor', 'av', '#123456');

  const fb2 = new FamilyBehaviour();
  await fb2.whenReady();
  const profiles = await fb2.getProfiles();
  const family = await fb2.getFamily();
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].name, 'Survivor');
  assert.ok(family.childIds.includes(profiles[0].id));
});

test('Persistence: data isolated across keys (no cross-contamination)', async () => {
  const tb = new TaskBehaviour();
  await tb.whenReady();
  await tb.createTask({
    title: 'iso test', description: '', status: 'pending' as TaskStatus,
    priority: 'medium', type: 'chore', section: 'assignments',
    creatorId: 'p', creatorName: 'P', tags: [],
  } as any);

  const cb = new ChatBehaviour();
  await cb.whenReady();
  // Should still have only 10 seed messages, not 11
  assert.equal(cb.getMessagesSync().length, 10);
});
