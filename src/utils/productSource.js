export const isTradeprintProduct = (product = {}) =>
  String(product?.source || '').trim() === 'third-party' &&
  Boolean(product?.thirdPartyProductKey);

export const normalizeProductSource = (product = {}) =>
  (isTradeprintProduct(product) ? 'third-party' : 'local');

export const isTradeprintLineItem = (item = {}) =>
  String(item?.source || '').trim() === 'third-party' &&
  Boolean(item?.thirdPartyProductKey || item?.productId);
