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

- The behaviour classes (TaskBehaviour, ChatBehaviour, FamilyBehaviour, AuthBehaviour) currently **do NOT use the repository abstraction** — they hold state in-memory. The data layer files exist but are unused at the moment.
- This is a known half-extraction: the abstraction is built, the wiring isn't. Phase 3 of this refactor does NOT wire behaviour → repository (that's a future refactor).
- Documented for portability — when behaviour classes ARE wired to repositories, the swap-test above becomes meaningful.
