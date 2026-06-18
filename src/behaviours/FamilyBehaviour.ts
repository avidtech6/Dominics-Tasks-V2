import { Family, Profile, User } from '../data/types';
import { StorageAdapter } from '../data/StorageAdapter';

const STORAGE_KEY = 'dominicstasks.family.v2';

const DEFAULT_FAMILY: Family = {
  id: 'family_default',
  name: 'Default Family',
  parentId: 'parent_default',
  childIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * FamilyBehaviour — persists family + child profiles to localStorage.
 *
 * Before: hardcoded `family_default`, profiles in RAM only.
 * After: family + profiles survive reload. First load uses DEFAULT_FAMILY if empty.
 */
export class FamilyBehaviour {
  private storage = new StorageAdapter<Profile>(STORAGE_KEY);
  // Family itself is a singleton object — store it under a separate key
  private familyKey = 'dominicstasks.family.object.v2';
  private subscribers: Set<(event: any) => void> = new Set();
  private ready: Promise<void>;
  private family: Family;

  constructor() {
    this.family = { ...DEFAULT_FAMILY };
    this.ready = (async () => {
      await this.storage.load();
      // Load family singleton
      try {
        const raw = localStorage.getItem(this.familyKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Re-hydrate dates
          if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
          if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
          this.family = parsed;
        }
      } catch (err) {
        console.error('[FamilyBehaviour] family load failed:', err);
        this.family = { ...DEFAULT_FAMILY };
      }
    })();
    // Forward storage events
    this.storage.subscribe((event) => {
      this.notify({ ...event, source: 'storage' });
    });
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

  async getFamily(): Promise<Family> {
    await this.ready;
    return { ...this.family };
  }

  async getProfiles(): Promise<Profile[]> {
    await this.ready;
    return [...this.storage.getAllSync()];
  }

  async getCurrentUser(): Promise<User> {
    return {
      id: 'user_default',
      email: 'user@example.com',
      name: 'Default User',
      color: '#3B82F6',
      role: 'parent' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async loadFamily(): Promise<Family> {
    return this.getFamily();
  }

  async createChildProfile(name: string, avatar: string, color: string): Promise<Profile> {
    await this.ready;
    const newProfile: Profile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      avatar,
      color,
      userId: 'child_default',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.storage.add(newProfile);
    // Add to family's childIds + persist
    this.family.childIds = [...this.family.childIds, newProfile.id];
    this.family.updatedAt = new Date();
    await this.persistFamily();
    this.notify({ type: 'child_created', profile: newProfile });
    return newProfile;
  }

  async deleteChildProfile(childId: string): Promise<void> {
    await this.ready;
    await this.storage.hardDelete(childId);
    this.family.childIds = this.family.childIds.filter(id => id !== childId);
    this.family.updatedAt = new Date();
    await this.persistFamily();
    const profile = { id: childId } as Profile;
    this.notify({ type: 'child_deleted', profile });
  }

  async updateParentSettings(settings: any): Promise<void> {
    await this.ready;
    this.family = {
      ...this.family,
      ...settings,
      updatedAt: new Date(),
    };
    await this.persistFamily();
    this.notify({ type: 'family_updated', family: this.family });
  }

  private async persistFamily(): Promise<void> {
    try {
      localStorage.setItem(this.familyKey, JSON.stringify(this.family));
    } catch (err) {
      console.error('[FamilyBehaviour] family persist failed:', err);
      throw err;
    }
  }

  /** Test helper — clear all data. */
  async _clearForTest(): Promise<void> {
    await this.storage.clear();
    localStorage.removeItem(this.familyKey);
    this.family = { ...DEFAULT_FAMILY };
    this.notify({ type: 'cleared' });
  }
}
