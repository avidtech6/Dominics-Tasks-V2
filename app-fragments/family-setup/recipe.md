# M03 — Family Setup & Profiles

## A. Product Description

First-run family creation and child profile selection. The FamilySetupScreen captures family name + parent PIN, then ProfileSelectionScreen lets users pick a child profile (or enter parent mode).

- **Source:**
  - UI: `src/components/FamilySetupScreen.tsx`, `src/components/ProfileSelectionScreen.tsx`
  - Behaviour: `src/behaviours/FamilyBehaviour.ts`, paired Behaviour hooks
- **Surfaces:** `/setup`, `/profile-select`

## B. Structural Contract

### Family state

```ts
family: Family = {
  id: 'family_default',
  name: 'Default Family',
  parentId: 'parent_default',
  childIds: [],
  createdAt: Date,
  updatedAt: Date,
}
```

### Profile state

```ts
profiles: Profile[] = []  // child profiles
```

### Methods

```ts
getFamily(): Promise<Family>
getProfiles(): Promise<Profile[]>
getCurrentUser(): Promise<User>
loadFamily(): Promise<Family>
createChildProfile(name, avatar, color): Promise<Profile>
deleteChildProfile(id): Promise<void>
updateParentSettings(settings): Promise<void>
```

## C. Reconstruction Notes

- Initial family is hardcoded `family_default` — there's no real persistence.
- `createChildProfile` pushes to profiles array AND adds to `family.childIds`.
- The PIN system is conceptual; `setupParentPin` logs only.
