import { ChatMessage } from '../data/types';

export class ChatBehaviour {
  private messages: ChatMessage[] = [];
  private subscribers: Set<(event: any) => void> = new Set();

  subscribe(callback: (event: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(event: any) {
    this.subscribers.forEach(cb => cb(event));
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return [...this.messages];
  }

  async sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    this.messages.push(newMessage);
    this.notify({ type: 'message_sent', message: newMessage });
    return newMessage;
  }
}
