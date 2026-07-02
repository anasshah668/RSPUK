import React, { useEffect, useState } from 'react';

const DEFAULT_FONT = { fontFamily: 'Lexend Deca, system-ui, sans-serif' };

/**
 * Reusable guard logic for accidental page reloads.
 *
 * Intercepts the F5 and Ctrl/⌘+R refresh shortcuts and opens our own styled
 * popup instead of the browser's native dialog. Note: reloads triggered from
 * the browser's refresh button or address bar cannot be intercepted with a
 * custom UI (browser security limitation), so those are intentionally left to
 * reload normally.
 *
 * @param {object} options
 * @param {boolean|() => boolean} options.enabled  Whether guarding is active.
 *        Pass a function to evaluate lazily (e.g. only when there is unsaved work).
 * @returns {{ open: boolean, setOpen: Function, confirmReload: Function, cancel: Function }}
 */
export const useRefreshGuard = ({ enabled = true } = {}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isEnabled = () => (typeof enabled === 'function' ? Boolean(enabled()) : Boolean(enabled));

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      const isReloadKey =
        event.key === 'F5' ||
        ((event.ctrlKey || event.metaKey) && (event.key === 'r' || event.key === 'R'));
      if (!isReloadKey || !isEnabled()) return;
      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);

  const confirmReload = () => {
    setOpen(false);
    window.location.reload();
  };

  const cancel = () => setOpen(false);

  return { open, setOpen, confirmReload, cancel };
};

/**
 * Reusable "are you sure you want to refresh?" confirmation popup.
 *
 * This is a controlled component: the parent owns the `open` state (typically
 * toggled by `useRefreshGuard` below, or any custom trigger) and decides what
 * happens on confirm/cancel.
 *
 * Props:
 * - open:        whether the modal is visible
 * - onCancel:    called when the user dismisses (backdrop, Esc, "Keep editing")
 * - onConfirm:   called when the user confirms. Defaults to a full page reload.
 * - title:       heading text
 * - message:     body text
 * - confirmLabel / cancelLabel: button labels
 * - font:        optional style object for font family
 */
const RefreshGuardModal = ({
  open,
  onCancel,
  onConfirm,
  title = 'Refresh this page?',
  message = 'Reloading may lose your current changes. We recommend saving or downloading your work first to be safe.',
  confirmLabel = 'Refresh anyway',
  cancelLabel = 'Keep editing',
  font = DEFAULT_FONT,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onCancel]);

  if (!open) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)]"
        style={font}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="refresh-guard-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h3 id="refresh-guard-title" className="text-base font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefreshGuardModal;
