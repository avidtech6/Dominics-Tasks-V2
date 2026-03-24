import { Family, Profile, User } from '../data/types';

export class FamilyBehaviour {
  private family: Family = {
    id: 'family_default',
    name: 'Default Family',
    parentId: 'parent_default',
    childIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  private profiles: Profile[] = [];
  private subscribers: Set<(event: any) => void> = new Set();

  subscribe(callback: (event: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(event: any) {
    this.subscribers.forEach(cb => cb(event));
  }

  async getFamily(): Promise<Family> {
    return this.family;
  }

  async getProfiles(): Promise<Profile[]> {
    return [...this.profiles];
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
}
