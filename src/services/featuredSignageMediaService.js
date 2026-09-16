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

const uploadViaPresign = async (files) => {
  const uploadedImages = [];
  for (const file of files) {
    const presign = await httpClient.post(apiRoutes.admin.uploadsPresign, {
      fileName: file.name,
      contentType: file.type || 'image/jpeg',
      folder: 'printing-platform/featured-signage',
    });
    if (!presign?.uploadUrl) {
      throw new Error('S3 upload URL was not returned');
    }
    const putRes = await fetch(presign.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': presign.contentType || file.type || 'image/jpeg',
      },
    });
    if (!putRes.ok) {
      const detail = await putRes.text().catch(() => '');
      throw new Error(detail || `S3 upload failed (${putRes.status})`);
    }
    uploadedImages.push({
      url: presign.publicUrl,
      publicId: presign.publicId || presign.key,
    });
  }
  return uploadedImages;
};

const uploadViaApi = async (categorySlug, existingImages, files) => {
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

const updateAdmin = async (categorySlug, { existingImages = [] } = {}, files = []) => {
  if (!files.length) {
    return httpClient.put(adminMediaUrl(categorySlug), {
      existingImages,
      uploadedImages: [],
    });
  }

  try {
    const uploadedImages = await uploadViaPresign(files);
    return httpClient.put(adminMediaUrl(categorySlug), {
      existingImages,
      uploadedImages,
    });
  } catch (error) {
    console.warn('Direct S3 upload failed, falling back to API proxy', error);
    return uploadViaApi(categorySlug, existingImages, files);
  }
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
