const STORAGE_PREFIX = 'rspuk-admin-seen';

const TAB_STORAGE_KEYS = {
  orders: 'orders',
  quotes: 'quotes',
  'design-service': 'designService',
};

const TYPE_LABELS = {
  orders: 'New order',
  quotes: 'New quote',
  designService: 'Design service',
};

function storageKey(userId) {
  return `${STORAGE_PREFIX}:${String(userId || 'admin')}`;
}

function readState(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeState(userId, state) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

function defaultState(now = new Date().toISOString()) {
  return {
    initialized: true,
    orders: now,
    quotes: now,
    designService: now,
    seenItemIds: { orders: [], quotes: [], designService: [] },
  };
}

function ensureSeenBuckets(state) {
  const next = { ...state };
  next.seenItemIds = next.seenItemIds || { orders: [], quotes: [], designService: [] };
  next.seenItemIds.orders = Array.isArray(next.seenItemIds.orders) ? next.seenItemIds.orders : [];
  next.seenItemIds.quotes = Array.isArray(next.seenItemIds.quotes) ? next.seenItemIds.quotes : [];
  next.seenItemIds.designService = Array.isArray(next.seenItemIds.designService)
    ? next.seenItemIds.designService
    : [];
  return next;
}

function itemId(item) {
  return String(item?._id || item?.id || '').trim();
}

function isItemDismissed(userId, type, id) {
  if (!id) return true;
  const state = readState(userId);
  return Boolean(state?.seenItemIds?.[type]?.includes(id));
}

function isItemNew(userId, type, timestamp, id) {
  if (isItemDismissed(userId, type, id)) return false;
  const sinceIso = readState(userId)?.[type];
  if (!sinceIso) return true;
  const since = new Date(sinceIso).getTime();
  const ts = new Date(timestamp).getTime();
  if (!Number.isFinite(ts)) return false;
  if (!Number.isFinite(since)) return true;
  return ts > since;
}

/** First visit: baseline now so existing records don't all appear as new. */
export function ensureAdminSeenInitialized(userId) {
  if (!userId) return;
  const existing = readState(userId);
  if (existing?.initialized) return;
  writeState(userId, defaultState());
}

export function getAdminTabLastSeen(userId, tab) {
  const field = TAB_STORAGE_KEYS[tab];
  if (!field) return null;
  return readState(userId)?.[field] || null;
}

export function markActivityItemSeen(userId, type, id) {
  const normalizedId = String(id || '').trim();
  if (!userId || !type || !normalizedId) return;
  const state = ensureSeenBuckets(readState(userId) || defaultState());
  if (!state.seenItemIds[type].includes(normalizedId)) {
    state.seenItemIds[type].push(normalizedId);
  }
  writeState(userId, state);
}

export function markAllActivitySeen(userId, activities = []) {
  if (!userId || !Array.isArray(activities)) return;
  const state = ensureSeenBuckets(readState(userId) || defaultState());
  activities.forEach((entry) => {
    const type = entry?.storageType;
    const id = String(entry?.itemId || '').trim();
    if (!type || !id) return;
    if (!state.seenItemIds[type].includes(id)) {
      state.seenItemIds[type].push(id);
    }
  });
  writeState(userId, state);
}

export function markAdminTabSeen(userId, tab, items = []) {
  const field = TAB_STORAGE_KEYS[tab];
  if (!userId || !field) return;
  const state = ensureSeenBuckets(readState(userId) || defaultState());
  state[field] = new Date().toISOString();
  state.initialized = true;

  if (Array.isArray(items)) {
    items.forEach((item) => {
      const id = itemId(item);
      if (id && !state.seenItemIds[field].includes(id)) {
        state.seenItemIds[field].push(id);
      }
    });
  }

  writeState(userId, state);
}

export function countNewSince(
  items,
  userId,
  type,
  getTimestamp = (item) => item?.createdAt,
) {
  if (!Array.isArray(items)) return 0;
  return items.filter((item) => {
    const id = itemId(item);
    const timestamp = getTimestamp(item);
    return isItemNew(userId, type, timestamp, id);
  }).length;
}

export function buildAdminTabBadges({ orders = [], quotes = [], designRequests = [] }, userId) {
  return {
    orders: countNewSince(orders, userId, 'orders'),
    quotes: countNewSince(quotes, userId, 'quotes'),
    designService: countNewSince(
      designRequests,
      userId,
      'designService',
      (item) => item?.updatedAt || item?.createdAt,
    ),
  };
}

export function getAdminTabBadgeCount(tab, badges) {
  if (tab === 'orders') return badges.orders || 0;
  if (tab === 'quotes') return badges.quotes || 0;
  if (tab === 'design-service') return badges.designService || 0;
  return 0;
}

function orderActivityTitle(order) {
  const tracking = order?.trackingNumber || order?.trackingId;
  const label =
    order?.orderDetails?.title ||
    order?.productType ||
    order?.orderDetail?.lines?.[0]?.name ||
    order?.orderDetail?.lines?.[0]?.title ||
    'Order';
  return tracking ? `${label} · ${tracking}` : label;
}

function orderActivitySubtitle(order) {
  const name =
    order?.customer?.name ||
    order?.user?.name ||
    order?.shippingAddress?.name ||
    order?.orderDetail?.customer?.name;
  const total = Number(order?.total || 0);
  const cur = order?.currency === 'GBP' || !order?.currency ? '£' : `${order.currency} `;
  const parts = [];
  if (name) parts.push(name);
  if (Number.isFinite(total) && total > 0) parts.push(`${cur}${total.toFixed(2)}`);
  return parts.join(' · ') || 'New checkout';
}

function quoteActivityTitle(quote) {
  return quote?.projectType || quote?.name || 'Quote request';
}

function quoteActivitySubtitle(quote) {
  const parts = [quote?.name, quote?.email].filter(Boolean);
  if (quote?.company) parts.push(quote.company);
  return parts.join(' · ') || 'Customer quote';
}

function designActivityTitle(request) {
  return request?.title || 'Design request';
}

function designActivitySubtitle(request) {
  const parts = [
    request?.customerName || request?.user?.name,
    request?.customerEmail || request?.user?.email,
    request?.productType,
  ].filter(Boolean);
  return parts.join(' · ') || 'Paid design job';
}

export function buildAdminActivityLog(
  { orders = [], quotes = [], designRequests = [] },
  userId,
) {
  if (!userId) return [];

  const entries = [];

  orders.forEach((order) => {
    const id = itemId(order);
    const timestamp = order?.createdAt;
    if (!isItemNew(userId, 'orders', timestamp, id)) return;
    entries.push({
      id: `orders-${id}`,
      storageType: 'orders',
      itemId: id,
      tab: 'orders',
      typeLabel: TYPE_LABELS.orders,
      title: orderActivityTitle(order),
      subtitle: orderActivitySubtitle(order),
      timestamp,
    });
  });

  quotes.forEach((quote) => {
    const id = itemId(quote);
    const timestamp = quote?.createdAt;
    if (!isItemNew(userId, 'quotes', timestamp, id)) return;
    entries.push({
      id: `quotes-${id}`,
      storageType: 'quotes',
      itemId: id,
      tab: 'quotes',
      typeLabel: TYPE_LABELS.quotes,
      title: quoteActivityTitle(quote),
      subtitle: quoteActivitySubtitle(quote),
      timestamp,
    });
  });

  designRequests.forEach((request) => {
    const id = itemId(request);
    const timestamp = request?.updatedAt || request?.createdAt;
    if (!isItemNew(userId, 'designService', timestamp, id)) return;
    entries.push({
      id: `designService-${id}`,
      storageType: 'designService',
      itemId: id,
      tab: 'design-service',
      typeLabel: TYPE_LABELS.designService,
      title: designActivityTitle(request),
      subtitle: designActivitySubtitle(request),
      timestamp,
    });
  });

  return entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function formatActivityTime(timestamp) {
  if (!timestamp) return '—';
  try {
    return new Date(timestamp).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(timestamp);
  }
}
