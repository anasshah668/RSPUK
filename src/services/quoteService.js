import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const create = (payload) => {
  return httpClient.post(
    `${apiRoutes.quotes.create}`,
    payload
  );
};

const list = (params = {}) => {
  return httpClient.get(
    `${apiRoutes.quotes.list}`,
    params
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

export const quoteService = {
  create,
  list,
  getById,
  update,
};

export default quoteService;
