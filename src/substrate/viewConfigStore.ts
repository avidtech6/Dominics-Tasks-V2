/**
 * viewConfigStore — substrate piece from FreshCards (viewConfig.ts + useViewConfig.ts).
 *
 * Persists per-database view configurations to localStorage. Future code
 * can add a ViewSwitcher dropdown without re-architecting — the persistence
 * and accessor helpers are substrate.
 *
 * Usage:
 *   // Initialise a database with default views
 *   const db = createDatabase('db_tasks');
 *   saveDatabase(db);
 *
 *   // Read later (e.g. in a Tasks page header)
 *   const db = loadDatabase('db_tasks');
 *   const views = db?.views ?? [];
 *
 *   // Update a view
 *   updateView('db_tasks', 'view_kanban', { groupBy: 'status' });
 *
 *   // Active view (the one currently being shown)
 *   setActiveView('db_tasks', 'view_kanban');
 *   const active = getActiveViewId('db_tasks');
 *
 * This is purely infrastructure — no UI consumes it yet. The substrate
 * makes adding a ViewSwitcher dropdown a 30-line change instead of a
 * 200-line refactor.
 */

import type { Database, ViewConfig, DatabaseItem } from './Database';
import { createDatabase } from './Database';
import { StorageAdapter } from '../data/StorageAdapter';

const STORAGE_PREFIX = 'dominicstasks.db.';
const ACTIVE_VIEW_PREFIX = 'dominicstasks.db.active.';

/**
 * Per-database store. One StorageAdapter per database id.
 */
function dbStore(databaseId: string): StorageAdapter<DatabaseItem> {
  // Note: we wrap the *whole* Database as a single-item collection so we
  // can use the existing StorageAdapter pattern. The item id is 'database'.
  return new StorageAdapter<DatabaseItem & { __isDatabaseRoot?: true }>(
    `${STORAGE_PREFIX}${databaseId}`
  );
}

/** Default database configs the app ships with. */
export const DEFAULT_DATABASES: Database[] = [
  (() => {
    const db = createDatabase('db_tasks', 'Tasks');
    db.views = [
      { id: 'db_tasks_view_board',  name: 'Board',  type: 'kanban',  primaryPropertyId: 'status' },
      { id: 'db_tasks_view_list',   name: 'List',   type: 'list' },
      { id: 'db_tasks_view_gallery', name: 'Gallery', type: 'gallery' },
      { id: 'db_tasks_view_calendar', name: 'Calendar', type: 'calendar', primaryPropertyId: 'dueDate' },
    ];
    return db;
  })(),
  (() => {
    const db = createDatabase('db_chat', 'Family Chat');
    db.views = [
      { id: 'db_chat_view_threads', name: 'Threads', type: 'list' },
    ];
    return db;
  })(),
];

/**
 * Save a database (overwrites). Idempotent.
 */
export function saveDatabase(db: Database): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${db.id}`, JSON.stringify(db));
  } catch (err) {
    console.error(`[viewConfigStore] saveDatabase(${db.id}) failed:`, err);
    throw err;
  }
}

/**
 * Load a database by id. Returns null if not yet saved.
 */
export function loadDatabase(databaseId: string): Database | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${databaseId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Re-hydrate dates
    if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
    if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
    if (Array.isArray(parsed.items)) {
      parsed.items.forEach((it: any) => {
        if (it.createdAt) it.createdAt = new Date(it.createdAt);
        if (it.updatedAt) it.updatedAt = new Date(it.updatedAt);
      });
    }
    return parsed as Database;
  } catch (err) {
    console.error(`[viewConfigStore] loadDatabase(${databaseId}) failed:`, err);
    return null;
  }
}

/**
 * Get a database, falling back to a default config if not saved.
 */
export function getOrCreateDatabase(databaseId: string): Database {
  const existing = loadDatabase(databaseId);
  if (existing) return existing;
  const def = DEFAULT_DATABASES.find(d => d.id === databaseId);
  const db = def ?? createDatabase(databaseId);
  saveDatabase(db);
  return db;
}

/**
 * Update an existing view config. If the database doesn't exist, creates it.
 */
export function updateView(
  databaseId: string,
  viewId: string,
  updates: Partial<ViewConfig>
): void {
  const db = getOrCreateDatabase(databaseId);
  const idx = db.views.findIndex(v => v.id === viewId);
  if (idx === -1) {
    console.warn(`[viewConfigStore] view ${viewId} not found in ${databaseId}`);
    return;
  }
  db.views[idx] = { ...db.views[idx], ...updates, id: viewId };
  db.updatedAt = new Date();
  saveDatabase(db);
}

/**
 * Add a new view to a database.
 */
export function addView(databaseId: string, view: ViewConfig): void {
  const db = getOrCreateDatabase(databaseId);
  if (db.views.find(v => v.id === view.id)) {
    console.warn(`[viewConfigStore] view ${view.id} already exists`);
    return;
  }
  db.views.push(view);
  db.updatedAt = new Date();
  saveDatabase(db);
}

/**
 * Remove a view from a database. Refuses to remove the last view.
 */
export function removeView(databaseId: string, viewId: string): boolean {
  const db = getOrCreateDatabase(databaseId);
  if (db.views.length <= 1) {
    console.warn('[viewConfigStore] refusing to remove last view');
    return false;
  }
  db.views = db.views.filter(v => v.id !== viewId);
  db.updatedAt = new Date();
  saveDatabase(db);
  return true;
}

// ─── Active view tracking ──────────────────────────────────────────────────

/**
 * Set the active view for a database. UI components read this to know
 * which view to render.
 */
export function setActiveView(databaseId: string, viewId: string): void {
  try {
    localStorage.setItem(`${ACTIVE_VIEW_PREFIX}${databaseId}`, viewId);
  } catch (err) {
    console.error('[viewConfigStore] setActiveView failed:', err);
  }
}

export function getActiveViewId(databaseId: string): string | null {
  try {
    return localStorage.getItem(`${ACTIVE_VIEW_PREFIX}${databaseId}`);
  } catch {
    return null;
  }
}

/**
 * Resolve the active view config (or first view as fallback).
 */
export function getActiveView(databaseId: string): ViewConfig | null {
  const db = getOrCreateDatabase(databaseId);
  const activeId = getActiveViewId(databaseId);
  return db.views.find(v => v.id === activeId) ?? db.views[0] ?? null;
}

/**
 * Get the items stored in a database. Empty array if not yet loaded.
 */
export function getDatabaseItems(databaseId: string): DatabaseItem[] {
  const db = loadDatabase(databaseId);
  return db?.items ?? [];
}

/**
 * Persist items to a database (overwrites items array; keeps schema/views).
 */
export function saveDatabaseItems(databaseId: string, items: DatabaseItem[]): void {
  const db = getOrCreateDatabase(databaseId);
  db.items = items;
  db.updatedAt = new Date();
  saveDatabase(db);
}

/**
 * Migration helper — ensure all default databases exist in storage.
 * Call this once at app startup (AppOrchestrator's whenReady).
 */
export function ensureDefaultDatabases(): void {
  for (const db of DEFAULT_DATABASES) {
    if (!loadDatabase(db.id)) {
      saveDatabase(db);
    }
  }
}
