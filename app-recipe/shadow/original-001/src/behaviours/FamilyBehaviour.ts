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

  // Family management methods
  async loadFamily(): Promise<Family> {
    return this.getFamily();
  }

  async createChildProfile(name: string, avatar: string, color: string): Promise<Profile> {
    const newProfile: Profile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      avatar,
      color,
      userId: 'child_default',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.profiles.push(newProfile);
    this.family.childIds.push(newProfile.id);
    this.notify({ type: 'child_created', profile: newProfile });
    
    return newProfile;
  }

  async deleteChildProfile(childId: string): Promise<void> {
    const index = this.profiles.findIndex(p => p.id === childId);
    if (index === -1) {
      throw new Error(`Profile ${childId} not found`);
    }
    
    const deletedProfile = this.profiles[index];
    this.profiles.splice(index, 1);
    this.family.childIds = this.family.childIds.filter(id => id !== childId);
    
    this.notify({ type: 'child_deleted', profile: deletedProfile });
  }

  async updateParentSettings(settings: any): Promise<void> {
    this.family = {
      ...this.family,
      ...settings,
      updatedAt: new Date(),
    };
    this.notify({ type: 'family_updated', family: this.family });
  }
}
