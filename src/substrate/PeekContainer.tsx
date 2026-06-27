/**
 * PeekContainer — substrate component from FreshCards (src/ui/components/common/PeekContainer.tsx).
 *
 * Vanilla React port. Slide-in panel from right, draggable resize handle,
 * escape-to-close, click-backdrop-to-close, origin chip + support acts.
 *
 * The substrate makes peek an option for every detail surface without
 * locking it in. Tasks currently use a modal; can switch to peek via
 * substrate when the operator wants it.
 *
 * Usage:
 *   <PeekContainer
 *     id="task-peek"
 *     title="Take out the bins"
 *     isOpen={isOpen}
 *     onClose={() => setIsOpen(false)}
 *   >
 *     <div>Task detail content here</div>
 *   </PeekContainer>
 */

import React, { useEffect, useState, useRef, useCallback, CSSProperties } from 'react';

export interface PeekContainerProps {
  id: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;

  width?: number;
  minWidth?: number;
  maxWidth?: number;
  showResizeHandle?: boolean;
  onWidthChange?: (width: number) => void;

  originLabel?: string;
  supportActs?: React.ReactNode;
  breadcrumb?: React.ReactNode;

  className?: string;
}

const INJECTED_CSS = `
.fc-peek-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.12);
  z-index: 60;
  animation: fc-peek-fade 180ms ease-out;
}
.fc-peek-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  box-shadow: -8px 0 24px rgba(0,0,0,0.06);
  z-index: 70;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fc-peek-panel.open {
  transform: translateX(0);
}
.fc-peek-resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
  background: transparent;
}
.fc-peek-resize-handle:hover,
.fc-peek-resize-handle.active {
  background: #475569;
}
.fc-peek-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}
.fc-peek-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fc-peek-close {
  background: transparent;
  border: none;
  font-size: 22px;
  line-height: 1;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
}
.fc-peek-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}
.fc-peek-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.fc-peek-origin {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
}
@keyframes fc-peek-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

let cssInjected = false;
function ensureCssInjected() {
  if (cssInjected || typeof document === 'undefined') return;
  cssInjected = true;
  const style = document.createElement('style');
  style.setAttribute('data-fc-substrate', 'peek');
  style.textContent = INJECTED_CSS;
  document.head.appendChild(style);
}

export const PeekContainer: React.FC<PeekContainerProps> = ({
  id,
  title,
  isOpen,
  onClose,
  children,
  width = 360,
  minWidth = 280,
  maxWidth = 600,
  showResizeHandle = true,
  onWidthChange,
  originLabel,
  supportActs,
  breadcrumb,
  className = '',
}) => {
  const [currentWidth, setCurrentWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { ensureCssInjected(); }, []);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Resize handlers
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setCurrentWidth(newWidth);
        onWidthChange?.(newWidth);
      }
    };
    const onUp = () => setIsResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isResizing, minWidth, maxWidth, onWidthChange]);

  const panelStyle: CSSProperties = {
    width: currentWidth,
    maxWidth: '90vw',
  };

  return (
    <>
      {isOpen && (
        <div
          className="fc-peek-backdrop"
          onClick={onClose}
          aria-hidden="true"
          data-testid={`peek-backdrop-${id}`}
        />
      )}
      <div
        ref={panelRef}
        className={`fc-peek-panel ${isOpen ? 'open' : ''} ${className}`}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid={`peek-panel-${id}`}
        data-peek-state={isOpen ? 'open' : 'closed'}
      >
        {showResizeHandle && (
          <div
            className={`fc-peek-resize-handle ${isResizing ? 'active' : ''}`}
            onMouseDown={handleResizeMouseDown}
            aria-label="Resize peek panel"
            role="separator"
          />
        )}

        <header className="fc-peek-header">
          <div>
            {originLabel && (
              <span className="fc-peek-origin" data-testid={`peek-origin-${id}`}>
                {originLabel}
              </span>
            )}
            <h2 className="fc-peek-title">{title}</h2>
          </div>
          <button
            type="button"
            className="fc-peek-close"
            onClick={onClose}
            aria-label="Close peek panel"
            title="Close (Esc)"
          >
            ×
          </button>
        </header>

        {supportActs && (
          <div style={{ padding: '8px 20px', borderBottom: '1px solid #f3f4f6' }}>
            {supportActs}
          </div>
        )}

        <div className="fc-peek-content">{children}</div>

        {breadcrumb && (
          <div style={{ padding: '8px 20px', borderTop: '1px solid #f3f4f6', fontSize: 11, color: '#9ca3af' }}>
            {breadcrumb}
          </div>
        )}
      </div>
    </>
  );
};

export default PeekContainer;
