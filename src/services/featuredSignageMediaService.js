import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';
import compressImageFile from '../utils/compressImageFile';

const adminMediaUrl = (categorySlug) =>
  `${apiRoutes.admin.featuredSignageMedia}/${encodeURIComponent(categorySlug)}`;

const listPublic = () => httpClient.get(apiRoutes.featuredSignageMedia.list);

const getPublicBySlug = (categorySlug) =>
  httpClient.get(`${apiRoutes.featuredSignageMedia.bySlug}/${encodeURIComponent(categorySlug)}`);

const listAdmin = () => httpClient.get(apiRoutes.admin.featuredSignageMedia);

const getAdminBySlug = (categorySlug) =>
  httpClient.get(`${apiRoutes.admin.featuredSignageMedia}/${encodeURIComponent(categorySlug)}`);

const updateAdmin = async (categorySlug, { existingImages = [] } = {}, files = []) => {
  if (!files.length) {
    return httpClient.put(adminMediaUrl(categorySlug), {
      existingImages,
      uploadedImages: [],
    });
  }

  let images = [...existingImages];
  for (const file of files) {
    const compressed = await compressImageFile(file);
    const formData = new FormData();
    formData.append('existingImages', JSON.stringify(images));
    formData.append('images', compressed, compressed.name || file.name);
    const updated = await httpClient.put(adminMediaUrl(categorySlug), formData, {
      timeout: 120000,
    });
    images = Array.isArray(updated?.images) ? updated.images : images;
  }
  return { images };
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
