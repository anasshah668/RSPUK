import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const list = () => {
  return httpClient.get(
    `${apiRoutes.categories.list}`
  );
};

const listAll = () => {
  return httpClient.get(
    `${apiRoutes.categories.listAll}`
  );
};

const getById = (categoryId) => {
  return httpClient.get(
    `${apiRoutes.categories.getById}/${categoryId}`
  );
};

const create = (payload) => {
  return httpClient.post(
    `${apiRoutes.categories.create}`,
    payload
  );
};

const update = (categoryId, payload) => {
  return httpClient.put(
    `${apiRoutes.categories.update}/${categoryId}`,
    payload
  );
};

const deleteCategory = (categoryId) => {
  return httpClient.delete(
    `${apiRoutes.categories.delete}/${categoryId}`
  );
};

export const categoryService = {
  list,
  listAll,
  getById,
  create,
  update,
  delete: deleteCategory,
};

export default categoryService;
