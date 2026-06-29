import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import { Task, TaskSection, TaskStatus, TaskPriority, TaskType, MirroredTask } from '../data/types';
import { Plus, RefreshCw, Archive, RotateCcw, Trash, AlertTriangle, Settings, User, X } from 'lucide-react';
import {
  needsCatchUp,
  isFromYesterday,
  getMirroredTasksForToday,
  formatSmartDate
} from '../data/utils';
import { getDefaultValuesForTaskType } from '../components/TaskModalBehaviour';

type TabType = 'tasks' | 'history' | 'deleted' | 'profile';

// Type guard for MirroredTask
const isMirroredTask = (task: Task | MirroredTask): task is MirroredTask => {
  return 'isMirrored' in task && !!(task as MirroredTask).isMirrored;
};


const Tasks: React.FC = () => {
  // Get behaviours from context
  const { taskBehaviour, chatBehaviour } = useBehaviours();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Drag-drop state
  const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const draggedId = String(event.active.id);
    const dragged = tasks.find((t) => t.id === draggedId);
    if (dragged) setActiveDragTask(dragged);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragTask(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const targetSection = String(over.id) as TaskSection;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.section === targetSection) return;
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, section: targetSection } : t)));
    try {
      await taskBehaviour.updateTask(taskId, { section: targetSection });
    } catch (err) {
      console.error('[Tasks] drag-drop updateTask failed:', err);
      // Revert on failure by refetching
      const fresh = taskBehaviour.getTasksSync();
      setTasks(fresh);
    }
  };

  // Load tasks from behaviour on mount
  useEffect(() => {
    try {
      const initial = taskBehaviour.getTasksSync();
      setTasks(initial);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setLoading(false);
    }
    // Subscribe so seed tasks + remote updates also reach the page
    const unsub = taskBehaviour.subscribe(() => {
      setTasks(taskBehaviour.getTasksSync());
    });
    return () => unsub();
  }, [taskBehaviour]);
  
  // Form state for TaskModal
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTaskType, setFormTaskType] = useState<TaskType>('regular');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formSection, setFormSection] = useState<TaskSection>('morning');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDeadlineDate, setFormDeadlineDate] = useState('');
  const [formPointsValue, setFormPointsValue] = useState('50');
  const [formSelectedTags, setFormSelectedTags] = useState<string[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Comment state
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Handle task type change to update default values
  const handleTaskTypeChange = (newTaskType: TaskType) => {
    setFormTaskType(newTaskType);
    
    // Get default values for this task type
    const defaults = getDefaultValuesForTaskType(newTaskType);
    
    // Update section if it's an assignment task
    if (defaults.section) {
      setFormSection(defaults.section);
    }
    
    // Update due date if it's an assignment task
    if (defaults.dueDate) {
      // Format date for input (YYYY-MM-DD)
      const formattedDate = new Date(defaults.dueDate).toISOString().split('T')[0];
      setFormDueDate(formattedDate);
    }
  };

  // Form handlers
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingTask) {
        // Update existing task
        await taskBehaviour.updateTask(editingTask.id, {
          title: formTitle,
          description: formDescription,
          taskType: formTaskType,
          priority: formPriority,
          section: formSection,
          dueDate: formDueDate ? new Date(formDueDate) : undefined,
          deadlineDate: formDeadlineDate ? new Date(formDeadlineDate) : undefined,
          pointsValue: parseInt(formPointsValue),
          tags: formSelectedTags,
        });
        setEditingTask(null);
      } else {
        // Create new task
        const newTaskId = await taskBehaviour.createTask({
          title: formTitle,
          description: formDescription,
          taskType: formTaskType,
          priority: formPriority,
          section: formSection,
          dueDate: formDueDate ? new Date(formDueDate) : undefined,
          deadlineDate: formDeadlineDate ? new Date(formDeadlineDate) : undefined,
          pointsValue: parseInt(formPointsValue),
          tags: formSelectedTags,
          status: 'todo' as const,
        });
        
        // Re-fetch tasks to get the updated list
        const updatedTasks = taskBehaviour.getTasksSync();
        setTasks(updatedTasks);
        setShowAddModal(false);
      }
      // Reset form
      setFormTitle('');
      setFormDescription('');
      setFormTaskType('regular');
      setFormPriority('medium');
      setFormSection('morning');
      setFormDueDate('');
      setFormDeadlineDate('');
      setFormPointsValue('50');
      setFormSelectedTags([]);
    } catch (error) {
      setFormError('Failed to save task. Please try again.');
      console.error('Error saving task:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleAddComment = async (taskId: string, commentText: string) => {
    if (!commentText.trim()) return;
    
    setSendingComment(true);
    try {
      await chatBehaviour.sendMessage(commentText);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSendingComment(false);
    }
  };

  // Load comments when editing a task
  useEffect(() => {
    if (editingTask) {
      // Initialize form state with editing task data
      setFormTitle(editingTask.title);
      setFormDescription(editingTask.description || '');
      setFormTaskType(editingTask.taskType);
      setFormPriority(editingTask.priority);
      setFormSection(editingTask.section);
      setFormDueDate(editingTask.dueDate ? editingTask.dueDate.toISOString().split('T')[0] : '');
      setFormDeadlineDate(editingTask.deadlineDate ? editingTask.deadlineDate.toISOString().split('T')[0] : '');
      setFormPointsValue(editingTask.pointsValue.toString());
      setFormSelectedTags(editingTask.tags || []);
      
      // Load comments for the task
      // This would typically come from the ChatBehaviour
      const loadComments = async () => {
        setLoadingComments(true);
        try {
          // For now, load empty comments
          // In a real implementation, you'd load comments from the chat system
          setComments([]);
        } catch (error) {
          console.error('Error loading comments:', error);
        } finally {
          setLoadingComments(false);
        }
      };
      
      loadComments();
    } else {
      setComments([]);
    }
  }, [editingTask]);
  
  
  // Load tasks from behaviour
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const allTasks = await taskBehaviour.getTasks();
        setTasks(allTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, []);
  
  // Subscribe to task updates
  useEffect(() => {
    const unsubscribe = taskBehaviour.subscribe((event: any) => {
      if (event.type === 'task_created' || event.type === 'task_updated' || event.type === 'task_deleted') {
        // Reload tasks when any task changes
        const loadTasks = async () => {
          try {
            const allTasks = await taskBehaviour.getTasks();
            setTasks(allTasks);
          } catch (error) {
            console.error('Error reloading tasks:', error);
          }
        };
        loadTasks();
      }
    });
    
    return () => unsubscribe();
  }, []);


  

  // Organize tasks by section - show ALL tasks including completed ones on main page
  // Only hide tasks that are soft-deleted (in trash)
  const allTasks = tasks.filter((t) => !t.deletedAt);
  const todayTasks = allTasks.filter((t) => t.status === 'today' || t.status === 'done');
  const todoTasks = allTasks.filter((t) => t.status === 'todo' || t.status === 'done');

  // Active tasks (not done) - include both 'today' and 'todo' status for morning/afternoon sections
  const morningTasks = todayTasks.filter((t) => t.section === 'morning');
  const afternoonTasks = todayTasks.filter((t) => t.section === 'afternoon');
  
  // Also include todo tasks in morning/afternoon sections
  const morningTodoTasks = allTasks.filter((t) => t.section === 'morning' && t.status === 'todo');
  const afternoonTodoTasks = allTasks.filter((t) => t.section === 'afternoon' && t.status === 'todo');
  
  // Combine today and todo tasks for morning/afternoon sections
  const combinedMorningTasks = [...morningTasks, ...morningTodoTasks];
  const combinedAfternoonTasks = [...afternoonTasks, ...afternoonTodoTasks];

  // NEW: Catch Up section - tasks that need to be shored up from yesterday or before
  const catchUpTasks = allTasks.filter((t) =>
    t.status !== 'done' &&
    !t.deletedAt &&
    (needsCatchUp(t.deadlineDate) || isFromYesterday(t.dueDate || t.createdAt))
  );

  // NEW: Get mirrored tasks from right column sections that have today's date
  const rightColumnTasks = todoTasks.filter((t) => 
    ['assignments', 'leftovers', 'experiments', 'support'].includes(t.section)
  );
  
  const mirroredTasksMorning: MirroredTask[] = getMirroredTasksForToday(rightColumnTasks).map((task: any) => ({
    ...task,
    isMirrored: true,
    originalSection: task.section
  }));

  const assignmentsTasks = todoTasks.filter((t) => t.section === 'assignments');
  const leftoversTasks = todoTasks.filter((t) => t.section === 'leftovers');
  const experimentsTasks = todoTasks.filter((t) => t.section === 'experiments');
  const supportTasks = todoTasks.filter((t) => t.section === 'support');

  // History tasks (archived)
  const historyTasks = tasks.filter((t) => t.archivedAt && !t.deletedAt);

  // Deleted tasks
  const deletedTasks = tasks.filter((t) => t.deletedAt);


  // Tasks to restore
  const tasksToRestore = {
    morning: [
      { title: 'CS test', section: 'morning', status: 'today', priority: 'high', description: 'ASAP Important', taskType: 'exam' },
      { title: 'CS lesson', section: 'morning', status: 'today', priority: 'high', description: 'After test', taskType: 'regular' },
      { title: 'Foundations prep', section: 'morning', status: 'today', priority: 'medium', description: 'This morning', taskType: 'regular' },
      { title: 'Maths prep', section: 'morning', status: 'today', priority: 'medium', description: 'This morning', taskType: 'regular' },
    ],
    afternoon: [
      { title: 'CS tutorials', section: 'afternoon', status: 'today', priority: 'high', description: '3:00 PM', taskType: 'regular' },
      { title: 'Tutorial prep', section: 'afternoon', status: 'today', priority: 'high', description: 'Afternoon', taskType: 'regular' },
      { title: 'Printing', section: 'afternoon', status: 'today', priority: 'medium', description: 'Sort out printing - check if Daddy fixed home printer, or have things ready to print in office', taskType: 'regular' },
    ],
    assignments: [
      { title: 'Math assignment', section: 'assignments', status: 'todo', priority: 'high', description: 'Friday 16th Important', taskType: 'assignment', deadlineDate: new Date('2025-01-17') },
      { title: 'Science assignment', section: 'assignments', status: 'todo', priority: 'high', description: 'Friday 16th (due 20th) Important', taskType: 'assignment', deadlineDate: new Date('2025-01-20') },
    ],
    leftovers: [
      { title: 'Notes on Foundations lesson 13', section: 'leftovers', status: 'todo', priority: 'low', description: 'When you have time', taskType: 'personal' },
      { title: 'Highlight Science book pages 114-121', section: 'leftovers', status: 'todo', priority: 'low', description: 'When you have time', taskType: 'personal' },
      { title: 'Science vocab', section: 'leftovers', status: 'todo', priority: 'low', description: 'When you have time', taskType: 'personal' },
    ],
    experiments: [
      { title: 'Write up Melting experiment', section: 'experiments', status: 'todo', priority: 'medium', description: 'This week', taskType: 'project' },
      { title: 'Write up Lava lamp experiment', section: 'experiments', status: 'todo', priority: 'medium', description: 'This week', taskType: 'project' },
    ],
    support: [
      { title: 'Printer working?', section: 'support', status: 'todo', priority: 'high', description: 'By lunchtime - Let Brenda know at lunchtime if not', taskType: 'personal' },
      { title: '30-minute check-ins with Brenda', section: 'support', status: 'todo', priority: 'high', description: 'Every 30 mins Support', taskType: 'personal' },
      { title: 'Organise squash exercise session', section: 'support', status: 'todo', priority: 'low', description: 'This week Fun!', taskType: 'personal' },
    ],
  };


  const formatDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return now.toLocaleDateString('en-US', options);
  };

  const formatDateTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    });
  };






  // Task Card Wrapper with Drag Support
  const TaskCardWrapper: React.FC<{ task: Task | MirroredTask; isMirrored?: boolean; index?: number }> = ({ task, isMirrored = false, index }) => {
    const handleEdit = () => setEditingTask(task);
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

    const style: React.CSSProperties = {
      opacity: isDragging ? 0.4 : 1,
      cursor: 'grab',
      touchAction: 'none',
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`task-card-wrapper group ${task.status === 'done' ? 'completed' : ''} ${isMirrored ? 'mirrored-task' : ''}`}
        data-task-id={task.id}
        data-task-index={index}
      >
        <TaskCard
          task={task}
          onEdit={handleEdit}
          onComplete={() => taskBehaviour.completeTask(task.id)}
          onDelete={() => taskBehaviour.deleteTask(task.id)}
        />
        {/* Mirrored Badge */}
        {isMirrored && (
          <div className="mirrored-badge-overlay" title={`Also in ${(task as MirroredTask).originalSection}`}>
            ↔ {(task as MirroredTask).originalSection}
          </div>
        )}
      </div>
    );
  };

  const TaskListSection: React.FC<{
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    iconClass: string;
    tasks: (Task | MirroredTask)[];
    showWhenEmpty?: boolean;
    section: TaskSection;
  }> = ({ title, subtitle, icon, iconClass, tasks, showWhenEmpty = false, section }) => {
    // Don't render anything if no tasks and not forcing show
    if (tasks.length === 0 && !showWhenEmpty) return null;

    const { setNodeRef, isOver } = useDroppable({ id: section });

    return (
      <div
        ref={setNodeRef}
        className={`task-section ${tasks.length === 0 ? 'empty-section' : ''} ${isOver ? 'drop-target' : ''}`}
        data-section-id={section}
      >
        <div className="section-header">
          <div className={`section-icon ${iconClass}`}>
            {icon}
          </div>
          <span className="section-title">{title}</span>
          {subtitle && <span className="section-subtitle">{subtitle}</span>}
        </div>
        {tasks.length > 0 ? (
          <div className="task-cards-container">
            {tasks.map((task, index) => (
              <TaskCardWrapper 
                key={task.id} 
                task={task} 
                isMirrored={isMirroredTask(task)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="empty-section-message">
            <span className="empty-icon">✨</span>
            <span>All caught up!</span>
          </div>
        )}
      </div>
    );
  };


  const HistorySection: React.FC<{ tasks: Task[], title: string }> = ({ tasks, title }) => {
    if (tasks.length === 0) {
      return (
        <div className="history-section">
          <div className="history-title">
            <RotateCcw size={18} />
            <span>{title}</span>
          </div>
          <div className="history-empty">
            No tasks in history yet. Complete some tasks to see them here!
          </div>
        </div>
      );
    }

    return (
      <div className="history-section">
        <div className="history-title">
          <RotateCcw size={18} />
          <span>{title}</span>
        </div>
        {tasks.map((task) => (
          <div key={task.id} className="history-item">
            <div className="task-checkbox" style={{ background: '#cbd5e0', borderColor: '#cbd5e0' }}></div>
            <div className="history-item-content">
              <div className="history-item-title">{task.title}</div>
              <div className="history-item-date">
                Completed: {formatDateTime(task.completedAt ?? undefined)}
              </div>
            </div>
            <button
              className="history-btn"
              onClick={() => taskBehaviour.reviveTask(task.id)}
              title="Restore this task to active list"
            >
              <RotateCcw size={14} />
              <span>Restore</span>
            </button>
          </div>
        ))}
      </div>
    );
  };

  const DeletedSection: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    if (tasks.length === 0) {
      return (
        <div className="deleted-section">
          <div className="deleted-title">
            <Trash size={18} />
            <span>Deleted Tasks (Recover within 30 days)</span>
          </div>
          <div className="history-empty">
            No deleted tasks. When you delete tasks, they'll appear here for 30 days.
          </div>
        </div>
      );
    }

    return (
      <div className="deleted-section">
        <div className="deleted-title">
          <Trash size={18} />
          <span>Deleted Tasks (Recover within 30 days)</span>
        </div>
        {tasks.map((task) => (
          <div key={task.id} className="deleted-item">
            <div className="task-checkbox" style={{ background: '#fed7d7', borderColor: '#feb2b2' }}></div>
            <div className="deleted-item-content">
              <div className="deleted-item-title">{task.title}</div>
              <div className="deleted-item-date">
                Deleted: {formatDateTime(task.deletedAt ?? undefined)}
              </div>
            </div>
            <button
              className="history-btn"
              onClick={() => taskBehaviour.restoreDeletedTask(task.id)}
              title="Restore this task"
            >
              <RotateCcw size={14} />
              <span>Restore</span>
            </button>
          </div>
        ))}
      </div>
    );
  };

  const ProfileSection: React.FC = () => {
    const activeTasksCount = tasks.filter(t => t.status !== 'done' && !t.archivedAt && !t.deletedAt).length;
    const completedTasksCount = tasks.filter(t => t.status === 'done' && !t.archivedAt && !t.deletedAt).length;
    const historyCount = tasks.filter(t => t.archivedAt && !t.deletedAt).length;
    const deletedCount = tasks.filter(t => t.deletedAt).length;

    const userInitials = 'U';

    return (
      <div className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar">{userInitials}</div>
          <div className="profile-info">
            <h3>User</h3>
            <p>user@example.com</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{activeTasksCount}</div>
            <div className="profile-stat-label">Active Tasks</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{completedTasksCount}</div>
            <div className="profile-stat-label">Completed</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{historyCount + deletedCount}</div>
            <div className="profile-stat-label">Archived</div>
          </div>
        </div>
      </div>
    );
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'morning':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case 'afternoon':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        );
      case 'assignments':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        );
      case 'leftovers':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        );
      case 'experiments':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        );
      case 'support':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        );
      case 'catchup':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <polyline points="17 11 19 13 23 9"></polyline>
          </svg>
        );
      case 'gaming':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
            <path d="M6 12h4"></path>
            <path d="M8 10v4"></path>
            <path d="M15 10v4"></path>
            <path d="M17 12h3"></path>
          </svg>
        );
      case 'reading':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        );
      case 'creative':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
      case 'music':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeTasksCount = tasks.filter(t => t.status !== 'done' && !t.archivedAt && !t.deletedAt).length;
  const completedTasksCount = tasks.filter(t => t.status === 'done' && !t.archivedAt && !t.deletedAt).length;
  const totalTasks = activeTasksCount + completedTasksCount;
  const progressPercentage = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

  return (
    <div className="max-w-[1100px] mx-auto px-5 py-10">
      {/* Restore Message */}
      {restoreMessage && (
        <div className={`restore-message ${
          restoreMessage.includes('Successfully') 
            ? 'restore-message-success' 
            : 'restore-message-error'
        }`}>
          {restoreMessage}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[2.2rem] font-bold text-[#2d3748] mb-2">Dominic's Tasks</h1>
        <p className="text-[#718096] text-base">Take it one step at a time!</p>
        <div className="date-badge">{formatDate(new Date())}</div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <Plus size={18} />
          <span>Tasks</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Archive size={18} />
          <span>History</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'deleted' ? 'active' : ''}`}
          onClick={() => setActiveTab('deleted')}
        >
          <Trash size={18} />
          <span>Trash</span>
          {deletedTasks.length > 0 && (
            <span style={{ 
              background: '#e53e3e', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: 10, 
              fontSize: '0.75rem' 
            }}>
              {deletedTasks.length}
            </span>
          )}
        </button>
        <button
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} />
          <span>Profile</span>
        </button>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <>
          {/* Floating Add Task Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="floating-add-btn"
            title="Add New Task"
          >
            <Plus size={28} />
          </button>

          {/* Restore All Tasks Button (if there are archived tasks) */}
          {historyTasks.length > 0 && (
            <div style={{ 
              background: '#fef3c7', 
              border: '2px dashed #d97706',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#92400e', marginBottom: '12px', fontWeight: '500' }}>
                {historyTasks.length} task{historyTasks.length !== 1 ? 's' : ''} in History
              </p>
              <button
                onClick={() => {
                  // Restore all archived tasks
                  historyTasks.forEach(task => taskBehaviour.reviveTask(task.id));
                }}
                style={{
                  background: '#d97706',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RotateCcw size={16} />
                Restore All to Main Page
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
            >
              <Plus size={20} />
              <span>Add Task</span>
            </button>
          </div>

          {/* Two Column Layout — wrapped in DndContext for drag-drop between sections (recipe §B Inputs) */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Focus - Left Column */}
            <div>
              <h2 className="column-header column-header-amber">Today's Focus</h2>
              
              <TaskListSection
                section="morning"
                title="This Morning"
                subtitle="Priority Focus"
                icon={getSectionIcon('morning')}
                iconClass="section-icon-morning"
                tasks={combinedMorningTasks}
                showWhenEmpty={true}
              />

              <TaskListSection
                section="afternoon"
                title="This Afternoon"
                subtitle="Keep going!"
                icon={getSectionIcon('afternoon')}
                iconClass="section-icon-afternoon"
                tasks={combinedAfternoonTasks}
                showWhenEmpty={true}
              />

              {/* NEW: Catch Up Section */}
              <TaskListSection
                section="catchup"
                title="Catch Up"
                subtitle="From yesterday & before"
                icon={<AlertTriangle size={20} />}
                iconClass="section-icon-catchup"
                tasks={catchUpTasks}
                showWhenEmpty={true}
              />

              {/* NEW: Show mirrored tasks from right column that have today's date */}
              {mirroredTasksMorning.length > 0 && (
                <div className="mirrored-section">
                  <div className="mirrored-header">
                    <span className="mirrored-title">Also Today</span>
                    <span className="mirrored-subtitle">From other sections</span>
                  </div>
                  <TaskListSection
                    section="morning"
                    title="Today's Assignments & Tasks"
                    subtitle="Due today - also in focus"
                    icon={<RotateCcw size={18} />}
                    iconClass="section-icon-mirrored"
                    tasks={mirroredTasksMorning}
                  />
                </div>
              )}
            </div>

            {/* Other Activities - Right Column */}
            <div>
              <h2 className="column-header column-header-purple">Other Activities</h2>

              <TaskListSection
                section="assignments"
                title="Assignments Due"
                subtitle="Don't forget!"
                icon={getSectionIcon('assignments')}
                iconClass="section-icon-assignments"
                tasks={assignmentsTasks}
                showWhenEmpty={true}
              />

              <TaskListSection
                section="leftovers"
                title="Left Over from Last Term"
                subtitle="Finish these up!"
                icon={getSectionIcon('leftovers')}
                iconClass="section-icon-leftovers"
                tasks={leftoversTasks}
                showWhenEmpty={true}
              />

              <TaskListSection
                section="experiments"
                title="Experiments"
                subtitle="Write these up!"
                icon={getSectionIcon('experiments')}
                iconClass="section-icon-experiments"
                tasks={experimentsTasks}
                showWhenEmpty={true}
              />

              <TaskListSection
                section="support"
                title="Support & Activities"
                subtitle="Stay motivated"
                icon={getSectionIcon('support')}
                iconClass="section-icon-support"
                tasks={supportTasks}
                showWhenEmpty={true}
              />
            </div>
            </div>
          </DndContext>
          <DragOverlay>
            {activeDragTask ? (
              <div className="opacity-90 rotate-1">
                <TaskCard task={activeDragTask} showActions={false} />
              </div>
            ) : null}
          </DragOverlay>

          {/* Progress Section */}
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {completedTasksCount} of {totalTasks} tasks completed
            </div>
          </div>
        </>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <HistorySection tasks={historyTasks} title="History - Click Restore to bring tasks back" />
      )}

      {/* Deleted Tab */}
      {activeTab === 'deleted' && (
        <DeletedSection tasks={deletedTasks} />
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <ProfileSection />
      )}

      {/* Motivation Banner */}
      <div className="motivation-banner">
        <p>"Eating the elephant one step at a time!" - Brenda</p>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-[#a0aec0] text-sm">
        You've got this, Dominic!
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <TaskModal
          onClose={() => setShowAddModal(false)}
          onTaskSaved={() => {
            // Reset form state after save
            setFormTitle('');
            setFormDescription('');
            setFormTaskType('regular');
            setFormPriority('medium');
            setFormSection('morning');
            setFormDueDate('');
            setFormDeadlineDate('');
            setFormPointsValue('50');
            setFormSelectedTags([]);
          }}
          // Form state props
          title={formTitle}
          description={formDescription}
          taskType={formTaskType}
          priority={formPriority}
          section={formSection}
          dueDate={formDueDate}
          deadlineDate={formDeadlineDate}
          pointsValue={formPointsValue}
          selectedTags={formSelectedTags}
          submitting={formSubmitting}
          error={formError}
          // Form handlers
          onTitleChange={setFormTitle}
          onDescriptionChange={setFormDescription}
          onTaskTypeChange={handleTaskTypeChange}
          onPriorityChange={setFormPriority}
          onSectionChange={setFormSection}
          onDueDateChange={setFormDueDate}
          onDeadlineDateChange={setFormDeadlineDate}
          onPointsValueChange={setFormPointsValue}
          onSelectedTagsChange={setFormSelectedTags}
          onFormSubmit={handleFormSubmit}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          onClose={() => setEditingTask(null)}
          taskToEdit={editingTask}
          onTaskSaved={() => setEditingTask(null)}
          // Form state props populated from editingTask
          title={formTitle}
          description={formDescription}
          taskType={formTaskType}
          priority={formPriority}
          section={formSection}
          dueDate={formDueDate}
          deadlineDate={formDeadlineDate}
          pointsValue={formPointsValue}
          selectedTags={formSelectedTags}
          submitting={formSubmitting}
          error={formError}
          // Form handlers
          onTitleChange={setFormTitle}
          onDescriptionChange={setFormDescription}
          onTaskTypeChange={setFormTaskType}
          onPriorityChange={setFormPriority}
          onSectionChange={setFormSection}
          onDueDateChange={setFormDueDate}
          onDeadlineDateChange={setFormDeadlineDate}
          onPointsValueChange={setFormPointsValue}
          onSelectedTagsChange={setFormSelectedTags}
          onFormSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Warning Modal */}
      {showDeleteWarning && (
        <div className="modal-overlay" onClick={() => setShowDeleteWarning(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <AlertTriangle size={20} style={{ color: '#e53e3e', marginRight: 8 }} />
                Delete Task?
              </h3>
              <button className="modal-close" onClick={() => setShowDeleteWarning(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#4a5568', lineHeight: 1.6 }}>
                Are you sure you want to delete <strong>"{taskToDelete?.title}"</strong>?
              </p>
              <p style={{ color: '#718096', marginTop: 12, fontSize: '0.9rem' }}>
                The task will be moved to Trash where it can be recovered for 30 days.
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowDeleteWarning(false)}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={() => setShowDeleteWarning(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
