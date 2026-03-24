import { Task, TaskSection, TaskStatus, TaskPriority, TaskType, MirroredTask } from '../data/types';
import type { TaskSection as TaskSectionType } from '../components/taskConstants';

export class TaskBehaviour {
  private tasks: Task[] = [];
  private subscribers: Set<(event: any) => void> = new Set();

  subscribe(callback: (event: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(event: any) {
    this.subscribers.forEach(cb => cb(event));
  }

  getTasksSync(): Task[] {
    return [...this.tasks];
  }

  async getTasks(): Promise<Task[]> {
    return this.getTasksSync();
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.unshift(newTask);
    this.notify({ type: 'task_created', task: newTask });
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task ${id} not found`);
    }
    const updatedTask = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.tasks[index] = updatedTask;
    this.notify({ type: 'task_updated', task: updatedTask });
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task ${id} not found`);
    }
    const taskToDelete = this.tasks[index];
    taskToDelete.status = 'cancelled' as TaskStatus;
    this.notify({ type: 'task_deleted', task: taskToDelete });
  }

  async completeTask(id: string): Promise<Task> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task ${id} not found`);
    }
    const updatedTask = {
      ...this.tasks[index],
      status: 'done' as TaskStatus,
      completedAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks[index] = updatedTask;
    this.notify({ type: 'task_updated', task: updatedTask });
    return updatedTask;
  }

  async getMirroredTasks(): Promise<MirroredTask[]> {
    return this.tasks.filter(t => t.section === 'assignments' || t.section === 'leftovers')
      .map(t => ({ ...t, isMirrored: true, originalTaskId: t.id }));
  }
}
