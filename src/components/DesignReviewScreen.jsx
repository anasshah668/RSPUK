import React from 'react';
import { FileViewerLink } from './FileDocViewer';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const DesignReviewScreen = ({
  productTitle,
  pdfUrl,
  pdfFileName,
  summaryRows = [],
  priceLabel,
  onBackToEditor,
  onAddToCart,
  onProceedToCheckout,
  isAddingToCart = false,
  isProcessingCheckout = false,
}) => {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto overscroll-y-contain bg-gray-50" style={font}>
      <div className="min-h-full py-8 px-4 pb-16">
        <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={onBackToEditor}
          className="mb-6 text-sm font-semibold text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
        >
          <span aria-hidden>←</span>
          Back to editor
        </button>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Review & confirm</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{productTitle || 'Your design'}</h1>
            <p className="text-sm text-gray-600 mt-2">
              Check your print-ready PDF and selected options before adding to basket or checkout.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <h2 className="text-sm font-bold text-gray-900 mb-2">Print-ready design (PDF)</h2>
              <p className="text-xs text-gray-600 mb-3">
                This is the artwork file we will use for production. Open it to double-check text, alignment and bleed.
              </p>
              {pdfUrl ? (
                <FileViewerLink
                  url={pdfUrl}
                  label={pdfFileName || 'Open design PDF'}
                  className="text-sm font-semibold"
                />
              ) : (
                <p className="text-sm text-red-600 font-medium">Design file is not available. Go back and download again.</p>
              )}
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-900 mb-3">Selected options</h2>
              {summaryRows.length > 0 ? (
                <dl className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {summaryRows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                      <dt className="text-gray-500 shrink-0">{row.label}</dt>
                      <dd className="text-gray-900 font-medium text-right">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-gray-500">No additional options recorded.</p>
              )}
            </section>

            {priceLabel ? (
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">Line price</span>
                <span className="text-lg font-bold text-gray-900 tabular-nums">{priceLabel}</span>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onAddToCart}
                disabled={isAddingToCart || isProcessingCheckout || !pdfUrl}
                className="flex-1 py-3 rounded-xl border-2 border-blue-600 text-blue-700 font-semibold text-sm hover:bg-blue-50 disabled:opacity-50 transition-colors"
              >
                {isAddingToCart ? 'Adding…' : 'Add to basket'}
              </button>
              <button
                type="button"
                onClick={onProceedToCheckout}
                disabled={isAddingToCart || isProcessingCheckout || !pdfUrl}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isProcessingCheckout ? 'Preparing…' : 'Proceed to checkout'}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DesignReviewScreen;
