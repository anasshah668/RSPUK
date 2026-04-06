import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const createWorldpayCheckoutSession = (payload) => {
  return httpClient.post(
    `${apiRoutes.payments.worldpayCheckoutSession}`,
    payload,
    { skipAuth: true }
  );
};

const chargeWorldpay = (payload) => {
  return httpClient.post(
    `${apiRoutes.payments.worldpayCharge}`,
    payload,
    { skipAuth: true }
  );
};

export const paymentService = {
  createWorldpayCheckoutSession,
  chargeWorldpay,
};

export default paymentService;
