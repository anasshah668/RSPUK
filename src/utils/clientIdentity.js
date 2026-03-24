const CONSENT_KEY = 'rspuk_cookie_consent_v1';
const CLIENT_ID_KEY = 'rspuk_client_id_v1';

const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name, value, days = 365) => {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
};

const createClientId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const ensureClientId = () => {
  if (typeof window === 'undefined') return null;
  let clientId = localStorage.getItem(CLIENT_ID_KEY) || getCookie(CLIENT_ID_KEY);
  if (!clientId) clientId = createClientId();

  localStorage.setItem(CLIENT_ID_KEY, clientId);
  setCookie(CLIENT_ID_KEY, clientId, 365);
  return clientId;
};

export const getBrowserClientId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CLIENT_ID_KEY) || getCookie(CLIENT_ID_KEY) || ensureClientId();
};

export const hasCookieConsent = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(CONSENT_KEY));
};

export const acceptCookieConsent = () => {
  if (typeof window === 'undefined') return;
  const payload = {
    choice: 'accepted',
    accepted: true,
    decidedAt: new Date().toISOString(),
    acceptedAt: new Date().toISOString(),
    version: 1,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
  setCookie(CONSENT_KEY, 'accepted', 365);
};

export const rejectCookieConsent = () => {
  if (typeof window === 'undefined') return;
  const payload = {
    choice: 'rejected',
    accepted: false,
    decidedAt: new Date().toISOString(),
    version: 1,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
  setCookie(CONSENT_KEY, 'rejected', 365);
};

export const COOKIE_KEYS = {
  CONSENT_KEY,
  CLIENT_ID_KEY,
};

