import { useEffect, useState } from 'react';
import { readVatInclusiveFromStorage } from '../utils/vatUtils';

/**
 * Tracks header VAT toggle (Inc VAT vs Ex VAT) via localStorage + `vat-mode-changed` event.
 */
export function useVatInclusive() {
  const [vatInclusive, setVatInclusive] = useState(readVatInclusiveFromStorage);

  useEffect(() => {
    const sync = () => setVatInclusive(readVatInclusiveFromStorage());
    window.addEventListener('vat-mode-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('vat-mode-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return vatInclusive;
}
