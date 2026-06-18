import { Task, TaskStatus, MirroredTask } from '../data/types';
import { StorageAdapter } from '../data/StorageAdapter';

const STORAGE_KEY = 'dominicstasks.tasks.v2';

/**
 * TaskBehaviour — persists tasks to localStorage via StorageAdapter.
 *
 * Before (in-memory only): tasks lost on reload.
 * After (wired): tasks survive reload. UI gets reactive updates via subscribe().
 *
 * Public surface unchanged from pre-wiring version — all callers (UI components,
 * other behaviours) work without modification.
 */
export class TaskBehaviour {
  private storage = new StorageAdapter<Task>(STORAGE_KEY);
  private subscribers: Set<(event: any) => void> = new Set();
  private ready: Promise<void>;

  constructor() {
    this.ready = this.storage.load();
    // Forward storage events to our subscribers
    this.storage.subscribe((event) => {
      this.notify({ ...event, source: 'storage' });
    });
  }

  /**
   * Wait for initial load to complete. UI components should call this once
   * before rendering to avoid showing empty state on first paint.
   */
  async whenReady(): Promise<void> {
    return this.ready;
  }

  subscribe(callback: (event: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(event: any) {
    this.subscribers.forEach(cb => cb(event));
  }

  getTasksSync(): Task[] {
    return this.storage.getAllSync();
  }

  async getTasks(): Promise<Task[]> {
    await this.ready;
    return this.storage.getAllSync();
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    await this.ready;
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.storage.add(newTask);
    this.notify({ type: 'task_created', task: newTask });
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await this.ready;
    const updated = await this.storage.update(id, { ...updates, updatedAt: new Date() });
    this.notify({ type: 'task_updated', task: updated });
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await this.ready;
    await this.storage.softDelete(id);
    const task = this.storage.getByIdSync(id);
    this.notify({ type: 'task_deleted', task });
  }

  async completeTask(id: string): Promise<Task> {
    await this.ready;
    const updated = await this.storage.update(id, {
      status: 'done' as TaskStatus,
      completedAt: new Date(),
      updatedAt: new Date(),
    });
    this.notify({ type: 'task_updated', task: updated });
    return updated;
  }

  async getMirroredTasks(): Promise<MirroredTask[]> {
    await this.ready;
    return this.storage
      .getAllSync()
      .filter(t => t.section === 'assignments' || t.section === 'leftovers')
      .map(t => ({ ...t, isMirrored: true, originalTaskId: t.id }));
  }

  // Task approval methods
  async getPendingApprovals(): Promise<any[]> {
    return [];
  }

  async approveTaskCompletion(approvalId: string): Promise<void> {
    console.log(`Approving task completion for: ${approvalId}`);
  }

  async rejectTaskCompletion(approvalId: string, reason?: string): Promise<void> {
    console.log(`Rejecting task completion for: ${approvalId}`, reason);
  }

  async restoreDeletedTasks(): Promise<number> {
    await this.ready;
    const cancelled = this.storage.getAllSync().filter(t => t.status === 'cancelled');
    let count = 0;
    for (const t of cancelled) {
      await this.storage.update(t.id, {
        status: 'pending' as TaskStatus,
        updatedAt: new Date(),
      });
      count++;
    }
    this.notify({ type: 'tasks_restored', tasks: cancelled });
    return count;
  }

  getDeletedTasks(): Task[] {
    return this.storage.getAllSync().filter(t => t.status === 'cancelled');
  }

  /** Test helper — clear all persisted tasks. */
  async _clearForTest(): Promise<void> {
    await this.storage.clear();
    this.notify({ type: 'cleared' });
  }
}
