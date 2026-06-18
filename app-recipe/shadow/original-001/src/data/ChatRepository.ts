import { Message, Attachment } from '../types';

/**
 * Repository interface for chat operations
 * Abstracts Firebase chat functionality behind clean interfaces
 */
export interface ChatRepository {
  // Message operations
  addMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<string>;
  updateMessage(messageId: string, updates: Partial<Message>): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  getMessage(messageId: string): Promise<Message | null>;
  
  // Real-time subscriptions
  subscribeToMessages(callback: (messages: Message[]) => void): () => void;
  
  // Attachment operations
  uploadAttachment(file: File, context: string, messageId: string, onProgress?: (progress: number) => void): Promise<{ url: string; fileType: string }>;
  
  // Query operations
  getMessages(limit?: number): Promise<Message[]>;
  getMessagesByDateRange(startDate: Date, endDate: Date): Promise<Message[]>;
}