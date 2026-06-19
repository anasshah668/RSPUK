import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const createWorldpayCheckoutSession = (payload) => {
  return httpClient.post(
    `${apiRoutes.payments.worldpayCheckoutSession}`,
    payload,
    { skipAuth: true }
  );
};

const chargeWorldpay = (payload, options = {}) => {
  return httpClient.post(
    `${apiRoutes.payments.worldpayCharge}`,
    payload,
    { skipAuth: true, ...options },
  );
};

/** Design service payments always require a valid Bearer token — no guest checkout. */
const chargeDesignServiceWorldpay = (payload) => {
  return httpClient.post(`${apiRoutes.payments.worldpayCharge}`, payload);
};

export const paymentService = {
  createWorldpayCheckoutSession,
  chargeWorldpay,
  chargeDesignServiceWorldpay,
};

export default paymentService;
