import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task } from '../data/types';
import AssignmentChip from './AssignmentChip';

interface AssignmentGroup {
  subject: string;
  icon: string;
  tasks: Task[];
  ep: number;
}

interface AssignmentsGroupedSectionProps {
  groups: AssignmentGroup[];
  onOpenFirst: (tasks: Task[]) => void;
}

/**
 * AssignmentsGroupedSection — minimal section that renders assignment tasks
 * grouped by subject (Maths, Reading, Spelling, etc.) instead of a flat list
 * of full TaskCards.
 *
 * Droppable: users can drag an assignment OUT of this section onto a time-slot
 * lane (Morning/Afternoon) to sync it. Tasks dragged here from elsewhere get
 * their section updated to 'assignments' (handled in handleDragEnd).
 *
 * Per operator directive 2026-07-01: keep this section quiet. No checkboxes,
 * no priority badges, no description text — just subject + count + EP summary.
 */
const AssignmentsGroupedSection: React.FC<AssignmentsGroupedSectionProps> = ({ groups, onOpenFirst }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop-assignments' });

  return (
    <div
      ref={setNodeRef}
      className={`task-section ${groups.length === 0 ? 'empty-section' : ''} ${isOver ? 'drop-target' : ''}`}
      data-section-id="assignments"
      data-assignments-grouped="true"
    >
      <div className="section-header">
        <div className="section-icon section-icon-assignments">
          {/* assignments icon — simple book/clipboard */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
        <span className="section-title">Assignments Due</span>
        <span className="section-subtitle">Type-grouped · drag to a time slot to schedule</span>
      </div>

      {groups.length === 0 ? (
        <div className="empty-section-message">
          <span className="empty-icon">✨</span>
          <span>No assignments yet</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <button
              key={group.subject}
              type="button"
              onClick={() => onOpenFirst(group.tasks)}
              data-assignment-group-chip={group.subject}
              className="text-left w-full"
            >
              <AssignmentChip
                subject={group.subject}
                icon={group.icon}
                count={group.tasks.length}
                ep={group.ep}
                taskIds={group.tasks.map((t) => t.id)}
                tasks={group.tasks}
                variant="grouped"
              />
            </button>
          ))}
        </div>
      )}

      {/* Drop-slot pill mirrors TaskListSection for consistency. */}
      <div
        data-drop-slot="assignments"
        aria-hidden="true"
        className={`mt-2 h-1.5 rounded-full transition-all duration-150 ${
          isOver
            ? 'h-2.5 bg-blue-500/30 border border-dashed border-blue-500'
            : 'bg-transparent border border-transparent'
        }`}
      />
    </div>
  );
};

export default AssignmentsGroupedSection;