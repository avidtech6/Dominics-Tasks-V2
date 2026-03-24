// Utility functions for the application

import { Task, MirroredTask, TaskType, TaskStatus, TaskPriority } from './types';

/**
 * Get days until deadline
 */
export function getDaysUntilDeadline(deadlineDate: Date | undefined): number {
  if (!deadlineDate) {
    return Infinity;
  }
  
  const now = new Date();
  const deadline = new Date(deadlineDate);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// XP calculation utilities
export const XP_PER_TASK = 10;
export const XP_PER_LEVEL = 100;

export function getEPForNextLevel(currentEP: number): number {
  const currentLevel = Math.floor(currentEP / XP_PER_LEVEL);
  return (currentLevel + 1) * XP_PER_LEVEL;
}

export function getEPProgress(currentEP: number): number {
  const currentLevel = Math.floor(currentEP / XP_PER_LEVEL);
  const levelStart = currentLevel * XP_PER_LEVEL;
  const levelEnd = (currentLevel + 1) * XP_PER_LEVEL;
  
  return ((currentEP - levelStart) / (levelEnd - levelStart)) * 100;
}

export function getPointsForTask(task: Task): number {
  let points = XP_PER_TASK;
  
  // Bonus points for high priority
  if (task.priority === 'urgent') points += 5;
  else if (task.priority === 'high') points += 3;
  else if (task.priority === 'medium') points += 1;
  
  // Bonus points for completing on time
  if (task.dueDate && task.completedAt) {
    const dueDate = new Date(task.dueDate);
    const completedDate = new Date(task.completedAt);
    if (completedDate <= dueDate) {
      points += 5; // On-time bonus
    }
  }
  
  return points;
}

// Task type utilities
export function getTaskTypeColor(taskType: TaskType | undefined): string {
  if (!taskType) {
    return '#6B7280'; // gray
  }
  
  switch (taskType) {
    case TaskType.CHORE:
      return '#3B82F6'; // blue
    case TaskType.HOMEWORK:
      return '#8B5CF6'; // purple
    case TaskType.PERSONAL:
      return '#10B981'; // green
    case TaskType.FAMILY:
      return '#F59E0B'; // amber
    default:
      return '#6B7280'; // gray
  }
}

export function getTaskTypeConfig(taskType: TaskType | undefined): { icon: string; color: string; name: string; label: string } {
  if (!taskType) {
    return { icon: '📝', color: '#6B7280', name: 'Task', label: 'Task' };
  }
  
  switch (taskType) {
    case TaskType.CHORE:
      return { icon: '🧹', color: '#3B82F6', name: 'Chore', label: 'Chore' };
    case TaskType.HOMEWORK:
      return { icon: '📚', color: '#8B5CF6', name: 'Homework', label: 'Homework' };
    case TaskType.PERSONAL:
      return { icon: '🎯', color: '#10B981', name: 'Personal', label: 'Personal' };
    case TaskType.FAMILY:
      return { icon: '👨‍👩‍👧‍👦', color: '#F59E0B', name: 'Family', label: 'Family' };
    default:
      return { icon: '📝', color: '#6B7280', name: 'Task', label: 'Task' };
  }
}

export function getPriorityConfig(priority: TaskPriority): { color: string; name: string; label: string } {
  switch (priority) {
    case TaskPriority.LOW:
      return { color: '#10B981', name: 'Low', label: 'Low' };
    case TaskPriority.MEDIUM:
      return { color: '#F59E0B', name: 'Medium', label: 'Medium' };
    case TaskPriority.HIGH:
      return { color: '#EF4444', name: 'High', label: 'High' };
    case TaskPriority.URGENT:
      return { color: '#DC2626', name: 'Urgent', label: 'Urgent' };
    default:
      return { color: '#6B7280', name: 'Normal', label: 'Normal' };
  }
}

export function getDeadlineStatus(deadlineDate: Date | undefined, status: TaskStatus): string {
  if (status === TaskStatus.COMPLETED) {
    return 'Completed';
  }
  
  if (!deadlineDate) {
    return 'No deadline';
  }
  
  const now = new Date();
  const deadline = new Date(deadlineDate);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'Overdue';
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays <= 3) {
    return `Due in ${diffDays} days`;
  } else {
    return 'Upcoming';
  }
}

