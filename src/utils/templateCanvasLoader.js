import { fabric } from 'fabric';
import {
  DEFAULT_BACKGROUND_STYLE,
  applyCanvasBackgroundFill,
  renderCanvasBackgroundStyle,
} from './designerBackground';

const DEFAULT_VPT = [1, 0, 0, 1, 0, 0];
const LAYOUT_STABILIZE_DELAYS_MS = [16, 100, 350];

const isTextType = (obj) => ['text', 'i-text', 'textbox'].includes(obj?.type);

export function sanitizeTemplateJson(json) {
  if (!json) return null;
  const clone = JSON.parse(JSON.stringify(json));

  const fixGradient = (value) => {
    if (!value || typeof value !== 'object' || !value.colorStops) return value;
    const gradient = { ...value };
    gradient.type = gradient.type || 'linear';
    gradient.gradientUnits = gradient.gradientUnits || 'pixels';
    gradient.coords = gradient.coords || { x1: 0, y1: 0, x2: 0, y2: 0 };
    if (Array.isArray(gradient.colorStops)) {
      gradient.colorStops = gradient.colorStops.map((stop, index, arr) => ({
        offset: stop?.offset ?? index / Math.max(arr.length - 1, 1),
        color: stop?.color || '#000000',
        opacity: stop?.opacity,
      }));
    }
    return gradient;
  };

  const visitObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj.fill) obj.fill = fixGradient(obj.fill);
    if (obj.stroke) obj.stroke = fixGradient(obj.stroke);
    if (Array.isArray(obj.objects)) obj.objects.forEach(visitObject);
  };

  if (Array.isArray(clone.objects)) {
    clone.objects.forEach(visitObject);
  }

  return clone;
}

export function resetCanvasViewport(canvas) {
  if (!canvas) return;
  canvas.viewportTransform = DEFAULT_VPT.slice();
  try {
    canvas.setViewportTransform(DEFAULT_VPT.slice());
  } catch {
    /* viewport already assigned above */
  }
}

export function fitCanvasToWorkspace(canvas, workspaceEl) {
  if (!canvas || !workspaceEl) return 100;

  const padding = 48;
  const availW = Math.max(workspaceEl.clientWidth - padding, 160);
  const availH = Math.max(workspaceEl.clientHeight - padding, 160);
  const cw = Math.max(canvas.getWidth(), 1);
  const ch = Math.max(canvas.getHeight(), 1);
  const scale = Math.min(availW / cw, availH / ch, 1);
  const zoom = Math.max(25, Math.min(100, Math.floor(scale * 100)));

  resetCanvasViewport(canvas);
  canvas.setZoom(zoom / 100);
  canvas.calcOffset();
  canvas.requestRenderAll();
  return zoom;
}

export const isFullCanvasBackground = (obj, canvas) => {
  if (!obj || obj.type !== 'rect') return false;
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();
  const w = (obj.width || 0) * (obj.scaleX || 1);
  const h = (obj.height || 0) * (obj.scaleY || 1);
  return (
    Math.abs(obj.left || 0) < 4 &&
    Math.abs(obj.top || 0) < 4 &&
    Math.abs(w - cw) < 8 &&
    Math.abs(h - ch) < 8
  );
};

export const isTemplateBackgroundObject = (obj, canvas) => {
  if (!obj) return false;
  if (obj.name === 'template-bg') return true;
  return isFullCanvasBackground(obj, canvas);
};

export const getTemplateBackgroundObject = (canvas) => {
  if (!canvas) return null;
  return canvas.getObjects().find((obj) => isTemplateBackgroundObject(obj, canvas)) || null;
};

export const extractFillColor = (fill) => {
  if (typeof fill === 'string') return fill;
  if (fill instanceof fabric.Gradient && Array.isArray(fill.colorStops) && fill.colorStops.length) {
    return fill.colorStops[0]?.color || '#ffffff';
  }
  if (fill && typeof fill === 'object' && Array.isArray(fill.colorStops) && fill.colorStops.length) {
    return fill.colorStops[0]?.color || '#ffffff';
  }
  return '#ffffff';
};

export const syncTemplateBackgroundFill = (canvas, fill) => {
  const bgObj = getTemplateBackgroundObject(canvas);
  if (!bgObj) return false;
  bgObj.set('fill', fill);
  bgObj.setCoords();
  canvas.sendToBack(bgObj);
  canvas.requestRenderAll();
  return true;
};

const isTemplateDecoration = (obj, canvas) => {
  if (!obj) return false;
  if (obj.name === 'template-decoration' || obj.name === 'template-bg') return true;
  if (isFullCanvasBackground(obj, canvas)) return true;
  if (obj.type === 'circle' && (obj.opacity ?? 1) < 0.4) return true;
  return false;
};

const lockObject = (obj) => {
  obj.set({
    selectable: false,
    evented: false,
    hasControls: false,
    hasBorders: false,
    hoverCursor: 'default',
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
  });
};

/** Clickable full-canvas background — opens colour panel, cannot be moved. */
const lockBackgroundObject = (obj) => {
  obj.set({
    selectable: true,
    evented: true,
    hasControls: false,
    hasBorders: false,
    hoverCursor: 'pointer',
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    perPixelTargetFind: false,
  });
};

