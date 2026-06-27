/**
 * useVibeCardState — substrate hook from FreshCards.
 *
 * Source: avidtech6/freshvibestudio/modules/freshcards/src/ui/components/cockpit/VibeCard/useVibeCardState.ts
 *
 * 5-state card lifecycle:
 *   dormant   — default, at rest
 *   active    — hover/selected, ready for action
 *   expanded  — clicked, full details
 *   peeked    — open in side peek panel
 *   filtered  — currently being filtered out (muted)
 *   grouped   — currently part of a group/cluster
 *
 * Transitions are enforced — illegal transitions (e.g. dormant → peeked)
 * are rejected. The substrate makes every card's state explicit so the
 * UI can render correctly without ad-hoc boolean flags.
 *
 * Usage:
 *   const card = useVibeCardState(task.id, 'dormant');
 *   <div className={card.isActive ? 'ring' : ''} onClick={() => card.transition('active')}>
 */

import { useCallback, useMemo, useState } from 'react';

export type VibeCardState =
  | 'dormant' | 'active' | 'expanded' | 'peeked' | 'filtered' | 'grouped';

/** Allowed transitions from each state. */
const TRANSITIONS: Record<VibeCardState, VibeCardState[]> = {
  dormant:  ['active', 'filtered', 'grouped'],
  active:   ['dormant', 'expanded', 'peeked'],
  expanded: ['active', 'peeked'],
  peeked:   ['active', 'expanded'],
  filtered: ['dormant', 'active'],
  grouped:  ['dormant', 'active'],
};

export interface VibeCardStateApi {
  cardId: string;
  state: VibeCardState;
  isActive: boolean;
  isPeeked: boolean;
  isExpanded: boolean;
  isFiltered: boolean;
  isGrouped: boolean;
  isDormant: boolean;
  transition: (next: VibeCardState) => void;
  /** Returns true if the requested transition is legal. */
  canTransition: (next: VibeCardState) => boolean;
}

export function useVibeCardState(
  cardId: string,
  initial: VibeCardState = 'dormant'
): VibeCardStateApi {
  const [state, setState] = useState<VibeCardState>(initial);

  const canTransition = useCallback(
    (next: VibeCardState) => TRANSITIONS[state].includes(next),
    [state]
  );

  const transition = useCallback(
    (next: VibeCardState) => {
      setState((curr) => (TRANSITIONS[curr].includes(next) ? next : curr));
    },
    []
  );

  return useMemo(
    () => ({
      cardId,
      state,
      isActive: state === 'active',
      isPeeked: state === 'peeked',
      isExpanded: state === 'expanded',
      isFiltered: state === 'filtered',
      isGrouped: state === 'grouped',
      isDormant: state === 'dormant',
      transition,
      canTransition,
    }),
    [cardId, state, transition, canTransition]
  );
}
