import React, { useState } from 'react';
import { Task, TaskStatus } from '../data/types';
import { getTaskTypeConfig, getPriorityConfig, getDeadlineStatus, getDaysUntilDeadline } from '../data/utils';
import { Check, Calendar, MoreVertical, Edit, Trash2, MessageCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import {
  getStatusStyles,
  isCheckboxDisabled,
  createEventHandler,
  shouldShowStatusBadge,
  getStatusBadgeText,
  getStatusBadgeColor,
  hasComments,
  getCommentCountText
} from './TaskCardBehaviour';

interface TaskCardProps {
  task: Task;
  showActions?: boolean;
  onEdit?: () => void;
  onAddComment?: () => void;
  onOpenComments?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  showActions = true,
  onEdit,
  onAddComment,
  onOpenComments,
  onDelete,
  onComplete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const typeConfig = getTaskTypeConfig(task.taskType);
  const priorityConfig = getPriorityConfig(task.priority);
  const deadlineStatus = getDeadlineStatus(task.deadlineDate, task.status);
  const daysUntilDeadline = getDaysUntilDeadline(task.deadlineDate);

  // Determine card styling based on task status
  const statusStyles = getStatusStyles(task.status);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
    setShowMenu(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
    setShowMenu(false);
  };

  const handleAddComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddComment?.();
    setShowMenu(false);
  };


  return (
    <div
      className={`task-card bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer task-type-${task.taskType}`}
      style={statusStyles}
    >
      {/* Status Badge */}
      {shouldShowStatusBadge(task.status) && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-amber-50 rounded-lg border border-amber-200 w-fit">
          <Clock size={12} className="text-amber-600" />
          <span className="text-xs font-medium text-amber-700">{getStatusBadgeText(task.status)}</span>
        </div>
      )}
      
      <div className="flex items-start space-x-3">
        {/* Complete Button */}
        {showActions && task.status !== 'done' && (
          <button
            onClick={handleComplete}
            disabled={isCheckboxDisabled(task.status)}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 transition-colors flex-shrink-0 flex items-center justify-center ${
              task.status === 'pending_approval'
                ? 'border-amber-300 bg-amber-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-green-500 hover:bg-green-500'
            }`}
            title={task.status === 'pending_approval' ? 'Waiting for parent approval' : 'Click to complete'}
          >
            {task.status === 'pending_approval' ? (
              <Clock size={12} className="text-amber-500" />
            ) : (
              <Check className="text-white opacity-0 hover:opacity-100" size={12} />
            )}
          </button>
        )}

        {/* Done Badge */}
        {task.status === 'done' && (
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-white" />
          </div>
        )}

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Header - Subtle badges */}
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-base">{typeConfig.icon}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium opacity-70"
              style={{
                backgroundColor: `${typeConfig.color}15`,
                color: typeConfig.color,
              }}
            >
              {typeConfig.label}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium opacity-70"
              style={{
                backgroundColor: `${priorityConfig.color}15`,
                color: priorityConfig.color,
              }}
            >
              {priorityConfig.label}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`font-semibold text-gray-800 mb-1 ${
              task.status === 'done' ? 'line-through text-gray-400' : ''
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
            <div className="flex items-center space-x-3">
              {/* Deadline */}
              {task.deadlineDate && (
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>
                    {deadlineStatus === 'overdue'
                      ? `Overdue by ${Math.abs(daysUntilDeadline || 0)} days`
                      : deadlineStatus === 'urgent'
                      ? 'Due tomorrow!'
                      : daysUntilDeadline === 0
                      ? 'Due today'
                      : `${daysUntilDeadline} days left`}
                  </span>
                </div>
              )}

              {/* Points */}
              <div className="flex items-center space-x-1">
                <span className="text-amber-500">⭐</span>
                <span>{task.pointsValue} EP</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Comment count badge */}
              {(task.commentCount || 0) > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenComments?.();
                  }}
                  className="flex items-center space-x-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <MessageCircle size={12} />
                  <span className="font-medium">{task.commentCount}</span>
                </button>
              )}

              {/* Actions Menu - only show on hover or if explicitly needed */}
              {showActions && (
                <div 
                  className="relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-6 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                      <button
                        onClick={handleEdit}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-50 text-sm"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      {onAddComment && (
                        <button
                          onClick={handleAddComment}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-50 text-sm"
                        >
                          <MessageCircle size={12} />
                          <span>Comment</span>
                        </button>
                      )}
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-red-600 hover:bg-red-50 text-sm"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
