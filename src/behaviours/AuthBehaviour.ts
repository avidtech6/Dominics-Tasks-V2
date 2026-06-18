import { User } from '../data/types';

const STORAGE_KEY = 'dominicstasks.user.v2';

const DEFAULT_USER: User = {
  id: 'user_default',
  email: 'user@example.com',
  name: 'Default User',
  color: '#3B82F6',
  role: 'parent' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * AuthBehaviour — minimal user persistence to localStorage.
 *
 * Real auth (Firebase, OAuth) is still a future feature per FWV v8 doctrine.
 * What we DO persist: the current user's identity + display prefs.
 *
 * Before: getCurrentUser always returned the same DEFAULT_USER object.
 * After: getCurrentUser returns the persisted user (or DEFAULT_USER if first load).
 */
export class AuthBehaviour {
  private subscribers: Set<(event: any) => void> = new Set();
  private ready: Promise<void>;
  private currentUser: User;

  constructor() {
    this.currentUser = { ...DEFAULT_USER };
    this.ready = (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Re-hydrate dates
          if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
          if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
          this.currentUser = parsed;
        }
      } catch (err) {
        console.error('[AuthBehaviour] user load failed:', err);
        this.currentUser = { ...DEFAULT_USER };
      }
    })();
  }

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

  async getCurrentUser(): Promise<User> {
    await this.ready;
    return { ...this.currentUser };
  }

  async exitParentMode(): Promise<void> {
    console.log('Exiting parent mode');
    this.notify({ type: 'parent_mode_exited' });
  }

  async setupParentPin(pin: string): Promise<void> {
    console.log('Setting up parent pin:', pin);
    // Persist hashed PIN (real impl would hash — for now, plain text in dev)
    try {
      localStorage.setItem('dominicstasks.parentpin.v2', pin);
      this.notify({ type: 'parent_pin_set' });
    } catch (err) {
      console.error('[AuthBehaviour] pin persist failed:', err);
    }
  }

  /** Test helper. */
  async _clearForTest(): Promise<void> {
    this.currentUser = { ...DEFAULT_USER };
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('dominicstasks.parentpin.v2');
    this.notify({ type: 'cleared' });
  }
}
