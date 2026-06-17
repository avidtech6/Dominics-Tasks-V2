import { User } from '../data/types';

export class AuthBehaviour {
  private subscribers: Set<(event: any) => void> = new Set();

  subscribe(callback: (event: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(event: any) {
    this.subscribers.forEach(cb => cb(event));
  }

  async getCurrentUser(): Promise<User> {
    return {
      id: 'user_default',
      email: 'user@example.com',
      name: 'Default User',
      color: '#3B82F6',
      role: 'parent' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async exitParentMode(): Promise<void> {
    // Placeholder implementation
    console.log('Exiting parent mode');
  }

  async setupParentPin(pin: string): Promise<void> {
    // Placeholder implementation
    console.log('Setting up parent pin:', pin);
  }
}
