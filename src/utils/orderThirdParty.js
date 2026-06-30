function hasThirdPartyLines(lines) {
  return (
    Array.isArray(lines) &&
    lines.some((item) => String(item?.source || '').trim() === 'third-party')
  );
}

/** True when fulfilment status is owned by the print partner API, not admin manual updates. */
export function isThirdPartyOrder(order) {
  if (!order || typeof order !== 'object') return false;
  if (order.tradeprint && typeof order.tradeprint === 'object') return true;
  if (order.checkoutContext?.tradeprint) return true;

  const collections = [
    order.lineItems,
    order.checkoutContext?.lineItems,
    order.orderDetail?.lines,
    order.orderItems,
  ];
  if (collections.some(hasThirdPartyLines)) return true;

  if (Array.isArray(order.items)) {
    return order.items.some((item) => {
      const customization = item?.customization;
      const product = item?.product;
      if (String(customization?.source || product?.source || '').trim() === 'third-party') {
        return true;
      }
      return Boolean(customization?.thirdPartyProductKey || product?.thirdPartyProductKey);
    });
  }

  return false;
}

export function thirdPartyOrderStatusLabel(order) {
  const partnerStatus =
    order?.tradeprint?.status ||
    order?.checkoutContext?.tradeprint?.status ||
    null;
  if (partnerStatus) {
    return String(partnerStatus).replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  return order?.status || 'pending';
}
