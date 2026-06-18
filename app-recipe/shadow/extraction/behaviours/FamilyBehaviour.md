=== Behaviour: FamilyBehaviour ===
**Source:** src/behaviours/FamilyBehaviour.ts

## Public methods

```typescript
  subscribe(callback: (event: any) => void): () => void {
    return () => this.subscribers.delete(callback);
  private notify(event: any) {
  async getFamily(): Promise<Family> {
  async getProfiles(): Promise<Profile[]> {
  async getCurrentUser(): Promise<User> {
  async loadFamily(): Promise<Family> {
  async createChildProfile(name: string, avatar: string, color: string): Promise<Profile> {
  async deleteChildProfile(childId: string): Promise<void> {
    if (index === -1) {
  async updateParentSettings(settings: any): Promise<void> {
```
