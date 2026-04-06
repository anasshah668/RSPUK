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

const syncProductsToDb = (params = {}) => {
  return httpClient.post(apiRoutes.thirdParty.syncProducts, {}, params);
};

const getProductPrices = (payload) => {
  return httpClient.post(apiRoutes.thirdParty.productPrices, payload);
};

const getExpectedDeliveryDate = (payload) => {
  return httpClient.post(apiRoutes.thirdParty.expectedDeliveryDate, payload);
};

export const thirdPartyService = {
  getProductAttributes,
  getProductAttributesByName,
  refreshAuth,
  syncProductsToDb,
  getProductPrices,
  getExpectedDeliveryDate,
};

export default thirdPartyService;

