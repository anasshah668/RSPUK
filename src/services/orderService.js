import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const create = (payload) => {
  return httpClient.post(
    `${apiRoutes.orders.create}`,
    payload,
    { skipAuth: true }
  );
};

const getUserOrders = () => {
  return httpClient.get(
    `${apiRoutes.orders.getUserOrders}`
  );
};

const getById = (orderId) => {
  return httpClient.get(
    `${apiRoutes.orders.getById}/${orderId}`
  );
};

const list = (params = {}) => {
  return httpClient.get(
    `${apiRoutes.orders.list}`,
    params
  );
};

const updateStatus = (orderId, status, trackingNumber = null) => {
  const payload = { status };
  if (trackingNumber) {
    payload.trackingNumber = trackingNumber;
  }
  return httpClient.put(
    `${apiRoutes.orders.updateStatus}/${orderId}/status`,
    payload
  );
};

export const orderService = {
  create,
  getUserOrders,
  getById,
  list,
  updateStatus,
};

export default orderService;
