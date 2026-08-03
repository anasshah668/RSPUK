import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const listPublic = () => httpClient.get(apiRoutes.featuredSignageMedia.list);

const getPublicBySlug = (categorySlug) =>
  httpClient.get(`${apiRoutes.featuredSignageMedia.bySlug}/${encodeURIComponent(categorySlug)}`);

const listAdmin = () => httpClient.get(apiRoutes.admin.featuredSignageMedia);

const getAdminBySlug = (categorySlug) =>
  httpClient.get(`${apiRoutes.admin.featuredSignageMedia}/${encodeURIComponent(categorySlug)}`);

const updateAdmin = (categorySlug, { existingImages = [] } = {}, files = []) => {
  const formData = new FormData();
  formData.append('existingImages', JSON.stringify(existingImages));
  files.forEach((file) => formData.append('images', file));
  return httpClient.put(
    `${apiRoutes.admin.featuredSignageMedia}/${encodeURIComponent(categorySlug)}`,
    formData,
  );
};

const clearAdmin = (categorySlug) =>
  httpClient.delete(`${apiRoutes.admin.featuredSignageMedia}/${encodeURIComponent(categorySlug)}`);

export const featuredSignageMediaService = {
  listPublic,
  getPublicBySlug,
  listAdmin,
  getAdminBySlug,
  updateAdmin,
  clearAdmin,
};

export default featuredSignageMediaService;
