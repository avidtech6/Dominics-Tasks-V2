/**
 * StorageAdapter — thin wrapper around localStorage with reactive subscribers.
 *
 * Used by Behaviour classes to persist their state across page reloads.
 * Each behaviour gets its own key. Writes notify all subscribers.
 *
 * Why not just use the typed Repository interfaces?
 * - The repos use slightly different field shapes (e.g., `createdBy`, `order`)
 * - The behaviours expose sync accessors (getTasksSync) that need a cache
 * - This adapter is the bridge: write-through cache + persistence + pub/sub
 *
 * Future: swap to Firebase by replacing the `persist` and `load` functions.
 */

type Listener = (event: { type: string; [key: string]: any }) => void;

export class StorageAdapter<T extends { id: string }> {
  private cache: T[] = [];
  private listeners: Set<Listener> = new Set();
  private loaded = false;

  constructor(private key: string) {}

  /**
   * Load from localStorage. Idempotent.
   */
  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const parsed = JSON.parse(raw) as T[];
        // Re-hydrate Date fields — JSON strips them to strings
        this.cache = parsed.map(this.revive);
      }
    } catch (err) {
      console.error(`[StorageAdapter:${this.key}] load failed:`, err);
      this.cache = [];
    }
    this.loaded = true;
  }

  /**
   * Force-reload from localStorage (e.g., after another tab writes).
   */
  async reload(): Promise<void> {
    this.loaded = false;
    await this.load();
    this.notify({ type: 'reloaded' });
  }

  /**
   * Get the full list (sync — cache-backed).
   */
  getAllSync(): T[] {
    return [...this.cache];
  }

  /**
   * Find by id (sync — cache-backed).
   */
  getByIdSync(id: string): T | undefined {
    return this.cache.find(item => item.id === id);
  }

  /**
   * Add a new item.
   */
  async add(item: T): Promise<T> {
    this.cache.push(item);
    await this.persist();
    this.notify({ type: 'added', item });
    return item;
  }

  /**
   * Update by id.
   */
  async update(id: string, updates: Partial<T>): Promise<T> {
    const idx = this.cache.findIndex(item => item.id === id);
    if (idx === -1) throw new Error(`[StorageAdapter:${this.key}] ${id} not found`);
    this.cache[idx] = { ...this.cache[idx], ...updates };
    await this.persist();
    this.notify({ type: 'updated', item: this.cache[idx] });
    return this.cache[idx];
  }

  /**
   * Soft-delete: marks status='cancelled' (or sets deletedAt) instead of removing.
   */
  async softDelete(id: string, cancelledField: keyof T = 'status' as keyof T): Promise<void> {
    await this.update(id, { [cancelledField]: 'cancelled' } as Partial<T>);
    this.notify({ type: 'deleted', id });
  }

  /**
   * Hard-delete: removes from cache.
   */
  async hardDelete(id: string): Promise<void> {
    const before = this.cache.length;
    this.cache = this.cache.filter(item => item.id !== id);
    if (this.cache.length === before) {
      throw new Error(`[StorageAdapter:${this.key}] ${id} not found`);
    }
    await this.persist();
    this.notify({ type: 'deleted', id });
  }

  /**
   * Subscribe to changes.
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Clear all data (for testing).
   */
  async clear(): Promise<void> {
    this.cache = [];
    localStorage.removeItem(this.key);
    this.notify({ type: 'cleared' });
  }

  // ---- private ----

  private async persist(): Promise<void> {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.cache));
    } catch (err) {
      console.error(`[StorageAdapter:${this.key}] persist failed:`, err);
      throw err;
    }
  }

  private notify(event: { type: string; [key: string]: any }): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error(`[StorageAdapter:${this.key}] listener threw:`, err);
      }
    }
  }

  /**
   * Re-hydrate Date fields after JSON round-trip.
   * Override for custom shape revival.
   */
  protected revive(item: any): T {
    if (item == null) return item;
    const result: any = { ...item };
    for (const k of Object.keys(result)) {
      // ISO date string → Date
      if (typeof result[k] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(result[k])) {
        const d = new Date(result[k]);
        if (!isNaN(d.getTime())) result[k] = d;
      }
    }
    return result as T;
  }
}
