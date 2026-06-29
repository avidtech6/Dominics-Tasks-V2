import React, { useMemo } from 'react';
import { Task } from '../data/types';
import { CheckCircle2, Star, Flame, Sparkles, X } from 'lucide-react';
import {
  groupByCategoryForDay,
  getCategoryMeta,
  epEarned,
  countCompleted,
} from '../behaviours/CategoryLaneBehaviour';

interface DailyViewFamilyProps {
  tasks: Task[];
  /** Today's date for grouping. */
  day: Date;
  /** Open the existing TaskModal in edit mode (same wiring as Daily View). */
  onOpenTask?: (task: Task) => void;
  /** Toggle completion via TaskBehaviour (same contract as Daily View). */
  onToggleComplete?: (task: Task) => void;
}

const ENCOURAGEMENTS = [
  'Slow progress is still progress.',
  "Today's small steps are tomorrow's big wins.",
  "Done is better than perfect.",
  'Showing up counts. You did.',
  'Rest is part of the plan.',
  'One thing at a time. You got this.',
  'Family over finish line.',
];

const DailyViewFamily: React.FC<DailyViewFamilyProps> = ({ tasks, day, onOpenTask, onToggleComplete }) => {
  const groups = useMemo(() => groupByCategoryForDay(tasks, day), [tasks, day]);
  const sections = useMemo(() => Object.keys(groups).sort(), [groups]);

  const today = useMemo(() => tasks.filter((t) => {
    // "today" = tasks that fall on the chosen day AND aren't done-or-cancelled
    const own = (t.dueDate as Date) ?? (t.deadlineDate as Date) ?? t.createdAt;
    return sameDay(own, day) && (t.status as string) !== 'done' && (t.status as string) !== 'cancelled';
  }), [tasks, day]);

  const completedToday = useMemo(() => today.filter((t) => (t.status as string) === 'done'), [today]);
  const ep = epEarned(today);
  const doneCount = countCompleted(today);
  const quote = ENCOURAGEMENTS[day.getDate() % ENCOURAGEMENTS.length];

  return (
    <div className="daily-family space-y-6">
      {/* Hero strip */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-amber-50 border border-gray-200 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl shadow-sm">
          🌿
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500">Family View</div>
          <div className="text-lg font-semibold text-gray-800">{formatHeroDate(day)}</div>
          <div className="text-sm text-gray-500 italic mt-1">{quote}</div>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="inline-flex items-center gap-1 text-emerald-700 text-sm font-medium">
            <CheckCircle2 size={14} />
            <span>{doneCount} done</span>
          </div>
          <div className="inline-flex items-center gap-1 text-amber-700 text-sm font-medium">
            <Star size={14} />
            <span>{ep} EP</span>
          </div>
        </div>
      </div>

      {/* Card-lanes (one per category with tasks today) */}
      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-10 text-center">
          <div className="text-4xl mb-2">🌿</div>
          <div className="text-gray-700 font-medium">Nothing planned today</div>
          <div className="text-sm text-gray-500 mt-1">Rest days count.</div>
        </div>
      ) : (
        <div className="space-y-5">
          {sections.map((section) => {
            const items = groups[section];
            const meta = getCategoryMeta(section);
            const laneDone = items.filter((t) => (t.status as string) === 'done').length;
            const laneEp = items
              .filter((t) => (t.status as string) === 'done')
              .reduce((s, t) => s + ((t.pointsValue as number) ?? 0), 0);
            return (
              <div key={section} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">{meta.icon}</span>
                    <span className={`text-sm font-semibold ${meta.accentClass.split(' ')[0]}`}>
                      {meta.label || section}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {laneDone > 0 && (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 size={12} />
                        {laneDone}
                      </span>
                    )}
                    {laneEp > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Star size={12} />
                        {laneEp} EP
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-row gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                  {items.map((t) => (
                    <TaskMini
                      key={t.id}
                      task={t}
                      bgClass={meta.bgClass}
                      accentClass={meta.accentClass}
                      onOpen={() => onOpenTask?.(t)}
                      onToggleComplete={() => onToggleComplete?.(t)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day-summary strip */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 flex flex-wrap items-center gap-4 text-sm">
        {doneCount > 0 && (
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <CheckCircle2 size={14} />
            {doneCount} done
          </span>
        )}
        {ep > 0 && (
          <span className="inline-flex items-center gap-1 text-amber-700">
            <Star size={14} />
            {ep} EP earned
          </span>
        )}
        {doneCount === 0 && ep === 0 && sections.length === 0 && (
          <span className="inline-flex items-center gap-1 text-gray-500">
            <Sparkles size={14} />
            Fresh slate.
          </span>
        )}
      </div>
    </div>
  );
};

interface TaskMiniProps {
  task: Task;
  bgClass: string;
  accentClass: string;
  onOpen?: () => void;
  onToggleComplete?: () => void;
}

const TaskMini: React.FC<TaskMiniProps> = ({ task, bgClass, accentClass, onOpen, onToggleComplete }) => {
  const done = (task.status as string) === 'done';
  return (
    <div
      className={`snap-start shrink-0 w-52 rounded-xl border ${accentClass.split(' ')[1] || 'border-gray-200'} ${bgClass} p-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.();
        }
      }}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.();
          }}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
            done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-emerald-500'
          }`}
        >
          {done ? <CheckCircle2 size={12} /> : <X size={12} className="opacity-0 hover:opacity-100 text-gray-400" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-800'} truncate`}>
            {task.title}
          </div>
          {task.description && (
            <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{task.description}</div>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="inline-flex items-center gap-0.5 text-amber-700">
              <Star size={10} />
              {task.pointsValue ?? 0} EP
            </span>
            <span className={`px-1.5 py-0.5 rounded-full ${
              (task.priority as string) === 'urgent' ? 'bg-rose-100 text-rose-700' :
              (task.priority as string) === 'high' ? 'bg-amber-100 text-amber-700' :
              (task.priority as string) === 'low' ? 'bg-gray-100 text-gray-600' :
              'bg-blue-100 text-blue-700'
            }`}>
              {(task.priority as string) ?? 'medium'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
}

function formatHeroDate(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export default DailyViewFamily;