import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const isAdminContext = useMemo(
    () => location.pathname.startsWith('/admin/') || searchParams.get('context') === 'admin',
    [location.pathname, searchParams],
  );

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginPath = isAdminContext ? '/admin/login' : '/login';

  const validateForm = () => {
    const nextErrors = {};
    if (!token) {
      nextErrors.submit = 'Reset link is invalid or missing. Request a new reset email.';
    }
    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = await authService.resetPassword({
        token,
        password: formData.password,
      });
      setSuccessMessage(data.message || 'Password reset successfully.');
      setTimeout(() => navigate(loginPath, { replace: true }), 1800);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to reset password' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAdminContext) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-800 shadow-lg">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-center h-24">
              <img src="/logo.png" alt="RER Logo" className="h-16 w-auto object-contain" />
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900" style={font}>Reset admin password</h2>
              <p className="mt-2 text-sm text-gray-600" style={font}>Choose a new password for your admin account</p>
            </div>

            {errors.submit ? (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{errors.submit}</div>
            ) : null}
            {successMessage ? (
              <div className="p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm">{successMessage}</div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2" style={font}>
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 pr-12 py-3 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    style={font}
                  />
                  <PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                </div>
                <AuthFieldError message={errors.password} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2" style={font}>
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 pr-12 py-3 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    style={font}
                  />
                  <PasswordToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />
                </div>
                <AuthFieldError message={errors.confirmPassword} />
              </div>

              <button
                type="submit"
                disabled={isLoading || Boolean(successMessage)}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                style={font}
              >
                {isLoading ? 'Updating…' : 'Update password'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600" style={font}>
              <Link to={loginPath} className="text-blue-600 hover:text-blue-700 font-medium">
                Back to admin login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter a new password for your account."
      benefits={[
        'Secure sign-in after your password is updated',
        'Your designs, orders, and quotes stay linked to your account',
      ]}
      footer={(
        <>
          Remembered it?{' '}
          <Link to={loginPath} className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </>
      )}
    >
      {errors.submit ? <AuthAlert type="error">{errors.submit}</AuthAlert> : null}
      {successMessage ? <AuthAlert type="success">{successMessage}</AuthAlert> : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password" className={labelClass} style={font}>New password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className={`${inputClass} pr-10 ${errors.password ? 'border-red-300' : ''}`}
              style={font}
            />
            <PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </div>
          <AuthFieldError message={errors.password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass} style={font}>Confirm password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${inputClass} pr-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
              style={font}
            />
            <PasswordToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />
          </div>
          <AuthFieldError message={errors.confirmPassword} />
        </div>

        <AuthSubmitButton loading={isLoading} loadingLabel="Updating…" disabled={Boolean(successMessage)}>
          Update password
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
