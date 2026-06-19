import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const getPrice = () => httpClient.get(apiRoutes.designService.price);

const create = (payload) => {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (key === 'referenceFiles') return;
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  (payload?.referenceFiles || []).forEach((file) => {
    if (file) formData.append('referenceFiles', file);
  });
  return httpClient.post(apiRoutes.designService.create, formData);
};

const listMy = () => httpClient.get(apiRoutes.designService.my);

const getById = (id) => httpClient.get(`${apiRoutes.designService.getById}/${id}`);

const adminList = (params = {}) =>
  httpClient.get(apiRoutes.designService.adminList, params);

const adminUpdate = (id, payload) =>
  httpClient.patch(`${apiRoutes.designService.adminUpdate}/${id}`, payload);

const adminUploadDeliverable = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return httpClient.post(
    `${apiRoutes.designService.adminDeliverable}/${id}/deliverable`,
    formData,
  );
};

export const designService = {
  getPrice,
  create,
  listMy,
  getById,
  adminList,
  adminUpdate,
  adminUploadDeliverable,
};

export default designService;
