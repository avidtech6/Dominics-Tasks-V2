import { Achievement } from '../data/types';

/**
 * Achievement Badge Behaviour Module
 * Contains all non-UI logic extracted from AchievementBadge component
 */

/**
 * Format earned date for display
 * @param earnedDate - Date when achievement was earned
 * @returns Formatted date string
 */
export const formatEarnedDate = (earnedDate?: Date): string => {
  if (!earnedDate) return '';
  return earnedDate.toLocaleDateString();
};

/**
 * Determine achievement badge styling based on earned state
 * @param earned - Whether achievement is earned
 * @returns CSS class string for badge styling
 */
export const getAchievementBadgeClasses = (earned: boolean): string => {
  return earned
    ? 'bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 hover:scale-105'
    : 'bg-gray-100 border-2 border-gray-200 opacity-60';
};

/**
 * Determine achievement icon background styling
 * @param earned - Whether achievement is earned
 * @returns CSS class string for icon background
 */
export const getIconBackgroundClasses = (earned: boolean): string => {
  return earned ? 'bg-amber-200' : 'bg-gray-200';
};

/**
 * Determine achievement title styling
 * @param earned - Whether achievement is earned
 * @returns CSS class string for title styling
 */
export const getTitleClasses = (earned: boolean): string => {
  return earned ? 'text-gray-800' : 'text-gray-500';
};

/**
 * Determine if locked overlay should be shown
 * @param earned - Whether achievement is earned
 * @returns Boolean indicating if locked overlay should be shown
 */
export const shouldShowLockedOverlay = (earned: boolean): boolean => {
  return !earned;
};

/**
 * Get achievement icon to display
 * @param achievement - Achievement object
 * @param earned - Whether achievement is earned
 * @returns Icon string or lock emoji
 */
export const getAchievementIcon = (achievement: Achievement, earned: boolean): string => {
  return earned ? achievement.icon : '🔒';
};