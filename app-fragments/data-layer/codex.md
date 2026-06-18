# M00b — Data Layer — Codex

## C1. Behaviour inventory

The data layer is a passive interface layer. It has no event handlers — only CRUD methods. Each method maps 1:1 to a behaviour class method.

### Method: TaskRepository.create
- **Source:** src/data/TaskRepository.ts (interface) + Local/Firebase impls
- **Trigger:** behaviour.createTask() call (not yet wired)
- **Effect:** persists a new task; returns the persisted task with assigned id
- **State change:** underlying storage (localStorage key or Firestore doc)

### Method: ChatRepository.send
- **Source:** src/data/ChatRepository.ts
- **Trigger:** behaviour.sendChatMessage() call (not yet wired)
- **Effect:** persists a message
- **State change:** underlying storage

### Method: FamilyRepository.createChild
- **Source:** src/data/FamilyRepository.ts
- **Trigger:** behaviour.createChildProfile() call (not yet wired)
- **Effect:** persists a child profile
- **State change:** underlying storage

### Method: AuthRepository.signInWithGoogle
- **Source:** src/data/AuthRepository.ts + FirebaseAuthRepository.ts
- **Trigger:** user clicks "Sign in with Google"
- **Effect:** opens OAuth popup, returns User on success
- **State change:** Firebase auth state

## C2. State machine

### Stateless declaration (interfaces)
The interfaces are stateless — they describe a contract. State lives in the concrete implementations.

### Stateful (Local implementations)
LocalTaskRepository holds tasks in memory + mirrors to localStorage under key `dominicstasks.tasks.v1`. State transitions: read → memory cache hit; miss → localStorage read → cache.

### Stateful (Firebase implementations)
FirebaseAuthRepository uses Firebase's onAuthStateChanged observable. State: `currentUser: User | null`.

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| localStorage.setItem | TaskRepository.create/update/delete | persist | key=`tasks.v1`, value=JSON |
| Firebase Firestore write | TaskRepository.create/update/delete | persist | collection='tasks', doc=id |
| OAuth popup | AuthRepository.signInWithGoogle | auth flow | Google OAuth response |
| onAuthStateChanged listener | FirebaseAuthRepository.init | auth state sync | User \| null |

## C4. Input validation

### Input: task object passed to TaskRepository.create
- **Type:** Omit<Task, 'id'>
- **Valid range:** must have title (non-empty), status (one of pending/in_progress/done/cancelled), priority, type, section
- **Default:** none — caller must supply
- **Invalid input behaviour:** Firebase impl uses Firestore schema validation; Local impl does not validate (trusts caller)

## C5. Failure modes

### Failure: localStorage quota exceeded
- **Trigger:** LocalTaskRepository persists when localStorage is full
- **Detection:** QuotaExceededError thrown
- **Recovery:** none — currently bubbles up
- **User-visible behaviour:** task appears to fail; no error UI

### Failure: Firebase offline
- **Trigger:** FirebaseTaskRepository write while offline
- **Detection:** SDK retries automatically
- **Recovery:** eventual consistency when online
- **User-visible behaviour:** optimistic UI updates immediately, sync when online

## C6. User simulation list

Not directly user-simulable — the data layer is invoked through behaviour classes, which are invoked through UI components. Test through Tasks UI (M01) and Chat UI (M02).

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md (this file) + codex.md + TypeScript
- **Expected output:** a LocalTaskRepository that round-trips a task to localStorage
- **Acceptance criteria:** create(task) → getById(id) returns the same task
- **Module class:** A (self-contained, no behaviour)

### Test result
- [ ] Manual: data-layer round-trip test — see app-vp/validity/data-layer.spec.ts (planned)

## C8. Shape matrix

Not applicable — no shape-polymorphism.
