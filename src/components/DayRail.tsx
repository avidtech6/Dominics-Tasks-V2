import React from 'react';
import { format, isToday } from 'date-fns';
import { isoDay, daySubtitle } from '../behaviours/WeeklyBehaviour';

interface DayRailProps {
  days: Date[];
  today: Date;
  hasTasksByDay: Record<string, number>;
  doneByDay: Record<string, number>;
}

const DayRail: React.FC<DayRailProps> = ({ days, today, hasTasksByDay, doneByDay }) => {
  const onPick = (iso: string) => {
    const el = document.getElementById(`day-lane-${iso}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      data-testid="day-rail"
      className="sticky top-16 z-10 bg-gray-50/95 backdrop-blur py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gray-200"
    >
      <div className="flex flex-row gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
        {days.map((d) => {
          const iso = isoDay(d);
          const isT = isToday(d);
          const taskCount = hasTasksByDay[iso] ?? 0;
          const doneCount = doneByDay[iso] ?? 0;
          return (
            <button
              key={iso}
              type="button"
              data-day-iso={iso}
              data-day-rail-pill="true"
              onClick={() => onPick(iso)}
              className={`snap-start shrink-0 min-w-[5.5rem] rounded-2xl border px-3 py-2 text-left transition-all duration-150 ${
                isT
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className={`text-xs font-medium ${isT ? 'text-indigo-100' : 'text-gray-500'}`}>
                {daySubtitle(d, today)}
              </div>
              <div className="text-base font-semibold leading-tight">
                {format(d, 'd MMM')}
              </div>
              <div className={`text-[10px] mt-0.5 ${isT ? 'text-indigo-100' : 'text-gray-400'}`}>
                {taskCount === 0
                  ? 'rest day'
                  : doneCount > 0
                  ? `✓${doneCount}/${taskCount}`
                  : `${taskCount} task${taskCount === 1 ? '' : 's'}`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DayRail;