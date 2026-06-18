/**
 * PinPadBehaviour.ts
 * 
 * Behavioural module for PinPad component.
 * Extracted from PinPad.tsx during FreshVibe PASS 7 behavioural isolation.
 * 
 * Contains pure, deterministic functions for PIN validation, 
 * biometric checks, and lockout management.
 */

/**
 * Type definitions for PIN-related operations
 */
interface PinValidationResult {
  isValid: boolean;
  error?: string;
}

interface LockoutState {
  isLocked: boolean;
  lockTimeRemaining: number;
  wrongAttempts: number;
}

interface BiometricCheckResult {
  available: boolean;
  type?: 'fingerprint' | 'faceid';
}

/**
 * Validates PIN input based on length and format requirements
 */
export const validatePinInput = (
  pin: string, 
  maxLength: number = 4
): PinValidationResult => {
  if (!pin || pin.length === 0) {
    return { isValid: false, error: 'PIN is required' };
  }
  
  if (pin.length !== maxLength) {
    return { isValid: false, error: `PIN must be ${maxLength} digits` };
  }
  
  // Check if all characters are digits
  if (!/^\d+$/.test(pin)) {
    return { isValid: false, error: 'PIN must contain only digits' };
  }
  
  return { isValid: true };
};

/**
 * Checks if biometric authentication is available in the current environment
 */
export const checkBiometricAvailability = (showBiometric: boolean = true): BiometricCheckResult => {
  if (!showBiometric) {
    return { available: false };
  }

  // Check if WebAuthn API is available
  if (typeof window !== 'undefined' && 'credentials' in navigator && 'get' in navigator.credentials) {
    // For demo purposes, we'll assume fingerprint is available
    // In a real implementation, you would check for specific biometric types
    return { 
      available: true, 
      type: 'fingerprint' 
    };
  }
  
  return { available: false };
};

/**
 * Calculates new lockout state after a failed attempt
 */
export const calculateLockoutState = (
  currentState: LockoutState,
  maxAttempts: number = 5,
  lockoutDuration: number = 30
): LockoutState => {
  const newWrongAttempts = currentState.wrongAttempts + 1;
  
  if (newWrongAttempts >= maxAttempts) {
    return {
      isLocked: true,
      lockTimeRemaining: lockoutDuration,
      wrongAttempts: newWrongAttempts
    };
  }
  
  return {
    isLocked: false,
    lockTimeRemaining: 0,
    wrongAttempts: newWrongAttempts
  };
};

/**
 * Formats lockout time display for user interface
 */
export const formatLockTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${secs}s`;
};

/**
 * Handles PIN submission logic and validation
 */
export const handlePinSubmission = async (
  pin: string,
  onSubmit: (pin: string) => Promise<boolean>,
  maxLength: number = 4
): Promise<{ success: boolean; shouldLock: boolean; newWrongAttempts: number }> => {
  // Validate PIN format
  const validation = validatePinInput(pin, maxLength);
  if (!validation.isValid) {
    return { 
      success: false, 
      shouldLock: false, 
      newWrongAttempts: 0 
    };
  }

  try {
    const success = await onSubmit(pin);
    return { 
      success, 
      shouldLock: false, 
      newWrongAttempts: success ? 0 : 1 
    };
  } catch (error) {
    return { 
      success: false, 
      shouldLock: false, 
      newWrongAttempts: 1 
    };
  }
};

/**
 * Handles biometric authentication simulation
 */
export const handleBiometricSubmission = async (
  onSubmit: (pin: string) => Promise<boolean>,
  placeholderPin: string = '0000'
): Promise<{ success: boolean }> => {
  try {
    // In a real implementation, this would use WebAuthn API
    // For demo purposes, we use a placeholder PIN
    const success = await onSubmit(placeholderPin);
    return { success };
  } catch (error) {
    return { success: false };
  }
};

/**
 * Determines if PIN input should be allowed based on current state
 */
export const canInputPin = (
  isLoading: boolean,
  isLocked: boolean,
  currentLength: number,
  maxLength: number
): boolean => {
  return !isLoading && !isLocked && currentLength < maxLength;
};

/**
 * Determines if backspace should be allowed
 */
export const canBackspace = (isLoading: boolean, isLocked: boolean): boolean => {
  return !isLoading && !isLocked;
};

/**
 * Determines if biometric authentication should be available
 */
export const canUseBiometric = (
  biometricAvailable: boolean,
  isLoading: boolean,
  isLocked: boolean
): boolean => {
  return biometricAvailable && !isLoading && !isLocked;
};

/**
 * Handles keyboard input for PIN entry
 */
export const handleKeyboardInput = (
  key: string,
  currentPin: string,
  maxLength: number,
  onDigitPress: (digit: string) => void,
  onBackspace: () => void,
  onSubmit: () => void,
  onCancel?: () => void
): void => {
  if (key >= '0' && key <= '9') {
    onDigitPress(key);
  } else if (key === 'Backspace') {
    onBackspace();
  } else if (key === 'Enter') {
    if (currentPin.length === maxLength) {
      onSubmit();
    }
  } else if (key === 'Escape') {
    onCancel?.();
  }
};

/**
 * Auto-submits PIN when complete
 */
export const shouldAutoSubmit = (
  pin: string,
  maxLength: number,
  isLoading: boolean,
  isLocked: boolean
): boolean => {
  return pin.length === maxLength && !isLoading && !isLocked;
};