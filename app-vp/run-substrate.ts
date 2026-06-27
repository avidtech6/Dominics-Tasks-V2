/**
 * Substrate validity tests — FreshCards substrate pieces that we plugged in.
 * Each substrate piece has its own test group.
 *
 * Run: npx tsx --test app-vp/run-substrate.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

// Polyfill localStorage
const _store = new Map<string, string>();
const ls = {
  getItem: (k: string) => (_store.has(k) ? _store.get(k)! : null),
  setItem: (k: string, v: string) => { _store.set(k, String(v)); },
  removeItem: (k: string) => { _store.delete(k); },
  clear: () => _store.clear(),
  key: (i: number) => Array.from(_store.keys())[i] ?? null,
  get length() { return _store.size; },
};
// @ts-expect-error
globalThis.localStorage = ls;

import { EventBus, eventBus } from '../src/substrate/EventBus';
import {
  createDatabase,
  createDatabaseItem,
  createProperty,
  createStatusProperty,
  getPropValue,
  setPropValue,
} from '../src/substrate/Database';
import {
  taskToDatabaseItem,
  databaseItemToTask,
  buildTasksSchema,
} from '../src/substrate/adapters';
import {
  hashId,
  getGradientForId,
  resolveCover,
  classifyCover,
  COVER_GRADIENTS,
} from '../src/substrate/coverResolver';
import {
  saveDatabase,
  loadDatabase,
  getOrCreateDatabase,
  updateView,
  addView,
  removeView,
  setActiveView,
  getActiveView,
  ensureDefaultDatabases,
  getDatabaseItems,
  saveDatabaseItems,
} from '../src/substrate/viewConfigStore';
import type { Task } from '../src/data/types';

// ============ EventBus ============

test('Substrate: EventBus on/emit delivers', () => {
  const bus = new EventBus();
  let received: any = null;
  bus.on('test.event', (data) => { received = data; });
  bus.emit('test.event', { hello: 'world' });
  assert.deepEqual(received, { hello: 'world' });
});

test('Substrate: EventBus on/off unsubscribes', () => {
  const bus = new EventBus();
  let count = 0;
  const handler = () => { count++; };
  bus.on('x', handler);
  bus.emit('x', null);
  bus.off('x', handler);
  bus.emit('x', null);
  assert.equal(count, 1);
});

test('Substrate: EventBus multiple handlers all fire', () => {
  const bus = new EventBus();
  let a = 0, b = 0;
  bus.on('y', () => a++);
  bus.on('y', () => b++);
  bus.emit('y', null);
  assert.equal(a, 1);
  assert.equal(b, 1);
});

test('Substrate: singleton eventBus is shared across modules', () => {
  eventBus.clear();
  let n = 0;
  eventBus.on('singleton.test', () => n++);
  eventBus.emit('singleton.test', null);
  assert.equal(n, 1);
});

// ============ Database model ============

test('Substrate: createDatabase returns valid structure', () => {
  const db = createDatabase('db_x', 'Test');
  assert.equal(db.id, 'db_x');
  assert.equal(db.name, 'Test');
  assert.equal(db.views.length, 1);
  assert.equal(db.items.length, 0);
  assert.ok(db.schema);
});

test('Substrate: createDatabaseItem returns valid structure', () => {
  const item = createDatabaseItem('i_1', 'db_x', 'Hello');
  assert.equal(item.id, 'i_1');
  assert.equal(item.title, 'Hello');
  assert.equal(item.properties.length, 0);
  assert.equal(item.tags.length, 0);
});

test('Substrate: getPropValue reads typed property', () => {
  const item = createDatabaseItem('i_1', 'db_x');
  item.properties.push({ propertyId: 'status', value: 'status_done' });
  assert.equal(getPropValue(item, 'status'), 'status_done');
  assert.equal(getPropValue(item, 'nonexistent'), undefined);
});

test('Substrate: setPropValue immutably updates property', () => {
  const item = createDatabaseItem('i_1', 'db_x');
  item.properties.push({ propertyId: 'status', value: 'status_todo' });
  const updated = setPropValue(item, 'status', 'status_done');
  assert.equal(updated.properties.length, 1);
  assert.equal(getPropValue(updated, 'status'), 'status_done');
  // Original is unchanged
  assert.equal(getPropValue(item, 'status'), 'status_todo');
});

test('Substrate: setPropValue replaces existing property (no dupes)', () => {
  const item = createDatabaseItem('i_1', 'db_x');
  item.properties.push({ propertyId: 'priority', value: 'prio_low' });
  const updated = setPropValue(item, 'priority', 'prio_high');
  assert.equal(updated.properties.filter(p => p.propertyId === 'priority').length, 1);
  assert.equal(getPropValue(updated, 'priority'), 'prio_high');
});

test('Substrate: createStatusProperty attaches statusOptions', () => {
  const p = createStatusProperty('status', 'Status', [
    { name: 'To do', color: '#999', state: 'active' },
    { name: 'Done', color: '#0f0', state: 'completed' },
  ]);
  assert.equal(p.type, 'status');
  assert.equal(p.statusOptions?.length, 2);
  assert.equal(p.statusOptions?.[0].name, 'To do');
});

// ============ Adapters (Task <-> DatabaseItem) ============

test('Substrate: Task → DatabaseItem maps status', () => {
  const task: Task = {
    id: 'task_1',
    title: 'Test',
    description: '',
    status: 'in_progress',
    priority: 'high',
    type: 'chore',
    section: 'assignments',
    creatorId: 'p',
    creatorName: 'P',
    tags: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
  const item = taskToDatabaseItem(task);
  assert.equal(item.id, 'task_1');
  assert.equal(item.title, 'Test');
  assert.equal(getPropValue(item, 'status'), 'status_in_progress');
  assert.equal(getPropValue(item, 'priority'), 'prio_high');
});

test('Substrate: DatabaseItem → Task round-trips status', () => {
  const original: Task = {
    id: 'task_1',
    title: 'Test',
    description: 'desc',
    status: 'pending',
    priority: 'medium',
    type: 'chore',
    section: 'assignments',
    creatorId: 'p',
    creatorName: 'P',
    tags: ['a'],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
  const item = taskToDatabaseItem(original);
  const updated = setPropValue(item, 'status', 'status_done');
  const back = databaseItemToTask(updated, original);
  assert.equal(back.status, 'done');
  assert.equal(back.title, 'Test');
  assert.deepEqual(back.tags, ['a']);
});

test('Substrate: buildTasksSchema has all expected properties', () => {
  const schema = buildTasksSchema();
  const ids = schema.map(p => p.id);
  assert.ok(ids.includes('title'));
  assert.ok(ids.includes('status'));
  assert.ok(ids.includes('priority'));
  assert.ok(ids.includes('type'));
  assert.ok(ids.includes('section'));
});

// ============ Cover resolver ============

test('Substrate: hashId is stable', () => {
  assert.equal(hashId('task_1'), hashId('task_1'));
  assert.notEqual(hashId('task_1'), hashId('task_2'));
});

test('Substrate: getGradientForId returns deterministic gradient', () => {
  const g1 = getGradientForId('task_abc');
  const g2 = getGradientForId('task_abc');
  assert.equal(g1, g2);
  assert.ok(COVER_GRADIENTS.includes(g1));
});

test('Substrate: resolveCover falls back to gradient', () => {
  const item = createDatabaseItem('task_xyz', 'db_tasks');
  const cover = resolveCover(item);
  assert.ok(cover.startsWith('linear-gradient'));
});

test('Substrate: classifyCover identifies types', () => {
  assert.equal(classifyCover(null), 'empty');
  assert.equal(classifyCover('https://x.com/y.png'), 'remote');
  assert.equal(classifyCover('data:image/png;base64,xyz'), 'data');
  assert.equal(classifyCover('linear-gradient(...)'), 'gradient');
});

// ============ ViewConfigStore ============

test('Substrate: save/load database round-trips', () => {
  _store.clear();
  const db = createDatabase('db_v1', 'My board');
  saveDatabase(db);
  const loaded = loadDatabase('db_v1');
  assert.ok(loaded);
  assert.equal(loaded!.name, 'My board');
  // Date fields re-hydrate as Date objects
  assert.ok(loaded!.createdAt instanceof Date);
});

test('Substrate: getOrCreateDatabase returns default config when not saved', () => {
  _store.clear();
  const db = getOrCreateDatabase('db_tasks');
  assert.equal(db.id, 'db_tasks');
  assert.ok(db.views.length >= 1, 'default views present');
});

test('Substrate: updateView mutates existing view', () => {
  _store.clear();
  const db = getOrCreateDatabase('db_tasks');
  updateView('db_tasks', db.views[0].id, { name: 'Renamed' });
  const loaded = loadDatabase('db_tasks');
  assert.equal(loaded!.views[0].name, 'Renamed');
});

test('Substrate: addView appends; removeView removes', () => {
  _store.clear();
  const db = getOrCreateDatabase('db_tasks');
  const before = db.views.length;
  addView('db_tasks', { id: 'view_new', name: 'New', type: 'gallery' });
  let loaded = loadDatabase('db_tasks');
  assert.equal(loaded!.views.length, before + 1);
  assert.ok(loaded!.views.find(v => v.id === 'view_new'));

  const removed = removeView('db_tasks', 'view_new');
  loaded = loadDatabase('db_tasks');
  assert.equal(removed, true);
  assert.equal(loaded!.views.length, before);
});

test('Substrate: removeView refuses to remove last view', () => {
  _store.clear();
  const db = getOrCreateDatabase('db_tasks');
  // db_tasks starts with 4 views; remove down to 1
  while (loadDatabase('db_tasks')!.views.length > 1) {
    const lastId = loadDatabase('db_tasks')!.views[loadDatabase('db_tasks')!.views.length - 1].id;
    removeView('db_tasks', lastId);
  }
  // Now try to remove the last one
  const lastId = loadDatabase('db_tasks')!.views[0].id;
  const result = removeView('db_tasks', lastId);
  assert.equal(result, false);
  assert.equal(loadDatabase('db_tasks')!.views.length, 1);
});

test('Substrate: setActiveView / getActiveView', () => {
  _store.clear();
  getOrCreateDatabase('db_tasks');
  setActiveView('db_tasks', 'db_tasks_view_board');
  assert.equal(getActiveView('db_tasks')?.id, 'db_tasks_view_board');
});

test('Substrate: getActiveView falls back to first view', () => {
  _store.clear();
  const db = getOrCreateDatabase('db_tasks');
  assert.equal(getActiveView('db_tasks')?.id, db.views[0].id);
});

test('Substrate: ensureDefaultDatabases creates missing defaults', () => {
  _store.clear();
  ensureDefaultDatabases();
  assert.ok(loadDatabase('db_tasks'));
});

test('Substrate: getDatabaseItems returns [] for new database', () => {
  _store.clear();
  const items = getDatabaseItems('db_brand_new');
  assert.deepEqual(items, []);
});

test('Substrate: saveDatabaseItems persists items', () => {
  _store.clear();
  const item = createDatabaseItem('i_1', 'db_tasks', 'Hello');
  saveDatabaseItems('db_tasks', [item]);
  const items = getDatabaseItems('db_tasks');
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Hello');
});
