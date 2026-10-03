/** Iconify — 200k+ open icons (MIT/Apache). Free API, no key required. */
export const ICONIFY_CATEGORIES = [
  {
    id: 'socials',
    label: 'Socials',
    prefix: 'logos',
    defaultQuery: 'instagram',
    icons: [
      'logos:facebook',
      'logos:instagram-icon',
      'logos:x',
      'logos:twitter',
      'logos:linkedin-icon',
      'logos:youtube-icon',
      'logos:whatsapp-icon',
      'logos:tiktok-icon',
      'logos:pinterest',
      'logos:google-icon',
      'logos:apple',
      'logos:telegram',
    ],
  },
  {
    id: 'contacts',
    label: 'Contacts',
    prefix: 'mdi',
    defaultQuery: 'phone',
    icons: [
      'mdi:phone',
      'mdi:email-outline',
      'mdi:map-marker',
      'mdi:web',
      'mdi:account',
      'mdi:message-text',
      'mdi:cellphone',
      'mdi:home',
    ],
  },
  {
    id: 'business',
    label: 'Business',
    prefix: 'mdi',
    defaultQuery: 'briefcase',
    icons: [
      'mdi:briefcase',
      'mdi:store',
      'mdi:office-building',
      'mdi:credit-card',
      'mdi:chart-line',
      'mdi:calendar',
      'mdi:printer',
      'mdi:tag',
    ],
  },
  {
    id: 'shapes',
    label: 'Shapes',
    prefix: 'mdi',
    defaultQuery: 'shape',
    icons: [
      'mdi:circle',
      'mdi:square',
      'mdi:triangle',
      'mdi:star',
      'mdi:heart',
      'mdi:hexagon',
      'mdi:rhombus',
      'mdi:minus',
    ],
  },
  {
    id: 'arrows',
    label: 'Arrows',
    prefix: 'mdi',
    defaultQuery: 'arrow',
    icons: [
      'mdi:arrow-right',
      'mdi:arrow-left',
      'mdi:arrow-up',
      'mdi:arrow-down',
      'mdi:chevron-right',
      'mdi:arrow-right-bold',
      'mdi:swap-horizontal',
      'mdi:redo',
    ],
  },
  {
    id: 'safety',
    label: 'Safety',
    prefix: 'mdi',
    defaultQuery: 'warning',
    icons: [
      'mdi:alert',
      'mdi:alert-circle',
      'mdi:cancel',
      'mdi:fire',
      'mdi:shield-check',
      'mdi:biohazard',
      'mdi:recycle',
    ],
  },
  {
    id: 'packaging',
    label: 'Packaging',
    prefix: 'mdi',
    defaultQuery: 'package',
    icons: [
      'mdi:package-variant',
      'mdi:recycle',
      'mdi:truck',
      'mdi:barcode',
      'mdi:qrcode',
      'mdi:box-cutter',
    ],
  },
  {
    id: 'food',
    label: 'Food & Drink',
    prefix: 'mdi',
    defaultQuery: 'food',
    icons: [
      'mdi:food',
      'mdi:coffee',
      'mdi:beer',
      'mdi:glass-wine',
      'mdi:pizza',
      'mdi:ice-cream',
    ],
  },
  {
    id: 'wedding',
    label: 'Wedding',
    prefix: 'mdi',
    defaultQuery: 'heart',
    icons: [
      'mdi:heart',
      'mdi:ring',
      'mdi:flower',
      'mdi:cake',
      'mdi:champagne',
      'mdi:church',
    ],
  },
  {
    id: 'kids',
    label: 'Kids',
    prefix: 'mdi',
    defaultQuery: 'toy',
    icons: [
      'mdi:teddy-bear',
      'mdi:balloon',
      'mdi:puzzle',
      'mdi:star-face',
      'mdi:school',
      'mdi:soccer',
    ],
  },
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
