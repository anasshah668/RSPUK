import { useEffect, useState, useRef } from 'react';
import { featuredSignagePricingService } from '../services/featuredSignagePricingService';
import { readVatInclusiveFromStorage, payableFromNet } from '../utils/vatUtils';

/**
 * Debounced server-side price for featured signage forms.
 */
export function useFeaturedSignagePrice(calculatePayload, depsKey) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    const width = String(calculatePayload?.width ?? '').trim();
    const height = String(calculatePayload?.height ?? '').trim();
    const qty = Number(calculatePayload?.quantity);

    if (!width || !height || !Number.isFinite(qty) || qty < 1) {
      setPricing(null);
      setError(null);
      setLoading(false);
      return undefined;
    }

    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await featuredSignagePricingService.calculate(calculatePayload);
        if (id !== requestId.current) return;
        setPricing(res);
      } catch (err) {
        if (id !== requestId.current) return;
        setPricing(null);
        setError(err?.message || 'Unable to calculate price');
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [depsKey]);

  const [vatInclusive, setVatInclusive] = useState(() => readVatInclusiveFromStorage());

  useEffect(() => {
    const onVatChange = () => setVatInclusive(readVatInclusiveFromStorage());
    window.addEventListener('vat-mode-changed', onVatChange);
    return () => window.removeEventListener('vat-mode-changed', onVatChange);
  }, []);

  const netTotal = pricing?.total ?? 0;
  const displayTotal = payableFromNet(netTotal, vatInclusive);

  return {
    pricing,
    loading,
    error,
    netTotal,
    displayTotal,
    vatInclusive,
    complete: Boolean(pricing?.complete),
  };
}

export default useFeaturedSignagePrice;
