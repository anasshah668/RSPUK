import React, { useEffect } from 'react';

/**
 * Themed confirmation when leaving custom neon preview — matches site header (slate/dark) + Lexend + blue CTAs.
 */
const NeonPreviewExitDialog = ({ open, onStay, onLeave, title = 'Leave preview?' }) => {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onStay();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onStay]);

  if (!open) return null;

  const font = { fontFamily: 'Lexend Deca, system-ui, sans-serif' };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-slate-900/55 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="neon-exit-title"
      aria-describedby="neon-exit-desc"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog backdrop"
        onClick={onStay}
      />
      <div
        className="relative w-full max-w-[440px] bg-white rounded-xl shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/10 overflow-hidden animate-[fadeIn_.2s_ease-out]"
        style={font}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onStay}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Stay on preview"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative px-5 pt-8 pb-5 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-white/[0.08]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-400/40">
            <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2
            id="neon-exit-title"
            className="relative mt-4 text-lg sm:text-xl font-semibold text-white tracking-tight"
            style={font}
          >
            {title}
          </h2>
        </div>

        <div className="px-5 sm:px-6 py-5">
          <p id="neon-exit-desc" className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to leave? Your custom neon design on the preview step may be lost unless you add it
            to the basket or continue to checkout.
          </p>
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onLeave}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold bg-white hover:bg-slate-50 transition-colors"
            >
              Leave
            </button>
            <button
              type="button"
              onClick={onStay}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Stay on preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeonPreviewExitDialog;
