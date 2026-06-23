/** Iconify — 200k+ open icons (MIT/Apache). Free API, no key required. */
export const ICONIFY_CATEGORIES = [
  { id: 'socials', label: 'Socials', defaultQuery: 'social media', prefix: 'logos' },
  { id: 'contacts', label: 'Contacts', defaultQuery: 'contact communication', prefix: 'fluent-color' },
  { id: 'business', label: 'Business', defaultQuery: 'business office', prefix: 'fluent-color' },
  { id: 'shapes', label: 'Shapes', defaultQuery: 'shape geometric', prefix: 'fluent-color' },
  { id: 'arrows', label: 'Arrows', defaultQuery: 'arrow', prefix: 'fluent-color' },
  { id: 'safety', label: 'Safety', defaultQuery: 'warning safety', prefix: 'fluent-color' },
  { id: 'packaging', label: 'Packaging', defaultQuery: 'recycle package', prefix: 'fluent-color' },
  { id: 'food', label: 'Food & Drink', defaultQuery: 'food restaurant', prefix: 'fluent-color' },
  { id: 'wedding', label: 'Wedding', defaultQuery: 'wedding love', prefix: 'noto' },
  { id: 'kids', label: 'Kids', defaultQuery: 'kids toy school', prefix: 'noto' },
];

export async function searchIconifyIcons(query, limit = 64, prefix = '') {
  const trimmed = String(query || '').trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    query: trimmed,
    limit: String(limit),
  });
  if (prefix) {
    params.set('prefix', prefix);
  }

  const res = await fetch(`https://api.iconify.design/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Icon search failed');
  }
  const data = await res.json();
  return data.icons || [];
}

export async function fetchIconifySvg(iconName) {
  const res = await fetch(`https://api.iconify.design/${encodeURIComponent(iconName)}.svg`);
  if (!res.ok) {
    throw new Error('Icon fetch failed');
  }
  return res.text();
}

export function getIconifyPreviewUrl(iconName, size = 32) {
  return `https://api.iconify.design/${encodeURIComponent(iconName)}.svg?width=${size}&height=${size}`;
}

/** Preserve original SVG colours; only ensure dimensions for reliable Fabric rendering. */
export function prepareIconifySvgForCanvas(svgText) {
  let svg = String(svgText || '').trim();
  if (!svg) return '';

  if (!/\bwidth=/.test(svg)) {
    svg = svg.replace('<svg', '<svg width="48" height="48"');
  }

  return svg;
}

export function iconifySvgToDataUrl(svgText) {
  const svg = prepareIconifySvgForCanvas(svgText);
  const encodedSvg = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
}
