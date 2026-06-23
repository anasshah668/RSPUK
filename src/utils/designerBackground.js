import { fabric } from 'fabric';

export const DEFAULT_BACKGROUND_STYLE = { kind: 'solid', color: '#ffffff' };

export const backgroundColorSwatches = [
  'transparent',
  '#000000',
  '#5b5b5b',
  '#7a7a7a',
  '#a8a8a8',
  '#d4d4d8',
  '#ffffff',
  '#ef4444',
  '#f2645d',
  '#d95eb6',
  '#b06ad5',
  '#7c4ce3',
  '#5b21d9',
  '#58b7d8',
  '#7cd0da',
  '#5aa7ea',
  '#586de8',
  '#2d52a8',
  '#58b86a',
  '#c5f36a',
  '#f9dc67',
  '#f7bf60',
];

export const backgroundPatternPresets = [
  { id: 'dots-teal', name: 'Teal Dots', type: 'dots', foreground: '#0f766e', background: '#ffffff', category: 'Simple' },
  { id: 'dots-gold', name: 'Gold Dots', type: 'dots', foreground: '#f59e0b', background: '#fffaf0', category: 'Simple' },
  { id: 'stripes-sand', name: 'Sand Stripes', type: 'stripes', foreground: '#d6b68a', background: '#f7efe3', category: 'Nature' },
  { id: 'stripes-night', name: 'Night Stripes', type: 'stripes', foreground: '#f59e0b', background: '#3a3d52', category: 'Bold' },
  { id: 'grid-sage', name: 'Sage Grid', type: 'grid', foreground: '#bfd8bf', background: '#f6faf4', category: 'Nature' },
  { id: 'grid-blue', name: 'Blue Grid', type: 'grid', foreground: '#bfdbfe', background: '#eff6ff', category: 'Simple' },
  { id: 'diagonal-berry', name: 'Berry Diagonal', type: 'diagonal', foreground: '#b91c1c', background: '#fff7f7', category: 'Bold' },
  { id: 'diagonal-lavender', name: 'Lavender Diagonal', type: 'diagonal', foreground: '#8b5cf6', background: '#faf5ff', category: 'Floral' },
];

const buildCategory = (category, type, palettePairs) =>
  palettePairs.map(([foreground, background], index) => ({
    id: `free-${category.toLowerCase()}-${type}-${index + 1}`,
    name: `${category} ${index + 1}`,
    type,
    foreground,
    background,
    category,
  }));

export const freeBackgroundLibrary = [
  ...buildCategory('Floral', 'dots', [
    ['#c084fc', '#faf5ff'],
    ['#ec4899', '#fff1f7'],
    ['#8b5cf6', '#f5f3ff'],
    ['#fb7185', '#fff1f2'],
    ['#e879f9', '#fdf4ff'],
    ['#a855f7', '#faf5ff'],
    ['#f43f5e', '#fff1f2'],
    ['#d946ef', '#fdf4ff'],
    ['#f472b6', '#fff1f7'],
    ['#c026d3', '#faf5ff'],
  ]),
  ...buildCategory('Nature', 'grid', [
    ['#86efac', '#f0fdf4'],
    ['#65a30d', '#f7fee7'],
    ['#16a34a', '#f0fdf4'],
    ['#10b981', '#ecfdf5'],
    ['#84cc16', '#f7fee7'],
    ['#22c55e', '#f0fdf4'],
    ['#15803d', '#ecfdf5'],
    ['#4d7c0f', '#f7fee7'],
    ['#14b8a6', '#f0fdfa'],
    ['#0f766e', '#f0fdfa'],
  ]),
  ...buildCategory('Geometric', 'diagonal', [
    ['#334155', '#f8fafc'],
    ['#1e40af', '#eff6ff'],
    ['#1d4ed8', '#dbeafe'],
    ['#0f172a', '#f1f5f9'],
    ['#3730a3', '#eef2ff'],
    ['#4338ca', '#e0e7ff'],
    ['#2563eb', '#eff6ff'],
    ['#475569', '#f8fafc'],
    ['#6366f1', '#eef2ff'],
    ['#0ea5e9', '#f0f9ff'],
  ]),
  ...buildCategory('Luxury', 'stripes', [
    ['#d97706', '#fffbeb'],
    ['#ca8a04', '#fefce8'],
    ['#b45309', '#fffbeb'],
    ['#92400e', '#fff7ed'],
    ['#7c2d12', '#fff7ed'],
    ['#a16207', '#fefce8'],
    ['#c2410c', '#fff7ed'],
    ['#78350f', '#fef3c7'],
    ['#eab308', '#fefce8'],
    ['#f59e0b', '#fffbeb'],
  ]),
  ...buildCategory('Festive', 'dots', [
    ['#dc2626', '#fef2f2'],
    ['#ea580c', '#fff7ed'],
    ['#b91c1c', '#fef2f2'],
    ['#c2410c', '#fff7ed'],
    ['#059669', '#ecfdf5'],
    ['#0f766e', '#f0fdfa'],
    ['#7c3aed', '#f5f3ff'],
    ['#db2777', '#fdf2f8'],
    ['#2563eb', '#eff6ff'],
    ['#7c2d12', '#fff7ed'],
  ]),
];

