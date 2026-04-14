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

const listGalleryProjectsAdmin = () => {
  return httpClient.get(`${apiRoutes.admin.galleryProjectsAdmin}`);
};

const createGalleryProject = (payload, files = []) => {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  });
  files.forEach((file) => formData.append('images', file));
  return httpClient.post(`${apiRoutes.admin.galleryProjects}`, formData);
};

const updateGalleryProject = (projectId, payload, files = []) => {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  });
  files.forEach((file) => formData.append('images', file));
  return httpClient.put(`${apiRoutes.admin.galleryProjectById}/${projectId}`, formData);
};

const deleteGalleryProject = (projectId) => {
  return httpClient.delete(`${apiRoutes.admin.galleryProjectById}/${projectId}`);
};

export const adminService = {
  analytics,
  getTopAnnouncement,
  updateTopAnnouncement,
  listGalleryProjectsAdmin,
  createGalleryProject,
  updateGalleryProject,
  deleteGalleryProject,
};

export default adminService;
