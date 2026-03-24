/**
 * Achievement Badge Component
 * Displays individual achievements with earned/locked states
 */

import React from 'react';
import { Achievement } from '../data/types';
import {
  formatEarnedDate,
  getAchievementBadgeClasses,
  getIconBackgroundClasses,
  getTitleClasses,
  shouldShowLockedOverlay,
  getAchievementIcon
} from './AchievementBadgeBehaviour';

interface AchievementBadgeProps {
  achievement: Achievement;
  earned: boolean;
  earnedDate?: Date;
  onClick: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  earned, 
  earnedDate,
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-2xl transition-all ${getAchievementBadgeClasses(earned)}`}
    >
      {/* Icon Background */}
      <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-3xl mb-2 ${getIconBackgroundClasses(earned)}`}>
        {getAchievementIcon(achievement, earned)}
      </div>

      {/* Title */}
      <h3 className={`text-sm font-bold ${getTitleClasses(earned)}`}>
        {achievement.title}
      </h3>

      {/* EP Reward */}
      <p className="text-xs text-amber-600 mt-1">
        +{achievement.epReward} EP
      </p>

      {/* Earned Date */}
      {earned && earnedDate && (
        <p className="text-[10px] text-gray-500 mt-1">
          {formatEarnedDate(earnedDate)}
        </p>
      )}

      {/* Locked Overlay */}
      {shouldShowLockedOverlay(earned) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-2xl">
          <span className="text-2xl">🔒</span>
        </div>
      )}
    </button>
  );
};

export default AchievementBadge;
