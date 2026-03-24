import { TaskType, TaskSection } from './taskConstants';

/**
 * TaskModal Behaviour Module
 * Contains all non-UI logic extracted from TaskModal component
 */

/**
 * Toggle tag selection in an array of selected tags
 * @param tag - The tag to toggle
 * @param selectedTags - Current array of selected tags
 * @returns New array with tag toggled
 */
export const toggleTagSelection = (tag: string, selectedTags: string[]): string[] => {
  return selectedTags.includes(tag)
    ? selectedTags.filter(t => t !== tag)
    : [...selectedTags, tag];
};

/**
 * Validate task form data
 * @param title - Task title
 * @param taskType - Task type
 * @param priority - Task priority
 * @param section - Task section
 * @returns Validation result with errors
 */
export const validateTaskForm = (
  title: string,
  taskType: TaskType,
  priority: string,
  section: TaskSection
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }

  if (!taskType) {
    errors.push('Task type is required');
  }

  if (!priority) {
    errors.push('Priority is required');
  }

  if (!section) {
    errors.push('Section is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format date for display
 * @param date - Date string to format
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateForDisplay = (date: string): string => {
  if (!date) return '';
  try {
    // This would use date-fns in the actual implementation
    return new Date(date).toLocaleDateString();
  } catch {
    return '';
  }
};

/**
 * Calculate default points based on task type
 * @param taskType - Task type
 * @returns Default points value
 */
export const getDefaultPointsForTaskType = (taskType: TaskType): string => {
  const pointsMap: Record<TaskType, string> = {
    regular: '50',
    assignment: '100',
    exam: '200',
    project: '300',
    personal: '25'
  };
  return pointsMap[taskType] || '50';
};

/**
 * Check if task has required fields filled
 * @param task - Partial task object
 * @returns Boolean indicating if required fields are filled
 */
export const hasRequiredFields = (task: {
  title?: string;
  taskType?: TaskType;
  priority?: string;
  section?: TaskSection;
}): boolean => {
  return !!(
    task.title?.trim() &&
    task.taskType &&
    task.priority &&
    task.section
  );
};