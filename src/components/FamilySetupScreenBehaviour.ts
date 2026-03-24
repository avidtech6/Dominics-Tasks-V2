/**
 * Family Setup Screen Behaviour Module
 * Extracted from FamilySetupScreen component
 * Handles form validation, data loading, and profile creation logic
 */

import { CHILD_AVATARS, CHILD_THEME_COLORS, GMAIL_AVATAR, isGmailAvatar } from '../data/constants';

/**
 * Validate family name input
 * @param familyName - Family name to validate
 * @returns Whether the family name is valid
 */
export const isValidFamilyName = (familyName: string): boolean => {
  return familyName.trim().length > 0;
};

/**
 * Validate PIN input
 * @param pin - PIN to validate
 * @param confirmPin - Confirmation PIN to validate against
 * @returns Validation result with error message if invalid
 */
export const validatePin = (pin: string, confirmPin: string): { isValid: boolean; error?: string } => {
  if (pin.length !== 4) {
    return { isValid: false, error: 'PIN must be 4 digits' };
  }
  if (pin !== confirmPin) {
    return { isValid: false, error: 'PINs do not match' };
  }
  if (!/^\d+$/.test(pin)) {
    return { isValid: false, error: 'PIN must contain only numbers' };
  }
  return { isValid: true };
};

/**
 * Validate child name input
 * @param childName - Child name to validate
 * @returns Whether the child name is valid
 */
export const isValidChildName = (childName: string): boolean => {
  return childName.trim().length > 0;
};

/**
 * Determine if setup is loading
 * @param isLoading - Loading state from component
 * @returns Whether to show loading state
 */
export const isLoadingState = (isLoading: boolean): boolean => {
  return isLoading;
};

/**
 * Determine if error should be shown
 * @param error - Error message from component
 * @returns Whether to show error state
 */
export const shouldShowError = (error: string | null): boolean => {
  return error !== null;
};

/**
 * Format error message for display
 * @param error - Error message to format
 * @returns Formatted error message
 */
export const formatErrorMessage = (error: string | null): string => {
  return error || '';
};

/**
 * Get default child avatar
 * @returns Default avatar from constants
 */
export const getDefaultChildAvatar = () => {
  return CHILD_AVATARS[0];
};

/**
 * Get default child color
 * @returns Default color from constants
 */
export const getDefaultChildColor = () => {
  return CHILD_THEME_COLORS[0];
};

/**
 * Determine if avatar is Gmail avatar
 * @param avatar - Avatar to check
 * @param user - User object with photoURL
 * @returns Gmail photo URL if applicable
 */
export const getGmailPhotoUrl = (avatar: string, user: any): string | null => {
  return isGmailAvatar(avatar) ? user?.photoURL || null : null;
};

/**
 * Validate step progression
 * @param step - Current step number
 * @param familyName - Family name input
 * @param pin - PIN input
 * @param confirmPin - Confirmation PIN input
 * @param childName - Child name input
 * @returns Next step number or current step if validation fails
 */
export const validateStepProgression = (
  step: number,
  familyName: string,
  pin: string,
  confirmPin: string,
  childName: string
): number => {
  switch (step) {
    case 1:
      if (!isValidFamilyName(familyName)) {
        return 1;
      }
      return 2;
    case 2:
      const pinValidation = validatePin(pin, confirmPin);
      if (!pinValidation.isValid) {
        return 2;
      }
      return 3;
    case 3:
      if (!isValidChildName(childName)) {
        return 3;
      }
      return 4;
    default:
      return step;
  }
};

/**
 * Get step title based on current step
 * @param step - Current step number
 * @returns Step title string
 */
export const getStepTitle = (step: number): string => {
  const titles = [
    'Create Your Family',
    'Set Up Parent PIN',
    'Create Child Profile',
    'Complete Setup'
  ];
  return titles[step - 1] || 'Setup';
};

/**
 * Get step description based on current step
 * @param step - Current step number
 * @returns Step description string
 */
export const getStepDescription = (step: number): string => {
  const descriptions = [
    'Choose a name for your family',
    'Create a 4-digit PIN for parent access',
    'Add your child\'s profile information',
    'You\'re all set to begin!'
  ];
  return descriptions[step - 1] || '';
};

/**
 * Check if family name exists in family settings
 * @param family - Family object from component
 * @returns Family name if exists
 */
export const getExistingFamilyName = (family: any): string => {
  return family?.settings?.familyName || '';
};

/**
 * Format family name for submission
 * @param familyName - Raw family name input
 * @returns Trimmed family name
 */
export const formatFamilyName = (familyName: string): string => {
  return familyName.trim();
};

/**
 * Format child name for submission
 * @param childName - Raw child name input
 * @returns Trimmed child name
 */
export const formatChildName = (childName: string): string => {
  return childName.trim();
};

/**
 * Check if setup can be completed
 * @param step - Current step number
 * @param familyName - Family name input
 * @param pin - PIN input
 * @param confirmPin - Confirmation PIN input
 * @param childName - Child name input
 * @param isLoading - Loading state
 * @returns Whether setup can be completed
 */
export const canCompleteSetup = (
  step: number,
  familyName: string,
  pin: string,
  confirmPin: string,
  childName: string,
  isLoading: boolean
): boolean => {
  if (isLoading) return false;
  if (step !== 3) return false;
  if (!isValidFamilyName(familyName)) return false;
  if (!validatePin(pin, confirmPin).isValid) return false;
  if (!isValidChildName(childName)) return false;
  return true;
};

/**
 * Get help text for current step
 * @param step - Current step number
 * @returns Help text string
 */
export const getStepHelpText = (step: number): string => {
  const helpTexts = [
    'Your family name helps identify your household in the app',
    'Your PIN is used for parent access and secure settings',
    'Choose an avatar and color that represents your child',
    'You can always change these settings later in the profile'
  ];
  return helpTexts[step - 1] || '';
};