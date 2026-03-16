import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

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

const getProfile = () => {
  return httpClient.get(
    `${apiRoutes.authentication.me}`
  );
};

const forgotPassword = (email) => {
  return httpClient.post(
    `${apiRoutes.authentication.forgotPassword}`,
    { email }
  );
};

export const authService = {
  login,
  register,
  getProfile,
  forgotPassword,
};

export default authService;
