# M09 — Parent Dashboard

## A. Product Description

Parent-only admin surface. Currently PIN-gate is **disabled** (ParentPinModal returns null per commit `54cd9152`).

- **Source:**
  - UI: `src/components/ParentDashboard.tsx`, `src/components/ParentPinModal.tsx`, `src/components/PinPad.tsx`
  - Behaviour: ParentPinModal hooks, PinPad hooks

## B. Structural Contract

### Surfaces
- `/admin` → ParentDashboard (currently no PIN check)

### PIN flow (when enabled)
- User enters PIN via PinPad
- ParentPinModal validates against `family.parentPin`
- On success → render dashboard; on fail → show error

### Dashboard content
- Pending task approvals (placeholder — getPendingApprovals returns [])
- Family settings
- Logout

## C. Reconstruction Notes

- The PIN gate is currently disabled; the modal exists but does not block render.
- The approval workflow is a placeholder.