const unlockObject = (obj) => {
  const isText = isTextType(obj);
  obj.set({
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    objectCaching: false,
    lockMovementX: false,
    lockMovementY: false,
    lockScalingX: false,
    lockScalingY: false,
    lockRotation: false,
    hoverCursor: 'move',
    editable: isText ? false : obj.editable,
    perPixelTargetFind: false,
    ...(isText ? {
      padding: 10,
      originX: 'left',
      originY: 'top',
      centeredScaling: false,
      centeredRotation: false,
    } : {}),
  });

  if (obj.fill && typeof obj.fill === 'object' && obj.fill.colorStops && !(obj.fill instanceof fabric.Gradient)) {
    try {
      obj.set('fill', new fabric.Gradient(obj.fill));
    } catch {
      /* keep existing fill */
    }
  }
};

export function prepareCanvasForInteraction(canvas) {
  if (!canvas || canvas._currentTransform) return;

  const objects = canvas.getObjects();
  const backgrounds = [];
  const decorations = [];
  const content = [];

  objects.forEach((obj) => {
    if (isFullCanvasBackground(obj, canvas) || obj.name === 'template-bg') {
      backgrounds.push(obj);
    } else if (isTemplateDecoration(obj, canvas)) {
      decorations.push(obj);
    } else {
      content.push(obj);
    }
  });

  backgrounds.forEach((obj) => {
    obj.name = obj.name || 'template-bg';
    lockBackgroundObject(obj);
    canvas.sendToBack(obj);
  });

  decorations.forEach((obj) => lockObject(obj));

  content.forEach((obj) => {
    unlockObject(obj);
    obj.setCoords();
  });

  content.filter((obj) => isTextType(obj)).forEach((obj) => canvas.bringToFront(obj));
  backgrounds.forEach((obj) => canvas.sendToBack(obj));

  canvas.interactive = true;
  canvas.selection = true;
  canvas.skipTargetFind = false;
  canvas.perPixelTargetFind = false;
  canvas.defaultCursor = 'default';
  canvas.hoverCursor = 'move';
  canvas.targetFindTolerance = 12;

  [canvas.upperCanvasEl, canvas.lowerCanvasEl, canvas.wrapperEl].forEach((el) => {
    if (el) {
      el.style.pointerEvents = 'auto';
    }
  });

  if (canvas.upperCanvasEl) canvas.upperCanvasEl.style.cursor = 'default';
  if (canvas.lowerCanvasEl) canvas.lowerCanvasEl.style.cursor = 'default';

  canvas.calcOffset();
  canvas.requestRenderAll();
}

/** Lightweight pointer sync — safe to run while user is interacting. */
export function syncCanvasPointer(canvas) {
  if (!canvas || canvas._currentTransform) return;
  const isEditingText = canvas.getObjects().some((obj) => obj.isEditing);
  if (!isEditingText) {
    canvas.getObjects().forEach((obj) => obj.setCoords());
  }
  canvas.calcOffset();
  canvas.requestRenderAll();
}

export function waitForCanvasLayout() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

/** Re-sync offsets after layout shifts without re-locking layers. */
export function scheduleCanvasOffsetSync(canvas) {
  if (!canvas) return;
  LAYOUT_STABILIZE_DELAYS_MS.forEach((ms) => {
    setTimeout(() => syncCanvasPointer(canvas), ms);
  });
}

/** Full interaction prep once, then light offset-only syncs. */
export function stabilizeCanvasInteraction(canvas) {
  if (!canvas) return;
  prepareCanvasForInteraction(canvas);
  scheduleCanvasOffsetSync(canvas);
}

export async function loadPageOntoCanvas(canvas, page) {
  if (!canvas || !page) return;

  const pageBackgroundStyle = page.backgroundStyle || { ...DEFAULT_BACKGROUND_STYLE };
  const json = sanitizeTemplateJson(page.json);
  const width = page.width || canvas.getWidth() || 800;
  const height = page.height || canvas.getHeight() || 400;

  resetCanvasViewport(canvas);
  canvas.setDimensions({ width, height });
  canvas.calcOffset();

  if (json) {
    await new Promise((resolve, reject) => {
      try {
        canvas.loadFromJSON(
          json,
          () => {
            resetCanvasViewport(canvas);
            resolve();
          },
          (objectData, fabricObject) => {
            if (!fabricObject || !objectData) return;
            if (objectData.fill?.colorStops && !(objectData.fill instanceof fabric.Gradient)) {
              try {
                fabricObject._initGradient(objectData.fill, 'fill');
              } catch {
                /* gradient will fall back to solid */
              }
            }
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  } else {
    canvas.clear();
    resetCanvasViewport(canvas);
  }

  const hasSceneObjects = Boolean(json?.objects?.length);
  if (hasSceneObjects) {
    await applyCanvasBackgroundFill(canvas, 'transparent');
  } else {
    await renderCanvasBackgroundStyle(canvas, pageBackgroundStyle);
  }

  prepareCanvasForInteraction(canvas);
  canvas.discardActiveObject();
}
