/**
 * ProfileSelectionScreenBehaviour.ts
 * 
 * Behavioural module for ProfileSelectionScreen component.
 * Extracted from ProfileSelectionScreen.tsx during FreshVibe PASS 7 behavioural isolation.
 * 
 * Contains pure, deterministic functions for profile data conversion,
 * child creation validation, and profile management.
 */

/**
 * Type definitions for profile-related operations
 */
interface ChildProfile {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'student' | 'parent';
  currentStreak: number;
  totalEP: number;
  level: number;
  unlockedAchievements: string[];
}

interface ChildData {
  name: string;
  photoUrl?: string;
  avatar?: string;
  stats?: {
    currentStreak?: number;
    totalEP?: number;
    level?: number;
  };
}

interface FamilyData {
  children?: Record<string, ChildData>;
}

/**
 * Converts family children data to profile array format
 */
export const convertFamilyToProfiles = (familyData: FamilyData | null): ChildProfile[] => {
  if (!familyData || !familyData.children) {
    return [];
  }

  return Object.entries(familyData.children).map(([id, child]) => ({
    id,
    uid: id,
    email: '',
    displayName: child.name,
    photoURL: child.photoUrl || child.avatar || '',
    role: 'student' as const,
    currentStreak: child.stats?.currentStreak || 0,
    totalEP: child.stats?.totalEP || 0,
    level: child.stats?.level || 1,
    unlockedAchievements: []
  }));
};

/**
 * Validates child name input for creation
 */
export const validateChildName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Please enter a name' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters long' };
  }

  // Check for invalid characters (basic validation)
  if (!/^[a-zA-Z0-9\s\-']+$/.test(name.trim())) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }

  return { isValid: true };
};

/**
 * Validates child avatar selection
 */
export const validateChildAvatar = (avatar: string, availableAvatars: string[]): { isValid: boolean; error?: string } => {
  if (!avatar || !availableAvatars.includes(avatar)) {
    return { isValid: false, error: 'Please select a valid avatar' };
  }
  return { isValid: true };
};

/**
 * Validates child color selection
 */
export const validateChildColor = (color: string, availableColors: string[]): { isValid: boolean; error?: string } => {
  if (!color || !availableColors.includes(color)) {
    return { isValid: false, error: 'Please select a valid color' };
  }
  return { isValid: true };
};

/**
 * Creates a new child profile object
 */
export const createChildProfile = (
  name: string,
  avatar: string,
  color: string,
  availableAvatars: string[],
  availableColors: string[]
): { profile: ChildProfile | null; errors: string[] } => {
  const errors: string[] = [];

  // Validate name
  const nameValidation = validateChildName(name);
  if (!nameValidation.isValid) {
    errors.push(nameValidation.error || 'Invalid name');
  }

  // Validate avatar
  const avatarValidation = validateChildAvatar(avatar, availableAvatars);
  if (!avatarValidation.isValid) {
    errors.push(avatarValidation.error || 'Invalid avatar');
  }

  // Validate color
  const colorValidation = validateChildColor(color, availableColors);
  if (!colorValidation.isValid) {
    errors.push(colorValidation.error || 'Invalid color');
  }

  if (errors.length > 0) {
    return { profile: null, errors };
  }

  return {
    profile: {
      id: '', // Will be set by the backend
      uid: '', // Will be set by the backend
      email: '',
      displayName: name.trim(),
      photoURL: avatar,
      role: 'student' as const,
      currentStreak: 0,
      totalEP: 0,
      level: 1,
      unlockedAchievements: []
    },
    errors: []
  };
};

/**
 * Handles profile click logic
 */
export const handleProfileClick = async (
  profileId: string,
  onProfileSelect: (profileId: string) => void
): Promise<void> => {
  try {
    await onProfileSelect(profileId);
  } catch (error) {
    console.error('Error selecting profile:', error);
    throw error;
  }
};

/**
 * Handles PIN submission for parent mode
 */
export const handlePinSubmission = async (
  pin: string,
  onParentMode: () => void
): Promise<boolean> => {
  try {
    // In a real implementation, this would validate the PIN
    // For now, we just proceed with parent mode
    onParentMode();
    return true;
  } catch (error) {
    console.error('Error handling PIN submission:', error);
    return false;
  }
};

/**
 * Formats display name for profile cards
 */
export const formatDisplayName = (name: string): string => {
  return name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
};

/**
 * Calculates profile statistics for display
 */
export const calculateProfileStats = (profile: ChildProfile): {
  streakDisplay: string;
  epDisplay: string;
  levelDisplay: string;
} => {
  return {
    streakDisplay: profile.currentStreak > 0 ? `${profile.currentStreak} day streak` : 'No streak',
    epDisplay: `${profile.totalEP} EP`,
    levelDisplay: `Level ${profile.level}`
  };
};

/**
 * Determines if a profile should show achievement indicators
 */
export const shouldShowAchievements = (profile: ChildProfile): boolean => {
  return profile.unlockedAchievements.length > 0;
};

/**
 * Sorts profiles by name for consistent display
 */
export const sortProfilesByName = (profiles: ChildProfile[]): ChildProfile[] => {
  return [...profiles].sort((a, b) => a.displayName.localeCompare(b.displayName));
};

/**
 * Filters profiles by search term
 */
export const filterProfilesBySearch = (profiles: ChildProfile[], searchTerm: string): ChildProfile[] => {
  if (!searchTerm) return profiles;
  
  const term = searchTerm.toLowerCase();
  return profiles.filter(profile => 
    profile.displayName.toLowerCase().includes(term) ||
    profile.email.toLowerCase().includes(term)
  );
};