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

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    if (!otpStep || otpExpiresIn <= 0) return undefined;
    const timer = setInterval(() => {
      setOtpExpiresIn((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpStep, otpExpiresIn]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.registerSendOtp({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });
      setOtpStep(true);
      setOtp('');
      setOtpExpiresIn(Number(response?.expiresInSeconds || 600));
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.registerVerifyOtp({
        email: formData.email,
        otp: otp.trim(),
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
      setErrors({ otp: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await authService.registerSendOtp({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });
      setOtpExpiresIn(Number(response?.expiresInSeconds || 600));
      setErrors((prev) => ({ ...prev, otp: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, otp: error.message }));
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }));
    }
  };

  const otpMinutes = Math.floor(otpExpiresIn / 60).toString().padStart(2, '0');
  const otpSeconds = (otpExpiresIn % 60).toString().padStart(2, '0');

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join RSP UK for free — save designs, checkout faster, and keep everything in one place."
      benefits={[
        'Free account with secure artwork storage',
        'Faster checkout with saved delivery details',
        'Access quotes, design deliverables, and order tracking',
      ]}
      footer={(
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </>
      )}
    >
      {!otpStep ? (
        <>
          <div className="mb-6 hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-900" style={font}>Sign up</h2>
            <p className="mt-1 text-sm text-gray-500" style={font}>Fill in your details to get started</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errors.submit ? <AuthAlert type="error">{errors.submit}</AuthAlert> : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelClass} style={font}>First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.firstName ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  placeholder="Jane"
                  style={font}
                />
                <AuthFieldError message={errors.firstName} />
              </div>

              <div>
                <label htmlFor="lastName" className={labelClass} style={font}>Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.lastName ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  placeholder="Smith"
                  style={font}
                />
                <AuthFieldError message={errors.lastName} />
              </div>
            </div>

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
              <label htmlFor="password" className={labelClass} style={font}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputClass} pr-10 ${errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  placeholder="Create a strong password"
                  style={font}
                />
                <PasswordToggle
                  show={showPassword}
                  onToggle={() => setShowPassword((prev) => !prev)}
                  label="password"
                />
              </div>
              <AuthFieldError message={errors.password} />
              <p className="mt-1.5 text-xs text-gray-400" style={font}>
                At least 8 characters with uppercase, lowercase, and a number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass} style={font}>Confirm password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputClass} pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  placeholder="Repeat your password"
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

            <div>
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm leading-relaxed text-gray-600" style={font}>
                  I agree to the{' '}
                  <button type="button" onClick={() => navigate('/')} className="font-semibold text-blue-600 hover:text-blue-700">
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button type="button" onClick={() => navigate('/')} className="font-semibold text-blue-600 hover:text-blue-700">
                    Privacy Policy
                  </button>
                </span>
              </label>
              <AuthFieldError message={errors.agreeToTerms} />
            </div>

            <AuthSubmitButton loading={isLoading} loadingLabel="Sending code…">
              Continue with email verification
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
            <h2 className="text-xl font-bold text-gray-900" style={font}>Check your email</h2>
            <p className="mt-2 text-sm text-gray-500" style={font}>
              We sent a 6-digit code to{' '}
              <span className="font-semibold text-gray-800">{formData.email}</span>
            </p>
            <p className={`mt-2 text-sm font-semibold ${otpExpiresIn > 0 ? 'text-blue-600' : 'text-red-600'}`} style={font}>
              {otpExpiresIn > 0 ? `Expires in ${otpMinutes}:${otpSeconds}` : 'Code expired — resend to continue'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleVerifyOtp}>
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

            <AuthSubmitButton
              loading={isLoading}
              loadingLabel="Verifying…"
              disabled={otpExpiresIn <= 0}
            >
              Verify & create account
            </AuthSubmitButton>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
                style={font}
              >
                ← Edit details
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
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

export default Register;
