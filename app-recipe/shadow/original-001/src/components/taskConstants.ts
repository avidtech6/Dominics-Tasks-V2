// TaskModal constants extracted for modularization
export type TaskType = 'regular' | 'assignment' | 'exam' | 'project' | 'personal';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskSection = 'morning' | 'afternoon' | 'assignments' | 'leftovers' | 'experiments' | 'support';

export const TASK_TYPE_OPTIONS: { value: TaskType; label: string; icon: string; points: number }[] = [
  { value: 'regular', label: 'Regular', icon: '📋', points: 50 },
  { value: 'assignment', label: 'Assignment', icon: '📝', points: 100 },
  { value: 'exam', label: 'Exam', icon: '🎯', points: 200 },
  { value: 'project', label: 'Project', icon: '🚀', points: 300 },
  { value: 'personal', label: 'Personal', icon: '⭐', points: 25 },
];

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const SECTION_OPTIONS: { value: TaskSection; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'assignments', label: 'Assignments' },
  { value: 'leftovers', label: 'Left Over' },
  { value: 'experiments', label: 'Experiments' },
  { value: 'support', label: 'Support & Activities' },
];