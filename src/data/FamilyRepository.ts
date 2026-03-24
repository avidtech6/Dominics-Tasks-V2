import { Family, FamilySettings, ChildSettings } from '../types';

/**
 * Repository interface for family operations
 * Abstracts Firebase family functionality behind clean interfaces
 */
export interface FamilyRepository {
  getFamily(userId: string): Promise<Family | null>;
  createFamily(family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>;
  updateFamily(userId: string, updates: Partial<Family>): Promise<void>;
  setupParentPin(userId: string, pinHash: string): Promise<void>;
  updateParentSettings(userId: string, settings: Partial<FamilySettings>): Promise<void>;
  updateChildSettings(userId: string, childId: string, settings: Partial<ChildSettings>): Promise<void>;
}

// Factory function for creating local family repository
export function createLocalFamilyRepository(): FamilyRepository {
  return new LocalFamilyRepository();
}

// Local implementation
class LocalFamilyRepository implements FamilyRepository {
  private storageKey = 'dominicstasks_family';
  private families: Map<string, Family> = new Map();
  private currentFamilyId: string | null = null;

  constructor() {
    this.loadFamilies();
  }

  private loadFamilies(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (data.families) {
          data.families.forEach((family: any) => {
            if (family.createdAt) family.createdAt = new Date(family.createdAt);
            if (family.updatedAt) family.updatedAt = new Date(family.updatedAt);
            if (family.members) {
              family.members.forEach((member: any) => {
                if (member.createdAt) member.createdAt = new Date(member.createdAt);
                if (member.lastLogin) member.lastLogin = new Date(member.lastLogin);
              });
            }
          });
          this.families = new Map(data.families.map((f: Family) => [f.id, f]));
        }
        this.currentFamilyId = data.currentFamilyId || null;
      }
    } catch (error) {
      console.error('Error loading family data from localStorage:', error);
      this.families = new Map();
      this.currentFamilyId = null;
    }
  }

  private saveFamilies(): void {
    try {
      const data = {
        families: Array.from(this.families.values()),
        currentFamilyId: this.currentFamilyId
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving family data to localStorage:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async getFamily(userId: string): Promise<Family | null> {
    // Find family where user is a parent (based on settings.parentId)
    for (const family of this.families.values()) {
      if (family.settings.parentId === userId) {
        this.currentFamilyId = family.id;
        return family;
      }
    }
    return null;
  }

  async createFamily(family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const newFamily: Family = {
      ...family,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.families.set(newFamily.id, newFamily);
    this.currentFamilyId = newFamily.id;
    this.saveFamilies();
  }

  async updateFamily(userId: string, updates: Partial<Family>): Promise<void> {
    const family = await this.getFamily(userId);
    if (!family) {
      throw new Error('Family not found for user');
    }

    const updatedFamily: Family = {
      ...family,
      ...updates,
      updatedAt: new Date()
    };

    this.families.set(family.id, updatedFamily);
    this.saveFamilies();
  }

  async setupParentPin(userId: string, pinHash: string): Promise<void> {
    const family = await this.getFamily(userId);
    if (!family) {
      throw new Error('Family not found for user');
    }

    const updatedFamily: Family = {
      ...family,
      settings: {
        ...family.settings,
        pinHash: pinHash,
        hasPinSetup: true
      },
      updatedAt: new Date()
    };

    this.families.set(family.id, updatedFamily);
    this.saveFamilies();
  }

  async updateParentSettings(userId: string, settings: Partial<FamilySettings>): Promise<void> {
    const family = await this.getFamily(userId);
    if (!family) {
      throw new Error('Family not found for user');
    }

    const updatedFamily: Family = {
      ...family,
      settings: {
        ...family.settings,
        ...settings
      },
      updatedAt: new Date()
    };

    this.families.set(family.id, updatedFamily);
    this.saveFamilies();
  }

  async updateChildSettings(userId: string, childId: string, settings: Partial<ChildSettings>): Promise<void> {
    const family = await this.getFamily(userId);
    if (!family) {
      throw new Error('Family not found for user');
    }

    // In a real implementation, child settings would be stored separately
    // For now, we'll store them in the family settings as a stringified JSON
    const childSettingsData = {
      ...settings,
      childId: childId,
      updatedAt: new Date()
    };

    // Store child settings in a simple key-value format in localStorage
    const childSettingsKey = `dominicstasks_child_settings_${childId}`;
    localStorage.setItem(childSettingsKey, JSON.stringify(childSettingsData));

    // Update the family to reflect that child settings were updated
    const updatedFamily: Family = {
      ...family,
      settings: {
        ...family.settings
      },
      updatedAt: new Date()
    };

    this.families.set(family.id, updatedFamily);
    this.saveFamilies();
  }
}