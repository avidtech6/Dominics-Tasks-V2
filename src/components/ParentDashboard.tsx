import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import { APPROVAL_LEVELS } from '../data/types';
import {
  Users, Settings, Plus, Edit2, Trash2, CheckCircle, XCircle,
  Trophy, Clock, ChevronRight,
  Bell, Shield, Check, X, FileText, Image, Mail,
  ArrowLeftRight, Database, CheckCircle2, AlertTriangle, LayoutDashboard, RefreshCw
} from 'lucide-react';
import PinPad from './PinPad';
import {
  transformApprovalsForDisplay,
  calculateDashboardStats,
  validateChildName,
  validateFamilyName,
  confirmChildDeletion
} from './ParentDashboardBehaviour';

// ============================================
// PARENT DASHBOARD COMPONENT
// Modern design matching the main app's Tailwind CSS style
// ============================================

const ParentDashboard: React.FC = () => {
  const { authBehaviour, familyBehaviour, taskBehaviour } = useBehaviours();
  const [user, setUser] = useState<unknown>(null);
  const [family, setFamily] = useState<unknown>(null);
  const [profiles, setProfiles] = useState<unknown[]>([]);
  const [isParentMode, setIsParentMode] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await authBehaviour.getCurrentUser();
        setUser(currentUser);
        const currentFamily = await familyBehaviour.loadFamily();
        setFamily(currentFamily);
        const currentProfiles = await familyBehaviour.getProfiles();
        setProfiles(currentProfiles);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadData();
  }, [authBehaviour, familyBehaviour]);

  // Add null guard for useEffect dependencies
  if (!authBehaviour || !familyBehaviour) return null;

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'approvals' | 'tasks' | 'settings'>('overview');
  const [showPinPad, setShowPinPad] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChild, setEditingChild] = useState<string | null>(null);
  const [isRestoringTasks, setIsRestoringTasks] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<number | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // Child form state
  const [newChildName, setNewChildName] = useState('');
  const [newChildAvatar, setNewChildAvatar] = useState('🦁');
  const [newChildColor, setNewChildColor] = useState('#3B82F6');

  // Family name editing state
  const [isEditingFamilyName, setIsEditingFamilyName] = useState(false);
  const [editedFamilyName, setEditedFamilyName] = useState('');
  const [isSavingFamilyName, setIsSavingFamilyName] = useState(false);

  // Sync editedFamilyName when entering edit mode or family data changes
  useEffect(() => {
    if (!isEditingFamilyName && (family as any)?.settings?.familyName) {
      setEditedFamilyName((family as any).settings.familyName);
    }
  }, [(family as any)?.settings?.familyName, isEditingFamilyName]);

  // Handle approve task
  const handleApproveTask = async (approvalId: string) => {
    try {
      await taskBehaviour.approveTaskCompletion(approvalId);
    } catch (error) {
      console.error('Error approving task:', error);
    }
  };

  // Handle reject task
  const handleRejectTask = async (approvalId: string, reason?: string) => {
    try {
      await taskBehaviour.rejectTaskCompletion(approvalId, reason);
    } catch (error) {
      console.error('Error rejecting task:', error);
    }
  };

  // Handle restore deleted tasks
  const handleRestoreTasks = async () => {
    setShowRestoreConfirm(false);
    setIsRestoringTasks(true);
    setRestoreSuccess(null);
    
    try {
      const count = await taskBehaviour.restoreDeletedTasks();
      setRestoreSuccess(count);
      // Clear success message after 5 seconds
      setTimeout(() => {
        setRestoreSuccess(null);
      }, 5000);
    } catch (error) {
      console.error('Error restoring tasks:', error);
    } finally {
      setIsRestoringTasks(false);
    }
  };

  // Transform pending approvals for display
  const displayApprovals = useMemo(() => {
    return transformApprovalsForDisplay(taskBehaviour.getPendingApprovals(), profiles as any[]);
  }, [profiles, taskBehaviour]);

  // Handle add child
  const handleAddChild = async () => {
    if (!validateChildName(newChildName)) return;
    try {
      await familyBehaviour.createChildProfile(newChildName, newChildAvatar, newChildColor);
      setNewChildName('');
      setShowAddChild(false);
    } catch (error) {
      console.error('Error adding child:', error);
    }
  };

  // Handle delete child
  const handleDeleteChild = async (childId: string) => {
    if (confirmChildDeletion()) {
      try {
        await familyBehaviour.deleteChildProfile(childId);
      } catch (error) {
        console.error('Error deleting child:', error);
      }
    }
  };

  // Handle save family name
  const handleSaveFamilyName = async () => {
    const trimmedName = editedFamilyName.trim();
    if (!validateFamilyName(trimmedName)) {
      alert('Family name cannot be empty');
      return;
    }

    setIsSavingFamilyName(true);
    try {
      await familyBehaviour.updateParentSettings({ familyName: trimmedName });
      setIsEditingFamilyName(false);
    } catch (error) {
      console.error('Error saving family name:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSavingFamilyName(false);
    }
  };

  // Handle cancel family name editing
  const handleCancelFamilyNameEdit = () => {
    setEditedFamilyName((family as any)?.settings?.familyName || '');
    setIsEditingFamilyName(false);
  };

  // Calculate stats
  const { totalPointsEarned, totalTasksCompleted, averageStreak } = calculateDashboardStats(profiles as any[]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-500">Manage your family and review tasks</p>
        </div>
        <button
          onClick={() => authBehaviour.exitParentMode()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
        >
          <XCircle size={20} />
          Exit Parent Mode
        </button>
      </div>

      {/* Success Message for Restore */}
      {restoreSuccess !== null && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-600" size={24} />
          <div>
            <p className="font-medium text-green-800">Tasks Restored Successfully!</p>
            <p className="text-sm text-green-600">{restoreSuccess} task(s) have been restored to their original state.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-2xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <LayoutDashboard size={20} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('children')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'children'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <Users size={20} />
          Children
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'approvals'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <CheckCircle size={20} />
          Approvals
          {taskBehaviour.getPendingApprovals().length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {taskBehaviour.getPendingApprovals().length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'tasks'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <Database size={20} />
          Task Manager
          {taskBehaviour.getDeletedTasks().length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
              {taskBehaviour.getDeletedTasks().length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <Settings size={20} />
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Trophy className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalPointsEarned.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total EP Earned</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalTasksCompleted}</p>
                    <p className="text-sm text-gray-500">Tasks Completed</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{averageStreak}</p>
                    <p className="text-sm text-gray-500">Avg Streak Days</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
                    <p className="text-sm text-gray-500">Active Profiles</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Children Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Children Overview</h2>
                <button
                  onClick={() => setShowAddChild(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <Plus size={18} />
                  Add Child
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {profiles.map((profile) => (
                  <div key={(profile as any).id} className="p-4 sm:p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                      {(profile as any).photoUrl ? (
                        <img src={(profile as any).photoUrl} alt={(profile as any).name} className="w-full h-full object-cover" />
                      ) : (
                        (profile as any).avatar
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{(profile as any).name}</h3>
                      <p className="text-sm text-gray-500">Level {(profile as any).stats.level} • {(profile as any).stats.currentStreak} day streak</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{(profile as any).stats.totalEP.toLocaleString()}</p>
                        <p className="text-gray-500">EP</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{(profile as any).stats.tasksCompleted}</p>
                        <p className="text-gray-500">Tasks</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingChild((profile as any).id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                ))}
                {profiles.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h3>
                    <p className="text-gray-500 mb-4">Add your first child to start tracking their tasks and progress.</p>
                    <button
                      onClick={() => setShowAddChild(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={18} />
                      Add Your First Child
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Approvals Preview */}
            {taskBehaviour.getPendingApprovals().length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
                  <button
                    onClick={() => setActiveTab('approvals')}
                    className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700"
                  >
                    View All
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {displayApprovals.slice(0, 3).map((approval) => (
                    <div key={approval.id} className="p-4 sm:p-6 flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: `${approval.childThemeColor}20` }}
                      >
                        {approval.childAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{approval.childName}</p>
                        <p className="text-sm text-gray-500 truncate">{approval.taskTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+{approval.taskPoints} EP</p>
                        <p className="text-xs text-gray-500">{approval.timeAgo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Children Tab */}
        {activeTab === 'children' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Manage Children</h2>
              <button
                onClick={() => setShowAddChild(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <Plus size={18} />
                Add Child
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <div key={(profile as any).id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div
                    className="p-6 text-white"
                    style={{ background: (profile as any).themeColor }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl overflow-hidden">
                        {(profile as any).photoUrl ? (
                          <img src={(profile as any).photoUrl} alt={(profile as any).name} className="w-full h-full object-cover" />
                        ) : (
                          (profile as any).avatar
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{(profile as any).name}</h3>
                        <p className="text-white/80">Level {(profile as any).stats.level}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Total EP</span>
                      <span className="font-semibold text-gray-900">{(profile as any).stats.totalEP.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Tasks Completed</span>
                      <span className="font-semibold text-gray-900">{(profile as any).stats.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Current Streak</span>
                      <span className="font-semibold text-gray-900">{(profile as any).stats.currentStreak} days</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Approval Level</span>
                      <span className="font-semibold text-gray-900">
                        {(APPROVAL_LEVELS as any)[(profile as any).settings.defaultApprovalLevel]?.label || `Level ${(profile as any).settings.defaultApprovalLevel}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => setEditingChild((profile as any).id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-medium hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteChild((profile as any).id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {profiles.length === 0 && (
                <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No children yet</h3>
                  <p className="text-gray-500 mb-4">Add children to start managing their tasks and progress.</p>
                  <button
                    onClick={() => setShowAddChild(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                    Add Child
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Task Approvals</h2>
              <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                {displayApprovals.length} pending
              </span>
            </div>

            <div className="space-y-4">
              {displayApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div
                    className="p-4 border-b flex items-center justify-between"
                    style={{ background: `${approval.childThemeColor}10`, borderBottomColor: `${approval.childThemeColor}30` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: approval.childThemeColor }}
                      >
                        {approval.childAvatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{approval.childName}</p>
                        <p className="text-sm text-gray-500">{approval.timeAgo}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{approval.taskTitle}</h3>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        +{approval.taskPoints} EP
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        {(APPROVAL_LEVELS as any)[(approval as any).level]?.label || `Level ${(approval as any).level}`}
                      </span>
                      {(approval as any).evidenceUrl && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {(approval as any).evidenceType === 'image' ? <Image size={14} /> : <FileText size={14} />}
                          Evidence Provided
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleApproveTask(approval.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                      >
                        <Check size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection (optional):');
                          handleRejectTask(approval.id, reason || undefined);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors"
                      >
                        <X size={18} />
                        Reject
                      </button>
                      {(approval as any).evidenceUrl && (
                        <a
                          href={(approval as any).evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                          <FileText size={18} />
                          View Evidence
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {displayApprovals.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-500">No pending approvals at the moment.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Task Manager Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Restore Deleted Tasks Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <ArrowLeftRight className="text-amber-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Restore Deleted Tasks</h2>
                      <p className="text-sm text-gray-500">
                        Restore tasks that were accidentally deleted or need to be reinstated
                      </p>
                    </div>
                  </div>
                  {taskBehaviour.getDeletedTasks().length > 0 && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      {taskBehaviour.getDeletedTasks().length} deleted task{taskBehaviour.getDeletedTasks().length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                {taskBehaviour.getDeletedTasks().length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="font-medium text-amber-800">Ready to restore {taskBehaviour.getDeletedTasks().length} task(s)</p>
                          <p className="text-sm text-amber-700 mt-1">
                            This will reinstate all deleted tasks back to their original state with their history preserved.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowRestoreConfirm(true)}
                        disabled={isRestoringTasks}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRestoringTasks ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Restoring...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={18} />
                            Restore All Tasks
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No deleted tasks</h3>
                    <p className="text-gray-500">There are no tasks to restore at this time.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Security Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Shield className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Parent PIN</p>
                      <p className="text-sm text-gray-500">Protect parent mode with a 4-digit PIN</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPinPad(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    {(family as any)?.settings.hasPinSetup ? 'Change PIN' : 'Set PIN'}
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Bell className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-500">Get notified about pending approvals</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(family as any)?.settings.notificationsEnabled}
                      onChange={(e) => familyBehaviour.updateParentSettings({ notificationsEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Mail className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive daily summary emails</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(family as any)?.settings.emailNotificationsEnabled}
                      onChange={(e) => familyBehaviour.updateParentSettings({ emailNotificationsEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Family Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Family</h2>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Name</label>
                {isEditingFamilyName ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedFamilyName}
                      onChange={(e) => setEditedFamilyName(e.target.value)}
                      placeholder="Enter your family name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveFamilyName}
                        disabled={isSavingFamilyName || !editedFamilyName.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingFamilyName ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelFamilyNameEdit}
                        disabled={isSavingFamilyName}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                      {(family as any)?.settings.familyName || 'No family name set'}
                    </div>
                    <button
                      onClick={() => {
                        setEditedFamilyName((family as any)?.settings.familyName || '');
                        setIsEditingFamilyName(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Edit2 size={18} />
                      Edit Family Name
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">Display name for your family</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Child Profile</h2>
              <button
                onClick={() => setShowAddChild(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="Enter child's name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {['🦁', '🐯', '🐻', '🐨', '🐼', '🐸', '🦊', '🐰', '🦄', '🐳', '🦋', '🐞'].map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setNewChildAvatar(avatar)}
                      className={`w-12 h-12 text-2xl rounded-xl transition-all ${
                        newChildAvatar === avatar
                          ? 'bg-blue-100 ring-2 ring-blue-500'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme Color</label>
                <div className="flex flex-wrap gap-3">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewChildColor(color)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        newChildColor === color ? 'ring-4 ring-offset-2 ring-gray-300' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowAddChild(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChild}
                disabled={!newChildName.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Child
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Setup Modal */}
      {showPinPad && (
        <PinPad
          onSubmit={async (pin) => {
            await authBehaviour.setupParentPin(pin);
            setShowPinPad(false);
            return true;
          }}
          onCancel={() => setShowPinPad(false)}
          title="Set Parent PIN"
          subtitle="Create a 4-digit PIN to protect parent mode"
          showBiometric={false}
        />
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <RefreshCw className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Restore Deleted Tasks</h3>
                <p className="text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to restore all {taskBehaviour.getDeletedTasks().length} deleted task(s)?
              They will be reinstated with their original state and history preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreTasks}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Restore All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
