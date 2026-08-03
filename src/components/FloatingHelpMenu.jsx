import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { COMPANY_CONTACT } from '../config/companyContact';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const FloatingHelpMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  const goToContact = () => {
    setOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    navigate('/#contact');
    window.setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      <div
        className={`origin-bottom-right transition-all duration-300 ease-out ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-3 scale-95 opacity-0'
        }`}
      >
        <div
          className="w-[min(calc(100vw-2.5rem),19.5rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_18px_50px_-20px_rgba(15,23,42,0.45)]"
          style={font}
          role="dialog"
          aria-label="Quick links"
        >
          <div className="relative overflow-hidden bg-slate-900 px-4 py-3.5 text-white">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  'radial-gradient(circle at 100% 0%, rgba(59,130,246,0.45), transparent 55%), linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              }}
            />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200/90">
                How can we help?
              </p>
              <p className="mt-1 text-sm font-semibold text-white">River Signs · Quick links</p>
            </div>
          </div>

          <div className="space-y-1 p-2">
            <button
              type="button"
              onClick={() => go('/get-free-quote')}
              className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-blue-50"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition group-hover:bg-emerald-100">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">Get a free quote</span>
                <span className="block text-xs text-slate-500">Tell us about your project</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => go('/about-us')}
              className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-200 transition group-hover:bg-slate-200/80">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">About us</span>
                <span className="block text-xs text-slate-500">Our story and workshop</span>
              </span>
            </button>

            <button
              type="button"
              onClick={goToContact}
              className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-blue-50"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100 transition group-hover:bg-blue-100">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">Contact</span>
                <span className="block text-xs text-slate-500">Message the team</span>
              </span>
            </button>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2.5">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Reach us now
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={COMPANY_CONTACT.phoneTel}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-900 hover:text-white hover:ring-slate-900"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call
              </a>
              <a
                href={`mailto:${COMPANY_CONTACT.email}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-blue-600 hover:text-white hover:ring-blue-600"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email
              </a>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close help menu' : 'Open help menu'}
        className={`group relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_14px_30px_-12px_rgba(37,99,235,0.65)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
          open
            ? 'rotate-0 bg-slate-900 hover:bg-slate-800'
            : 'bg-blue-600 hover:-translate-y-0.5 hover:bg-blue-700'
        }`}
      >
        <span
          className={`pointer-events-none absolute -inset-1 rounded-[1.15rem] border border-blue-400/30 transition ${
            open ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden
        />
        {open ? (
          <svg className="relative h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="relative h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M4.5 12a7.5 7.5 0 0115 0v2.25a2.25 2.25 0 01-2.25 2.25h-.75a1.5 1.5 0 01-1.5-1.5v-2.25a1.5 1.5 0 011.5-1.5h.75M4.5 12v2.25A2.25 2.25 0 006.75 16.5h.75a1.5 1.5 0 001.5-1.5v-2.25a1.5 1.5 0 00-1.5-1.5h-.75"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M15.75 16.5a3.75 3.75 0 01-3.75 3.75h-.75"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default FloatingHelpMenu;
