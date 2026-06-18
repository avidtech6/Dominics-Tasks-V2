/**
 * Layout Behaviour Module
 * Extracted behavioural logic from Layout.tsx
 * Contains pure, deterministic functions for layout management
 */

interface UserType {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  currentStreak: number;
  totalEP: number;
  level: number;
  unlockedAchievements: any[];
}

interface ChildProfile {
  name: string;
  photoUrl?: string;
  avatar?: string;
  stats: {
    currentStreak: number;
    totalEP: number;
    level: number;
  };
}

/**
 * Determines if user is parent based on user data
 */
export const isParentUser = (userData: UserType | null): boolean => {
  return userData?.role === 'parent' || false;
};

/**
 * Converts family children data to profile array
 */
export const convertFamilyToProfiles = (familyData: any): UserType[] => {
  if (!familyData?.children) {
    return [];
  }

  return Object.entries(familyData.children).map(([id, child]) => ({
    id,
    uid: id,
    email: '',
    displayName: (child as ChildProfile).name,
    photoURL: (child as ChildProfile).photoUrl || (child as ChildProfile).avatar,
    role: 'student' as const,
    currentStreak: (child as ChildProfile).stats.currentStreak || 0,
    totalEP: (child as ChildProfile).stats.totalEP || 0,
    level: (child as ChildProfile).stats.level || 1,
    unlockedAchievements: []
  }));
};

/**
 * Determines if family setup is needed
 */
export const needsFamilySetup = (familyData: any): boolean => {
  return !familyData;
};

/**
 * Gets default profile from profiles array
 */
export const getDefaultProfile = (profiles: UserType[]): UserType | null => {
  return profiles.length > 0 ? profiles[0] : null;
};

/**
 * Resets all state for sign out
 */
export const resetSignOutState = (): void => {
  // This function returns void as it's meant to be used with setState calls
  return;
};

/**
 * Verifies parent pin and returns success status
 */
export const verifyParentPin = async (
  pin: string, 
  family: any, 
  familyBehaviour: any
): Promise<boolean> => {
  if (!family) {
    return false;
  }
  
  try {
    const success = await familyBehaviour.verifyParentPin(pin, family);
    return success;
  } catch (error) {
    console.error('Error verifying parent pin:', error);
    return false;
  }
};

/**
 * Validates PIN format (4 digits)
 */
export const isValidPin = (pin: string): boolean => {
  return pin.length === 4 && /^\d+$/.test(pin);
};

/**
 * Gets current path for navigation
 */
export const getCurrentPath = (): string => {
  return typeof window !== 'undefined' ? window.location.pathname : '/tasks';
};

/**
 * Determines if navigation path is active
 */
export const isPathActive = (currentPath: string, path: string): boolean => {
  return currentPath === path;
};

/**
 * Handles PIN input validation
 */
export const validatePinInput = (pin: string, maxLength: number = 4): {
  isValid: boolean;
  canAddDigit: boolean;
  canRemoveDigit: boolean;
} => {
  return {
    isValid: pin.length === maxLength && /^\d+$/.test(pin),
    canAddDigit: pin.length < maxLength,
    canRemoveDigit: pin.length > 0
  };
};

/**
 * Formats PIN display with dots
 */
export const formatPinDisplay = (pin: string, maxLength: number = 4): string[] => {
  return Array.from({ length: maxLength }, (_, i) => 
    i < pin.length ? '●' : '○'
  );
};

/**
 * Handles PIN submission logic
 */
export const handlePinSubmission = async (
  pin: string,
  onSubmit: (pin: string) => Promise<boolean>,
  setError: (error: boolean) => void
): Promise<boolean> => {
  if (pin.length !== 4) {
    return false;
  }
  
  try {
    const success = await onSubmit(pin);
    if (!success) {
      setError(true);
    }
    return success;
  } catch (error) {
    console.error('Error handling pin submission:', error);
    setError(true);
    return false;
  }
};