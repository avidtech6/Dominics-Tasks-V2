import React, { useState } from 'react';
import { CheckCircle2, X as XIcon, Star } from 'lucide-react';
import { Task } from '../data/types';
import { getCategoryMeta } from '../behaviours/CategoryLaneBehaviour';

interface CategoryCardProps {
  /** Section name from task.section. */
  section: string;
  tasks: Task[];
  dayIso: string;
  onOpenTask?: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  section,
  tasks,
  dayIso,
  onOpenTask,
  onToggleComplete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(section);
  const done = tasks.filter((t) => ((t.status as unknown) as string) === 'done').length;
  const ep = tasks
    .filter((t) => ((t.status as unknown) as string) === 'done')
    .reduce((s, t) => s + (((t as any).pointsValue as number) ?? 0), 0);
  const first2 = tasks.slice(0, 2).map((t) => t.title).filter(Boolean);

  return (
    <div
      data-category-card="true"
      data-section={section}
      data-day-iso={dayIso}
      data-expanded={expanded ? 'true' : 'false'}
      className={`snap-start shrink-0 w-52 rounded-2xl border ${meta.accentClass.split(' ')[1] || 'border-gray-200'} ${meta.bgClass} p-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left"
        data-category-toggle="true"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl" aria-hidden="true">{meta.icon}</span>
            <span className={`text-sm font-semibold truncate ${meta.accentClass.split(' ')[0]}`}>
              {meta.label || section}
            </span>
          </div>
          <span className="text-xs font-medium bg-white/70 rounded-full px-2 py-0.5 text-gray-700">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mb-2" aria-label="status dots">
          {tasks.slice(0, 6).map((t, i) => {
            const status = ((t.status as unknown) as string) ?? 'pending';
            const color =
              status === 'done' ? 'bg-emerald-500' :
              status === 'cancelled' ? 'bg-gray-300' :
              status === 'pending_approval' ? 'bg-amber-400' :
              'bg-blue-300';
            return <span key={t.id ?? i} className={`w-2 h-2 rounded-full ${color}`} />;
          })}
          {tasks.length > 6 && (
            <span className="text-[10px] text-gray-500">+{tasks.length - 6}</span>
          )}
        </div>
        {first2.length > 0 && (
          <div className="text-xs text-gray-600 line-clamp-1">
            ▸ {first2.join(' · ')}
          </div>
        )}
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-1.5 pt-1">
            {tasks.map((t) => {
              const isDone = ((t.status as unknown) as string) === 'done';
              return (
                <li key={t.id} className="flex items-start gap-2">
                  <button
                    type="button"
                    aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete?.(t);
                    }}
                    className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400 hover:border-emerald-500'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={10} /> : <XIcon size={10} className="opacity-0 hover:opacity-100 text-gray-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTask?.(t);
                    }}
                    className={`flex-1 text-left text-xs ${isDone ? 'line-through text-gray-400' : 'text-gray-800'} truncate`}
                  >
                    {t.title}
                  </button>
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 shrink-0">
                    <Star size={9} />
                    {((t as any).pointsValue as number) ?? 0}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {(done > 0 || ep > 0) && (
        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
          {done > 0 && (
            <span className="inline-flex items-center gap-0.5 text-emerald-700">
              <CheckCircle2 size={10} />
              {done}
            </span>
          )}
          {ep > 0 && (
            <span className="inline-flex items-center gap-0.5 text-amber-700">
              <Star size={10} />
              {ep} EP
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;