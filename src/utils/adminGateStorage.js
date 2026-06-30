const STORAGE_KEY = 'rspuk_admin_gate';

export function getAdminGateToken() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.expiresAt) return null;
    if (Date.now() >= Number(parsed.expiresAt)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.token;
  } catch {
    return null;
  }
}

export function setAdminGateToken(token, expiresInSeconds = 1800) {
  if (!token) return;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token,
      expiresAt: Date.now() + Number(expiresInSeconds) * 1000,
    }),
  );
}

export function clearAdminGateToken() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function hasValidAdminGate() {
  return Boolean(getAdminGateToken());
}
