# M04 — Authentication

## A. Product Description

Authenticate users via Firebase Google OAuth. Currently the auth gate is **disabled** (per commit `54cd9152` and the `ProtectedPage` no-op in orchestrator) — the app renders without checking auth state.

- **Source:**
  - UI: `src/pages/LandingPage.tsx`, `src/pages/Login.tsx`
  - Behaviour: `src/behaviours/AuthBehaviour.ts`
  - Repository: `src/data/AuthRepository.ts`, `src/data/FirebaseAuthRepository.ts`

## B. Structural Contract

### Behaviour interface

```ts
class AuthBehaviour {
  subscribe(cb): () => void;
  getCurrentUser(): Promise<User>;
  exitParentMode(): Promise<void>;
  setupParentPin(pin: string): Promise<void>;
}
```

### Default user (when auth disabled)

```ts
{
  id: 'user_default',
  email: 'user@example.com',
  name: 'Default User',
  color: '#3B82F6',
  role: 'parent',
  createdAt: Date,
  updatedAt: Date,
}
```

## C. Reconstruction Notes

- Auth is conceptual — the real auth flow goes through FirebaseAuthRepository which is wired to Firebase SDK.
- Currently NO component calls AuthBehaviour methods; auth is a future feature.
- The OAuth intercept script in index.html exists but only fires on URL params.
