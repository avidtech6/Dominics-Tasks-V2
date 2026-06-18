/**
 * Validity tests for M02-family-chat — ChatBehaviour
 *
 * Source: src/behaviours/ChatBehaviour.ts
 * Recipe: app-fragments/family-chat/
 */

import { ChatBehaviour } from '../../src/behaviours/ChatBehaviour';

describe('ChatBehaviour — validity', () => {
  let cb: ChatBehaviour;

  beforeEach(() => {
    cb = new ChatBehaviour();
  });

  // C2: initial state has 10 seed messages
  it('starts with 10 seed messages (commit 54cd9152)', () => {
    const msgs = cb.getMessagesSync();
    expect(msgs).toHaveLength(10);
    expect(msgs[0].id).toBe('seed_1');
    expect(msgs[9].id).toBe('seed_10');
  });

  // C1: sendChatMessage
  it('appends a message and notifies', async () => {
    const events: any[] = [];
    cb.subscribe(e => events.push(e));

    const m = await cb.sendChatMessage({
      familyId: 'demo',
      userId: 'u1',
      userName: 'Test',
      content: 'hello',
      type: 'text',
    } as any);

    expect(m.id).toMatch(/^msg_\d+_[a-z0-9]+$/);
    expect(cb.getMessagesSync()).toHaveLength(11);
    expect(events).toContainEqual(expect.objectContaining({ type: 'message_sent' }));
  });

  // C6: user simulation
  it('user can read + send (C6)', async () => {
    const initial = cb.getMessagesSync();
    expect(initial.length).toBeGreaterThan(0);

    await cb.sendChatMessage({
      familyId: 'demo', userId: 'u1', userName: 'T',
      content: 'new', type: 'text',
    } as any);

    const after = cb.getMessagesSync();
    expect(after.length).toBe(initial.length + 1);
  });
});
