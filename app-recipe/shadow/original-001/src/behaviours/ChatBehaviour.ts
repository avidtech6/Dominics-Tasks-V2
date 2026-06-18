import { ChatMessage } from '../data/types';

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'seed_1',
    familyId: 'demo',
    senderId: 'dev@parent.com',
    senderName: 'Dev User',
    senderEmail: 'dev@parent.com',
    text: 'Morning! How did everyone sleep?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    type: 'user',
    edited: false,
    reactions: {},
    attachments: [],
  },
  {
    id: 'seed_2',
    familyId: 'demo',
    senderId: 'child_a@family',
    senderName: 'Child A',
    senderEmail: 'child_a@family',
    text: 'Good! I finished the maths worksheet last night 📚',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.7),
    type: 'user',
    edited: false,
    reactions: { '👍': ['dev@parent.com'] },
    attachments: [],
  },
  {
    id: 'seed_3',
    familyId: 'demo',
    senderId: 'child_b@family',
    senderName: 'Child B',
    senderEmail: 'child_b@family',
    text: 'Same. Can someone remind me what time piano is?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.5),
    type: 'user',
    edited: false,
    reactions: {},
    attachments: [],
  },
  {
    id: 'seed_4',
    familyId: 'demo',
    senderId: 'parent_b@family',
    senderName: 'Parent B',
    senderEmail: 'parent_b@family',
    text: 'Piano is at 4pm today. I added it to your tasks.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.4),
    type: 'user',
    edited: false,
    reactions: { '❤️': ['child_b@family', 'child_a@family'] },
    attachments: [],
  },
  {
    id: 'seed_5',
    familyId: 'demo',
    senderId: 'child_a@family',
    senderName: 'Child A',
    senderEmail: 'child_a@family',
    text: 'Thanks!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.3),
    type: 'user',
    edited: false,
    reactions: {},
    attachments: [],
  },
  {
    id: 'seed_6',
    familyId: 'demo',
    senderId: 'dev@parent.com',
    senderName: 'Dev User',
    senderEmail: 'dev@parent.com',
    text: "Don't forget to log your reading tonight before bed.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    type: 'user',
    edited: false,
    reactions: {},
    attachments: [],
  },
  {
    id: 'seed_7',
    familyId: 'demo',
    senderId: 'child_b@family',
    senderName: 'Child B',
    senderEmail: 'child_b@family',
    text: 'I finished the bins, did you see?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
    type: 'user',
    edited: false,
    reactions: {},
    attachments: [],
  },
  {
    id: 'seed_8',
    familyId: 'demo',
    senderId: 'parent_b@family',
    senderName: 'Parent B',
    senderEmail: 'parent_b@family',
    text: 'Yes! Big tick. I approved it.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.4),
    type: 'user',
    edited: false,
    reactions: {},
    attachments: [],
  },
  {
    id: 'seed_9',
    familyId: 'demo',
    senderId: 'child_a@family',
    senderName: 'Child A',
    senderEmail: 'child_a@family',
    text: 'Can we get pizza for dinner?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    type: 'user',
    edited: false,
    reactions: {},
    attachments: [],
  },
  {
    id: 'seed_10',
    familyId: 'demo',
    senderId: 'dev@parent.com',
    senderName: 'Dev User',
    senderEmail: 'dev@parent.com',
    text: 'Maybe Friday if you both finish your tasks.',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    type: 'user',
    edited: false,
    reactions: { '🎉': ['child_a@family', 'child_b@family'] },
    attachments: [],
  },
];

export class ChatBehaviour {
  private messages: ChatMessage[] = [...SEED_MESSAGES];
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

  getMessagesSync(): ChatMessage[] {
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
