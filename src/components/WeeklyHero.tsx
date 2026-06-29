import React from 'react';
import { CheckCircle2, Star, Flame, TrendingUp } from 'lucide-react';
import {
  totalActive,
  totalDone,
  epEarned,
  computeStreak,
  completionRatio,
} from '../behaviours/WeeklyBehaviour';

interface WeeklyHeroProps {
  tasksByDay: Record<string, any[]>;
  weekLabel: string;
}

const WeeklyHero: React.FC<WeeklyHeroProps> = ({ tasksByDay, weekLabel }) => {
  const total = totalActive(tasksByDay);
  const done = totalDone(tasksByDay);
  const ep = Object.values(tasksByDay).reduce((s, list) => s + epEarned(list), 0);
  const streak = computeStreak(tasksByDay);
  const ratio = completionRatio(tasksByDay);

  return (
    <div
      data-testid="weekly-hero"
      className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-amber-50 border border-gray-200 p-5 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl shadow-sm">
        📅
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-500">Your week</div>
        <div className="text-lg font-semibold text-gray-800">{weekLabel}</div>
        <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-[width] duration-500"
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-500">{Math.round(ratio * 100)}% complete</div>
      </div>
      <div className="flex flex-col items-end gap-1 text-right shrink-0">
        <div className="inline-flex items-center gap-1 text-emerald-700 text-sm font-medium">
          <CheckCircle2 size={14} />
          <span data-testid="weekly-done-count">{done}/{total}</span>
        </div>
        <div className="inline-flex items-center gap-1 text-amber-700 text-sm font-medium">
          <Star size={14} />
          <span data-testid="weekly-ep-total">{ep} EP</span>
        </div>
        {streak >= 2 && (
          <div className="inline-flex items-center gap-1 text-orange-700 text-sm font-medium">
            <Flame size={14} />
            <span>{streak}-day streak</span>
          </div>
        )}
        {total === 0 && (
          <div className="inline-flex items-center gap-1 text-gray-500 text-xs">
            <TrendingUp size={12} />
            <span>Fresh week.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyHero;