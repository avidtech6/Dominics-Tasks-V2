import { Task, TaskStatus, TaskSection, TaskApproval } from '../types';
import { TaskRepository } from './TaskRepository';

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
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === targetDate.getTime();
    });
  }

  getTasksByDeadline(): Task[] {
    const tasks = this.getStoredTasks();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const deadline = new Date(task.dueDate);
      return deadline <= today && task.status !== 'done';
    });
  }

  getOverdueTasks(): Task[] {
    const tasks = this.getStoredTasks();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const deadline = new Date(task.dueDate);
      return deadline < today && task.status !== 'done';
    });
  }

  getHistoryTasks(): Task[] {
    return this.getStoredTasks().filter(task => task.status === 'pending_approval');
  }

  getDeletedTasks(): Task[] {
    // In local storage, deleted tasks are removed, so return empty array
    return [];
  }

  getCompletedTodayTasks(): Task[] {
    const tasks = this.getStoredTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter(task => {
      if (task.status !== 'done') return false;
      const completedDate = new Date(task.completedAt || task.createdAt);
      return completedDate >= today && completedDate < tomorrow;
    });
  }

  async addTaskComment(taskId: string, taskTitle: string, text: string): Promise<void> {
    // Implementation for adding comments
    console.log('Add task comment not fully implemented in local storage');
  }

  async getTaskComments(taskId: string): Promise<any[]> {
    // Implementation for getting comments
    return [];
  }

  getApprovalsByChild(childId: string): TaskApproval[] {
    // Implementation for getting approvals by child
    return [];
  }

  async submitApprovalEvidence(approvalId: string, evidenceUrl: string, evidenceType: 'image' | 'document' | 'text'): Promise<void> {
    // Implementation for submitting evidence
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

// Factory function for creating LocalTaskRepository
export const createLocalTaskRepository = (): TaskRepository => {
  return new LocalTaskRepository();
};