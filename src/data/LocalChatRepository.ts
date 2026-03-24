import { Message, Attachment } from '../types';
import { ChatRepository } from './ChatRepository';

/**
 * LocalStorage-backed ChatRepository
 * Implements the interface with localStorage-based logic
 */
export class LocalChatRepository implements ChatRepository {
  private readonly storageKey = 'dominicstasks_messages';

  async addMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const newMessage: Message = {
      id: messageId,
      ...message,
      timestamp: new Date(timestamp)
    };

    const messages = await this.getAllMessages();
    messages.push(newMessage);
    this.saveMessages(messages);

    return messageId;
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<void> {
    const messages = await this.getAllMessages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      throw new Error(`Message with ID ${messageId} not found`);
    }

    messages[messageIndex] = {
      ...messages[messageIndex],
      ...updates,
      timestamp: new Date().toISOString()
    };

    this.saveMessages(messages);
  }

  async deleteMessage(messageId: string): Promise<void> {
    const messages = await this.getAllMessages();
    const filteredMessages = messages.filter(msg => msg.id !== messageId);
    
    if (filteredMessages.length === messages.length) {
      throw new Error(`Message with ID ${messageId} not found`);
    }

    this.saveMessages(filteredMessages);
  }

  async getMessage(messageId: string): Promise<Message | null> {
    const messages = await this.getAllMessages();
    return messages.find(msg => msg.id === messageId) || null;
  }

  subscribeToMessages(callback: (messages: Message[]) => void): () => void {
    // For localStorage, we'll just return a no-op unsubscribe function
    // In a real implementation, this would handle real-time updates
    callback([]);
    return () => {};
  }

  async getMessages(limit?: number): Promise<Message[]> {
    const messages = await this.getAllMessages();
    // Sort by timestamp newest first
    const sortedMessages = messages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return limit ? sortedMessages.slice(0, limit) : sortedMessages;
  }

  async getMessagesByDateRange(startDate: Date, endDate: Date): Promise<Message[]> {
    const messages = await this.getAllMessages();
    const filteredMessages = messages.filter(msg => {
      const messageDate = new Date(msg.timestamp);
      return messageDate >= startDate && messageDate <= endDate;
    });
    
    return filteredMessages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async uploadAttachment(
    file: File, 
    context: string, 
    messageId: string, 
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; fileType: string }> {
    // For localStorage, we'll return a mock URL
    // In a real implementation, this would upload to Firebase Storage
    
    if (onProgress) {
      onProgress(100);
    }

    const fileType = this.getFileType(file.name);
    const mockUrl = `data:${file.type};base64,${'mock-base64-data'}`;
    
    return { url: mockUrl, fileType };
  }

  private async getAllMessages(): Promise<Message[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
      return [];
    }
  }

  private saveMessages(messages: Message[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
      throw new Error('Failed to save messages');
    }
  }

  private getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return 'video';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
    if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) return 'audio';
    return 'unknown';
  }
}

/**
 * Factory function to create a LocalChatRepository instance
 */
export const createLocalChatRepository = (): LocalChatRepository => {
  return new LocalChatRepository();
};