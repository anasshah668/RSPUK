/**
 * User-facing copy for Worldpay Access Checkout Web SDK errors (and related failures).
 * SDK often passes { code, message } or "code: message" strings.
 */
export function formatWorldpayClientError(err) {
  if (err == null) return 'Checkout failed. Please try again.';

  const code = typeof err === 'object' && err && 'code' in err ? String(err.code || '').trim() : '';
  const message =
    typeof err === 'object' && err && err.message != null
      ? String(err.message).trim()
      : err instanceof Error
        ? String(err.message || '').trim()
        : typeof err === 'string'
          ? err.trim()
          : '';

  const haystack = `${code} ${message}`.trim().toLowerCase();

  if (!haystack && !message) return 'Checkout failed. Please try again.';

  if (haystack.includes('invalidform') || code === 'invalidForm') {
    return 'Please enter a valid card number, expiry date (MM/YY), and security code (CVV), then try Pay again.';
  }
  if (haystack.includes('session') && haystack.includes('expir')) {
    return 'Your secure card session expired. Refresh the page and enter your card details again.';
  }
  if (haystack.includes('not initialized') || haystack.includes('not ready')) {
    return 'Card payment is not ready yet. Wait until it says “Worldpay fields ready”, then try again.';
  }
  if (haystack.includes('network') || haystack.includes('failed to fetch')) {
    return 'We could not reach the payment service. Check your connection and try again.';
  }

  return message || code || 'Checkout failed. Please try again.';
}
