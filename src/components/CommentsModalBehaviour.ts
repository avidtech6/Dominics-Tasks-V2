import { format } from 'date-fns';

/**
 * Comments Modal Behaviour Module
 * Contains all non-UI logic extracted from CommentsModal component
 */

/**
 * Format comment timestamp for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatCommentTime = (date: Date): string => {
  return format(date, 'MMM d, h:mm a');
};

/**
 * Validate comment before sending
 * @param comment - Comment text to validate
 * @returns Boolean indicating if comment is valid
 */
export const isValidComment = (comment: string): boolean => {
  return comment.trim().length > 0;
};

/**
 * Determine if loading state should be shown
 * @param loading - Loading state from props
 * @param comments - Comments array
 * @returns Boolean indicating if loading should be shown
 */
export const shouldShowLoading = (loading: boolean, comments: any[]): boolean => {
  return loading;
};

/**
 * Determine if empty state should be shown
 * @param loading - Loading state from props
 * @param comments - Comments array
 * @returns Boolean indicating if empty state should be shown
 */
export const shouldShowEmptyState = (loading: boolean, comments: any[]): boolean => {
  return !loading && comments.length === 0;
};

/**
 * Determine if comments list should be shown
 * @param loading - Loading state from props
 * @param comments - Comments array
 * @returns Boolean indicating if comments list should be shown
 */
export const shouldShowCommentsList = (loading: boolean, comments: any[]): boolean => {
  return !loading && comments.length > 0;
};