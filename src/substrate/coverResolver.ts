/**
 * Cover resolver — substrate piece from FreshCards.
 *
 * Source: avidtech6/freshvibestudio/modules/freshcards/src/ui/components/database/coverResolver.ts
 *
 * Resolves the cover image/gradient for a card:
 *   1. If item has an explicit 'cover' property → use it
 *   2. Else if the database has an 'image'-type property and the item has
 *      a value → use that
 *   3. Else fall back to a deterministic per-item gradient
 *
 * Used by TaskCard (and any future card component) to give every card
 * visual variety without needing real photos.
 */

import type { DatabaseItem, Database } from './Database';

/**
 * 12 deterministic gradient covers. Same palette used across the app
 * for visual consistency.
 */
export const COVER_GRADIENTS: string[] = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
];

/** Stable hash so the same id always gets the same gradient. */
export function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Pick a deterministic gradient for an id. */
export function getGradientForId(id: string): string {
  return COVER_GRADIENTS[hashId(id) % COVER_GRADIENTS.length];
}

/**
 * Resolve a cover for an item. Returns a CSS-ready value:
 * remote URL, data URL, or linear-gradient(...) string.
 */
export function resolveCover(item: DatabaseItem, database?: Database): string {
  // 1. Explicit 'cover' property
  const coverProp = item.properties.find(p => p.propertyId === 'cover');
  if (coverProp?.value != null) {
    const v = String(coverProp.value);
    if (v) return v;
  }
  // 2. First 'image'-type property in schema
  if (database?.schema?.properties) {
    const imagePropDef = database.schema.properties.find(p => p.type === 'image');
    if (imagePropDef) {
      const imageProp = item.properties.find(p => p.propertyId === imagePropDef.id);
      if (imageProp?.value != null) {
        const v = String(imageProp.value);
        if (v) return v;
      }
    }
  }
  // 3. Fallback gradient
  return getGradientForId(item.id);
}

export type CoverKind = 'remote' | 'data' | 'gradient' | 'empty';

export function classifyCover(value: string | undefined | null): CoverKind {
  if (!value) return 'empty';
  if (/^https?:\/\//.test(value)) return 'remote';
  if (value.startsWith('data:')) return 'data';
  if (value.startsWith('linear-gradient')) return 'gradient';
  return 'remote';
}
