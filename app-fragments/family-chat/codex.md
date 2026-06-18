# M02 — Family Chat — Codex

## C1. Behaviour inventory

### Handler: sendChatMessage
- **Source:** src/behaviours/ChatBehaviour.ts:130-138
- **Trigger:** chat input "Send"
- **Effect:** generates id (`msg_<ts>_<rand>`), appends to messages, notifies
- **State change:** messages array (push)

### Handler: getMessagesSync
- **Source:** src/behaviours/ChatBehaviour.ts:125-127
- **Trigger:** FamilyChat render
- **Effect:** returns shallow copy of messages
- **State change:** none

## C2. State machine

### States
- `messages: ChatMessage[]` — 10 seeded + any user-sent
- `subscribers: Set`

### Transitions
- `messages: [seed_1...seed_10]` → `messages: [...seed, msg_X]` on `sendChatMessage`
- notifies all subscribers with `{ type: 'message_sent', message: msg_X }`

### Initial state
- 10 seed messages loaded at construction time

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| Subscribers notified | sendChatMessage | message_sent event | `{ type, message }` |

## C4. Input validation

### Input: message in sendChatMessage
- **Type:** Omit<ChatMessage, 'id'|'timestamp'>
- **Valid range:** text non-empty; senderName, senderId present
- **Default:** none
- **Invalid input behaviour:** no validation

## C5. Failure modes

### Failure: Parent Chat filter ambiguity
- **Trigger:** filter parent-only messages
- **Detection:** seed data uses `senderEmail` ending in `@parent.com` or `parent_b@family` — no explicit `role` field on ChatMessage
- **Recovery:** ParentChat page filters by `senderEmail.includes('parent')`
- **User-visible behaviour:** parent-only messages render in ParentChat

## C6. User simulation list

### Action: Open /chat
- **Trigger:** navigate
- **Expected outcome:** 10 seed messages render
- **DOM change:** message bubbles render
- **State change:** none
- **Should NOT change:** messages array

### Action: Send a message
- **Trigger:** type in input + click Send
- **Expected outcome:** new message bubble appears
- **DOM change:** bubble prepended/append to message list
- **State change:** messages array

### Action: Open /parent-chat
- **Trigger:** navigate
- **Expected outcome:** filtered parent-only messages render
- **DOM change:** parent bubbles render
- **State change:** none

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + codex.md + ChatBehaviour class
- **Expected output:** FamilyChat renders 10 messages, ParentChat renders filtered set
- **Acceptance criteria:** both pages render without crash
- **Module class:** B

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis) — see deployed build at https://ahago45ksit8.space.minimax.io

## C8. Shape matrix

### Surface: family-chat
| view | mode=desktop | mode=mobile |
|---|---|---|
| family-chat | shell=scrollable, view=chat.html | shell=scrollable, view=chat.html |

No shape polymorphism — single column, scrollable.
