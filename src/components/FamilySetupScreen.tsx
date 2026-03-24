import React, { useState, useCallback, useEffect } from 'react';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import {
  User,
  Lock,
  Check,
  ChevronRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  isValidFamilyName,
  validatePin,
  isValidChildName,
  isLoadingState,
  shouldShowError,
  formatErrorMessage,
  getDefaultChildAvatar,
  getDefaultChildColor,
  getGmailPhotoUrl,
  validateStepProgression,
  getStepTitle,
  getStepDescription,
  getExistingFamilyName,
  formatFamilyName,
  formatChildName,
  canCompleteSetup,
  getStepHelpText
} from './FamilySetupScreenBehaviour';
import { CHILD_AVATARS, CHILD_THEME_COLORS, GMAIL_AVATAR, isGmailAvatar } from '../data/constants';

interface FamilySetupScreenProps {
  onComplete: () => void;
}

const FamilySetupScreen: React.FC<FamilySetupScreenProps> = ({ onComplete }) => {
  const { authBehaviour, familyBehaviour } = useBehaviours();
  const [user, setUser] = useState<unknown>(null);
  const [family, setFamily] = useState<unknown>(null);
  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState('');
  
  useEffect(() => {
    if (!authBehaviour || !familyBehaviour) return;
    const loadUserData = async () => {
      try {
        const currentUser = await authBehaviour.getCurrentUser();
        setUser(currentUser);
        const currentFamily = await familyBehaviour.loadFamily();
        setFamily(currentFamily);
        if (currentFamily?.settings?.familyName) {
          setFamilyName(getExistingFamilyName(currentFamily));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, [authBehaviour, familyBehaviour]);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [childName, setChildName] = useState('');
  const [childAvatar, setChildAvatar] = useState(getDefaultChildAvatar());
  const [childColor, setChildColor] = useState(getDefaultChildColor());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<number | null>(null);

  const handleFamilyNameSubmit = useCallback(() => {
    if (!familyName.trim()) {
      setError('Please enter a family name');
      return;
    }
    setError(null);
    setStep(2);
  }, [familyName]);

  const handlePinSubmit = useCallback(() => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    if (!/^\d+$/.test(pin)) {
      setError('PIN must contain only numbers');
      return;
    }
    setError(null);
    setStep(3);
  }, [pin, confirmPin]);

  const handleCreateProfile = useCallback(async () => {
    if (!childName.trim()) {
      setError('Please enter your child\'s name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update family name first
      await familyBehaviour.updateFamily({ name: familyName.trim() });
      
      // Setup PIN
      await familyBehaviour.setupParentPin(pin);
      
      // Determine avatar - if using Gmail photo, we'll pass the photoURL separately
      const avatarToUse = childAvatar;
      const gmailPhotoUrl = getGmailPhotoUrl(childAvatar, user);
      
      // Create first child profile
      await familyBehaviour.createChildProfile(childName.trim(), avatarToUse, childColor, gmailPhotoUrl);
      
      onComplete();
    } catch (err: any) {
      setError('Failed to complete setup: ' + (err?.message || 'Please try again.'));
      console.error('Setup error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [childName, childAvatar, childColor, familyName, pin, user, familyBehaviour, onComplete]);

  // Remove the empty updateFamilySettings function - using updateParentSettings directly

  return (
    <div className="family-setup-screen">
      {/* Progress indicator */}
      <div className="setup-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">{step > 1 ? <Check size={16} /> : '1'}</div>
          <span>Family Name</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">{step > 2 ? <Check size={16} /> : '2'}</div>
          <span>Parent PIN</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span>First Child</span>
        </div>
      </div>

      {/* Step 1: Family Name */}
      {step === 1 && (
        <div className="setup-step">
          <div className="step-icon">
            <User size={48} />
          </div>
          <h1>Welcome to Dominic's Tasks!</h1>
          <p>Let's set up your family account in just a few steps. This helps us create personalized profiles for each child.</p>

          <div className="form-group">
            <label>
              Your Family Name
              <button 
                className="help-btn" 
                onClick={() => setShowHelp(showHelp === 1 ? null : 1)}
                title="What is this for?"
              >
                <HelpCircle size={16} />
              </button>
            </label>
            {showHelp === 1 && (
              <div className="help-box">
                This name will appear on the family dashboard and helps identify whose account this is.
              </div>
            )}
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="The Giles Family"
              maxLength={30}
              autoFocus
            />
            <span className="input-hint">Give your family a name (e.g., "The Giles Family")</span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button className="primary-btn" onClick={handleFamilyNameSubmit}>
            Continue
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Step 2: Parent PIN */}
      {step === 2 && (
        <div className="setup-step">
          <div className="step-icon lock-icon">
            <Lock size={48} />
          </div>
          <h1>Set Parent PIN</h1>
          <p>Create a 4-digit PIN to access parent controls, settings, and approvals.</p>

          <div className="form-group">
            <label>
              Enter PIN
              <button 
                className="help-btn" 
                onClick={() => setShowHelp(showHelp === 2 ? null : 2)}
                title="What is this for?"
              >
                <HelpCircle size={16} />
              </button>
            </label>
            {showHelp === 2 && (
              <div className="help-box">
                This PIN protects parent-only features. You'll need it to approve task completions, manage settings, and access the admin dashboard.
              </div>
            )}
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              className="pin-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Confirm PIN</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              className="pin-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button className="secondary-btn" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="primary-btn" onClick={handlePinSubmit}>
              Continue
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: First Child */}
      {step === 3 && (
        <div className="setup-step">
          <div className="step-icon sparkles-icon">
            <Sparkles size={48} />
          </div>
          <h1>Add Your First Child</h1>
          <p>Create a profile for your child to start tracking tasks and earning rewards!</p>

          <div className="form-group">
            <label>
              Child's Name
              <button 
                className="help-btn" 
                onClick={() => setShowHelp(showHelp === 3 ? null : 3)}
                title="What is this for?"
              >
                <HelpCircle size={16} />
              </button>
            </label>
            {showHelp === 3 && (
              <div className="help-box">
                This is the name your child will see on their profile. You can add more children later from the parent dashboard.
              </div>
            )}
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Enter name"
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Choose Avatar</label>
            <div className="avatar-grid">
              {/* Gmail Photo Option */}
              {(user as any)?.photoURL && (
                <button
                  className={`avatar-option gmail-avatar ${childAvatar === GMAIL_AVATAR ? 'selected' : ''}`}
                  onClick={() => setChildAvatar(GMAIL_AVATAR)}
                  title="Use Gmail photo"
                >
                  <img
                    src={(user as any).photoURL}
                    alt="Gmail"
                    className="gmail-avatar-img"
                  />
                </button>
              )}
              {/* Emoji Avatars */}
              {CHILD_AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  className={`avatar-option ${childAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setChildAvatar(avatar)}
                >
                  {avatar}
                </button>
              ))}
            </div>
            {(user as any)?.photoURL && (
              <span className="input-hint">Click the Gmail photo to use your Google profile picture</span>
            )}
          </div>

          <div className="form-group">
            <label>Theme Color</label>
            <div className="color-grid">
              {CHILD_THEME_COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-option ${childColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setChildColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="preview-section">
            <label>Preview</label>
            <div className="preview-card" style={{ borderColor: childColor }}>
              <div className="preview-avatar">
                {isGmailAvatar(childAvatar) && (user as any)?.photoURL ? (
                  <img src={(user as any).photoURL} alt="Profile" className="preview-gmail-avatar" />
                ) : (
                  childAvatar
                )}
              </div>
              <div className="preview-info">
                <div className="preview-name">{childName || 'Child Name'}</div>
                <div className="preview-theme" style={{ color: childColor }}>
                  {isGmailAvatar(childAvatar) ? 'Gmail Photo' : 'Custom Theme'}
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button className="secondary-btn" onClick={() => setStep(2)} disabled={isLoading}>
              Back
            </button>
            <button className="primary-btn" onClick={handleCreateProfile} disabled={isLoading}>
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .family-setup-screen {
          min-height: 100vh;
          background: linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%);
          display: flex;
          flex-direction: column;
          padding: 24px;
        }

        .setup-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 40px;
          padding-top: 20px;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #6B7280;
          transition: all 0.2s;
        }

        .progress-step.active .step-number {
          background: #3B82F6;
          color: white;
        }

        .progress-step.completed .step-number {
          background: #10B981;
          color: white;
        }

        .progress-step span {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }

        .progress-step.active span {
          color: #374151;
        }

        .progress-line {
          width: 40px;
          height: 2px;
          background: #E5E7EB;
          margin-bottom: 20px;
        }

        .setup-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 420px;
          margin: 0 auto;
          text-align: center;
        }

        .step-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }

        .step-icon.lock-icon {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
        }

        .step-icon.sparkles-icon {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
        }

        .setup-step h1 {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px;
        }

        .setup-step p {
          font-size: 16px;
          color: #6B7280;
          margin: 0 0 32px;
          line-height: 1.5;
        }

        .form-group {
          width: 100%;
          margin-bottom: 20px;
          text-align: left;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #D1D5DB;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .help-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: #E5E7EB;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          margin-left: 6px;
          color: #6B7280;
          transition: all 0.2s;
        }

        .help-btn:hover {
          background: #D1D5DB;
          color: #374151;
        }

        .help-box {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #1E40AF;
          line-height: 1.5;
        }

        .pin-input {
          font-size: 24px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 8px;
        }

        .input-hint {
          display: block;
          font-size: 12px;
          color: #9CA3AF;
          margin-top: 4px;
        }

        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }

        .avatar-option {
          aspect-ratio: 1;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          background: white;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .avatar-option:hover {
          border-color: #3B82F6;
          background: #EFF6FF;
        }

        .avatar-option.selected {
          border-color: #3B82F6;
          background: #EFF6FF;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .gmail-avatar {
          font-size: 0;
        }

        .gmail-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          object-fit: cover;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .color-option {
          aspect-ratio: 1;
          border: 3px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .color-option:hover {
          transform: scale(1.05);
        }

        .color-option.selected {
          border-color: #111827;
        }

        .preview-section {
          width: 100%;
          text-align: left;
          margin-bottom: 16px;
        }

        .preview-section label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .preview-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 16px;
          border: 2px solid;
        }

        .preview-avatar {
          font-size: 36px;
          width: 56px;
          height: 56px;
          background: #F3F4F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .preview-gmail-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-info {
          text-align: left;
        }

        .preview-name {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .preview-theme {
          font-size: 13px;
          font-weight: 500;
        }

        .error-message {
          width: 100%;
          padding: 12px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          color: #DC2626;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .primary-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          border: none;
          border-radius: 14px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .primary-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .secondary-btn {
          flex: 1;
          padding: 16px;
          background: #F3F4F6;
          border: none;
          border-radius: 14px;
          color: #374151;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-btn:hover:not(:disabled) {
          background: #E5E7EB;
        }

        .secondary-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-group {
          display: flex;
          gap: 12px;
          width: 100%;
          margin-top: auto;
        }

        @media (max-width: 480px) {
          .avatar-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .setup-progress {
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

export default FamilySetupScreen;
