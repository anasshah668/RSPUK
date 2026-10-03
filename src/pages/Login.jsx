import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import AuthLayout, {
  AuthAlert,
  AuthFieldError,
  AuthSubmitButton,
  PasswordToggle,
  font,
  inputClass,
  labelClass,
} from '../components/AuthLayout';

const Login = () => {
  const navigate = useNavigate();
  const { login, authReady, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (authReady && isAuthenticated()) {
      navigate('/account', { replace: true });
    }
  }, [authReady, isAuthenticated, navigate]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetStep, setResetStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    if (!resetStep || otpExpiresIn <= 0) return undefined;
    const timer = setInterval(() => {
      setOtpExpiresIn((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resetStep, otpExpiresIn]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResetMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      await login({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      }, data.token);

      navigate('/');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setResetMessage('');
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }));
    }
  };

  const sendResetOtp = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Enter a valid email to reset your password',
      }));
      return;
    }

    setResetLoading(true);
    setResetMessage('');
    try {
      const data = await authService.forgotPassword(formData.email);
      setResetStep(true);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpExpiresIn(Number(data?.expiresInSeconds || 600));
      setErrors({});
      setResetMessage(data.message || 'If an account exists, a verification code has been sent.');
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email: error.message || 'Could not send the verification code.',
      }));
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!otp.trim()) nextErrors.otp = 'OTP is required';
    if (!newPassword) {
      nextErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    setResetMessage('');
    try {
      const data = await authService.forgotPasswordVerifyOtp({
        email: formData.email,
        otp: otp.trim(),
        password: newPassword,
      });
      setResetStep(false);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setFormData((prev) => ({ ...prev, password: '' }));
      setResetMessage(data.message || 'Password updated. You can now sign in.');
    } catch (error) {
      setErrors({ otp: error.message || 'Could not reset password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const otpMinutes = Math.floor(otpExpiresIn / 60).toString().padStart(2, '0');
  const otpSeconds = (otpExpiresIn % 60).toString().padStart(2, '0');

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage orders, save designs, and access your quotes — all in one place."
      benefits={[
        'Track production and delivery from your dashboard',
        'Save designs and artwork securely to your basket',
        'View quotes, design files, and order history anytime',
      ]}
      footer={(
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create one free
          </Link>
        </>
      )}
    >
      {!resetStep ? (
        <>
          <div className="mb-6 hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-900" style={font}>Sign in</h2>
            <p className="mt-1 text-sm text-gray-500" style={font}>Enter your credentials to continue</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                placeholder="you@example.com"
                style={font}
              />
              <AuthFieldError message={errors.email} />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className={labelClass} style={font}>Password</label>
                <button
                  type="button"
                  onClick={sendResetOtp}
                  disabled={resetLoading || isLoading}
                  className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
                  style={font}
                >
                  {resetLoading ? 'Sending code…' : 'Forgot password?'}
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
                <PasswordToggle
                  show={showPassword}
                  onToggle={() => setShowPassword((prev) => !prev)}
                />
              </div>
              <AuthFieldError message={errors.password} />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600" style={font}>Remember me on this device</span>
            </label>

            <AuthSubmitButton loading={isLoading} loadingLabel="Signing in…">
              Sign in
            </AuthSubmitButton>
          </form>
        </>
      ) : (
        <>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900" style={font}>Reset your password</h2>
            <p className="mt-2 text-sm text-gray-500" style={font}>
              We sent a 6-digit code to{' '}
              <span className="font-semibold text-gray-800">{formData.email}</span>
            </p>
            <p className={`mt-2 text-sm font-semibold ${otpExpiresIn > 0 ? 'text-blue-600' : 'text-red-600'}`} style={font}>
              {otpExpiresIn > 0 ? `Expires in ${otpMinutes}:${otpSeconds}` : 'Code expired — resend to continue'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleResetSubmit}>
            {resetMessage ? <AuthAlert type="success">{resetMessage}</AuthAlert> : null}

            <div>
              <label htmlFor="otp" className={labelClass} style={font}>Verification code</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setErrors((prev) => ({ ...prev, otp: '' }));
                }}
                className={`${inputClass} text-center text-2xl font-bold tracking-[0.4em] ${
                  errors.otp ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''
                }`}
                placeholder="000000"
                style={font}
              />
              <AuthFieldError message={errors.otp} />
            </div>

            <div>
              <label htmlFor="newPassword" className={labelClass} style={font}>New password</label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }}
                  className={`${inputClass} pr-10 ${errors.newPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  placeholder="Enter a new password"
                  style={font}
                />
                <PasswordToggle
                  show={showNewPassword}
                  onToggle={() => setShowNewPassword((prev) => !prev)}
                  label="new password"
                />
              </div>
              <AuthFieldError message={errors.newPassword} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass} style={font}>Confirm new password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={`${inputClass} pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  placeholder="Repeat your new password"
                  style={font}
                />
                <PasswordToggle
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((prev) => !prev)}
                  label="confirm password"
                />
              </div>
              <AuthFieldError message={errors.confirmPassword} />
            </div>

            <AuthSubmitButton
              loading={isLoading}
              loadingLabel="Updating password…"
              disabled={otpExpiresIn <= 0}
            >
              Verify code & update password
            </AuthSubmitButton>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setResetStep(false);
                  setResetMessage('');
                  setErrors({});
                }}
                className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
                style={font}
              >
                ← Back to sign in
              </button>
              <button
                type="button"
                onClick={sendResetOtp}
                disabled={resetLoading || isLoading}
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
                style={font}
              >
                Resend code
              </button>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  );
};

export default Login;
