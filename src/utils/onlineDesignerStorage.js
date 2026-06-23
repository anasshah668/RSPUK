export const ONLINE_DESIGNER_AUTOSAVE_KEY = 'rspuk_online_designer_autosave_v1';

export function loadOnlineDesignerAutosave() {
  try {
    const raw = localStorage.getItem(ONLINE_DESIGNER_AUTOSAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.pages?.length) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveOnlineDesignerAutosave(payload) {
  try {
    localStorage.setItem(
      ONLINE_DESIGNER_AUTOSAVE_KEY,
      JSON.stringify({ ...payload, savedAt: Date.now() }),
    );
  } catch {
    /* storage full or unavailable */
  }
}

export function clearOnlineDesignerAutosave() {
  try {
    localStorage.removeItem(ONLINE_DESIGNER_AUTOSAVE_KEY);
  } catch {
    /* ignore */
  }
}
