/**
 * EventBus — substrate piece from FreshCards (src/core/event-bus.ts).
 *
 * Pub/sub for cross-component messaging. Behaviour → UI → other UI.
 *
 * Why: Components shouldn't talk to each other through props or context chains
 * when the message has no UI tree relationship. EventBus is the substrate
 * layer that lets any component emit "task.dragStart" and any other component
 * subscribe — without them knowing about each other.
 *
 * Usage:
 *   import { eventBus } from '@/substrate/EventBus';
 *   eventBus.emit('task.dragStart', { taskId: 't_123' });
 *   eventBus.on('task.dragStart', (e) => { ... });
 *
 * Layer: substrate (FreshCards-compatible, see avidtech6/freshvibestudio
 *        modules/freshcards/src/core/event-bus.ts).
 */

export type EventHandler = (data: any) => void;

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      // Snapshot to avoid issues if handlers modify the set during iteration
      const snapshot = new Set(listeners);
      snapshot.forEach(handler => handler(data));
    }
  }

  getListenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  clear(event?: string): void {
    if (event) this.listeners.delete(event);
    else this.listeners.clear();
  }
}

/** Singleton — used app-wide. */
export const eventBus = new EventBus();

/**
 * Typed event names used in DominicsTasks.
 * Adding a new event: extend this union, then emit/on with the new name.
 */
export type DominicsTasksEvent =
  // Card lifecycle
  | 'card.stateChanged'           // { cardId, from, to }
  | 'card.selected'                // { cardId }
  | 'card.deselected'              // { cardId }
  // Task mutations (also flow through TaskBehaviour, but useful for UI cross-talk)
  | 'task.created'                 // { task }
  | 'task.updated'                 // { task }
  | 'task.deleted'                 // { taskId }
  | 'task.completed'               // { task }
  // View switching (for when ViewSwitcher is wired)
  | 'view.changed'                 // { databaseId, fromViewId, toViewId }
  // Peek panel
  | 'peek.open'                    // { kind, id }
  | 'peek.close'                   // { kind, id }
  // Cross-component notifications (e.g. "task X needs parent approval")
  | 'notification'                 // { kind, message, taskId? };
