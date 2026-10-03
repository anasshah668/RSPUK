const DEAD_IMAGE_HOSTS = /via\.placeholder\.com|placehold\.it|placehold\.co|placeholder\.com/i;

export function isUsableImageUrl(value) {
  const url = String(value || '').trim();
  if (!url || url === 'undefined' || url === 'null') return false;
  if (DEAD_IMAGE_HOSTS.test(url)) return false;
  return /^(https?:\/\/|\/|data:image\/)/i.test(url);
}

export function fallbackImageDataUri(label = 'No image', size = 400) {
  const text = String(label || 'No image').replace(/[<>&]/g, '').slice(0, 28) || 'No image';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect fill="#e5e7eb" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#9ca3af">${text}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function handleImageErrorOnce(event, label = 'No image') {
  const img = event.currentTarget;
  if (!img || img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';
  img.onerror = null;
  img.src = fallbackImageDataUri(label);
}

export function extractImageUrl(entry) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry.trim();
  if (typeof entry === 'object') {
    return String(entry.url || entry.src || entry.secure_url || '').trim();
  }
  return '';
}
