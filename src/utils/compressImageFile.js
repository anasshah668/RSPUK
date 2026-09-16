const compressImageFile = async (file, options = {}) => {
  const {
    maxDimension = 1800,
    quality = 0.82,
    maxBytes = 1.5 * 1024 * 1024,
  } = options;

  if (!file || typeof file.type !== 'string' || !file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }

  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return file;
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    let { width, height } = bitmap;
    const scale = Math.min(1, maxDimension / Math.max(width, height, 1));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const toBlob = (mime, q) =>
      new Promise((resolve) => {
        canvas.toBlob(resolve, mime, q);
      });

    let mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    let q = quality;
    let blob = await toBlob(mime, q);

    while (blob && blob.size > maxBytes && q > 0.5) {
      mime = 'image/jpeg';
      q -= 0.08;
      blob = await toBlob(mime, q);
    }

    if (!blob) return file;

    const extension = mime === 'image/png' ? '.png' : '.jpg';
    const name = String(file.name || 'image').replace(/\.[^.]+$/, extension);
    return new File([blob], name, { type: mime, lastModified: Date.now() });
  } finally {
    if (typeof bitmap.close === 'function') bitmap.close();
  }
};

export default compressImageFile;
