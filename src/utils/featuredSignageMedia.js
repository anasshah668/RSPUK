import { featuredSignageItems, getFeaturedSignageBySlug } from '../data/featuredSignageData';

/**
 * Merge static featured items with admin-uploaded Cloudinary images.
 * When a category has admin images, they replace public-folder images.
 */
export function mergeFeaturedItemsWithMedia(mediaItems = []) {
  const bySlug = new Map();
  (Array.isArray(mediaItems) ? mediaItems : []).forEach((row) => {
    const slug = String(row?.categorySlug || '').toLowerCase();
    const urls = Array.isArray(row?.images)
      ? row.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
      : [];
    if (slug && urls.length > 0) bySlug.set(slug, urls);
  });

  return featuredSignageItems.map((item) => {
    const override = bySlug.get(String(item.categorySlug || '').toLowerCase());
    if (!override?.length) return item;
    return { ...item, images: override, imagesFromAdmin: true };
  });
}

export function mergeFeaturedItemWithMedia(slug, mediaImages = []) {
  const item = getFeaturedSignageBySlug(slug);
  if (!item) return null;
  const urls = (Array.isArray(mediaImages) ? mediaImages : [])
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean);
  if (!urls.length) return item;
  return { ...item, images: urls, imagesFromAdmin: true };
}
