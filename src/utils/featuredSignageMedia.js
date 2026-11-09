import { featuredSignageItems, getFeaturedSignageBySlug } from '../data/featuredSignageData';

const urlsFromMedia = (images) =>
  (Array.isArray(images) ? images : [])
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean);

/**
 * Merge static featured copy with admin-uploaded images.
 * Categories without admin pictures stay empty — no public-folder defaults.
 */
export function mergeFeaturedItemsWithMedia(mediaItems = []) {
  const bySlug = new Map();
  (Array.isArray(mediaItems) ? mediaItems : []).forEach((row) => {
    const slug = String(row?.categorySlug || '').toLowerCase();
    const urls = urlsFromMedia(row?.images);
    if (slug && urls.length > 0) bySlug.set(slug, urls);
  });

  return featuredSignageItems.map((item) => {
    const override = bySlug.get(String(item.categorySlug || '').toLowerCase());
    return {
      ...item,
      images: override?.length ? override : [],
      imagesFromAdmin: Boolean(override?.length),
    };
  });
}

export function mergeFeaturedItemWithMedia(slug, mediaImages = []) {
  const item = getFeaturedSignageBySlug(slug);
  if (!item) return null;
  const urls = urlsFromMedia(mediaImages);
  return {
    ...item,
    images: urls,
    imagesFromAdmin: urls.length > 0,
  };
}
