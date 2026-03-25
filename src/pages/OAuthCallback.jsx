import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('Missing Google authentication token');
        }

        localStorage.setItem('token', token);
        const profile = await authService.getProfile();

        login(
          {
            _id: profile._id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          },
          token
        );

        navigate('/', { replace: true });
      } catch (oauthError) {
        localStorage.removeItem('token');
        setError(oauthError.message || 'Google login failed. Please try again.');
      }
    };

    handleOAuthCallback();
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-red-600">Google sign-in failed</h1>
            <p className="mt-3 text-sm text-gray-600">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-6 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Back to login
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-gray-900">Signing you in...</h1>
            <p className="mt-3 text-sm text-gray-600">Completing Google authentication.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
