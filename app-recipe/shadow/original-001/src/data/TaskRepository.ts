import { Task, TaskStatus, TaskSection, TaskApproval } from '../types';

// Repository interface for task operations (same as in behaviour layer)
export interface TaskRepository {
  getTasks(): Promise<Task[]>;
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'order'>): Promise<string>;
  updateTask(id: string, updates: Partial<Task>): Promise<void>;
  deleteTask(id: string): Promise<void>;
  restoreDeletedTask(id: string): Promise<void>;
  permanentlyDeleteTask(id: string): Promise<void>;
  completeTask(id: string): Promise<void>;
  uncompleteTask(id: string): Promise<void>;
  archiveTask(id: string): Promise<void>;
  reviveTask(id: string): Promise<void>;
  moveTask(id: string, section: TaskSection, status: TaskStatus): Promise<void>;
  getTasksByDate(date: Date): Task[];
  getTasksByDeadline(): Task[];
  getOverdueTasks(): Task[];
  getHistoryTasks(): Task[];
  getDeletedTasks(): Task[];
  getCompletedTodayTasks(): Task[];
  addTaskComment(taskId: string, taskTitle: string, text: string): Promise<void>;
  getTaskComments(taskId: string): Promise<any[]>;
  getApprovalsByChild(childId: string): TaskApproval[];
  submitApprovalEvidence(approvalId: string, evidenceUrl: string, evidenceType: 'image' | 'document' | 'text'): Promise<void>;
  uploadAndSubmitEvidence(approvalId: string, file: File, onProgress?: (progress: number) => void): Promise<void>;
  approveTaskCompletion(approvalId: string): Promise<void>;
  rejectTaskCompletion(approvalId: string, reason?: string): Promise<void>;
}


// Local implementation
class LocalTaskRepository implements TaskRepository {
  private readonly STORAGE_KEY = 'dominicstasks_tasks';

  private getStoredTasks(): Task[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  private saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  async getTasks(): Promise<Task[]> {
    return this.getStoredTasks();
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'order'>): Promise<string> {
    const tasks = this.getStoredTasks();
    const newTask: Task = {
      ...task,
      id: `${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
      createdBy: 'local-user', // In real implementation, get from auth context
      order: tasks.length,
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask.id;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const tasks = this.getStoredTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    this.saveTasks(tasks);
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = this.getStoredTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    this.saveTasks(filteredTasks);
  }

  async restoreDeletedTask(id: string): Promise<void> {
    // Implementation for restoring deleted tasks
    const tasks = this.getStoredTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
      // Task already exists, do nothing
      return;
    }
    // In a real implementation, you'd need a separate deleted tasks storage
    console.log('Restore deleted task not fully implemented in local storage');
  }

  async permanentlyDeleteTask(id: string): Promise<void> {
    // Implementation for permanent deletion
    // Similar to deleteTask but more permanent
    await this.deleteTask(id);
  }

  async completeTask(id: string): Promise<void> {
    await this.updateTask(id, {
      status: 'done' as TaskStatus,
      completedAt: new Date()
    });
  }

  async uncompleteTask(id: string): Promise<void> {
    await this.updateTask(id, {
      status: 'todo' as TaskStatus,
      completedAt: undefined
    });
  }

  async archiveTask(id: string): Promise<void> {
    await this.updateTask(id, {
      status: 'pending_approval' as TaskStatus,
      archivedAt: new Date()
    });
  }

  async reviveTask(id: string): Promise<void> {
    await this.updateTask(id, {
      status: 'todo' as TaskStatus,
      archivedAt: undefined
    });
  }

  async moveTask(id: string, section: TaskSection, status: TaskStatus): Promise<void> {
    await this.updateTask(id, { section, status });
  }

  getTasksByDate(date: Date): Task[] {
    const tasks = this.getStoredTasks();
    const dateStr = date.toDateString();
    return tasks.filter(task =>
      task.createdAt && task.createdAt.toDateString() === dateStr
    );
  }

  getTasksByDeadline(): Task[] {
    const tasks = this.getStoredTasks();
    return tasks.filter(task => task.deadlineDate);
  }

  getOverdueTasks(): Task[] {
    const now = new Date();
    return this.getTasksByDeadline().filter(task =>
      task.deadlineDate && task.deadlineDate < now && task.status !== 'done'
    );
  }

  getHistoryTasks(): Task[] {
    const tasks = this.getStoredTasks();
    return tasks.filter(task => task.status === 'done');
  }

  getDeletedTasks(): Task[] {
    const tasks = this.getStoredTasks();
    return tasks.filter(task => task.deletedAt !== null);
  }

  getCompletedTodayTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = this.getStoredTasks();
    return tasks.filter(task =>
      task.completedAt &&
      task.completedAt >= today &&
      task.completedAt < tomorrow
    );
  }

  async addTaskComment(taskId: string, taskTitle: string, text: string): Promise<void> {
    // Implementation for adding task comments
    console.log('Add task comment not fully implemented in local storage');
  }

  async getTaskComments(taskId: string): Promise<any[]> {
    // Implementation for getting task comments
    console.log('Get task comments not fully implemented in local storage');
    return [];
  }

  getApprovalsByChild(childId: string): TaskApproval[] {
    // Implementation for getting approvals by child
    console.log('Get approvals by child not fully implemented in local storage');
    return [];
  }

  async submitApprovalEvidence(approvalId: string, evidenceUrl: string, evidenceType: 'image' | 'document' | 'text'): Promise<void> {
    // Implementation for submitting approval evidence
    console.log('Submit approval evidence not fully implemented in local storage');
  }

  async uploadAndSubmitEvidence(approvalId: string, file: File, onProgress?: (progress: number) => void): Promise<void> {
    // Implementation for uploading and submitting evidence
    console.log('Upload and submit evidence not fully implemented in local storage');
  }

  async approveTaskCompletion(approvalId: string): Promise<void> {
    // Implementation for approving task completion
    console.log('Approve task completion not fully implemented in local storage');
  }

  async rejectTaskCompletion(approvalId: string, reason?: string): Promise<void> {
    // Implementation for rejecting task completion
    console.log('Reject task completion not fully implemented in local storage');
  }
}