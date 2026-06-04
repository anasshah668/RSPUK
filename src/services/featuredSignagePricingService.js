import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const calculate = (payload) =>
  httpClient.post(`${apiRoutes.featuredSignagePricing.calculate}`, payload, { skipAuth: true });

const listAdmin = () => httpClient.get(`${apiRoutes.admin.featuredSignagePricing}`);

const getAdmin = (categorySlug) =>
  httpClient.get(`${apiRoutes.admin.featuredSignagePricing}/${encodeURIComponent(categorySlug)}`);

const updateAdmin = (categorySlug, payload) =>
  httpClient.put(`${apiRoutes.admin.featuredSignagePricing}/${encodeURIComponent(categorySlug)}`, payload);

export const featuredSignagePricingService = {
  calculate,
  listAdmin,
  getAdmin,
  updateAdmin,
};

export default featuredSignagePricingService;
