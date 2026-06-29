import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Star, Flame, Sparkles } from 'lucide-react';
import { Task } from '../data/types';
import { isoDay, daySubtitle, epEarned, countCompleted } from '../behaviours/WeeklyBehaviour';
import { groupByCategoryForDay } from '../behaviours/CategoryLaneBehaviour';
import CategoryCard from './CategoryCard';

interface DayLaneProps {
  day: Date;
  today: Date;
  tasks: Task[];
  onOpenTask?: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
}

const DayLane: React.FC<DayLaneProps> = ({ day, today, tasks, onOpenTask, onToggleComplete }) => {
  const iso = isoDay(day);
  const groups = useMemo(() => groupByCategoryForDay(tasks, day), [tasks, day]);
  const sections = useMemo(() => Object.keys(groups).sort(), [groups]);
  const dayDone = countCompleted(tasks);
  const dayEp = epEarned(tasks);

  return (
    <section
      id={`day-lane-${iso}`}
      data-day-lane="true"
      data-day-iso={iso}
      data-task-count={tasks.length}
      className="grid grid-cols-1 md:grid-cols-[7rem_1fr] gap-3 md:gap-4 items-start"
    >
      {/* Day label column */}
      <div className="md:pt-2">
        <div className={`text-sm font-semibold ${dayIsToday(day, today) ? 'text-indigo-700' : 'text-gray-700'}`}>
          {format(day, 'EEE')}
        </div>
        <div className={`text-xs ${dayIsToday(day, today) ? 'text-indigo-500' : 'text-gray-500'}`}>
          {format(day, 'd MMM')}
        </div>
        <div className={`text-[10px] mt-0.5 ${dayIsToday(day, today) ? 'text-indigo-400' : 'text-gray-400'}`}>
          {daySubtitle(day, today)}
        </div>
      </div>

      {/* Lane content */}
      <div className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm min-h-[5rem]">
        {tasks.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <span aria-hidden="true">🌿</span>
            <span>Nothing planned — rest day.</span>
          </div>
        ) : (
          <>
            <div className="flex flex-row gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
              {sections.map((section) => (
                <CategoryCard
                  key={section}
                  section={section}
                  dayIso={iso}
                  tasks={groups[section]}
                  onOpenTask={onOpenTask}
                  onToggleComplete={onToggleComplete}
                />
              ))}
            </div>
            {(dayDone > 0 || dayEp > 0) && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
                {dayDone > 0 && (
                  <span className="inline-flex items-center gap-1 text-emerald-700" data-day-done-count={dayDone}>
                    <CheckCircle2 size={12} />
                    {dayDone} done
                  </span>
                )}
                {dayEp > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <Star size={12} />
                    {dayEp} EP
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

function dayIsToday(d: Date, today: Date): boolean {
  return d.getFullYear() === today.getFullYear()
    && d.getMonth() === today.getMonth()
    && d.getDate() === today.getDate();
}

export default DayLane;