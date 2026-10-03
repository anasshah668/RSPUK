/** Basket / cart line display helpers */

import { dedupeOptionRows } from './optionLabels';

export function basketTypeLabel(type) {
  switch (type) {
    case 'design-service':
      return 'Design service';
    case 'custom-neon':
      return 'Custom neon';
    case 'featured-signage':
      return 'Featured signage';
    case 'checkout-order':
      return 'Order receipt';
    default:
      return type ? String(type).replace(/-/g, ' ') : null;
  }
}

/**
 * Human-readable detail lines for a basket row.
 * Prefer structured summary for design-service / neon; avoid duplicating title.
 */
export function getBasketItemDetailLines(item, { maxSummary = 4 } = {}) {
  const lines = [];
  const type = item?.type;

  if (item?.quantity) {
    lines.push({ label: 'Quantity', value: String(item.quantity) });
  }

  const collected = [];
  if (Array.isArray(item?.summary) && item.summary.length > 0) {
    item.summary.forEach(({ label, value }) => {
      if (!label || String(label).toLowerCase() === 'quantity') return;
      if (type === 'design-service' && label === 'Price') return;
      collected.push({ label, value });
    });
  } else {
    if (item?.size) collected.push({ label: 'Size', value: String(item.size) });
    if (item?.designOption === 'upload') collected.push({ label: 'Design', value: 'Upload artwork' });
    if (item?.designOption === 'custom') collected.push({ label: 'Design', value: 'Online designer' });
    if (item?.deliveryOption) collected.push({ label: 'Delivery', value: item.deliveryOption });
    if (Array.isArray(item?.productOptions)) collected.push(...item.productOptions);
    if (item?.selectedAttributes && typeof item.selectedAttributes === 'object') {
      Object.entries(item.selectedAttributes).forEach(([label, value]) => {
        if (value == null || value === '' || typeof value === 'object') return;
        collected.push({ label, value: String(value) });
      });
    }
  }

  lines.push(...dedupeOptionRows(collected));

  if (lines.length > 0) return lines.slice(0, maxSummary);

  if (item?.description && type !== 'design-service') {
    const short =
      item.description.length > 120
        ? `${item.description.slice(0, 117)}…`
        : item.description;
    lines.push({ label: null, value: short });
  }

  return lines;
}
