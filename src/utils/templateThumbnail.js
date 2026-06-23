import { fabric } from 'fabric';
import {
  DEFAULT_BACKGROUND_STYLE,
  renderCanvasBackgroundStyle,
} from './designerBackground';
import { resetCanvasViewport, sanitizeTemplateJson } from './templateCanvasLoader';

const thumbnailCache = new Map();

export function clearTemplateThumbnailCache() {
  thumbnailCache.clear();
}

/**
 * Render a template's first page to a PNG data URL using an off-screen
 * Fabric static canvas.
 */
export async function generateTemplateThumbnail(template, maxSize = 320) {
  if (!template?.pages?.length) return null;
  if (thumbnailCache.has(template.id)) return thumbnailCache.get(template.id);

  const firstPage = template.pages[0];
  const { width, height } = firstPage;

  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;

  const staticCanvas = new fabric.StaticCanvas(el, {
    width,
    height,
    backgroundColor: firstPage.backgroundStyle?.color || '#ffffff',
    enableRetinaScaling: false,
  });

  try {
    const json = sanitizeTemplateJson(firstPage.json);
    resetCanvasViewport(staticCanvas);

    if (json) {
      await new Promise((resolve) => {
        staticCanvas.loadFromJSON(json, () => resolve());
      });
      staticCanvas.setBackgroundColor('transparent', () => staticCanvas.renderAll());
    } else {
      await renderCanvasBackgroundStyle(
        staticCanvas,
        firstPage.backgroundStyle || { ...DEFAULT_BACKGROUND_STYLE },
      );
    }

    staticCanvas.renderAll();

    const multiplier = Math.min(1, maxSize / Math.max(width, height));
    const dataUrl = staticCanvas.toDataURL({ format: 'png', quality: 0.85, multiplier });
    thumbnailCache.set(template.id, dataUrl);
    return dataUrl;
  } catch (error) {
    console.error('[template-thumbnail]', template.id, error);
    return null;
  } finally {
    try {
      staticCanvas.dispose();
    } catch {
      /* ignore disposal errors */
    }
  }
}
