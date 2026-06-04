import { readVatInclusiveFromStorage, payableFromNet } from './vatUtils';

/** Build API calculate payload from featured form state. */
export function buildFeaturedPricingInput(categorySlug, formData, productSpecificInputs = {}, advancedInputs = {}) {
  return {
    categorySlug: categorySlug || '_default',
    width: formData.width,
    height: formData.height,
    unit: formData.unit || 'mm',
    quantity: formData.quantity,
    usage: formData.usage,
    installationRequired: formData.installationRequired,
    deliveryRequired: formData.deliveryRequired,
    rushOrder: advancedInputs.rushOrder ?? formData.rushOrder,
    designServiceRequired: advancedInputs.designServiceRequired ?? formData.designServiceRequired,
    productSpecific: productSpecificInputs,
  };
}

export function formatFeaturedMoney(amount, vatInclusive = readVatInclusiveFromStorage()) {
  const net = Number(amount) || 0;
  const display = payableFromNet(net, vatInclusive);
  return `£${display.toFixed(2)}`;
}

export function featuredPriceLabel(vatInclusive = readVatInclusiveFromStorage()) {
  return vatInclusive ? 'Inc VAT' : 'Ex VAT';
}
