const SLUG_LABELS = {
  '450gsm-silk-finish': '450gsm Silk Finish',
  '350gsm-recycled-uncoated': '350gsm Recycled Uncoated',
  '350gsm-silk-finish': '350gsm Silk Finish',
  '300gsm-uncoated': '300gsm Uncoated',
  'both-sides-matt': 'Both Sides (Matt)',
  'double-sided': 'Double sided',
  'single-sided': 'Single sided',
  saver: 'Saver delivery',
  standard: 'Standard delivery',
  express: 'Express delivery',
  no: 'None',
  yes: 'Yes',
  none: 'None',
  upload: 'Upload artwork',
  custom: 'Online designer',
  uk: 'United Kingdom',
  'united-kingdom': 'United Kingdom',
};

const LABEL_ALIASES = {
  'sides printed': 'Sides printed',
  'side printed': 'Sides printed',
  'paper type': 'Paper type',
  material: 'Paper type',
  corners: 'Corners',
  'round corners': 'Corners',
  delivery: 'Delivery',
  'delivery option': 'Delivery',
};

const HIDDEN_BASKET_LABELS = new Set([
  'preview text size',
  'glow intensity',
  'letter spacing',
  'flicker effect',
  'pricing basis',
  'matches header vat',
]);

export function formatOptionLabel(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const mapped = SLUG_LABELS[raw.toLowerCase()];
  if (mapped) return mapped;
  if (!/[-_]/.test(raw)) return raw;
  return raw
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function canonicalOptionLabel(label) {
  const raw = String(label || '').trim();
  if (!raw) return '';
  return LABEL_ALIASES[raw.toLowerCase()] || raw;
}

export function shouldHideBasketLabel(label) {
  return HIDDEN_BASKET_LABELS.has(String(label || '').trim().toLowerCase());
}

export function dedupeOptionRows(rows = []) {
  const seen = new Set();
  const out = [];
  rows.forEach((row) => {
    const label = canonicalOptionLabel(row?.label);
    const value = formatOptionLabel(row?.value);
    if (!label || !value || shouldHideBasketLabel(label)) return;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ label, value });
  });
  return out;
}
