=== Behaviour: TaskBehaviour ===
**Source:** src/behaviours/TaskBehaviour.ts

## Public methods

```typescript
  subscribe(callback: (event: any) => void): () => void {
    return () => this.subscribers.delete(callback);
  private notify(event: any) {
  getTasksSync(): Task[] {
  async getTasks(): Promise<Task[]> {
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (index === -1) {
  async deleteTask(id: string): Promise<void> {
    if (index === -1) {
  async completeTask(id: string): Promise<Task> {
    if (index === -1) {
  async getMirroredTasks(): Promise<MirroredTask[]> {
  async getPendingApprovals(): Promise<any[]> {
  async approveTaskCompletion(approvalId: string): Promise<void> {
  async rejectTaskCompletion(approvalId: string, reason?: string): Promise<void> {
  async restoreDeletedTasks(): Promise<number> {
  getDeletedTasks(): Task[] {
```
