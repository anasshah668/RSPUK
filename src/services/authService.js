import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const getApiBaseUrl = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    return config?.api?.baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
  } catch (error) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
  }
};

const getGoogleAuthUrl = async () => {
  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}/auth/google`;
};

const login = (payload) => {
  return httpClient.post(
    `${apiRoutes.authentication.login}`,
    payload
  );
};

const register = (payload) => {
  return httpClient.post(
    `${apiRoutes.authentication.register}`,
    payload
  );
};

const registerSendOtp = (payload) => {
  return httpClient.post(
    `${apiRoutes.authentication.registerSendOtp}`,
    payload
  );
};

const registerVerifyOtp = (payload) => {
  return httpClient.post(
    `${apiRoutes.authentication.registerVerifyOtp}`,
    payload
  );
};

const getProfile = () => {
  return httpClient.get(
    'users/profile'
  );
};

const updateProfile = (payload) => {
  return httpClient.put(
    'users/profile',
    payload
  );
};

const forgotPassword = (email) => {
  return httpClient.post(
    `${apiRoutes.authentication.forgotPassword}`,
    { email }
  );
};

const changePassword = (payload) => {
  return httpClient.post(
    `${apiRoutes.authentication.changePassword}`,
    payload
  );
};

export const authService = {
  login,
  register,
  registerSendOtp,
  registerVerifyOtp,
  getProfile,
  updateProfile,
  forgotPassword,
  getGoogleAuthUrl,
  changePassword,
};

export default authService;
