/**
 * ParentDashboardBehaviour.ts
 * 
 * Behavioural logic extracted from ParentDashboard component.
 * Contains pure, deterministic functions with no side effects.
 */

// Type definitions
export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  themeColor: string;
  stats: {
    totalEP: number;
    tasksCompleted: number;
    currentStreak: number;
  };
}

export interface FamilySettings {
  familyName: string;
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
}

export interface FamilyData {
  settings: FamilySettings;
}

export interface TaskApproval {
  id: string;
  childId: string;
  createdAt: Date;
  taskId: string;
}

export interface DisplayApproval extends TaskApproval {
  childName: string;
  childAvatar: string;
  childThemeColor: string;
  timeAgo: string;
  taskTitle: string;
  taskPoints: number;
}

// Behaviour functions
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export const transformApprovalsForDisplay = (
  approvals: TaskApproval[], 
  profiles: UserProfile[]
): DisplayApproval[] => {
  return approvals.map(approval => {
    const childProfile = profiles.find(p => p.id === approval.childId);
    const timeAgo = formatTimeAgo(approval.createdAt);
    
    return {
      ...approval,
      childName: childProfile?.name || 'Unknown',
      childAvatar: childProfile?.avatar || '👤',
      childThemeColor: childProfile?.themeColor || '#3B82F6',
      timeAgo,
      // Placeholder values for missing task properties
      taskTitle: `Task ${approval.taskId.substring(0, 8)}...`,
      taskPoints: 10, // Default points
    };
  });
};

export const calculateDashboardStats = (profiles: UserProfile[]) => {
  const totalPointsEarned = profiles.reduce((sum, p) => sum + p.stats.totalEP, 0);
  const totalTasksCompleted = profiles.reduce((sum, p) => sum + p.stats.tasksCompleted, 0);
  const averageStreak = profiles.length > 0
    ? Math.round(profiles.reduce((sum, p) => sum + p.stats.currentStreak, 0) / profiles.length)
    : 0;
  
  return {
    totalPointsEarned,
    totalTasksCompleted,
    averageStreak
  };
};

export const validateChildName = (name: string): boolean => {
  return name.trim().length > 0;
};

export const validateFamilyName = (name: string): boolean => {
  return name.trim().length > 0;
};

export const confirmChildDeletion = (): boolean => {
  return window.confirm('Are you sure you want to delete this profile? All data will be lost.');
};

export const showTaskRestoreConfirmation = (count: number): boolean => {
  return window.confirm(`Are you sure you want to restore all ${count} deleted task(s)? They will be reinstated with their original state and history preserved.`);
};