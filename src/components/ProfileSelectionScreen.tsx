import React, { useState, useCallback, useEffect } from 'react';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import PinPad from './PinPad';
import {
  Plus,
  Settings,
  Lock,
  Trophy,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { CHILD_AVATARS, CHILD_THEME_COLORS, GMAIL_AVATAR, isGmailAvatar } from '../data/constants';
import { User } from '../data/types';
import { Family } from '../data/types';
import { ChildProfile } from './ProfileSelectionScreenBehaviour';
import {
  convertFamilyToProfiles,
  validateChildName,
  validateChildAvatar,
  validateChildColor,
  createChildProfile,
  handleProfileClick as handleProfileClickBehaviour,
  handlePinSubmission
} from './ProfileSelectionScreenBehaviour';

interface ProfileSelectionScreenProps {
  onProfileSelect: (profileId: string) => void;
  onParentMode: () => void;
}

const ProfileSelectionScreen: React.FC<ProfileSelectionScreenProps> = ({
  onProfileSelect,
  onParentMode,
}) => {
  const { authBehaviour, familyBehaviour } = useBehaviours();
  const [user, setUser] = useState<ChildProfile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from behaviors
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const userData = await authBehaviour.getCurrentUser();
        const familyData = await familyBehaviour.loadFamily();
        
        setUser(userData);
        setFamily(familyData);
        
        if (familyData) {
          // Convert family children to profile array using behaviour function
          const profileArray = convertFamilyToProfiles(familyData);
          setProfiles(profileArray);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [authBehaviour, familyBehaviour]);
  const [showPinPad, setShowPinPad] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAvatar, setNewChildAvatar] = useState(CHILD_AVATARS[0]);
  const [newChildColor, setNewChildColor] = useState(CHILD_THEME_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProfileClick = useCallback(async (profileId: string) => {
    handleProfileClickBehaviour(profileId, onProfileSelect);
  }, [onProfileSelect]);

  const handleParentModeClick = useCallback(() => {
    setShowPinPad(true);
  }, []);

  const handlePinSubmit = useCallback(async (pin: string) => {
    const success = await handlePinSubmission(pin, onParentMode);
    if (success) {
      setShowPinPad(false);
    }
    return success;
  }, [onParentMode]);

  const handleCreateChild = useCallback(async () => {
    // Validate name using behaviour function
    const nameValidation = validateChildName(newChildName);
    if (!nameValidation.isValid) {
      setError(nameValidation.error || 'Please enter a name');
      return;
    }

    // Validate avatar and color using behaviour functions
    const avatarValidation = validateChildAvatar(newChildAvatar, CHILD_AVATARS);
    const colorValidation = validateChildColor(newChildColor, CHILD_THEME_COLORS);
    
    if (!avatarValidation.isValid || !colorValidation.isValid) {
      setError(avatarValidation.error || colorValidation.error || 'Invalid profile settings');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create child profile using behaviour function
      const result = createChildProfile(
        newChildName,
        newChildAvatar,
        newChildColor,
        CHILD_AVATARS,
        CHILD_THEME_COLORS
      );

      if (result.errors.length > 0) {
        setError(result.errors.join(', '));
        return;
      }

      // In a real implementation, this would save to the backend
      setShowAddChild(false);
      setNewChildName('');
      setNewChildAvatar(CHILD_AVATARS[0]);
      setNewChildColor(CHILD_THEME_COLORS[0]);
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Failed to create profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [newChildName, newChildAvatar, newChildColor, user]);

  const handleCancel = useCallback(() => {
    setShowPinPad(false);
  }, []);

  if (isLoading) {
    return (
      <div className="profile-selection-loading">
        <div className="loading-spinner" />
        <p>Loading your family...</p>
      </div>
    );
  }

  return (
    <div className="profile-selection-screen">
      {/* Header */}
      <div className="profile-selection-header">
        <div className="family-badge">
          <Trophy size={20} />
        </div>
        <h1>{family?.name || 'Our Family'}</h1>
        <p>Who is using the app?</p>
      </div>

      {/* Profile Grid */}
      <div className="profile-grid">
        {/* Existing child profiles */}
        {profiles.map((profile) => (
          <button
            key={profile.id}
            className="profile-card"
            onClick={() => handleProfileClick(profile.id)}
            style={{ '--profile-color': profile.themeColor } as React.CSSProperties}
          >
            <div className="profile-avatar">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="profile-avatar-img" />
              ) : (
                <span className="avatar-emoji">{profile.avatar}</span>
              )}
              <div className="avatar-ring" />
            </div>
            <div className="profile-name">{profile.name}</div>
            <div className="profile-stats">
              <span className="stat-level">Level {profile.stats.level}</span>
              <span className="stat-ep">{profile.stats.totalEP} EP</span>
            </div>
            <ChevronRight className="profile-arrow" size={20} />
          </button>
        ))}

        {/* Add Child Button (only if less than 4 children) */}
        {profiles.length < 4 && (
          <button className="profile-card add-child" onClick={() => setShowAddChild(true)}>
            <div className="add-icon">
              <Plus size={32} />
            </div>
            <span>Add Child</span>
          </button>
        )}
      </div>

      {/* Parent Mode Button */}
      <div className="parent-mode-section">
        <button className="parent-mode-btn" onClick={handleParentModeClick}>
          <div className="parent-icon">
            <Lock size={24} />
          </div>
          <div className="parent-text">
            <span className="parent-label">Parent Mode</span>
            <span className="parent-desc">Manage settings & controls</span>
          </div>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* PIN Pad Modal */}
      {showPinPad && (
        <PinPad
          onSubmit={handlePinSubmit}
          onCancel={handleCancel}
          title="Parent Access"
          subtitle="Enter your 4-digit PIN"
          errorMessage="Incorrect PIN. Please try again."
          showBiometric={true}
        />
      )}

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="add-child-modal-overlay" onClick={() => setShowAddChild(false)}>
          <div className="add-child-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-child-header">
              <h2>Add Child Profile</h2>
              <button className="close-btn" onClick={() => setShowAddChild(false)}>
                ×
              </button>
            </div>

            <div className="add-child-form">
              {/* Name input */}
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="Enter child's name"
                  maxLength={20}
                />
              </div>

              {/* Avatar selection */}
              <div className="form-group">
                <label>Choose Avatar</label>
                <div className="avatar-grid">
                  {/* Gmail Photo Option */}
                  {user?.photoURL && (
                    <button
                      className={`avatar-option gmail-avatar ${newChildAvatar === GMAIL_AVATAR ? 'selected' : ''}`}
                      onClick={() => setNewChildAvatar(GMAIL_AVATAR)}
                      title="Use Gmail photo"
                    >
                      <img 
                        src={user.photoURL} 
                        alt="Gmail" 
                        className="gmail-avatar-img"
                      />
                    </button>
                  )}
                  {/* Emoji Avatars */}
                  {CHILD_AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      className={`avatar-option ${newChildAvatar === avatar ? 'selected' : ''}`}
                      onClick={() => setNewChildAvatar(avatar)}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
                {user?.photoURL && (
                  <span className="input-hint">Click the Gmail photo to use your Google profile picture</span>
                )}
              </div>

              {/* Theme color selection */}
              <div className="form-group">
                <label>Theme Color</label>
                <div className="color-grid">
                  {CHILD_THEME_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${newChildColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewChildColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="preview-section">
                <label>Preview</label>
                <div
                  className="preview-card"
                  style={{ borderColor: newChildColor }}
                >
                  <div className="preview-avatar">
                    {isGmailAvatar(newChildAvatar) && user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="preview-gmail-avatar" />
                    ) : (
                      newChildAvatar
                    )}
                  </div>
                  <div className="preview-name">{newChildName || 'Child Name'}</div>
                </div>
              </div>

              {/* Error message */}
              {error && <div className="error-message">{error}</div>}

              {/* Actions */}
              <div className="form-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowAddChild(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  className="create-btn"
                  onClick={handleCreateChild}
                  disabled={isCreating || !newChildName.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .profile-selection-screen {
          min-height: 100vh;
          background: linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%);
          display: flex;
          flex-direction: column;
          padding: 24px;
        }

        .profile-selection-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: #6B7280;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #E5E7EB;
          border-top-color: #3B82F6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .profile-selection-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .family-badge {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 16px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .profile-selection-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px;
        }

        .profile-selection-header p {
          font-size: 16px;
          color: #6B7280;
          margin: 0;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          flex: 1;
          align-content: start;
        }

        .profile-card {
          background: white;
          border-radius: 20px;
          padding: 24px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .profile-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .profile-card:active {
          transform: translateY(0);
        }

        .profile-card:not(.add-child) {
          border-color: var(--profile-color, #3B82F6);
        }

        .profile-avatar {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 12px;
        }

        .avatar-emoji {
          font-size: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: #F3F4F6;
          border-radius: 50%;
        }

        .profile-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .avatar-ring {
          position: absolute;
          inset: -4px;
          border: 3px solid var(--profile-color, #3B82F6);
          border-radius: 50%;
          opacity: 0.3;
        }

        .profile-name {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .profile-stats {
          display: flex;
          justify-content: center;
          gap: 12px;
          font-size: 12px;
          color: #6B7280;
        }

        .stat-level {
          background: #F3F4F6;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .stat-ep {
          background: #FEF3C7;
          color: #D97706;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 500;
        }

        .profile-arrow {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
        }

        .profile-card.add-child {
          border: 2px dashed #D1D5DB;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #6B7280;
          font-size: 14px;
          font-weight: 500;
        }

        .profile-card.add-child:hover {
          border-color: #3B82F6;
          color: #3B82F6;
          background: #EFF6FF;
        }

        .add-icon {
          width: 80px;
          height: 80px;
          background: #F3F4F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
          transition: all 0.2s;
        }

        .profile-card.add-child:hover .add-icon {
          background: #DBEAFE;
          color: #3B82F6;
        }

        .parent-mode-section {
          margin-top: auto;
          padding-top: 24px;
        }

        .parent-mode-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .parent-mode-btn:hover {
          background: #F9FAFB;
          border-color: #D1D5DB;
        }

        .parent-icon {
          width: 48px;
          height: 48px;
          background: #F3F4F6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6B7280;
        }

        .parent-text {
          flex: 1;
          text-align: left;
        }

        .parent-label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .parent-desc {
          display: block;
          font-size: 13px;
          color: #6B7280;
          margin-top: 2px;
        }

        /* Add Child Modal */
        .add-child-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }

        .add-child-modal {
          background: white;
          border-radius: 24px;
          width: 100%;
          max-width: 420px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .add-child-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #E5E7EB;
        }

        .add-child-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: #F3F4F6;
          border-radius: 50%;
          font-size: 24px;
          color: #6B7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #E5E7EB;
          color: #374151;
        }

        .add-child-form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
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
          padding: 12px 16px;
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

        .preview-gmail-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
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
          margin-bottom: 20px;
        }

        .preview-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #F9FAFB;
          border-radius: 16px;
          border: 2px solid;
        }

        .preview-avatar {
          font-size: 36px;
          width: 56px;
          height: 56px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .preview-name {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .error-message {
          padding: 12px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          color: #DC2626;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .cancel-btn,
        .create-btn {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: #F3F4F6;
          border: none;
          color: #374151;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #E5E7EB;
        }

        .create-btn {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          border: none;
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .create-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .create-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }

          .profile-selection-screen {
            padding: 16px;
          }

          .avatar-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSelectionScreen;
