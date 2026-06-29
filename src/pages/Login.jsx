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
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleForgotPassword = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Enter a valid email to reset your password',
      }));
      return;
    }

    try {
      const data = await authService.forgotPassword(formData.email);
      setResetMessage(data.message || 'If an account exists, a reset link has been sent.');
    } catch (error) {
      setResetMessage(error.message);
    }
  };

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
              onClick={handleForgotPassword}
              className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
              style={font}
            >
              Forgot password?
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
    </AuthLayout>
  );
};

export default Login;
