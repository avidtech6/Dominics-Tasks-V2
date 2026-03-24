import React, { useState } from 'react';
import { Task } from '../data/types';
import { X, MessageCircle, Send } from 'lucide-react';
import {
  TaskType,
  TaskPriority,
  TaskSection,
  TASK_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  SECTION_OPTIONS
} from './taskConstants';
import {
  toggleTagSelection,
  formatDateForDisplay
} from './TaskModalBehaviour';

interface TaskModalProps {
  onClose: () => void;
  taskToEdit?: Task | null;
  user?: {
    displayName: string;
    email: string;
    uid: string;
  };
  // Comment-related props - moved from component logic to parent
  comments?: any[];
  onAddComment?: (taskId: string, commentText: string) => Promise<void>;
  sendingComment?: boolean;
  newComment?: string;
  onNewCommentChange?: (value: string) => void;
  // Form state props - moved from component state to props
  title?: string;
  description?: string;
  taskType?: TaskType;
  priority?: TaskPriority;
  section?: TaskSection;
  dueDate?: string;
  deadlineDate?: string;
  pointsValue?: string;
  selectedTags?: string[];
  submitting?: boolean;
  error?: string | null;
  // Form handlers
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onTaskTypeChange?: (value: TaskType) => void;
  onPriorityChange?: (value: TaskPriority) => void;
  onSectionChange?: (value: TaskSection) => void;
  onDueDateChange?: (value: string) => void;
  onDeadlineDateChange?: (value: string) => void;
  onPointsValueChange?: (value: string) => void;
  onSelectedTagsChange?: (value: string[]) => void;
  onFormSubmit?: (e: React.FormEvent) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  onClose,
  taskToEdit,
  user,
  comments = [],
  onAddComment,
  sendingComment = false,
  newComment = '',
  onNewCommentChange,
  // Form state props
  title = '',
  description = '',
  taskType = 'regular',
  priority = 'medium',
  section = 'morning',
  dueDate = '',
  deadlineDate = '',
  pointsValue = '50',
  selectedTags = [],
  submitting = false,
  error = null,
  // Form handlers
  onTitleChange,
  onDescriptionChange,
  onTaskTypeChange,
  onPriorityChange,
  onSectionChange,
  onDueDateChange,
  onDeadlineDateChange,
  onPointsValueChange,
  onSelectedTagsChange,
  onFormSubmit
}) => {
  // Tab state - UI state only
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');

  // Task type options - imported from constants
  const taskTypeOptions = TASK_TYPE_OPTIONS;

  // Priority options - imported from constants
  const priorityOptions = PRIORITY_OPTIONS;

  // Section options - imported from constants
  const sectionOptions = SECTION_OPTIONS;

  // Handle tag selection - UI interaction only
  const handleTagToggle = (tag: string) => {
    const newSelectedTags = toggleTagSelection(tag, selectedTags);
    onSelectedTagsChange?.(newSelectedTags);
  };

  // Handle form submission - delegated to parent
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFormSubmit?.(e);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {taskToEdit ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Task Details
            </button>
            {taskToEdit?.id && (
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
                  activeTab === 'comments'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Comments ({comments.length})
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {/* Tab 1: Details */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange?.(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange?.(e.target.value)}
                    placeholder="Add details..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                    rows={3}
                  />
                </div>

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {taskTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onTaskTypeChange?.(option.value)}
                        className={`p-3 border rounded-xl text-left transition-colors ${
                          taskType === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{option.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.points} points</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority and Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => onPriorityChange?.(e.target.value as TaskPriority)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section
                    </label>
                    <select
                      value={section}
                      onChange={(e) => onSectionChange?.(e.target.value as TaskSection)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {sectionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => onDueDateChange?.(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline Date
                    </label>
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => onDeadlineDateChange?.(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Points Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Value
                  </label>
                  <input
                    type="number"
                    value={pointsValue}
                    onChange={(e) => onPointsValueChange?.(e.target.value)}
                    min="1"
                    max="1000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['urgent', 'important', 'school', 'home', 'health', 'hobby'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )} {/* End of Details tab */}

            {/* Tab 2: Comments - only show when editing existing task */}
            {taskToEdit?.id && activeTab === 'comments' && (
              <div>
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <MessageCircle size={40} className="mb-2" />
                      <p className="text-sm">No comments yet</p>
                      <p className="text-xs">Be the first to add one!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className={`p-3 rounded-lg ${
                          comment.authorEmail === user?.email
                            ? 'bg-blue-50 ml-8'
                            : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {comment.authorName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {comment.timestamp && formatDateForDisplay(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (onAddComment && taskToEdit?.id && newComment.trim()) {
                    onAddComment(taskToEdit.id, newComment.trim());
                  }
                }} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => onNewCommentChange?.(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sendingComment || !newComment.trim()}
                    className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Comments will also appear in Family Chat
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : taskToEdit ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
