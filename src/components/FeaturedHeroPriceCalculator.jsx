import React from 'react';
import { featuredPriceLabel } from '../utils/featuredSignagePricing';

const font = { fontFamily: 'Lexend Deca, system-ui, sans-serif' };

const UNIT_OPTIONS = [
  { value: 'mm', label: 'mm' },
  { value: 'cm', label: 'cm' },
  { value: 'inch', label: 'in' },
  { value: 'ft', label: 'ft' },
];

const FeaturedHeroPriceCalculator = ({
  formData,
  setFormData,
  pricing,
  pricingLoading,
  pricingError,
  displayTotal,
  vatInclusive,
  onStartProject,
  productName,
}) => {
  const hasDimensions =
    String(formData.width || '').trim() &&
    String(formData.height || '').trim() &&
    Number(formData.quantity) >= 1;

  const handleStart = () => {
    if (!hasDimensions) return;
    onStartProject?.();
  };

  return (
    <div
      className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-6"
      style={font}
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-200">Instant estimate</p>
          <h3 className="text-lg font-bold text-white sm:text-xl">Size your {productName || 'sign'}</h3>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
          Live pricing
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1.5 block text-xs font-medium text-blue-100">Width</label>
          <input
            type="number"
            min="1"
            step="any"
            value={formData.width}
            onChange={(e) => setFormData((prev) => ({ ...prev, width: e.target.value }))}
            placeholder="1200"
            className="w-full rounded-xl border border-white/25 bg-white/95 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1.5 block text-xs font-medium text-blue-100">Height</label>
          <input
            type="number"
            min="1"
            step="any"
            value={formData.height}
            onChange={(e) => setFormData((prev) => ({ ...prev, height: e.target.value }))}
            placeholder="600"
            className="w-full rounded-xl border border-white/25 bg-white/95 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-blue-100">Unit</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
            className="w-full rounded-xl border border-white/25 bg-white/95 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
          >
            {UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-blue-100">Qty</label>
          <input
            type="number"
            min="1"
            step="1"
            value={formData.quantity}
            onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
            className="w-full rounded-xl border border-white/25 bg-white/95 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/15 bg-slate-900/40 p-4">
        {pricingError ? (
          <p className="text-sm text-red-300">{pricingError}</p>
        ) : pricingLoading ? (
          <div className="flex items-center gap-3 text-sm text-blue-100">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Calculating your estimate…
          </div>
        ) : !hasDimensions ? (
          <p className="text-sm text-blue-100/90">Enter width and height to see your estimated price.</p>
        ) : pricing?.complete ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Estimated total</p>
              <p className="mt-0.5 text-3xl font-bold tabular-nums text-white sm:text-4xl">
                £{displayTotal.toFixed(2)}
                <span className="ml-2 text-sm font-medium text-blue-200">{featuredPriceLabel(vatInclusive)}</span>
              </p>
              {pricing.quantity > 1 ? (
                <p className="mt-1 text-xs text-blue-200/80 tabular-nums">
                  £{(displayTotal / pricing.quantity).toFixed(2)} per unit × {pricing.quantity}
                </p>
              ) : null}
            </div>
            {Array.isArray(pricing.breakdown) && pricing.breakdown.length > 0 ? (
              <ul className="min-w-[200px] space-y-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-blue-100">
                {pricing.breakdown.slice(0, 4).map((line, i) => (
                  <li key={`${line.label}-${i}`} className="flex justify-between gap-3">
                    <span className="truncate">{line.label}</span>
                    <span className="shrink-0 font-medium tabular-nums text-white">
                      £{Number(line.amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-amber-200">
            Add valid dimensions — pricing rules may need setup in admin for this product.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleStart}
          disabled={!hasDimensions || !pricing?.complete}
          className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start your project →
        </button>
      </div>
    </div>
  );
};

export default FeaturedHeroPriceCalculator;
