import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const list = () => httpClient.get(`${apiRoutes.settings.galleryProjects}`);

export const galleryService = { list };
export default galleryService;
