import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const list = (params = {}) => {
  return httpClient.get(
    `${apiRoutes.products.list}`,
    params
  );
};

const listAll = async (params = {}) => {
  const pageSize = 100;
  let page = 1;
  let allProducts = [];
  let totalPages = 1;

  do {
    const data = await list({ ...params, page, limit: pageSize });
    const batch = Array.isArray(data?.products) ? data.products : [];
    allProducts = allProducts.concat(batch);
    totalPages = Number(data?.totalPages) || 1;
    page += 1;
  } while (page <= totalPages);

  return {
    products: allProducts,
    total: allProducts.length,
  };
};

const getById = (productId) => {
  return httpClient.get(
    `${apiRoutes.products.getById}/${productId}`
  );
};

const getByCategory = (category) => {
  return httpClient.get(
    `${apiRoutes.products.getByCategory}/${category}`
  );
};

const getRecommended = (params = {}) => {
  return httpClient.get(
    `${apiRoutes.products.getRecommended}`,
    params
  );
};

const create = (payload, files = []) => {
  const formData = new FormData();
  
  // Append all payload fields to FormData
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  });
  
  // Append image files
  files.forEach((file) => formData.append('images', file));

  return httpClient.post(
    `${apiRoutes.products.create}`,
    formData
  );
};

const update = (productId, payload, files = []) => {
  const formData = new FormData();
  
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  });
  
  files.forEach((file) => formData.append('images', file));

  return httpClient.put(
    `${apiRoutes.products.update}/${productId}`,
    formData
  );
};

const deleteProduct = (productId) => {
  return httpClient.delete(
    `${apiRoutes.products.delete}/${productId}`
  );
};

export const productService = {
  list,
  listAll,
  getById,
  getByCategory,
  getRecommended,
  create,
  update,
  delete: deleteProduct,
};

export default productService;
