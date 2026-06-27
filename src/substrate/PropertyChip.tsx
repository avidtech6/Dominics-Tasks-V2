/**
 * PropertyChip — substrate component from FreshCards (src/ui/components/common/PropertyChip.tsx).
 *
 * Vanilla React port. Renders a property value as a Chip with an inline
 * pop-up editor. Click → opens a small editing surface right there.
 *
 * Currently supports 'select' and 'status' property types (the ones
 * DominicsTasks actually uses). Other types fall back to plain Chip.
 *
 * Usage:
 *   <PropertyChip
 *     property={statusProperty}
 *     value={item.properties.find(p => p.propertyId === 'status')?.value}
 *     onChange={(v) => updateItem(item.id, 'status', v)}
 *   />
 */

import React, { useState, useRef, useEffect } from 'react';
import { Chip } from './Chip';
import type { PropertyDefinition, PropertyValue, StatusOption } from './Database';

export interface PropertyChipProps {
  property: PropertyDefinition;
  value: PropertyValue | undefined;
  onChange?: (value: unknown) => void;
  readOnly?: boolean;
  compact?: boolean;
  className?: string;
}

/** Notion-style color names → CSS hex. Subset of FreshCards' palette. */
const STATUS_COLORS: Record<string, string> = {
  gray:   '#9b9a97',
  blue:   '#3370d4',
  green:  '#1a9a3c',
  yellow: '#d4a503',
  orange: '#d9730d',
  red:    '#d4451a',
  purple: '#9065b0',
  pink:   '#c14f8d',
  brown:  '#8a5e43',
};

/** Default status options every database gets. */
export const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
  { id: 'status_todo',        name: 'To do',        color: '#9b9a97', state: 'active' },
  { id: 'status_in_progress', name: 'In progress',  color: '#3370d4', state: 'active' },
  { id: 'status_done',        name: 'Done',         color: '#1a9a3c', state: 'completed' },
  { id: 'status_cancelled',   name: 'Cancelled',    color: '#d4451a', state: 'cancelled' },
];

interface ParsedDisplay {
  label: string;
  color?: string;
}

function parsePropertyDisplay(
  property: PropertyDefinition,
  value: PropertyValue | undefined
): ParsedDisplay {
  if (!value || value.value == null) {
    return { label: `No ${property.name}` };
  }
  switch (property.type) {
    case 'status':
    case 'select': {
      const v = value.value;
      if (typeof v === 'object' && v !== null) {
        const obj = v as { name?: string; color?: string; id?: string };
        return { label: obj.name ?? String(v), color: obj.color };
      }
      // String id → resolve against the property's options
      const id = String(v);
      const opt = property.options?.find(o => o.id === id)
        ?? property.statusOptions?.find(o => o.id === id);
      if (opt) return { label: opt.name, color: opt.color };
      return { label: id, color: STATUS_COLORS[id.replace('status_', '')] };
    }
    case 'multi_select':
    case 'tag': {
      if (Array.isArray(value.value)) {
        return { label: `${value.value.length} tag${value.value.length === 1 ? '' : 's'}` };
      }
      return { label: String(value.value) };
    }
    default:
      return { label: String(value.value) };
  }
}

export const PropertyChip: React.FC<PropertyChipProps> = ({
  property,
  value,
  onChange,
  readOnly = false,
  compact = false,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const display = parsePropertyDisplay(property, value);

  // Close popover on outside click
  useEffect(() => {
    if (!isEditing) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isEditing]);

  const options =
    property.type === 'status'
      ? property.statusOptions ?? DEFAULT_STATUS_OPTIONS
      : property.type === 'select'
        ? property.options ?? []
        : [];

  const editable = !readOnly && onChange && options.length > 0;

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      className={className}
    >
      <Chip
        label={display.label}
        variant={property.type === 'status' || property.type === 'select' ? 'status' : 'tag'}
        color={display.color}
        state="inactive"
        onClick={editable ? () => setIsEditing(v => !v) : undefined}
        title={editable ? 'Click to change' : display.label}
      />

      {isEditing && editable && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            minWidth: compact ? 140 : 180,
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: 4,
            zIndex: 50,
          }}
        >
          {options.map(opt => (
            <button
              key={opt.id}
              type="button"
              role="option"
              aria-selected={String(value?.value) === opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsEditing(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '6px 8px',
                border: 'none',
                background: 'transparent',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                color: '#1f2937',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: opt.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>{opt.name}</span>
              {String(value?.value) === opt.id && (
                <span aria-hidden style={{ color: '#475569', fontSize: 11 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
