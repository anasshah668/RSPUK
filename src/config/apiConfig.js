export const DEFAULT_API_BASE_URL = 'https://rspuk-services.vercel.app/api';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;

export const PUBLIC_URL = import.meta.env.BASE_URL || '/';

