import React from 'react';

export type DailyLens = 'dominic' | 'family';

interface DailyViewToggleProps {
  lens: DailyLens;
  onChange: (next: DailyLens) => void;
}

/**
 * DailyViewToggle — soft pill toggle under the date header.
 * Rendered only for adult (parent/guardian) users by the parent.
 */
const DailyViewToggle: React.FC<DailyViewToggleProps> = ({ lens, onChange }) => {
  return (
    <div
      role="tablist"
      aria-label="Daily view lens"
      data-testid="daily-view-toggle"
      className="inline-flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm mx-auto"
    >
      <button
        type="button"
        role="tab"
        aria-selected={lens === 'dominic'}
        data-lens="dominic"
        onClick={() => onChange('dominic')}
        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-150 ${
          lens === 'dominic'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Dominic's View
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={lens === 'family'}
        data-lens="family"
        onClick={() => onChange('family')}
        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-150 ${
          lens === 'family'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Family View
      </button>
    </div>
  );
};

export default DailyViewToggle;