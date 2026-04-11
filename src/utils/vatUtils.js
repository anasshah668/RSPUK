/** UK standard VAT rate (20%). Builder and cart store amounts as ex VAT (net) unless noted. */
export const UK_VAT_RATE = 0.2;

export function readVatInclusiveFromStorage() {
  return localStorage.getItem('vatMode') !== 'ex';
}

export function vatAmountFromNet(net) {
  const n = Number(net) || 0;
  return Math.round(n * UK_VAT_RATE * 100) / 100;
}

export function grossFromNet(net) {
  const n = Number(net) || 0;
  return Math.round(n * (1 + UK_VAT_RATE) * 100) / 100;
}

/** Amount to charge: inc VAT → net + VAT; ex VAT → net only. */
export function payableFromNet(net, vatInclusive) {
  const n = Number(net) || 0;
  return vatInclusive ? grossFromNet(n) : n;
}

/** Line display in basket: same rule as payable. */
export function displayMoneyFromNet(net, vatInclusive) {
  return payableFromNet(net, vatInclusive);
}

/** Strip from cart→checkout summary so CheckoutPage can show a single VAT breakdown. */
export const SUMMARY_LINES_EXCLUDE_FROM_CHECKOUT_NAV = new Set([
  'Subtotal (ex VAT)',
  'VAT (20%)',
  'Total (inc VAT)',
  'At checkout',
  'Matches header VAT',
  'Estimated total',
  'Pricing basis',
]);
