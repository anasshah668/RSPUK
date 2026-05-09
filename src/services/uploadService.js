import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

/**
 * Upload a single artwork file (image or PDF) to the backend, which forwards
 * it to Cloudinary and returns the hosted URL. The returned URL is what we
 * pass to Tradeprint as `fileUrls[]` during order validation/placement.
 *
 * @param {File} file
 * @returns {Promise<{ url: string, publicId?: string, format?: string }>}
 */
const uploadArtwork = async (file) => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  const formData = new FormData();
  formData.append('file', file);
  return httpClient.post(apiRoutes.uploads.artwork, formData);
};

export const uploadService = {
  uploadArtwork,
};

export default uploadService;
