import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import {
  LayoutDashboard,
  Calendar,
  MessageCircle,
  FolderOpen,
  BarChart3,
  Menu,
  X,
  LogOut,
  Trophy,
  User,
  BookOpen,
  AlertTriangle,
  Settings,
  ArrowRight,
  Users,
  MessageSquare,
  History,
} from 'lucide-react';
import {
  isParentUser,
  convertFamilyToProfiles,
  needsFamilySetup,
  getDefaultProfile,
  verifyParentPin,
  isValidPin,
  getCurrentPath,
  isPathActive,
  validatePinInput,
  formatPinDisplay,
  handlePinSubmission
} from './LayoutBehaviour';
import ParentPinModal from './ParentPinModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { authBehaviour } = useBehaviours();
  const { familyBehaviour } = useBehaviours();
  const navigate = useNavigate();
  
  // State variables to replace mock context functionality
  const [user, setUser] = useState<unknown>(null);
  const [isParent, setIsParent] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<unknown>(null);
  const [isParentMode, setIsParentMode] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [profiles, setProfiles] = useState<unknown[]>([]);
  const [family, setFamily] = useState<unknown>(null);
  const [pinInput, setPinInput] = useState('');
  
  // Initialize behavior data
  useEffect(() => {
    if (!authBehaviour || !familyBehaviour) return;
    // Load user from auth behavior
    const loadUser = async () => {
      const userData = await authBehaviour.getCurrentUser();
      setUser(userData);
      setIsParent(isParentUser(userData));
    };
    
    // Load family data from family behavior
    const loadFamily = async () => {
      const familyData = await familyBehaviour.loadFamily();
      setFamily(familyData);
      setNeedsSetup(needsFamilySetup(familyData));
      
      if (familyData) {
        // Convert family children to profile array using behaviour function
        const profileArray = convertFamilyToProfiles(familyData);
        setProfiles(profileArray);
        
        // Set current profile (first one by default) using behaviour function
        const defaultProfile = getDefaultProfile(profileArray);
        if (defaultProfile) {
          setCurrentProfile(defaultProfile);
        }
      }
    };
    
    loadUser();
    loadFamily();
  }, [authBehaviour, familyBehaviour]);
  
  // Behavior-driven functions
  const signOut = async () => {
    await authBehaviour.signOut();
    setUser(null);
    setIsParent(false);
    setCurrentProfile(null);
    setIsParentMode(false);
    setNeedsSetup(true);
    setProfiles([]);
    setFamily(null);
  };
  
  const selectProfile = async (profileId: string) => {
    setCurrentProfile((profiles as any[]).find(p => p.uid === profileId) || null);
    setIsParentMode(false);
  };
  
  const toggleParentMode = () => {
    setIsParentMode(!isParentMode);
  };
  
  const handlePinSubmit = async (pin: string) => {
    if (!authBehaviour || !familyBehaviour) return false;
    
    const isValid = await verifyParentPin(pin, family, (user as any).uid);
    if (isValid) {
      setIsParentMode(true);
      return true;
    }
    return false;
  };
  
  const handlePinCancel = () => {
    setIsParentMode(false);
  };
  
  const handleCreateFamily = async () => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.createFamily();
      // Refresh family data after creation
      const familyData = await familyBehaviour.loadFamily();
      setFamily(familyData);
      setNeedsSetup(needsFamilySetup(familyData));
      
      if (familyData) {
        const profileArray = convertFamilyToProfiles(familyData);
        setProfiles(profileArray);
        const defaultProfile = getDefaultProfile(profileArray);
        if (defaultProfile) {
          setCurrentProfile(defaultProfile);
        }
      }
    } catch (error) {
      console.error('Failed to create family:', error);
    }
  };
  
  const handleJoinFamily = async (familyId: string, pin: string) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.joinFamily(familyId, pin);
      // Refresh family data after joining
      const familyData = await familyBehaviour.loadFamily();
      setFamily(familyData);
      setNeedsSetup(needsFamilySetup(familyData));
      
      if (familyData) {
        const profileArray = convertFamilyToProfiles(familyData);
        setProfiles(profileArray);
        const defaultProfile = getDefaultProfile(profileArray);
        if (defaultProfile) {
          setCurrentProfile(defaultProfile);
        }
      }
    } catch (error) {
      console.error('Failed to join family:', error);
    }
  };
  
  const handleCreateProfile = async (name: string, avatar: string, color: string) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.createProfile(name, avatar, color);
      // Refresh family data after profile creation
      const familyData = await familyBehaviour.loadFamily();
      setFamily(familyData);
      setNeedsSetup(needsFamilySetup(familyData));
      
      if (familyData) {
        const profileArray = convertFamilyToProfiles(familyData);
        setProfiles(profileArray);
        const defaultProfile = getDefaultProfile(profileArray);
        if (defaultProfile) {
          setCurrentProfile(defaultProfile);
        }
      }
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };
  
  const handleDeleteProfile = async (profileId: string) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.deleteProfile(profileId);
      // Refresh family data after profile deletion
      const familyData = await familyBehaviour.loadFamily();
      setFamily(familyData);
      setNeedsSetup(needsFamilySetup(familyData));
      
      if (familyData) {
        const profileArray = convertFamilyToProfiles(familyData);
        setProfiles(profileArray);
        const defaultProfile = getDefaultProfile(profileArray);
        if (defaultProfile) {
          setCurrentProfile(defaultProfile);
        } else {
          setCurrentProfile(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };
  
  const handleUpdateProfile = async (profileId: string, updates: any) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.updateProfile(profileId, updates);
      // Refresh family data after profile update
      const familyData = await familyBehaviour.loadFamily();
      setFamily(familyData);
      setNeedsSetup(needsFamilySetup(familyData));
      
      if (familyData) {
        const profileArray = convertFamilyToProfiles(familyData);
        setProfiles(profileArray);
        const defaultProfile = getDefaultProfile(profileArray);
        if (defaultProfile) {
          setCurrentProfile(defaultProfile);
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  const handleAddTask = async (task: any) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.addTask(task);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };
  
  const handleUpdateTask = async (taskId: string, updates: any) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.updateTask(taskId, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };
  
  const handleAddReward = async (reward: any) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.addReward(reward);
    } catch (error) {
      console.error('Failed to add reward:', error);
    }
  };
  
  const handleUpdateReward = async (rewardId: string, updates: any) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.updateReward(rewardId, updates);
    } catch (error) {
      console.error('Failed to update reward:', error);
    }
  };
  
  const handleDeleteReward = async (rewardId: string) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.deleteReward(rewardId);
    } catch (error) {
      console.error('Failed to delete reward:', error);
    }
  };
  
  const handleAddComment = async (taskId: string, comment: any) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.addComment(taskId, comment);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };
  
  const handleUpdateComment = async (commentId: string, updates: any) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.updateComment(commentId, updates);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.deleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };
  
  const handleAddAchievement = async (achievement: any) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.addAchievement(achievement);
    } catch (error) {
      console.error('Failed to add achievement:', error);
    }
  };
  
  const handleUpdateAchievement = async (achievementId: string, updates: any) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.updateAchievement(achievementId, updates);
    } catch (error) {
      console.error('Failed to update achievement:', error);
    }
  };
  
  const handleDeleteAchievement = async (achievementId: string) => {
    if (!authBehaviour || !familyBehaviour) return;
    
    try {
      await familyBehaviour.deleteAchievement(achievementId);
    } catch (error) {
      console.error('Failed to delete achievement:', error);
    }
  };
  
  // Navigation state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Navigation items based on user role and mode
  const navItems = [
    { to: '/tasks', icon: BookOpen, label: 'Tasks' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/resources', icon: FolderOpen, label: 'Resources' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/achievements', icon: Users, label: 'Achievements' },
  ];
  
  // Additional items for parent mode
  const parentNavItems = [
    { to: '/parent-chat', icon: MessageCircle, label: 'Parent Chat' },
    { to: '/admin', icon: LayoutDashboard, label: 'Parent Dashboard' },
    { to: '/task-comment/:taskId', icon: MessageSquare, label: 'Task Comments' },
  ];
  
  const allNavItems = isParentMode ? [...navItems, ...parentNavItems] : navItems;
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          {(user as any) && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-800">Dominic's Tasks</h1>
                    <p className="text-xs text-gray-500">Family Hub</p>
                  </div>
                </div>
                <button
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          )}

          {/* Gamification Stats - Show child profile stats when in child mode */}
          {(currentProfile as any) && !isParentMode && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-2xl overflow-hidden">
                  {(currentProfile as any).photoURL ? (
                    <img src={(currentProfile as any).photoURL} alt={(currentProfile as any).displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-2xl">
                      {(currentProfile as any).displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {(currentProfile as any).displayName} - Level {(currentProfile as any).level}
                  </p>
                  <div className="w-full bg-amber-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentProfile as any).experience || 0) % 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {allNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
          {/* Footer */}
          {(user as any) && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={signOut}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>
            
            {/* User Profile */}
            {(user as any) && (
              <div className="flex items-center space-x-4">
                {/* Parent Mode Toggle */}
                {isParent && (
                  <button
                    onClick={toggleParentMode}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isParentMode
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isParentMode ? 'Child Mode' : 'Parent Mode'}
                  </button>
                )}
                
                {/* Current Profile Display */}
                {(currentProfile as any) && (
                  <div className="flex items-center space-x-2">
                    {(currentProfile as any).photoURL ? (
                      <img
                        src={(currentProfile as any).photoURL}
                        alt={(currentProfile as any).displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
                        {(currentProfile as any).displayName.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {(currentProfile as any).displayName}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      
      {/* Pin Modal */}
      <ParentPinModal
        isParent={isParent}
        isParentMode={isParentMode}
        pinInput={pinInput}
        onPinInputChange={setPinInput}
        onPinSubmit={handlePinSubmit}
        onPinCancel={handlePinCancel}
        isValidPin={isValidPin}
      />
    </div>
  );
};

export default Layout;
