/**
 * Validity tests for M03-family-setup — FamilyBehaviour
 *
 * Source: src/behaviours/FamilyBehaviour.ts
 */

import { FamilyBehaviour } from '../../src/behaviours/FamilyBehaviour';

describe('FamilyBehaviour — validity', () => {
  let fb: FamilyBehaviour;

  beforeEach(() => {
    fb = new FamilyBehaviour();
  });

  it('starts with default family + empty profiles', async () => {
    const family = await fb.getFamily();
    const profiles = await fb.getProfiles();
    expect(family.id).toBe('family_default');
    expect(profiles).toEqual([]);
  });

  it('createChildProfile adds profile + childId', async () => {
    const p = await fb.createChildProfile('Alice', 'avatar1', '#FF0000');
    expect(p.name).toBe('Alice');
    const profiles = await fb.getProfiles();
    const family = await fb.getFamily();
    expect(profiles).toHaveLength(1);
    expect(family.childIds).toContain(p.id);
  });

  it('deleteChildProfile removes profile (C5: throws if not found)', async () => {
    const p = await fb.createChildProfile('Bob', 'a2', '#00FF00');
    await fb.deleteChildProfile(p.id);
    expect(await fb.getProfiles()).toHaveLength(0);
    await expect(fb.deleteChildProfile('nope')).rejects.toThrow(/not found/);
  });
});
