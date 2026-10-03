export const ONLINE_DESIGNER_AUTOSAVE_KEY = 'rspuk_online_designer_autosave_v1';

export function designerAutosaveKey({ productMode, productId, productType } = {}) {
  if (productMode && (productId || productType)) {
    return `rspuk_product_designer_${String(productId || productType).replace(/\s+/g, '-')}`;
  }
  return ONLINE_DESIGNER_AUTOSAVE_KEY;
}

export function loadOnlineDesignerAutosave(storageKey = ONLINE_DESIGNER_AUTOSAVE_KEY) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.pages?.length) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveOnlineDesignerAutosave(payload, storageKey = ONLINE_DESIGNER_AUTOSAVE_KEY) {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ ...payload, savedAt: Date.now() }),
    );
  } catch {
    /* storage full or unavailable */
  }
}

export function clearOnlineDesignerAutosave(storageKey = ONLINE_DESIGNER_AUTOSAVE_KEY) {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}
