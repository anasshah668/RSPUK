import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const analytics = () => {
  return httpClient.get(
    `${apiRoutes.admin.analytics}`
  );
};

const getTopAnnouncement = () => {
  return httpClient.get(
    `${apiRoutes.admin.topAnnouncement}`
  );
};

const updateTopAnnouncement = (payload) => {
  return httpClient.put(
    `${apiRoutes.admin.topAnnouncement}`,
    payload
  );
};

export const adminService = {
  analytics,
  getTopAnnouncement,
  updateTopAnnouncement,
};

export default adminService;
