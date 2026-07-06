export const TRADEPRINT_CATEGORY_SLUGS = [
  'business-cards',
  'flyers',
  'leaflets',
  'brochures',
  'menus',
  'calendars',
  'stickers',
];

export const TRADEPRINT_CATEGORY_LABELS = {
  'business-cards': 'Business Cards',
  flyers: 'Flyers',
  leaflets: 'Leaflets',
  brochures: 'Brochures',
  menus: 'Menus',
  calendars: 'Calendars',
  stickers: 'Stickers',
};

export const isTradeprintCategory = (slug) =>
  TRADEPRINT_CATEGORY_SLUGS.includes(String(slug || '').toLowerCase());
