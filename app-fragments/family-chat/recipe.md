# M02 — Family Chat

## A. Product Description

Two chat surfaces: Family Chat (all family members) and Parent Chat (parent-private channel). Both render messages from ChatBehaviour, with seed data pre-loaded.

- **Source:**
  - UI: `src/pages/FamilyChat.tsx`, `src/pages/ParentChat.tsx`
  - Behaviour: `src/behaviours/ChatBehaviour.ts`
- **Surfaces:** `/chat` (Family Chat), `/parent-chat` (Parent Chat)
- **Seed data:** 10 messages pre-loaded (commit `54cd9152`)

## B. Structural Contract

### Behaviour interface

```ts
class ChatBehaviour {
  subscribe(cb): () => void;
  getChatMessages(): Promise<ChatMessage[]>;
  getMessagesSync(): ChatMessage[];  // synchronous accessor used by FamilyChat page
  sendChatMessage(msg: Omit<ChatMessage, 'id'|'timestamp'>): Promise<ChatMessage>;
}
```

### Initial state

```ts
private messages: ChatMessage[] = [...SEED_MESSAGES];  // 10 seeded messages
```

### Channels

- Family Chat: messages with `familyId='demo'` displayed
- Parent Chat: messages with `familyId='demo'` AND `senderRole='parent'` (or filter by sender — see codex C5)

## C. Reconstruction Notes

- `getMessagesSync` exists because the FamilyChat page calls it synchronously (commit `54cd9152` added this method).
- The seed data uses synthetic identities: `dev@parent.com`, `child_a@family`, `child_b@family`, `parent_b@family`.
- React UI subscribes via `subscribe()` and re-renders on `message_sent` events.
