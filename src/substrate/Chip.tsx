/**
 * Chip — substrate component from FreshCards (src/ui/components/common/Chip.tsx).
 *
 * Vanilla React port (no Mantine). Lightweight pill with 3 states
 * (inactive/active/elevated), 4 variants (default/status/tag/add),
 * long-press support, color dot for status chips.
 *
 * Usage:
 *   <Chip label="Today" state="active" onClick={...} />
 *   <Chip label="+" variant="add" onClick={...} />
 *   <Chip label="Doing" variant="status" color="#3370d4" />
 */

import React, { useCallback, useRef } from 'react';

export type ChipVariant = 'default' | 'status' | 'tag' | 'add';
export type ChipState = 'inactive' | 'active' | 'elevated';

export interface ChipProps {
  label: string;
  state?: ChipState;
  variant?: ChipVariant;
  /** Color for the dot on status chips. */
  color?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** Long-press fires after 400ms. Used for context menus. */
  onLongPress?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Optional dot icon (for status chips). */
  dot?: boolean;
}

const LONG_PRESS_DELAY = 400;

export const Chip: React.FC<ChipProps> = ({
  label,
  state = 'inactive',
  variant = 'default',
  color,
  onClick,
  onLongPress,
  disabled = false,
  title,
  className = '',
  style,
  dot = true,
}) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressing = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !onLongPress) return;
      isLongPressing.current = false;
      longPressTimer.current = setTimeout(() => {
        isLongPressing.current = true;
        onLongPress(e);
      }, LONG_PRESS_DELAY);
    },
    [disabled, onLongPress]
  );

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isLongPressing.current) {
        isLongPressing.current = false;
        return; // swallow click after long-press
      }
      onClick?.(e);
    },
    [onClick]
  );

  const isActive = state === 'active';
  const isElevated = state === 'elevated';
  const isAdd = variant === 'add';

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 26,
    padding: '0 10px',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'inherit',
    lineHeight: 1,
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: isAdd
      ? '1px dashed #d4d4d1'
      : `1px solid ${isActive ? '#475569' : '#e5e7eb'}`,
    background: isActive
      ? '#475569'
      : isElevated
        ? '#f1f5f9'
        : isAdd
          ? 'transparent'
          : '#ffffff',
    color: isActive
      ? '#ffffff'
      : disabled
        ? '#9ca3af'
        : '#374151',
    transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
    userSelect: 'none',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      disabled={disabled}
      title={title}
      className={`fc-chip ${isActive ? 'active' : ''} ${isElevated ? 'elevated' : ''} ${isAdd ? 'fc-chip--add' : ''} ${className}`}
      style={baseStyle}
      data-chip-state={state}
      data-chip-variant={variant}
    >
      {dot && variant === 'status' && color && (
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
      )}
      {variant === 'add' && <span aria-hidden>+</span>}
      <span>{label}</span>
    </button>
  );
};
