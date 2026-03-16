import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/apiConfig.js';

const AdminLogin = ({ onNavigate, onClose }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Check if user is admin
      if (data.role !== 'admin') {
        setErrors({ submit: 'Access denied. Admin credentials required.' });
        setIsLoading(false);
        return;
      }

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

      // Navigate to admin dashboard
      if (onNavigate) {
        onNavigate('admin');
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setResetMessage('');
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dark Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center h-24">
            <div className="flex items-center cursor-pointer">
              <img 
                src="/logo.png" 
                alt="RER Logo" 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden text-4xl font-bold items-center" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                <span className="text-blue-500">R</span>
                <span className="text-white">ER</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errors.submit}
              </div>
            )}
            <h2 
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Admin Login
            </h2>
            <p 
              className="mt-2 text-sm text-gray-600"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
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
                placeholder="admin@example.com"
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
                  onClick={async () => {
                    // Require a valid email to request reset
                    if (!formData.email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
                      setErrors(prev => ({
                        ...prev,
                        email: 'Enter a valid admin email to reset password',
                      }));
                      return;
                    }

                    try {
                      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                      const response = await fetch(`${API_URL}/auth/forgot-password`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: formData.email }),
                      });

                      const data = await response.json();
                      if (!response.ok) {
                        throw new Error(data.message || 'Unable to request password reset');
                      }

                      setResetMessage(data.message || 'If an admin account exists, a reset link has been sent.');
                    } catch (error) {
                      setResetMessage(error.message);
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
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
            </div>

            {resetMessage && (
              <p className="text-sm text-green-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {resetMessage}
              </p>
            )}

            {/* Submit Button */}
            <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>

            {/* Back to Home */}
            <div className="text-center">
            <button
              type="button"
              onClick={() => (onClose && onClose()) || (onNavigate && onNavigate('home'))}
              className="text-sm text-gray-600 hover:text-gray-900"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              ← Back to Home
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
