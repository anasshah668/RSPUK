import React from 'react';
import { Link } from 'react-router-dom';

export const font = { fontFamily: 'Lexend Deca, sans-serif' };

export const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

export const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';

export const PasswordToggle = ({ show, onToggle, label = 'password' }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:text-gray-600"
    title={show ? 'Hide password' : 'Show password'}
    aria-label={show ? `Hide ${label}` : `Show ${label}`}
  >
    {show ? (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.368M6.223 6.223A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.969 9.969 0 01-4.125 5.168M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
      </svg>
    ) : (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
);

export const AuthAlert = ({ type = 'info', children }) => {
  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles[type] || styles.info}`} style={font}>
      {children}
    </div>
  );
};

export const AuthFieldError = ({ message }) => (
  message ? (
    <p className="mt-1.5 text-sm text-red-600" style={font}>{message}</p>
  ) : null
);

export const AuthSubmitButton = ({ loading, loadingLabel, children, disabled = false }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    style={font}
  >
    {loading ? (
      <>
        <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {loadingLabel}
      </>
    ) : children}
  </button>
);

const BENEFIT_ICONS = [
  (
    <svg key="track" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  (
    <svg key="design" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  (
    <svg key="quote" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
];

const AuthLayout = ({
  title,
  subtitle,
  benefits = [],
  children,
  footer,
  backHref = '/',
}) => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 lg:grid lg:grid-cols-2">
    {/* Brand panel */}
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 p-10 xl:p-14">
        <Link to="/" className="inline-flex items-center gap-3">
          <img src="/logo.png" alt="RSP UK" className="h-10 w-auto brightness-0 invert" />
        </Link>

        <div className="mt-16 max-w-md">
          <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl" style={font}>
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-blue-100/80" style={font}>
            {subtitle}
          </p>
        </div>

        {benefits.length > 0 && (
          <ul className="mt-12 space-y-4">
            {benefits.map((text, idx) => (
              <li key={text} className="flex items-start gap-3 text-blue-50/90">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
                  {BENEFIT_ICONS[idx % BENEFIT_ICONS.length]}
                </span>
                <span className="pt-1.5 text-sm leading-relaxed" style={font}>{text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative z-10 border-t border-white/10 p-10 text-sm text-blue-200/70 xl:p-14" style={font}>
        Trusted print & signage partner for businesses across the UK.
      </div>
    </div>

    {/* Form panel */}
    <div className="flex flex-col justify-center px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
      {/* Mobile header */}
      <div className="mb-8 text-center lg:hidden">
        <Link to="/" className="inline-block">
          <img src="/logo.png" alt="RSP UK" className="mx-auto h-9 w-auto" />
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-gray-900" style={font}>{title}</h2>
        <p className="mt-2 text-sm text-gray-500" style={font}>{subtitle}</p>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">
          {children}
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-gray-600" style={font}>
            {footer}
          </div>
        ) : null}

        <div className="mt-6 text-center">
          <Link
            to={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
            style={font}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
