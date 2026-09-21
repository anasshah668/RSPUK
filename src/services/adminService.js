import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';
import { prepareImageForUpload } from '../utils/compressImageFile';

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

const getDesignServicePrice = () => {
  return httpClient.get(`${apiRoutes.admin.designServicePrice}`);
};

const updateDesignServicePrice = (payload) => {
  return httpClient.put(`${apiRoutes.admin.designServicePrice}`, payload);
};

const listGalleryProjectsAdmin = () => {
  return httpClient.get(`${apiRoutes.admin.galleryProjectsAdmin}`);
};

const appendGalleryPayload = (formData, payload = {}) => {
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  });
};

const createGalleryProject = async (payload, files = []) => {
  if (!files.length) {
    throw new Error('Please add at least one picture.');
  }
  const [first, ...rest] = files;
  const firstCompressed = await prepareImageForUpload(first);
  const formData = new FormData();
  appendGalleryPayload(formData, payload);
  formData.append('images', firstCompressed, firstCompressed.name);
  const created = await httpClient.post(`${apiRoutes.admin.galleryProjects}`, formData, {
    timeout: 120000,
  });
  if (!rest.length) return created;
  return updateGalleryProject(
    created._id,
    { ...payload, existingImages: created.images || [] },
    rest,
  );
};

const updateGalleryProject = async (projectId, payload, files = []) => {
  if (!files.length) {
    const formData = new FormData();
    appendGalleryPayload(formData, payload);
    return httpClient.put(`${apiRoutes.admin.galleryProjectById}/${projectId}`, formData, {
      timeout: 120000,
    });
  }

  let existingImages = Array.isArray(payload?.existingImages) ? [...payload.existingImages] : [];
  let latest = null;
  for (const file of files) {
    const compressed = await prepareImageForUpload(file);
    const formData = new FormData();
    appendGalleryPayload(formData, { ...payload, existingImages });
    formData.append('images', compressed, compressed.name);
    latest = await httpClient.put(`${apiRoutes.admin.galleryProjectById}/${projectId}`, formData, {
      timeout: 120000,
    });
    existingImages = Array.isArray(latest?.images) ? latest.images : existingImages;
  }
  return latest;
};

const deleteGalleryProject = (projectId) => {
  return httpClient.delete(`${apiRoutes.admin.galleryProjectById}/${projectId}`);
};

const listFaqsAdmin = () => {
  return httpClient.get(`${apiRoutes.admin.faqsAdmin}`);
};

const createFaq = (payload) => {
  return httpClient.post(`${apiRoutes.admin.faqs}`, payload);
};

const updateFaq = (faqId, payload) => {
  return httpClient.put(`${apiRoutes.admin.faqById}/${faqId}`, payload);
};

const deleteFaq = (faqId) => {
  return httpClient.delete(`${apiRoutes.admin.faqById}/${faqId}`);
};

export const adminService = {
  analytics,
  getTopAnnouncement,
  updateTopAnnouncement,
  getDesignServicePrice,
  updateDesignServicePrice,
  listGalleryProjectsAdmin,
  createGalleryProject,
  updateGalleryProject,
  deleteGalleryProject,
  listFaqsAdmin,
  createFaq,
  updateFaq,
  deleteFaq,
};

export default adminService;
