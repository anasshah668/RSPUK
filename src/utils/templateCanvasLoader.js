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

/**
 * Overhead (in px) consumed by the dimension guides + card padding that wrap
 * the canvas inside the measured stage element. Horizontal: left guide column
 * (~40) + card padding (~16). Vertical: bottom guide bar (~34) + card padding
 * (~16). A safety margin is added on top so the artboard never touches an edge.
 */
const STAGE_OVERHEAD_X = 56;
const STAGE_OVERHEAD_Y = 50;
const STAGE_SAFETY = 24;

/** Default artboard size shown in the size toolbar (mm). */
export const DEFAULT_CANVAS_SIZE_MM = { width: 250, height: 150 };

const DESIGN_CANVAS_DPI = 96;

export const getDefaultCanvasPixelSize = () => {
  const toPx = (mm) => Math.max(1, Math.round((mm / 25.4) * DESIGN_CANVAS_DPI));
  return {
    width: toPx(DEFAULT_CANVAS_SIZE_MM.width),
    height: toPx(DEFAULT_CANVAS_SIZE_MM.height),
  };
};

function applyCanvasCssSize(canvas, cssW, cssH) {
  if (!canvas) return;
  const pxW = `${cssW}px`;
  const pxH = `${cssH}px`;
  for (const el of [canvas.lowerCanvasEl, canvas.upperCanvasEl, canvas.wrapperEl]) {
    if (!el) continue;
    el.style.boxSizing = 'content-box';
    el.style.width = pxW;
    el.style.height = pxH;
    el.style.maxWidth = 'none';
    el.style.maxHeight = 'none';
    el.style.flexShrink = '0';
  }
}

/** Correct CSS when backstore aspect ratio ≠ on-screen aspect ratio (stretched templates). */
export function enforceCanvasDisplayAspectRatio(canvas) {
  const logicalW = Math.max(canvas?.getWidth() || 0, 1);
  const logicalH = Math.max(canvas?.getHeight() || 0, 1);
  const lower = canvas?.lowerCanvasEl;
  if (!lower) return false;

  const cssW = lower.clientWidth || lower.offsetWidth;
  const cssH = lower.clientHeight || lower.offsetHeight;
  if (!cssW || !cssH) return false;

  const expected = logicalW / logicalH;
  const actual = cssW / cssH;
  if (Math.abs(expected - actual) / expected < 0.004) return false;

  const scale = Math.min(cssW / logicalW, cssH / logicalH);
  applyCanvasCssSize(
    canvas,
    Math.max(1, Math.round(logicalW * scale)),
    Math.max(1, Math.round(logicalH * scale)),
  );
  canvas.calcOffset();
  return true;
}

/**
 * Updates the Fabric backstore (logical / export resolution) only.
 * On-screen CSS is updated separately via applyCanvasDisplayZoom.
 */
export function setCanvasLogicalDimensions(canvas, width, height) {
  if (!canvas) return;
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  canvas.setDimensions({ width: w, height: h }, { backstoreOnly: true });
  canvas.calcOffset();
}

export function applyCanvasDisplayZoom(canvas, zoomPercent) {
  if (!canvas) return;

  const scale = Math.max(0.001, Math.min(3, zoomPercent / 100));
  const logicalW = Math.max(canvas.getWidth(), 1);
  const logicalH = Math.max(canvas.getHeight(), 1);
  const cssW = Math.max(1, Math.round(logicalW * scale));
  const cssH = Math.max(1, Math.round(logicalH * scale));

  resetCanvasViewport(canvas);
  canvas.setZoom(1);

  // Set CSS directly with explicit px — Fabric's cssOnly path passes bare numbers
  // which browsers can mis-apply, leaving width/height out of sync (stretched artboard).
  applyCanvasCssSize(canvas, cssW, cssH);
  enforceCanvasDisplayAspectRatio(canvas);
  canvas.calcOffset();
  canvas.requestRenderAll();
}

