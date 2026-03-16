import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const analytics = () => {
  return httpClient.get(
    `${apiRoutes.admin.analytics}`
  );
};

export const adminService = {
  analytics,
};

export default adminService;
