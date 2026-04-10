import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const calculate = (payload) =>
  httpClient.post(`${apiRoutes.neonPricing.calculate}`, payload, { skipAuth: true });

const getAdmin = () => httpClient.get(`${apiRoutes.admin.neonPricing}`);

const updateAdmin = (payload) => httpClient.put(`${apiRoutes.admin.neonPricing}`, payload);

export const neonPricingService = {
  calculate,
  getAdmin,
  updateAdmin,
};

export default neonPricingService;