export function getTaskTypeIcon(taskType: TaskType): string {
  switch (taskType) {
    case TaskType.CHORE:
      return '🧹';
    case TaskType.HOMEWORK:
      return '📚';
    case TaskType.PERSONAL:
      return '👤';
    case TaskType.FAMILY:
      return '👨‍👩‍👧‍👦';
    default:
      return '📝';
  }
}

/**
 * Get mirrored tasks for today based on the original tasks
 */
export function getMirroredTasksForToday(tasks: Task[]): MirroredTask[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tasks
    .filter(task => {
      // Only mirror tasks that are not completed and have a due date
      if (task.status === TaskStatus.COMPLETED || !task.dueDate) {
        return false;
      }
      
      const taskDueDate = new Date(task.dueDate);
      taskDueDate.setHours(0, 0, 0, 0);
      
      // Only mirror tasks that are due today
      return taskDueDate.getTime() === today.getTime();
    })
    .map(task => ({
      id: `mirrored-${task.id}`,
      originalTaskId: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      type: task.type,
      section: task.section,
      assigneeId: task.assigneeId,
      assigneeName: task.assigneeName,
      creatorId: task.creatorId,
      creatorName: task.creatorName,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: task.tags,
      originalDueDate: task.dueDate,
      originalCompletedAt: task.completedAt,
    }));
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date and time for display
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > new Date().getTime();
}

/**
 * Check if a date is overdue
 */
export function isOverdue(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Get the display name for a task type
 */
export function getTaskTypeDisplayName(type: TaskType): string {
  switch (type) {
    case TaskType.CHORE:
      return 'Chore';
    case TaskType.HOMEWORK:
      return 'Homework';
    case TaskType.PERSONAL:
      return 'Personal';
    case TaskType.FAMILY:
      return 'Family';
    default:
      return type;
  }
}

/**
 * Get the display name for a task status
 */
export function getTaskStatusDisplayName(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.PENDING:
      return 'Pending';
    case TaskStatus.IN_PROGRESS:
      return 'In Progress';
    case TaskStatus.COMPLETED:
      return 'Completed';
    case TaskStatus.CANCELLED:
      return 'Cancelled';
    default:
      return status;
  }
}

/**
 * Get the display name for a task priority
 */
export function getTaskPriorityDisplayName(priority: string): string {
  switch (priority) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'urgent':
      return 'Urgent';
    default:
      return priority;
  }
}

/**
 * Calculate the percentage of completed tasks
 */
export function calculateCompletionPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
  return Math.round((completedTasks.length / tasks.length) * 100);
}

/**
 * Group tasks by section
 */
export function groupTasksBySection(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((groups, task) => {
    if (!groups[task.section]) {
      groups[task.section] = [];
    }
    groups[task.section].push(task);
    return groups;
  }, {} as Record<string, Task[]>);
}

/**
 * Sort tasks by due date (earliest first)
 */
export function sortTasksByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

/**
 * Filter tasks by status
 */
export function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter(task => task.status === status);
}

/**
 * Filter tasks by assignee
 */
export function filterTasksByAssignee(tasks: Task[], assigneeId?: string): Task[] {
  if (!assigneeId) return tasks;
  return tasks.filter(task => task.assigneeId === assigneeId);
}

/**
 * Filter tasks by type
 */
export function filterTasksByType(tasks: Task[], type: TaskType): Task[] {
  return tasks.filter(task => task.type === type);
}

/**
 * Check if a task needs catch up (for past due dates)
 */
export function needsCatchUp(deadlineDate: Date | undefined): boolean {
  if (!deadlineDate) return false;
  return new Date(deadlineDate).getTime() < new Date().getTime();
}

/**
 * Check if a date is from yesterday
 */
export function isFromYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
}

/**
 * Filter tasks by priority
 */
export function filterTasksByPriority(tasks: Task[], priority: string): Task[] {
  return tasks.filter(task => task.priority === priority);
}

/**
 * Filter tasks by tags
 */
export function filterTasksByTags(tasks: Task[], tags: string[]): Task[] {
  if (tags.length === 0) return tasks;
  return tasks.filter(task => 
    task.tags.some(tag => tags.includes(tag))
  );
}

/**
 * Search tasks by title or description
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  if (!query) return tasks;
  
  const lowercaseQuery = query.toLowerCase();
  return tasks.filter(task => 
    task.title.toLowerCase().includes(lowercaseQuery) ||
    task.description.toLowerCase().includes(lowercaseQuery)
  );
}