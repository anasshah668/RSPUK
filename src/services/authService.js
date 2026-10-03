import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const getApiBaseUrl = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    return config?.api?.baseUrl || import.meta.env.VITE_API_URL || 'https://rspuk-services.vercel.app/api';
  } catch (error) {
    return import.meta.env.VITE_API_URL || 'https://rspuk-services.vercel.app/api';
  }
};

const getGoogleAuthUrl = async () => {
  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}/auth/google`;
};

const login = (payload) => {
  return httpClient.post(
    `${apiRoutes.authentication.login}`,
    payload,
    { skipAuth: true },
  );
};

const adminGateHeaders = (gateToken) =>
  gateToken ? { 'X-Admin-Gate-Token': gateToken } : {};

const verifyAdminGate = (code) => {
  return httpClient.post(
    `${apiRoutes.authentication.adminVerifyGate}`,
    { code },
    { skipAuth: true },
  );
};

const adminLogin = (payload, gateToken) => {
  return httpClient.post(
    `${apiRoutes.authentication.adminLogin}`,
    { ...payload, gateToken },
    { skipAuth: true, headers: adminGateHeaders(gateToken) },
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

const forgotPassword = (email, options = {}) => {
  const { gateToken, ...rest } = options;
  return httpClient.post(
    `${apiRoutes.authentication.forgotPassword}`,
    { email, ...rest, ...(gateToken ? { gateToken } : {}) },
    { skipAuth: true, headers: adminGateHeaders(gateToken) },
  );
};

const forgotPasswordVerifyOtp = (payload) => {
  return httpClient.post(
    `${apiRoutes.authentication.forgotPasswordVerifyOtp}`,
    payload,
    { skipAuth: true },
  );
};

const resetPassword = (payload) => {
  return httpClient.post(
    `${apiRoutes.authentication.resetPassword}`,
    payload,
    { skipAuth: true },
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
  verifyAdminGate,
  adminLogin,
  register,
  registerSendOtp,
  registerVerifyOtp,
  getProfile,
  updateProfile,
  forgotPassword,
  forgotPasswordVerifyOtp,
  resetPassword,
  getGoogleAuthUrl,
  changePassword,
};

export default authService;
