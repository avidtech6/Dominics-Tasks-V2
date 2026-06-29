import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Star, Trophy, Sparkles } from 'lucide-react';
import {
  bestDay,
  totalDone,
  totalActive,
  epEarned as epSum,
  pickQuote,
} from '../behaviours/WeeklyBehaviour';

interface WeekSummaryCardProps {
  tasksByDay: Record<string, any[]>;
  weekStart: Date;
  weekEnd: Date;
}

const WeekSummaryCard: React.FC<WeekSummaryCardProps> = ({ tasksByDay, weekStart, weekEnd }) => {
  const done = totalDone(tasksByDay);
  const total = totalActive(tasksByDay);
  const ep = Object.values(tasksByDay).reduce((s, list) => s + epSum(list), 0);
  const best = bestDay(tasksByDay);
  const quote = pickQuote(weekStart);

  return (
    <div
      data-testid="week-summary-card"
      className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-amber-500" />
        <div className="text-sm text-gray-500">
          Week of {format(weekStart, 'd')}–{format(weekEnd, 'd MMM')}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-3">
        <Stat icon={<CheckCircle2 size={16} className="text-emerald-600" />} label="Tasks completed" value={`${done}`} sub={`of ${total}`} />
        <Stat icon={<Star size={16} className="text-amber-500" />} label="EP earned" value={`${ep}`} sub="experience points" />
        <Stat
          icon={<Trophy size={16} className="text-indigo-500" />}
          label="Best day"
          value={best ? format(new Date(best.iso), 'EEE') : '—'}
          sub={best ? `${best.count} done` : 'no completions yet'}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-sm text-gray-600 italic" data-testid="week-quote">
          “{quote}”
        </p>
      </div>
    </div>
  );
};

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}

const Stat: React.FC<StatProps> = ({ icon, label, value, sub }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div className="min-w-0">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-800">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  </div>
);

export default WeekSummaryCard;