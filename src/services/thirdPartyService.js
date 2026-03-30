import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const getProductAttributes = (params = {}) => {
  return httpClient.get(apiRoutes.thirdParty.productAttributes, params);
};

const refreshAuth = () => {
  return httpClient.post(apiRoutes.thirdParty.authLogin, {});
};

export const thirdPartyService = {
  getProductAttributes,
  refreshAuth,
};

export default thirdPartyService;