export const createPatternDataUrl = (type, foreground, background, tileSize = 64) => {
  const offscreen = document.createElement('canvas');
  offscreen.width = tileSize;
  offscreen.height = tileSize;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, tileSize, tileSize);

  ctx.strokeStyle = foreground;
  ctx.fillStyle = foreground;
  ctx.lineWidth = Math.max(1, tileSize * 0.06);

  switch (type) {
    case 'stripes':
      for (let y = 8; y < tileSize; y += 16) {
        ctx.fillRect(0, y, tileSize, 6);
      }
      break;
    case 'grid':
      for (let i = 0; i <= tileSize; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, tileSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(tileSize, i);
        ctx.stroke();
      }
      break;
    case 'diagonal':
      for (let i = -tileSize; i <= tileSize * 2; i += 18) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i - tileSize, tileSize);
        ctx.stroke();
      }
      break;
    case 'dots':
    default:
      for (let x = 12; x < tileSize; x += 20) {
        for (let y = 12; y < tileSize; y += 20) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
  }

  return offscreen.toDataURL('image/png');
};

export const createFabricPattern = (type, foreground, background, tileSize = 64) => {
  const offscreen = document.createElement('canvas');
  offscreen.width = tileSize;
  offscreen.height = tileSize;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, tileSize, tileSize);

  ctx.strokeStyle = foreground;
  ctx.fillStyle = foreground;
  ctx.lineWidth = Math.max(1, tileSize * 0.06);

  switch (type) {
    case 'stripes':
      for (let y = 8; y < tileSize; y += 16) {
        ctx.fillRect(0, y, tileSize, 6);
      }
      break;
    case 'grid':
      for (let i = 0; i <= tileSize; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, tileSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(tileSize, i);
        ctx.stroke();
      }
      break;
    case 'diagonal':
      for (let i = -tileSize; i <= tileSize * 2; i += 18) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i - tileSize, tileSize);
        ctx.stroke();
      }
      break;
    case 'dots':
    default:
      for (let x = 12; x < tileSize; x += 20) {
        for (let y = 12; y < tileSize; y += 20) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
  }

  return new fabric.Pattern({
    source: offscreen,
    repeat: 'repeat',
  });
};

export const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('Missing image source'));
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = src;
  });

export const createImageFillForArea = async (width, height, imageSrc, mode = 'single') => {
  if (!imageSrc) return null;

  const image = await loadImageElement(imageSrc);
  const targetWidth = Math.max(1, Math.round(width || 1));
  const targetHeight = Math.max(1, Math.round(height || 1));
  const offscreen = document.createElement('canvas');
  const ctx = offscreen.getContext('2d');
  if (!ctx) return null;

  if (mode === 'repeat') {
    const maxTileEdge = 160;
    const scale = Math.min(1, maxTileEdge / Math.max(image.width, image.height));
    offscreen.width = Math.max(24, Math.round(image.width * scale));
    offscreen.height = Math.max(24, Math.round(image.height * scale));
    ctx.drawImage(image, 0, 0, offscreen.width, offscreen.height);
    return new fabric.Pattern({
      source: offscreen,
      repeat: 'repeat',
    });
  }

  offscreen.width = targetWidth;
  offscreen.height = targetHeight;
  ctx.clearRect(0, 0, targetWidth, targetHeight);

  const scale = Math.max(targetWidth / image.width, targetHeight / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = (targetWidth - drawWidth) / 2;
  const offsetY = (targetHeight - drawHeight) / 2;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  return new fabric.Pattern({
    source: offscreen,
    repeat: 'no-repeat',
  });
};

export const applyCanvasBackgroundFill = (canvas, fill) =>
  new Promise((resolve) => {
    if (!canvas) {
      resolve();
      return;
    }
    canvas.setBackgroundColor(fill, () => {
      canvas.renderAll();
      resolve();
    });
  });

export const renderCanvasBackgroundStyle = async (canvas, style) => {
  if (!canvas || !style) return;

  if (style.kind === 'pattern' && style.patternConfig) {
    const fabricPattern = createFabricPattern(
      style.patternConfig.type,
      style.patternConfig.foreground,
      style.patternConfig.background,
    );
    if (fabricPattern) {
      await applyCanvasBackgroundFill(canvas, fabricPattern);
    }
    return;
  }

  if (style.kind === 'image' && style.imageSrc) {
    const fill = await createImageFillForArea(
      canvas.getWidth(),
      canvas.getHeight(),
      style.imageSrc,
      style.mode || 'single',
    );
    if (fill) {
      await applyCanvasBackgroundFill(canvas, fill);
    }
    return;
  }

  await applyCanvasBackgroundFill(
    canvas,
    style.color === 'transparent' ? 'transparent' : (style.color || '#ffffff'),
  );
};
