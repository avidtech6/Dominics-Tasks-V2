import { Task, TaskStatus } from '../data/types';

/**
 * TaskCard Behaviour Module
 * Contains all non-UI logic extracted from TaskCard component
 */

/**
 * Determine card styling based on task status
 * @param status - Task status
 * @returns CSS styling object
 */
export const getStatusStyles = (status: TaskStatus): {
  border: string;
  background: string;
  opacity: number;
} => {
  switch (status) {
    case 'pending_approval':
      return {
        border: '2px solid #F59E0B',
        background: 'linear-gradient(to right, #FEF3C7 0%, white 20%)',
        opacity: 0.9,
      };
    case 'done':
      return {
        border: '2px solid #10B981',
        background: 'linear-gradient(to right, #D1FAE5 0%, white 20%)',
        opacity: 0.85,
      };
    default:
      return {
        border: '2px solid transparent',
        background: 'white',
        opacity: 1,
      };
  }
};

/**
 * Determine if checkbox should be disabled based on task status
 * @param status - Task status
 * @returns Boolean indicating if checkbox should be disabled
 */
export const isCheckboxDisabled = (status: TaskStatus): boolean => {
  return status === 'done' || status === 'pending_approval';
};

/**
 * Handle event propagation and callback execution
 * @param callback - Callback function to execute
 * @param setShowMenu - Optional function to close menu
 * @returns Event handler function
 */
export const createEventHandler = (
  callback: () => void,
  setShowMenu?: (show: boolean) => void
) => {
  return (e: React.MouseEvent) => {
    e.stopPropagation();
    callback?.();
    setShowMenu?.(false);
  };
};

/**
 * Check if task should show status badge
 * @param status - Task status
 * @returns Boolean indicating if status badge should be shown
 */
export const shouldShowStatusBadge = (status: TaskStatus): boolean => {
  return status === 'pending_approval';
};

/**
 * Get status badge text based on task status
 * @param status - Task status
 * @returns Status badge text
 */
export const getStatusBadgeText = (status: TaskStatus): string => {
  switch (status) {
    case 'pending_approval':
      return 'Waiting for Parent';
    case 'done':
      return 'Completed';
    default:
      return '';
  }
};

/**
 * Get status badge color based on task status
 * @param status - Task status
 * @returns CSS color classes
 */
export const getStatusBadgeColor = (status: TaskStatus): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} => {
  switch (status) {
    case 'pending_approval':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: 'text-amber-600'
      };
    case 'done':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: 'text-gray-600'
      };
  }
};

/**
 * Check if task has comments
 * @param task - Task object
 * @returns Boolean indicating if task has comments
 */
export const hasComments = (task: Task): boolean => {
  return !!(task.commentCount && task.commentCount > 0);
};

/**
 * Get comment count display text
 * @param task - Task object
 * @returns Formatted comment count text
 */
export const getCommentCountText = (task: Task): string => {
  const count = task.commentCount || 0;
  return count === 1 ? '1 comment' : `${count} comments`;
};