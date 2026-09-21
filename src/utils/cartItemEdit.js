import { getRoutePath } from '../config/routes.config';
import { createSlug, encryptId } from './encryption';

const MONGO_ID = /^[a-fA-F0-9]{24}$/;

export function canEditCartItem(item) {
  if (!item || item.type === 'checkout-order' || item.paymentId) return false;
  if (item.type === 'custom-neon') return true;
  if (item.type === 'featured-signage') return true;
  if (item.type === 'design-service') return true;
  if (item.id && (item.category || item.name)) return true;
  return Boolean(item.id);
}

export function getCartItemEditTarget(item) {
  if (!canEditCartItem(item)) return null;

  const state = { editCartLine: item };

  if (item.type === 'custom-neon') {
    return { path: getRoutePath('customNeonBuilder'), state };
  }

  if (item.type === 'featured-signage') {
    const slug = String(item.selectedAttributes?.category || '').trim();
    if (slug) {
      return { path: `/featured/${encodeURIComponent(slug)}/quote`, state };
    }
  }

  if (item.type === 'design-service') {
    return { path: getRoutePath('designService'), state };
  }

  const productId = String(item.id || '').trim();
  if (MONGO_ID.test(productId) || productId) {
    const category = createSlug(item.category || 'products') || 'products';
    const productName = createSlug(item.name || item.title || 'product') || 'product';
    const encryptedId = encryptId(productId);
    if (encryptedId) {
      return {
        path: getRoutePath('productDetail', { category, productName, encryptedId }),
        state,
      };
    }
  }

  return null;
}
