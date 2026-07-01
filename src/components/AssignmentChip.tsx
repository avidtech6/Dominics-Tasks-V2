import React from 'react';
import { Task } from '../data/types';

interface AssignmentChipProps {
  subject: string;
  icon: string;
  count: number;
  ep: number;
  /** All task IDs in this subject — used to wire click → edit first task. */
  taskIds: string[];
  /** Lane this chip appears in — affects style subtly (small vs sync). */
  variant?: 'grouped' | 'sync';
  /** Optional click handler — opens the first task in edit mode. */
  onOpenTask?: (task: Task) => void;
  /** Tasks to pass to onOpenTask — caller resolves "first task" from IDs. */
  tasks?: Task[];
}

/**
 * AssignmentChip — minimal reference card for assignments.
 *
 * Two variants:
 *  - `grouped` (default): used inside the Assignments lane. Shows subject +
 *    count + EP summary. Tap = expand inline (managed by parent).
 *  - `sync`: small chip used in time-slot lanes (Morning/Afternoon) to
 *    indicate which assignment subjects are being worked on. Tap = open
 *    the first task in edit mode.
 */
const AssignmentChip: React.FC<AssignmentChipProps> = ({
  subject,
  icon,
  count,
  ep,
  variant = 'grouped',
  onOpenTask,
  tasks,
}) => {
  if (variant === 'sync') {
    return (
      <button
        type="button"
        data-assignment-chip="sync"
        data-subject={subject}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium hover:bg-blue-100 hover:border-blue-300 transition-colors"
        onClick={() => {
          if (onOpenTask && tasks && tasks.length > 0) onOpenTask(tasks[0]);
        }}
      >
        <span aria-hidden="true">{icon}</span>
        <span>{subject}</span>
        {count > 1 && (
          <span className="px-1 bg-blue-200 rounded-full text-[10px] text-blue-900">×{count}</span>
        )}
        {ep > 0 && <span className="text-blue-600 text-[10px]">· {ep}EP</span>}
      </button>
    );
  }

  return (
    <div
      data-assignment-chip="grouped"
      data-subject={subject}
      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="text-xl shrink-0" aria-hidden="true">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{subject}</div>
        <div className="text-xs text-gray-500">
          {count} assignment{count === 1 ? '' : 's'}
          {ep > 0 && <span className="ml-1 text-amber-600">· {ep} EP</span>}
        </div>
      </div>
    </div>
  );
};

export default AssignmentChip;