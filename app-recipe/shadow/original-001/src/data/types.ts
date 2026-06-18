// Type definitions for the application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  role: 'parent' | 'child';
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  parentId: string;
  childIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  userId: string;
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  section: TaskSection;
  assigneeId?: string;
  assigneeName?: string;
  creatorId: string;
  creatorName: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  mirroredTaskId?: string;
  taskType?: TaskType;
  deadlineDate?: Date;
  pointsValue?: number;
  commentCount?: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  familyId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  metadata?: any;
}

export interface PrivateMessage {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  edited?: boolean;
  reactions?: Record<string, string[]>;
  attachments?: Attachment[];
  conversationId?: string;
  senderId?: string;
  senderName?: string;
  text?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  title?: string;
  fileType?: 'image' | 'video' | 'document' | 'audio';
}

export interface MirroredTask {
  id: string;
  originalTaskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  section: TaskSection;
  assigneeId?: string;
  assigneeName?: string;
  creatorId: string;
  creatorName: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  originalDueDate?: Date;
  originalCompletedAt?: Date;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DONE = 'done',
  PENDING_APPROVAL = 'pending_approval',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskType {
  CHORE = 'chore',
  HOMEWORK = 'homework',
  PERSONAL = 'personal',
  FAMILY = 'family',
}

export type TaskSection = 'morning' | 'afternoon' | 'evening' | 'assignments' | 'leftovers' | 'experiments' | 'support' | 'gaming' | 'reading' | 'creative' | 'music' | 'catchup';

// Approval levels
export const APPROVAL_LEVELS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

// Child avatars and colors
export const CHILD_AVATARS = ['🦁', '🐯', '🐻', '🐼', '🐨', '🦊', '🐰', '🐸', '🐵', '🦄', '🐴', '🦋', '🐝', '🐢', '🦀', '🦖', '🦕', '🦘', '🦩', '🦚', '🦜', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥'] as const;

export const CHILD_THEME_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F97316', '#84CC16', '#06B6D4', '#A855F7', '#F43F5E',
  '#0EA5E9', '#22C55E', '#EAB308', '#DC2626', '#7C3AED', '#DB2777',
  '#0D9488', '#EA580C', '#65A30D', '#0891B2', '#9333EA', '#E11D48',
  '#0284C7', '#16A34A', '#CA8A04', '#B91C1C', '#6D28D9', '#BE123C'
] as const;

// Gmail avatar helper
export const GMAIL_AVATAR = {
  DEFAULT: '👤',
  SIZE: 40,
  COLORS: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
} as const;

export function isGmailAvatar(email: string): boolean {
  return email.includes('@gmail.com');
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
  criteria: {
    type: 'tasks_completed' | 'tasks_on_time' | 'streak' | 'specific_task';
    value: number;
    taskType?: TaskType;
  };
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'article' | 'video' | 'tool' | 'template';
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoryEntry {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_updated' | 'comment_added' | 'achievement_unlocked';
  userId: string;
  userName: string;
  familyId: string;
  taskId?: string;
  details: any;
  timestamp: Date;
}

export interface BehaviourModule {
  getTasksSync(): Task[];
  getTasks(): Promise<Task[]>;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  completeTask(id: string): Promise<Task>;
  getMirroredTasks(): Promise<MirroredTask[]>;
  getChatMessages(): Promise<ChatMessage[]>;
  sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage>;
  getFamily(): Promise<Family>;
  getProfiles(): Promise<Profile[]>;
  getCurrentUser(): Promise<User>;
  subscribe(callback: (event: any) => void): () => void;
}

export interface TaskBehaviour extends BehaviourModule {
  // Task-specific methods
  getTasksSync(): Task[];
  getTasks(): Promise<Task[]>;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  completeTask(id: string): Promise<Task>;
  getMirroredTasks(): Promise<MirroredTask[]>;
  subscribe(callback: (event: any) => void): () => void;
}

export interface ChatBehaviour extends BehaviourModule {
  // Chat-specific methods
  getChatMessages(): Promise<ChatMessage[]>;
  sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage>;
}

export interface FamilyBehaviour extends BehaviourModule {
  // Family-specific methods
  getFamily(): Promise<Family>;
  getProfiles(): Promise<Profile[]>;
}

export interface AuthBehaviour extends BehaviourModule {
  // Auth-specific methods
  getCurrentUser(): Promise<User>;
}