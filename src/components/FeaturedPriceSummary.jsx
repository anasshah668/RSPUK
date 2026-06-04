import React from 'react';
import { featuredPriceLabel } from '../utils/featuredSignagePricing';

const FeaturedPriceSummary = ({ pricing, loading, error, displayTotal, vatInclusive }) => {
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-800">
        Calculating estimate…
      </div>
    );
  }

  if (!pricing?.complete) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        Enter width, height and quantity to see your estimated price.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Estimated total</p>
      <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">
        £{displayTotal.toFixed(2)}
        <span className="text-sm font-medium text-gray-500 ml-2">{featuredPriceLabel(vatInclusive)}</span>
      </p>
      {pricing.quantity > 1 ? (
        <p className="text-xs text-gray-500 mt-1 tabular-nums">
          £{(displayTotal / pricing.quantity).toFixed(2)} per unit × {pricing.quantity}
        </p>
      ) : null}
      {Array.isArray(pricing.breakdown) && pricing.breakdown.length > 0 ? (
        <ul className="mt-4 space-y-1 border-t border-blue-100 pt-3">
          {pricing.breakdown.map((line, i) => (
            <li key={`${line.label}-${i}`} className="flex justify-between text-xs text-gray-600 gap-4">
              <span>{line.label}</span>
              <span className="tabular-nums font-medium text-gray-800">£{Number(line.amount).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-[10px] text-gray-500 mt-3 leading-snug">
        Estimate based on admin pricing rules. Final quote may vary after design review.
      </p>
    </div>
  );
};

export default FeaturedPriceSummary;
