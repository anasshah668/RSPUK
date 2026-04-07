import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const create = (payload) => {
  return httpClient.post(
    `${apiRoutes.quotes.create}`,
    payload
  );
};

const createLogoArtworkQuote = (payload) => {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  return httpClient.post(
    `${apiRoutes.quotes.create}`,
    formData
  );
};

const list = (params = {}) => {
  return httpClient.get(
    `${apiRoutes.quotes.list}`,
    params
  );
};

const listMy = () => {
  return httpClient.get(
    `${apiRoutes.quotes.my}`
  );
};

const getById = (quoteId) => {
  return httpClient.get(
    `${apiRoutes.quotes.getById}/${quoteId}`
  );
};

const update = (quoteId, payload) => {
  return httpClient.put(
    `${apiRoutes.quotes.update}/${quoteId}`,
    payload
  );
};

const sendQuotationEmail = (quoteId, payload = {}) => {
  return httpClient.post(
    `${apiRoutes.quotes.sendEmail}/${quoteId}/send-email`,
    payload
  );
};

const reply = (quoteId, payload = {}) => {
  return httpClient.put(
    `${apiRoutes.quotes.update}/${quoteId}/reply`,
    payload
  );
};

export const quoteService = {
  create,
  createLogoArtworkQuote,
  list,
  listMy,
  getById,
  update,
  reply,
  sendQuotationEmail,
};

export default quoteService;
