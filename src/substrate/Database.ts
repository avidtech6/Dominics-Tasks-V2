/**
 * Database / DatabaseItem / Property — substrate model from FreshCards.
 *
 * Source: avidtech6/freshvibestudio/modules/freshcards/src/types/models/
 *         - Database.ts
 *         - Property.ts
 *
 * This is the data model that makes the app scalable to multiple boards,
 * typed properties, and view configs. Existing TaskBehaviour/ChatBehaviour
 * data is wrapped through adapter functions (see ./adapters.ts).
 *
 * The model is intentionally NOT directly used by current behaviour classes
 * yet — that migration is staged. This file establishes the types and
 * factory functions so future code can grow into them.
 */

// ─── Property Model ────────────────────────────────────────────────────────

export type PropertyType =
  | 'title' | 'text' | 'number' | 'select' | 'multi_select'
  | 'date' | 'checkbox' | 'url' | 'files' | 'relation'
  | 'formula' | 'status' | 'person' | 'phone' | 'email'
  | 'image' | 'created_time' | 'last_edited_time';

export interface PropertyDefinition {
  id: string;
  name: string;
  type: PropertyType;
  visible: boolean;
  position: number;
  options?: SelectOption[];
  statusOptions?: StatusOption[];
  numberFormat?: NumberFormat;
  defaultValue?: unknown;
  readOnly?: boolean;
}

export interface PropertyValue {
  propertyId: string;
  value: unknown;
}

export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export interface StatusOption extends SelectOption {
  state: 'active' | 'completed' | 'cancelled';
}

export interface NumberFormat {
  type: 'number' | 'currency' | 'percent';
  symbol?: string;
  decimals?: number;
}

// ─── Card Cover ────────────────────────────────────────────────────────────

export interface CardCover {
  type: 'external' | 'file';
  url: string;
}

// ─── View Config ───────────────────────────────────────────────────────────

export type ViewType = 'gallery' | 'kanban' | 'list' | 'calendar';

export interface ViewConfig {
  id: string;
  name: string;
  type: ViewType;
  /** Property id this view groups/filters by (kanban group-by, calendar date) */
  primaryPropertyId?: string;
  filters?: Filter[];
  sorts?: Sort[];
}

export interface Filter {
  propertyId: string;
  operator: FilterOperator;
  value: unknown;
}

export type FilterOperator =
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'greater_than' | 'less_than';

export interface Sort {
  propertyId: string;
  direction: 'asc' | 'desc';
}

// ─── Database + DatabaseItem ───────────────────────────────────────────────

export interface DatabaseSchema {
  id: string;
  properties: PropertyDefinition[];
}

export interface Database {
  id: string;
  name: string;
  icon?: string;
  cover?: CardCover;
  schema: DatabaseSchema;
  views: ViewConfig[];
  items: DatabaseItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseItem {
  id: string;
  databaseId: string;
  title: string;
  icon?: string;
  cover?: CardCover;
  properties: PropertyValue[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Factories ─────────────────────────────────────────────────────────────

export function createDatabase(id: string, name: string = 'Untitled Database'): Database {
  const now = new Date();
  return {
    id,
    name,
    schema: { id: `${id}_schema`, properties: [] },
    views: [{ id: `${id}_default_view`, name: 'List', type: 'list' }],
    items: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createDatabaseItem(
  id: string,
  databaseId: string,
  title: string = 'Untitled'
): DatabaseItem {
  const now = new Date();
  return {
    id,
    databaseId,
    title,
    properties: [],
    tags: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createProperty(
  id: string,
  name: string,
  type: PropertyType,
  position: number = 0
): PropertyDefinition {
  return { id, name, type, visible: true, position };
}

export function createStatusProperty(
  id: string,
  name: string,
  statusOptions: Array<{ name: string; color: string; state: StatusOption['state'] }>,
  position: number = 0
): PropertyDefinition {
  return {
    ...createProperty(id, name, 'status', position),
    statusOptions: statusOptions.map((opt, i) => ({
      id: `${id}_status_${i}`,
      name: opt.name,
      color: opt.color,
      state: opt.state,
    })),
  };
}

export function createSelectProperty(
  id: string,
  name: string,
  options: Array<{ name: string; color: string }>,
  position: number = 0
): PropertyDefinition {
  return {
    ...createProperty(id, name, 'select', position),
    options: options.map((opt, i) => ({
      id: `${id}_opt_${i}`,
      name: opt.name,
      color: opt.color,
    })),
  };
}

// ─── Helpers (used by adapters + future code) ────────────────────────────

/** Read a typed property value from an item. */
export function getPropValue<T = unknown>(
  item: DatabaseItem,
  propertyId: string
): T | undefined {
  const p = item.properties.find(p => p.propertyId === propertyId);
  return p?.value as T | undefined;
}

/** Write a typed property value. Returns a new item (immutable). */
export function setPropValue(
  item: DatabaseItem,
  propertyId: string,
  value: unknown
): DatabaseItem {
  const others = item.properties.filter(p => p.propertyId !== propertyId);
  return {
    ...item,
    properties: [...others, { propertyId, value }],
    updatedAt: new Date(),
  };
}
