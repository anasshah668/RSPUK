import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  getAdminGateToken,
  setAdminGateToken,
  clearAdminGateToken,
  hasValidAdminGate,
} from '../utils/adminGateStorage';
import {
  AuthAlert,
  AuthFieldError,
  AuthSubmitButton,
  PasswordToggle,
  font,
  inputClass,
  labelClass,
} from '../components/AuthLayout';

const ADMIN_BENEFITS = [
  'Manage orders, quotes, and design service requests',
  'Update products, pricing, and site settings',
  'View analytics and fulfilment activity in one place',
];

const AdminBrandPanel = ({ gateMode = false }) => (
  <div className="relative hidden overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 lg:flex lg:flex-col lg:justify-between">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>

    <div className="relative z-10 p-10 xl:p-14">
      <Link to="/" className="inline-flex items-center gap-3">
        <img src="/logo.png" alt="RSP UK" className="h-10 w-auto brightness-0 invert" />
      </Link>

      <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        {gateMode ? 'Restricted access' : 'Admin area'}
      </div>

      <div className="mt-8 max-w-md">
        <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl" style={font}>
          {gateMode ? 'Enter access code' : 'Admin dashboard'}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300" style={font}>
          {gateMode
            ? 'This page is protected. Enter the admin access code provided by your organisation to continue.'
            : 'Sign in to manage orders, quotes, products, and customer design requests from one secure control panel.'}
        </p>
      </div>

      {!gateMode ? (
        <ul className="mt-12 space-y-4">
          {ADMIN_BENEFITS.map((text) => (
            <li key={text} className="flex items-start gap-3 text-slate-200">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200 ring-1 ring-white/15">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="pt-1.5 text-sm leading-relaxed" style={font}>{text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300" style={font}>
          <p className="font-semibold text-white">Why is this required?</p>
          <p className="mt-2 leading-relaxed">
            The access code adds an extra layer of protection so the admin sign-in page is not publicly exposed.
          </p>
        </div>
      )}
    </div>

    <div className="relative z-10 border-t border-white/10 p-10 xl:p-14" style={font}>
      <p className="text-sm text-slate-400">
        Authorised personnel only. All access attempts are monitored.
      </p>
    </div>
  </div>
);

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, user, authReady } = useAuth();
  const [gateVerified, setGateVerified] = useState(hasValidAdminGate);
  const [accessCode, setAccessCode] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateLoading, setGateLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [authReady, user, navigate]);

  const handleVerifyGate = async (e) => {
    e.preventDefault();
    setGateError('');

    const code = accessCode.trim();
    if (!code) {
      setGateError('Access code is required');
      return;
    }

    setGateLoading(true);
    try {
      const data = await authService.verifyAdminGate(code);
      setAdminGateToken(data.gateToken, data.expiresIn || 1800);
      setGateVerified(true);
      setAccessCode('');
    } catch (error) {
      const message =
        error?.status === 429
          ? error.message || 'Too many attempts. Please wait and try again.'
          : error.message || 'Invalid access code';
      setGateError(message);
    } finally {
      setGateLoading(false);
    }
  };

  const handleLockGate = () => {
    clearAdminGateToken();
    setGateVerified(false);
    setFormData({ email: '', password: '' });
    setErrors({});
    setResetMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResetMessage('');

    if (!validateForm()) return;

    const gateToken = getAdminGateToken();
    if (!gateToken) {
      setGateVerified(false);
      setErrors({ submit: 'Session expired. Enter the access code again.' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.adminLogin(
        {
          email: formData.email,
          password: formData.password,
        },
        gateToken,
      );

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      await login(
        {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        },
        data.token,
      );

      navigate('/admin');
    } catch (error) {
      if (error?.status === 403 && error?.data?.code === 'ADMIN_GATE_REQUIRED') {
        clearAdminGateToken();
        setGateVerified(false);
        setErrors({});
        setGateError('Access code session expired. Please enter the code again.');
        return;
      }
      const message =
        error?.status === 429
          ? error.message || 'Too many login attempts. Please wait and try again.'
          : error.message;
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setResetMessage('');
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }));
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Enter a valid admin email to reset password',
      }));
      return;
    }

    const gateToken = getAdminGateToken();
    if (!gateToken) {
      setGateVerified(false);
      setGateError('Access code session expired. Enter the code again.');
      return;
    }

    setResetLoading(true);
    setResetMessage('');
    try {
      const data = await authService.forgotPassword(formData.email, {
        context: 'admin',
        gateToken,
      });
      setResetMessage(data.message || 'If an admin account exists, a reset link has been sent.');
      setErrors((prev) => ({ ...prev, email: '' }));
    } catch (error) {
      const message =
        error?.status === 429
          ? error.message || 'Too many attempts. Please wait before trying again.'
          : error.message || 'Could not send reset email';
      setErrors((prev) => ({ ...prev, email: message }));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 lg:grid lg:grid-cols-2">
      <AdminBrandPanel gateMode={!gateVerified} />

      <div className="flex flex-col justify-center px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
        <div className="mb-8 text-center lg:hidden">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="RSP UK" className="mx-auto h-9 w-auto" />
          </Link>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
            {gateVerified ? 'Admin' : 'Restricted'}
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900" style={font}>
            {gateVerified ? 'Admin sign in' : 'Access code required'}
          </h2>
          <p className="mt-2 text-sm text-gray-500" style={font}>
            {gateVerified ? 'Access the management dashboard' : 'Enter your organisation access code'}
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xl shadow-gray-200/50">
            <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {gateVerified ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      )}
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900" style={font}>
                      {gateVerified ? 'Secure sign in' : 'Verify access code'}
                    </p>
                    <p className="text-xs text-gray-500" style={font}>
                      {gateVerified ? 'Admin credentials required' : 'Step 1 of 2'}
                    </p>
                  </div>
                </div>
                {gateVerified ? (
                  <button
                    type="button"
                    onClick={handleLockGate}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                    style={font}
                  >
                    Lock page
                  </button>
                ) : null}
              </div>
            </div>

            {!gateVerified ? (
              <form className="space-y-5 p-6 sm:p-8" onSubmit={handleVerifyGate}>
                {gateError ? <AuthAlert type="error">{gateError}</AuthAlert> : null}
                <div>
                  <label htmlFor="accessCode" className={labelClass} style={font}>Access code</label>
                  <input
                    id="accessCode"
                    name="accessCode"
                    type="password"
                    autoComplete="off"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      setGateError('');
                    }}
                    className={`${inputClass} ${gateError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                    placeholder="Enter admin access code"
                    style={font}
                  />
                  <p className="mt-2 text-xs text-gray-500" style={font}>
                    Contact your site administrator if you do not have the code.
                  </p>
                </div>
                <AuthSubmitButton loading={gateLoading} loadingLabel="Verifying…">
                  Continue to sign in
                </AuthSubmitButton>
              </form>
            ) : (
              <form className="space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
                {errors.submit ? <AuthAlert type="error">{errors.submit}</AuthAlert> : null}
                {resetMessage ? <AuthAlert type="success">{resetMessage}</AuthAlert> : null}

                <div>
                  <label htmlFor="email" className={labelClass} style={font}>Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputClass} ${errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                    placeholder="admin@yourcompany.com"
                    style={font}
                  />
                  <AuthFieldError message={errors.email} />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className={labelClass} style={font}>Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
                      style={font}
                    >
                      {resetLoading ? 'Sending reset…' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`${inputClass} pr-10 ${errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                      placeholder="Enter your password"
                      style={font}
                    />
                    <PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                  </div>
                  <AuthFieldError message={errors.password} />
                </div>

                <AuthSubmitButton loading={isLoading} loadingLabel="Signing in…">
                  Sign in to dashboard
                </AuthSubmitButton>
              </form>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
              style={font}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to store
            </Link>
            {gateVerified ? (
              <>
                <span className="hidden text-gray-300 sm:inline">·</span>
                <Link
                  to="/login"
                  className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                  style={font}
                >
                  Customer login
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
