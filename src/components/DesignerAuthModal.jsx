import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

/**
 * Shared auth gate for designers (GenericProductDesigner, CustomNeonBuilder, etc.).
 * Matches the flow in GenericProductDesigner: OTP quick signup or email/password sign-in.
 */
const DesignerAuthModal = ({
  open,
  onClose,
  /** Called after successful login/signup; run preview/download/export here. */
  onAuthenticated,
  title = 'Continue to Download',
  subtitle = 'Sign in once and download your artwork instantly.',
  verifyOtpButtonLabel = 'Verify & Download',
  signInButtonLabel = 'Sign In & Download',
}) => {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState('signup');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    signupPassword: '',
    signupConfirmPassword: '',
  });

  useEffect(() => {
    if (!open) return undefined;
    setAuthError('');
    setAuthLoading(false);
    setOtp('');
    setOtpSent(false);
    setOtpExpiresIn(0);
    setAuthMode('signup');
    setAuthForm({ email: '', password: '', signupPassword: '', signupConfirmPassword: '' });
    setShowPassword(false);
    setShowSignupPassword(false);
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open || !otpSent || otpExpiresIn <= 0) return undefined;
    const timer = setInterval(() => {
      setOtpExpiresIn((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, otpSent, otpExpiresIn]);

  const resetLocalErrors = () => {
    setAuthError('');
    setAuthLoading(false);
  };

  const closeModal = () => {
    resetLocalErrors();
    setOtp('');
    setOtpSent(false);
    setOtpExpiresIn(0);
    onClose();
  };

  const completeAuth = async (data) => {
    if (!data) return;
    await login(
      {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      },
      data.token
    );
    await onAuthenticated?.();
    setAuthError('');
    setAuthLoading(false);
    setOtp('');
    setOtpSent(false);
    setOtpExpiresIn(0);
    setAuthForm({ email: '', password: '', signupPassword: '', signupConfirmPassword: '' });
    onClose();
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

  const MIN_SIGNUP_PASSWORD_LEN = 8;

  const sendSignupOtp = async () => {
    if (!authForm.email.trim()) {
      setAuthError('Email is required');
      return;
    }
    if (!isValidEmail(authForm.email)) {
      setAuthError('Please enter a valid email address');
      return;
    }
    if (!authForm.signupPassword) {
      setAuthError('Password is required');
      return;
    }
    if (authForm.signupPassword.length < MIN_SIGNUP_PASSWORD_LEN) {
      setAuthError(`Password must be at least ${MIN_SIGNUP_PASSWORD_LEN} characters`);
      return;
    }
    if (authForm.signupPassword !== authForm.signupConfirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const response = await authService.registerSendOtp({
        name: 'Designer User',
        email: authForm.email.trim(),
        password: authForm.signupPassword,
      });
      setOtpSent(true);
      setOtp('');
      setOtpExpiresIn(Number(response?.expiresInSeconds || 600));
    } catch (error) {
      const message = String(error?.message || '');
      if (message.toLowerCase().includes('already exists')) {
        setAuthMode('signin');
        setOtpSent(false);
        setAuthError('Account already exists. Please sign in to continue.');
      } else {
        setAuthError(message || 'Unable to send OTP');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const verifySignupOtp = async () => {
    if (!otp.trim()) {
      setAuthError('OTP code is required');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const data = await authService.registerVerifyOtp({
        email: authForm.email.trim(),
        otp: otp.trim(),
      });
      await completeAuth(data);
    } catch (error) {
      setAuthError(error?.message || 'OTP verification failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async () => {
    if (!authForm.email.trim() || !authForm.password) {
      setAuthError('Email and password are required');
      return;
    }
    if (!isValidEmail(authForm.email)) {
      setAuthError('Please enter a valid email address');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const data = await authService.login({
        email: authForm.email.trim(),
        password: authForm.password,
      });
      await completeAuth(data);
    } catch (error) {
      setAuthError(error?.message || 'Sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  if (!open) return null;

  const showSubtitle = Boolean(subtitle && String(subtitle).trim());

  const inputClass =
    'w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/[0.07] focus:border-slate-300 transition-shadow';
  const btnPrimary =
    'w-full py-2 px-4 rounded-md bg-slate-900 text-white text-sm font-semibold tracking-tight hover:bg-slate-800 disabled:opacity-45 disabled:pointer-events-none transition-colors shadow-sm';
  const btnPrimarySm =
    'py-2 px-2.5 rounded-md bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-45 disabled:pointer-events-none transition-colors';
  const btnGhost =
    'py-2 px-2.5 rounded-md border border-slate-200 text-slate-700 text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-45 transition-colors';

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div
        className="relative w-full max-w-[420px] bg-white rounded-xl shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5 overflow-hidden animate-[fadeIn_.2s_ease-out]"
        style={{ fontFamily: 'Lexend Deca, system-ui, sans-serif' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="designer-auth-title"
      >
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md text-white/55 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div
          className={`relative px-5 pt-9 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-white/[0.08] ${showSubtitle ? 'pb-5' : 'pb-4'}`}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.12),transparent)]"
            aria-hidden
          />
          <img
            src="/logo.png"
            alt=""
            width={200}
            height={72}
            className="relative h-12 sm:h-14 w-auto max-w-[min(100%,200px)] mx-auto object-contain object-center select-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)]"
            decoding="async"
          />
          <h2
            id="designer-auth-title"
            className={`relative text-base sm:text-[1.05rem] font-semibold text-white tracking-tight leading-snug ${showSubtitle ? 'mt-3.5' : 'mt-3'}`}
          >
            {title}
          </h2>
          {showSubtitle ? (
            <p className="relative mt-1.5 text-xs text-slate-300/95 leading-snug max-w-[300px] mx-auto">{subtitle}</p>
          ) : null}
        </div>

        <div className="px-5 sm:px-6 py-4">
          <div
            className="flex items-center justify-center divide-x divide-slate-200 border-y border-slate-100 py-2 mb-3"
            aria-hidden="true"
          >
            {[
              { label: 'TLS 1.2+', title: 'Encrypted transport' },
              { label: 'OTP verify', title: 'Verified signup' },
              { label: 'Data privacy', title: 'Protected handling' },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`flex-1 text-center px-3 ${i === 0 ? 'pl-0' : ''} ${i === 2 ? 'pr-0' : ''}`}
                title={item.title}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-0.5 p-0.5 rounded-md bg-slate-100/90 mb-3">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setOtpSent(false);
                setAuthError('');
              }}
              className={`py-2 rounded-[5px] text-xs sm:text-sm font-semibold transition-all ${
                authMode === 'signup' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setOtpSent(false);
                setAuthError('');
              }}
              className={`py-2 rounded-[5px] text-xs sm:text-sm font-semibold transition-all ${
                authMode === 'signin' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign in
            </button>
          </div>

          {authMode === 'signup' && (
            !otpSent ? (
              <form
                className="space-y-2.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendSignupOtp();
                }}
              >
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className={inputClass}
                />
                {authForm.email && !isValidEmail(authForm.email) && (
                  <div className="text-xs text-amber-700">Please enter a valid email format.</div>
                )}

                <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={authForm.signupPassword}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, signupPassword: e.target.value }))}
                      placeholder="Password (min. 8 characters)"
                      autoComplete="new-password"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.368M6.223 6.223A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.969 9.969 0 01-4.125 5.168M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={authForm.signupConfirmPassword}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, signupConfirmPassword: e.target.value }))}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                <button
                  type="submit"
                  disabled={authLoading}
                  className={btnPrimary}
                >
                  {authLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form
                className="space-y-2.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  verifySignupOtp();
                }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className={inputClass}
                />
                <div className="text-xs text-slate-500 tabular-nums">
                  Expires in: {Math.floor(otpExpiresIn / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(otpExpiresIn % 60).toString().padStart(2, '0')}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className={`${btnPrimarySm} flex-1 min-w-0`}
                  >
                    {authLoading ? 'Verifying...' : verifyOtpButtonLabel}
                  </button>
                  <button
                    type="button"
                    onClick={sendSignupOtp}
                    disabled={authLoading}
                    className={`${btnGhost} flex-1 min-w-0`}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )
          )}

          {authMode === 'signin' && (
            <form
              className="space-y-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                signIn();
              }}
            >
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                autoComplete="email"
                className={inputClass}
              />
              {authForm.email && !isValidEmail(authForm.email) && (
                <div className="text-xs text-amber-700">Please enter a valid email format.</div>
              )}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authForm.password}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Password"
                  autoComplete="current-password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.368M6.223 6.223A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.969 9.969 0 01-4.125 5.168M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className={btnPrimary}
              >
                {authLoading ? 'Signing in...' : signInButtonLabel}
              </button>
            </form>
          )}

          {authError && (
            <div className="mt-3 text-xs sm:text-sm text-red-800 bg-red-50/90 border border-red-100 rounded-md px-3 py-2 leading-snug">
              {authError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerAuthModal;
