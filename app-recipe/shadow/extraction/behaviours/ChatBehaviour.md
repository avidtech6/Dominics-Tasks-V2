=== Behaviour: ChatBehaviour ===
**Source:** src/behaviours/ChatBehaviour.ts

## Public methods

```typescript
  subscribe(callback: (event: any) => void): () => void {
    return () => this.subscribers.delete(callback);
  private notify(event: any) {
  async getChatMessages(): Promise<ChatMessage[]> {
  getMessagesSync(): ChatMessage[] {
  async sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
```
