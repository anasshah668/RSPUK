// Encryption utility for product IDs
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'rspuk-product-key-2024';

export const encryptId = (id) => {
  try {
    if (!id) return '';
    const combined = `${id}-${ENCRYPTION_KEY}`;
    const encoded = btoa(combined);
    return encodeURIComponent(encoded);
  } catch (error) {
    console.error('Encryption error:', error);
    return id;
  }
};

export const decryptId = (encryptedId) => {
  try {
    if (!encryptedId) return '';
    const decoded = decodeURIComponent(encryptedId);
    const combined = atob(decoded);
    const id = combined.split('-')[0];
    return id;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedId;
  }
};

// Create URL-friendly slug from text
export const createSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
