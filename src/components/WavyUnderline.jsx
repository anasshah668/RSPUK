import React from 'react';

/**
 * Wrap the last word (or any word) with the orange wavy underline used in the reference UI.
 */
const WavyUnderline = ({ children, className = '', thick = false }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <span className="absolute left-0 right-0 -bottom-2">
        <svg
          viewBox="0 0 220 18"
          preserveAspectRatio="none"
          className={thick ? "h-[10px] w-full" : "h-[8px] w-full"}
          aria-hidden="true"
        >
          <path
            d="M4 12 Q 110 2 216 12"
            fill="none"
            stroke="#f59e0b"
            strokeWidth={thick ? "4.5" : "3.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
};

export default WavyUnderline;

