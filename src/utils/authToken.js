let memoryToken = null;

const readStoredToken = () => {
  try {
    return String(localStorage.getItem('token') || '').trim();
  } catch {
    return '';
  }
};

export const getAuthToken = () => {
  const stored = readStoredToken();
  if (stored) {
    memoryToken = stored;
    return stored;
  }
  return String(memoryToken || '').trim() || null;
};

export const setAuthToken = (token) => {
  const value = String(token || '').trim();
  memoryToken = value || null;
  try {
    if (value) localStorage.setItem('token', value);
    else localStorage.removeItem('token');
  } catch {
    /* private mode / blocked storage */
  }
};

export const clearAuthToken = () => {
  memoryToken = null;
  try {
    localStorage.removeItem('token');
  } catch {
    /* ignore */
  }
};
