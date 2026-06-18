/**
 * Validity tests for M04-auth — AuthBehaviour
 *
 * Source: src/behaviours/AuthBehaviour.ts
 *
 * Note: AuthBehaviour is mostly placeholder. Tests verify shape.
 */

import { AuthBehaviour } from '../../src/behaviours/AuthBehaviour';

describe('AuthBehaviour — validity', () => {
  let ab: AuthBehaviour;

  beforeEach(() => {
    ab = new AuthBehaviour();
  });

  it('getCurrentUser returns a default user (auth disabled)', async () => {
    const u = await ab.getCurrentUser();
    expect(u.id).toBe('user_default');
    expect(u.role).toBe('parent');
  });

  it('exitParentMode is a no-op (placeholder)', async () => {
    await expect(ab.exitParentMode()).resolves.toBeUndefined();
  });

  it('setupParentPin is a no-op (placeholder)', async () => {
    await expect(ab.setupParentPin('1234')).resolves.toBeUndefined();
  });

  it('subscribe returns unsubscribe fn (C1)', () => {
    const cb = jest.fn();
    const unsub = ab.subscribe(cb);
    expect(typeof unsub).toBe('function');
    unsub();
  });
});
