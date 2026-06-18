# M00b — Data Layer

## A. Product Description

The data layer abstracts persistence behind a Repository interface. Two implementations exist per repository: LocalStorage and Firebase. The orchestrator picks which to instantiate based on environment.

- **Source:** `src/data/`
- **Pattern:** Repository (interface) + 2 concrete impls (Local + Firebase)
- **Purpose:** swap persistence without changing behaviour classes

## B. Structural Contract

### Interfaces (one per domain)

```ts
interface TaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(task: Omit<Task, 'id'>): Promise<Task>;
  update(id: string, updates: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
  // ... domain-specific
}

interface ChatRepository {
  getMessages(familyId: string): Promise<ChatMessage[]>;
  send(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;
}

interface FamilyRepository {
  getFamily(): Promise<Family>;
  getProfiles(familyId: string): Promise<Profile[]>;
  createChild(name: string, avatar: string, color: string): Promise<Profile>;
  deleteChild(id: string): Promise<void>;
}

interface AuthRepository {
  getCurrentUser(): Promise<User | null>;
  signInWithGoogle(): Promise<User>;
  signOut(): Promise<void>;
}
```

### Implementations

For each interface, two files:
- `Local{...}Repository.ts` — uses `localStorage` or in-memory
- `Firebase{...}Repository.ts` — uses Firebase SDK (auth, firestore)

### Swap-test

Instantiate a `LocalTaskRepository` instead of `FirebaseTaskRepository` — the app should work identically except that data doesn't sync across devices.

## C. Reconstruction Notes

- The behaviour classes (TaskBehaviour, ChatBehaviour, FamilyBehaviour, AuthBehaviour) ARE wired to localStorage via `StorageAdapter`. State survives page reload.
- The wire-up happened in commit `0ce09d80` (post-FWV v8 refactor, v0.1.0).
- The typed `Repository` interfaces in `src/data/*.ts` still exist but are NOT used at runtime — they document the eventual cloud-sync shape. StorageAdapter is the pragmatic bridge (write-through cache + persistence + pub/sub) that avoids invasive UI changes.
- Future: swap StorageAdapter's localStorage calls for Firebase calls to get cloud sync. Behaviour signatures won't change.

### Storage keys (localStorage)

| Key | Owner | Shape |
|---|---|---|
| `dominicstasks.tasks.v2` | TaskBehaviour | Task[] |
| `dominicstasks.messages.v2` | ChatBehaviour | ChatMessage[] (10 seed on first load) |
| `dominicstasks.family.v2` | FamilyBehaviour | Profile[] |
| `dominicstasks.family.object.v2` | FamilyBehaviour | Family singleton |
| `dominicstasks.user.v2` | AuthBehaviour | User singleton |
| `dominicstasks.parentpin.v2` | AuthBehaviour | string (plain text in dev, hash in prod) |

### Async load pattern

Every Behaviour exposes `whenReady(): Promise<void>` that resolves after initial load completes. AppOrchestrator awaits all four before rendering. UI components can rely on `getXxxSync()` returning populated data on first render.
