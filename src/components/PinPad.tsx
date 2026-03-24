import React, { useState, useEffect, useCallback } from 'react';
import { Fingerprint, User, Delete, CheckCircle, XCircle } from 'lucide-react';
import {
  validatePinInput,
  checkBiometricAvailability,
  calculateLockoutState,
  formatLockTime,
  handlePinSubmission,
  handleBiometricSubmission,
  canInputPin,
  canBackspace,
  canUseBiometric,
  handleKeyboardInput,
  shouldAutoSubmit
} from './PinPadBehaviour';

interface PinPadProps {
  onSubmit: (pin: string) => Promise<boolean>;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  errorMessage?: string;
  showBiometric?: boolean;
  maxLength?: number;
}

const PinPad: React.FC<PinPadProps> = ({
  onSubmit,
  onCancel,
  title = 'Enter PIN',
  subtitle = 'Enter your 4-digit parent PIN',
  errorMessage,
  showBiometric = true,
  maxLength = 4,
}) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Check for biometric availability
  useEffect(() => {
    const biometricCheck = checkBiometricAvailability(showBiometric);
    setBiometricAvailable(biometricCheck.available);
  }, [showBiometric]);

  // Lockout timer
  useEffect(() => {
    if (!isLocked) return;

    if (lockTimeRemaining <= 0) {
      setIsLocked(false);
      setWrongAttempts(0);
      return;
    }

    const timer = setInterval(() => {
      setLockTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setWrongAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockTimeRemaining]);

  const handleDigitPress = useCallback((digit: string) => {
    if (!canInputPin(isLoading, isLocked, pin.length, maxLength)) return;
    setPin((prev) => prev + digit);
    setIsError(false);
  }, [isLoading, isLocked, pin.length, maxLength]);

  const handleBackspace = useCallback(() => {
    if (!canBackspace(isLoading, isLocked)) return;
    setPin((prev) => prev.slice(0, -1));
    setIsError(false);
  }, [isLoading, isLocked]);

  const handleClear = useCallback(() => {
    if (!canBackspace(isLoading, isLocked)) return;
    setPin('');
    setIsError(false);
  }, [isLoading, isLocked]);

  const handleSubmit = useCallback(async () => {
    if (isLoading || isLocked || pin.length !== maxLength) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const result = await handlePinSubmission(pin, onSubmit, maxLength);
      if (!result.success) {
        setIsError(true);
        setPin('');
        const newLockoutState = calculateLockoutState(
          { isLocked, lockTimeRemaining, wrongAttempts: result.newWrongAttempts },
          5,
          30
        );
        setWrongAttempts(newLockoutState.wrongAttempts);
        if (newLockoutState.isLocked) {
          setIsLocked(true);
          setLockTimeRemaining(newLockoutState.lockTimeRemaining);
        }
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit, pin, isLoading, isLocked, wrongAttempts, maxLength]);

  const handleBiometric = useCallback(async () => {
    if (!canUseBiometric(biometricAvailable, isLoading, isLocked)) return;

    try {
      setIsLoading(true);
      const result = await handleBiometricSubmission(onSubmit);
      if (!result.success) {
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [biometricAvailable, isLoading, isLocked, onSubmit]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyboardInput(
        e.key,
        pin,
        maxLength,
        handleDigitPress,
        handleBackspace,
        handleSubmit,
        onCancel
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isLoading, isLocked, handleDigitPress, handleBackspace, handleSubmit, onCancel, maxLength]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (shouldAutoSubmit(pin, maxLength, isLoading, isLocked)) {
      handleSubmit();
    }
  }, [pin, maxLength, isLoading, isLocked, handleSubmit]);

  return (
    <div className="pin-pad-overlay">
      <div className="pin-pad-modal">
        {/* Close button */}
        {onCancel && (
          <button className="pin-pad-close" onClick={onCancel}>
            <XCircle size={24} />
          </button>
        )}

        {/* Header */}
        <div className="pin-pad-header">
          <div className="pin-pad-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="pin-pad-title">{title}</h2>
          <p className="pin-pad-subtitle">{subtitle}</p>
        </div>

        {/* Error message */}
        {isError && (
          <div className="pin-pad-error">
            <XCircle size={18} />
            <span>{errorMessage || 'Incorrect PIN. Please try again.'}</span>
          </div>
        )}

        {/* Lockout message */}
        {isLocked && (
          <div className="pin-pad-locked">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
            <p>Too many attempts</p>
            <span>Try again in {formatLockTime(lockTimeRemaining)}</span>
          </div>
        )}

        {/* PIN dots */}
        {!isLocked && (
          <>
            <div className="pin-pad-dots">
              {Array.from({ length: maxLength }).map((_, index) => (
                <div
                  key={index}
                  className={`pin-dot ${index < pin.length ? 'filled' : ''} ${isError ? 'error' : ''}`}
                >
                  {index < pin.length && <span>•</span>}
                </div>
              ))}
            </div>

            {/* Biometric button */}
            {biometricAvailable && showBiometric && (
              <button className="pin-pad-biometric" onClick={handleBiometric} disabled={isLoading}>
                <User size={32} />
                <span>Use Biometric</span>
              </button>
            )}

            {/* Keypad */}
            <div className="pin-pad-keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  className={`pin-key ${pin.includes(digit) ? 'active' : ''}`}
                  onClick={() => handleDigitPress(digit)}
                  disabled={isLoading}
                >
                  {digit}
                </button>
              ))}

              {/* Bottom row: Biometric placeholder, 0, Backspace */}
              <div className="pin-key-spacer" />

              <button
                className="pin-key"
                onClick={() => handleDigitPress('0')}
                disabled={isLoading || pin.length >= maxLength}
              >
                0
              </button>

              <button
                className="pin-key pin-key-action"
                onClick={handleBackspace}
                disabled={isLoading || pin.length === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>
            </div>

            {/* Cancel button */}
            {onCancel && (
              <button className="pin-pad-cancel" onClick={onCancel}>
                Cancel
              </button>
            )}
          </>
        )}
      </div>

      <style>{`
        .pin-pad-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .pin-pad-modal {
          background: white;
          border-radius: 24px;
          padding: 32px;
          width: 100%;
          max-width: 360px;
          position: relative;
          animation: slideUp 0.3s ease-out;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pin-pad-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .pin-pad-close:hover {
          background: #F3F4F6;
          color: #4B5563;
        }

        .pin-pad-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .pin-pad-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .pin-pad-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px;
        }

        .pin-pad-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }

        .pin-pad-error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 12px;
          color: #DC2626;
          font-size: 14px;
          margin-bottom: 20px;
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .pin-pad-locked {
          text-align: center;
          padding: 24px;
          color: #6B7280;
        }

        .pin-pad-locked svg {
          color: #9CA3AF;
          margin-bottom: 12px;
        }

        .pin-pad-locked p {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 4px;
        }

        .pin-pad-locked span {
          font-size: 14px;
        }

        .pin-pad-dots {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .pin-dot {
          width: 20px;
          height: 20px;
          border: 2px solid #D1D5DB;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .pin-dot.filled {
          background: #3B82F6;
          border-color: #3B82F6;
        }

        .pin-dot.filled span {
          color: white;
          font-size: 16px;
          font-weight: bold;
        }

        .pin-dot.error {
          border-color: #EF4444;
          background: #FEF2F2;
        }

        .pin-pad-biometric {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          margin-bottom: 20px;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pin-pad-biometric:hover:not(:disabled) {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }

        .pin-pad-biometric:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pin-pad-keypad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .pin-key {
          height: 64px;
          border: none;
          background: #F3F4F6;
          border-radius: 16px;
          font-size: 24px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s;
        }

        .pin-key:hover:not(:disabled) {
          background: #E5E7EB;
          transform: scale(1.02);
        }

        .pin-key:active:not(:disabled) {
          transform: scale(0.98);
        }

        .pin-key:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pin-key.active {
          background: #3B82F6;
          color: white;
        }

        .pin-key-action {
          background: transparent;
          font-size: 0;
        }

        .pin-key-spacer {
          height: 0;
        }

        .pin-pad-cancel {
          width: 100%;
          padding: 12px;
          background: none;
          border: none;
          color: #6B7280;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .pin-pad-cancel:hover {
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default PinPad;
