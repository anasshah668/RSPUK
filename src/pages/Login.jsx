import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

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
      // Use centralized service
      const data = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      // Store token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Login user
      login({
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setResetMessage('');
    // Clear messages and error when user starts typing
    setResetMessage('');
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleForgotPassword = async () => {
    // Require a valid email before requesting reset
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Enter a valid email to reset your password',
      }));
      return;
    }

    try {
      // Use centralized service
      const data = await authService.forgotPassword(formData.email);
      setResetMessage(data.message || 'If an account exists, a reset link has been sent.');
    } catch (error) {
      setResetMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 
            className="text-3xl font-bold text-gray-900"
          >
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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
              <div className="flex items-center justify-between mb-2">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {errors.password}
                </p>
              )}
            </div>

            {resetMessage && (
              <p className="text-sm text-green-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {resetMessage}
              </p>
            )}

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor="rememberMe" 
                className="ml-2 block text-sm text-gray-700"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-medium text-blue-600 hover:text-blue-700"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