export function getCanvasStageAvailSize(stageEl) {
  if (!stageEl) return { width: 320, height: 240 };

  // Height is derived purely from viewport geometry (stage top -> bottom of the
  // window minus the bottom action bar). This is immune to any flex ancestor
  // reporting an inflated layout height: we only ever fit to pixels that are
  // genuinely visible on screen, so the canvas can never exceed the screen.
  const rect = stageEl.getBoundingClientRect();
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : rect.height;
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : rect.width;

  const BOTTOM_BAR = 56; // page/save action bar beneath the workspace

  const visibleH = Math.max(viewportH - rect.top - BOTTOM_BAR, 80);
  // Width: prefer the stage's own box (never grows past the pages panel), but
  // never exceed what's visible from the stage's left edge to the window edge.
  const visibleW = Math.min(
    stageEl.clientWidth || rect.width,
    Math.max(viewportW - rect.left, 80),
  );

  return {
    width: Math.max(visibleW - STAGE_OVERHEAD_X - STAGE_SAFETY, 80),
    height: Math.max(visibleH - STAGE_OVERHEAD_Y - STAGE_SAFETY, 80),
  };
}

// Backwards-compatible alias: callers may still pass the stage element here.
export const getCanvasWorkspaceAvailSize = getCanvasStageAvailSize;

export function fitCanvasToWorkspace(canvas, stageEl) {
  if (!canvas || !stageEl) return 100;

  const { width: availW, height: availH } = getCanvasStageAvailSize(stageEl);
  const cw = Math.max(canvas.getWidth(), 1);
  const ch = Math.max(canvas.getHeight(), 1);
  const scale = Math.min(availW / cw, availH / ch);

  // Deliberately no lower floor (beyond a tiny epsilon): the whole point of
  // "fit" is that the artboard must always be fully visible, no matter how
  // large the requested canvas size is (e.g. a 500x500cm sign). Clamping the
  // zoom to a floor like 5-10% would force oversized canvases to render
  // bigger than the available stage, pushing their edges off-screen. Keep two
  // decimal places of precision so very large canvases still get a
  // meaningful (non-zero) zoom percentage.
  const zoomRaw = scale * 100;
  const zoom = Math.max(0.1, Math.min(300, Math.floor(zoomRaw * 100) / 100));

  applyCanvasDisplayZoom(canvas, zoom);
  return zoom;
}

export function getCanvasDisplaySize(canvas, zoomPercent = 100) {
  if (!canvas) return { width: 0, height: 0 };

  const cssW = canvas.lowerCanvasEl?.clientWidth;
  const cssH = canvas.lowerCanvasEl?.clientHeight;
  if (cssW > 0 && cssH > 0) {
    return { width: cssW, height: cssH };
  }

  const scale = zoomPercent / 100;
  return {
    width: Math.max(1, Math.round(canvas.getWidth() * scale)),
    height: Math.max(1, Math.round(canvas.getHeight() * scale)),
  };
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
  const fallback = getDefaultCanvasPixelSize();
  const width = page.width || canvas.getWidth() || fallback.width;
  const height = page.height || canvas.getHeight() || fallback.height;

  resetCanvasViewport(canvas);
  setCanvasLogicalDimensions(canvas, width, height);
  enforceCanvasDisplayAspectRatio(canvas);
  canvas.calcOffset();

  if (json) {
    // Strip canvas dimensions from saved JSON so Fabric cannot shrink/grow the
    // artboard away from the page record (templates declare their own size).
    const jsonForLoad = { ...json };
    delete jsonForLoad.width;
    delete jsonForLoad.height;

    await new Promise((resolve, reject) => {
      try {
        canvas.loadFromJSON(
          jsonForLoad,
          () => {
            resetCanvasViewport(canvas);
            // Always restore the page's declared size after JSON load.
            setCanvasLogicalDimensions(canvas, width, height);
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
    setCanvasLogicalDimensions(canvas, width, height);
  }

  const hasSceneObjects = Boolean(json?.objects?.length);
  if (hasSceneObjects) {
    await applyCanvasBackgroundFill(canvas, 'transparent');
  } else {
    await renderCanvasBackgroundStyle(canvas, pageBackgroundStyle);
  }

  prepareCanvasForInteraction(canvas);
  enforceCanvasDisplayAspectRatio(canvas);
  canvas.discardActiveObject();
}
