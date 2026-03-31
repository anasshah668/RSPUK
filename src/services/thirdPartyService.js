import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const getProductAttributes = (params = {}) => {
  return httpClient.get(apiRoutes.thirdParty.productAttributes, params);
};

const getProductAttributesByName = (productName, params = {}) => {
  const encodedName = encodeURIComponent(productName);
  return httpClient.get(`${apiRoutes.thirdParty.productAttributesByName}/${encodedName}`, params);
};

const refreshAuth = () => {
  return httpClient.post(apiRoutes.thirdParty.authLogin, {});
};

export const thirdPartyService = {
  getProductAttributes,
  getProductAttributesByName,
  refreshAuth,
};

export default thirdPartyService;

