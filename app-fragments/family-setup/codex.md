# M03 — Family Setup — Codex

## C1. Behaviour inventory

### Handler: createChildProfile
- **Source:** src/behaviours/FamilyBehaviour.ts:62-78
- **Trigger:** FamilySetupScreen / ProfileSelectionScreen "Add child"
- **Effect:** generates id, pushes to profiles, adds to family.childIds, notifies
- **State change:** profiles array, family.childIds

### Handler: deleteChildProfile
- **Source:** src/behaviours/FamilyBehaviour.ts:80-92
- **Trigger:** profile management UI
- **Effect:** splices from profiles, removes from family.childIds, notifies
- **State change:** profiles array, family.childIds
- **Failure:** throws `Profile ${id} not found`

### Handler: updateParentSettings
- **Source:** src/behaviours/FamilyBehaviour.ts:94-101
- **Trigger:** parent settings UI
- **Effect:** spreads settings into family, sets updatedAt, notifies
- **State change:** family object

## C2. State machine

### States
- `family: Family` (single object)
- `profiles: Profile[]`
- `subscribers: Set`

### Initial state
- Family: hardcoded `family_default`
- Profiles: empty array

## C3. Side effects

| Side effect | When | Behaviour | Payload |
|---|---|---|---|
| Subscribers notified | createChildProfile / deleteChildProfile / updateParentSettings | change event | `{ type, profile\|family }` |

## C4. Input validation

### Input: name in createChildProfile
- **Type:** string
- **Valid range:** non-empty
- **Default:** none
- **Invalid input behaviour:** no validation

## C5. Failure modes

### Failure: deleteChildProfile with bad id
- **Trigger:** caller passes id not in profiles
- **Detection:** findIndex returns -1
- **Recovery:** throws

## C6. User simulation list

### Action: Navigate to /setup
- **Trigger:** browser URL
- **Expected outcome:** FamilySetupScreen renders
- **DOM change:** setup form renders
- **State change:** none

### Action: Navigate to /profile-select
- **Trigger:** browser URL
- **Expected outcome:** ProfileSelectionScreen renders with empty child list
- **DOM change:** profile picker renders

## C7. Reproducibility test

### Procedure
- **Minimal context:** recipe.md + FamilyBehaviour class
- **Expected output:** setup screen renders, profile select renders
- **Acceptance criteria:** both routes resolve
- **Module class:** A

### Test result
- [ ] Reproducibility test passed on 2026-06-18 by Mavis (mavis)

## C8. Shape matrix

Not applicable — single render tree per screen.
