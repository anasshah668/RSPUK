import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

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

      login({
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-3 px-3 sm:px-4">
      <div className="max-w-lg w-full space-y-4">
        {/* Header */}
        <div className="text-center">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {errors.submit}
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-1 text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Sign up to get started with your account
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-5 md:p-6">
          {!otpStep ? (
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label 
                  htmlFor="firstName" 
                  className="block text-xs font-medium text-gray-700 mb-1"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="First Name"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="lastName" 
                  className="block text-xs font-medium text-gray-700 mb-1"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Last Name"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-xs font-medium text-gray-700 mb-1"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-xs font-medium text-gray-700 mb-1"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3-11-7 1.02-2.04 2.568-3.63 4.413-4.8M9.88 9.88a3 3 0 104.24 4.24M6.1 6.1L3 3m0 0l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {errors.password}
                </p>
              )}
              <p className="mt-1 text-[11px] text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-xs font-medium text-gray-700 mb-1"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3-11-7 1.02-2.04 2.568-3.63 4.413-4.8M9.88 9.88a3 3 0 104.24 4.24M6.1 6.1L3 3m0 0l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label 
                  htmlFor="agreeToTerms" 
                  className="ml-2 block text-xs text-gray-700 leading-5"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
          ) : (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div className="text-center">
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Enter the OTP sent to <span className="font-semibold">{formData.email}</span>
                </p>
                <p className="mt-1 text-sm text-blue-600 font-medium" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Expires in: {Math.floor(otpExpiresIn / 60).toString().padStart(2, '0')}:{(otpExpiresIn % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setErrors((prev) => ({ ...prev, otp: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-[0.3em] text-center ${
                    errors.otp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="000000"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {errors.otp}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading || otpExpiresIn <= 0}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP & Create Account'}
              </button>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Edit details
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-700"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
