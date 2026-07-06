import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const list = () => httpClient.get(`${apiRoutes.settings.faqs}`);

export const faqService = { list };
export default faqService;
