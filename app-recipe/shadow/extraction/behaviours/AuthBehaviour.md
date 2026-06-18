=== Behaviour: AuthBehaviour ===
**Source:** src/behaviours/AuthBehaviour.ts

## Public methods

```typescript
  subscribe(callback: (event: any) => void): () => void {
    return () => this.subscribers.delete(callback);
  private notify(event: any) {
  async getCurrentUser(): Promise<User> {
  async exitParentMode(): Promise<void> {
  async setupParentPin(pin: string): Promise<void> {
```
