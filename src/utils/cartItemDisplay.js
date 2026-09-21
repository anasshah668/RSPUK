/** Basket / cart line display helpers */

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

  if (Array.isArray(item?.summary) && item.summary.length > 0) {
    const skipLabels =
      type === 'design-service'
        ? new Set(['Price'])
        : type === 'custom-neon'
          ? new Set()
          : new Set();

    item.summary.slice(0, maxSummary + 2).forEach(({ label, value }) => {
      if (!label || skipLabels.has(label)) return;
      if (value == null || String(value).trim() === '') return;
      lines.push({ label: String(label), value: String(value) });
    });
    return lines.slice(0, maxSummary);
  }

  if (item?.size) {
    lines.push({ label: 'Size', value: String(item.size) });
  }
  if (item?.quantity) {
    lines.push({ label: 'Quantity', value: String(item.quantity) });
  }
  if (item?.designOption === 'upload') {
    lines.push({ label: 'Design', value: 'Upload artwork' });
  } else if (item?.designOption === 'custom') {
    lines.push({ label: 'Design', value: 'Online designer' });
  }
  if (item?.deliveryOption) {
    lines.push({
      label: 'Delivery',
      value: String(item.deliveryOption).replace(/-/g, ' '),
    });
  }

  if (Array.isArray(item?.productOptions)) {
    item.productOptions.forEach((opt) => {
      if (!opt?.label || opt.value == null || String(opt.value).trim() === '') return;
      lines.push({ label: String(opt.label), value: String(opt.value) });
    });
  }

  if (item?.selectedAttributes && typeof item.selectedAttributes === 'object') {
    Object.entries(item.selectedAttributes).forEach(([label, value]) => {
      if (value == null || value === '' || typeof value === 'object') return;
      if (lines.some((row) => row.label === label && row.value === String(value))) return;
      lines.push({ label: String(label), value: String(value) });
    });
  }

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
