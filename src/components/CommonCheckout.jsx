import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { paymentService } from '../services/paymentService';

const paymentOptions = [
  {
    key: 'worldpay-card',
    title: 'Worldpay - Card Payment',
    description: 'Pay securely with Visa, Mastercard, or AMEX via Worldpay gateway.',
    badge: 'Recommended',
  },
  {
    key: 'klarna-3',
    title: 'Klarna - 3 Interest-Free Installments',
    description: 'Split your purchase into 3 equal payments with Klarna.',
    badge: 'Pay in 3',
  },
];

const trustBadges = [
  { title: '256-bit SSL', subtitle: 'Encrypted checkout' },
  { title: 'PCI DSS', subtitle: 'Compliant payments' },
  { title: 'Fraud Shield', subtitle: 'Protected transactions' },
  { title: 'Secure Delivery', subtitle: 'Tracked and insured' },
];

const paymentLogos = [
  { src: '/payment-logos/visa.png', alt: 'Visa' },
  { src: '/payment-logos/mastercard.png', alt: 'Mastercard' },
  { src: '/payment-logos/american-express.png', alt: 'American Express' },
];

/** Access Checkout Web SDK uses a callback API, not `await generateSessionState()`. */
const worldpaySessionStateFromInstance = (instance) => new Promise((resolve, reject) => {
  if (!instance) {
    reject(new Error('Worldpay checkout is not initialized.'));
    return;
  }

  let settled = false;
  const finish = (err, value) => {
    if (settled) return;
    settled = true;
    if (err) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Could not create secure card session.');
      reject(new Error(msg));
      return;
    }
    const sessionState = typeof value === 'string' ? value : value?.sessionState ?? value;
    if (sessionState == null || sessionState === '') {
      reject(new Error('Worldpay returned an empty session. Check your card details and try again.'));
      return;
    }
    resolve(sessionState);
  };

  if (typeof instance.generateSessionState === 'function') {
    try {
      const maybePromise = instance.generateSessionState((error, sessionState) => {
        finish(error, sessionState);
      });
      if (maybePromise != null && typeof maybePromise.then === 'function') {
        maybePromise
          .then((data) => finish(null, data?.sessionState ?? data))
          .catch((e) => finish(e, null));
      }
    } catch (e) {
      finish(e, null);
    }
    return;
  }

  if (typeof instance.generateSessions === 'function') {
    instance.generateSessions((error, sessions) => {
      if (error) {
        finish(error, null);
        return;
      }
      const card = sessions?.card;
      if (card == null || card === '') {
        finish(new Error('Worldpay did not return a card session.'), null);
        return;
      }
      finish(null, card);
    });
    return;
  }

  reject(new Error('Worldpay session API is not available on this checkout instance.'));
});

const CommonCheckout = ({
  title = 'Secure Checkout',
  orderSummary,
  totalAmount = 0,
  customerInfo,
  onCustomerInfoChange,
  paymentMethod,
  onPaymentMethodChange,
  acceptTerms,
  onAcceptTermsChange,
  onSubmit,
  submitDisabled = false,
  /** First reason checkout details block payment (shown under the button when disabled). */
  submitBlockedReason = null,
  /** When true, do not show pay-button hints (e.g. while charging). */
  isProcessingPayment = false,
  submitLabel = 'Complete Order',
}) => {
  const [loadingWorldpay, setLoadingWorldpay] = useState(false);
  const [worldpayReady, setWorldpayReady] = useState(false);
  const [worldpayInitError, setWorldpayInitError] = useState('');
  const defaultWorldpayScriptSrc = 'https://try.access.worldpay.com/access-checkout/v2/checkout.js';
  const checkoutInstanceRef = useRef(null);
  /** Bumps on each effect run so async Worldpay init from Strict Mode’s first mount is ignored. */
  const worldpayInitGenerationRef = useRef(0);

  const getCheckoutApi = () => window?.Worldpay?.checkout || null;

  useEffect(() => {
    let cancelled = false;
    const runId = ++worldpayInitGenerationRef.current;

    const loadScript = async (scriptSrc) => {
      await new Promise((resolve, reject) => {
        if (window.Worldpay?.checkout) {
          resolve();
          return;
        }
        const existing = document.querySelector(`script[src="${scriptSrc}"]`);
        if (existing) {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initWorldpay = async () => {
      if (paymentMethod !== 'worldpay-card' || totalAmount <= 0) return;
      try {
        setWorldpayReady(false);
        setWorldpayInitError('');
        setLoadingWorldpay(true);
        const session = await paymentService.createWorldpayCheckoutSession({
          amount: totalAmount,
          currency: 'GBP',
        });
        const resolvedScriptUrl = session?.scriptUrl || defaultWorldpayScriptSrc;
        const checkoutId = String(session?.checkoutId || '').trim();
        if (!checkoutId) {
          throw new Error('Worldpay checkout ID is missing. Please contact support.');
        }

        await loadScript(resolvedScriptUrl);

        if (cancelled || runId !== worldpayInitGenerationRef.current) return;

        const checkoutApi = getCheckoutApi();
        const panEl = document.querySelector('#card-pan');
        const expEl = document.querySelector('#card-expiry');
        const cvvEl = document.querySelector('#card-cvv');
        if (!panEl || !expEl || !cvvEl) {
          throw new Error('Card input containers are missing in checkout form.');
        }

        // Access Checkout v2 only accepts these field keys (not expiryDate / cvc).
        const initConfig = {
          id: checkoutId,
          form: '#worldpay-card-form',
          fields: {
            pan: {
              selector: '#card-pan',
              placeholder: 'Card number',
            },
            expiry: {
              selector: '#card-expiry',
              placeholder: 'MM/YY',
            },
            cvv: {
              selector: '#card-cvv',
              placeholder: 'CVV',
            },
          },
          enablePanFormatting: true,
        };

        if (!checkoutApi) {
          throw new Error('Worldpay checkout API is unavailable.');
        }

        const initCheckout = () => new Promise((resolve, reject) => {
          let settled = false;
          const finish = (fn) => {
            if (settled) return;
            settled = true;
            fn();
          };

          const useInstance = (instance) => {
            if (!instance) return false;
            const canPay =
              typeof instance.generateSessionState === 'function'
              || typeof instance.generateSessions === 'function';
            if (!canPay) return false;
            checkoutInstanceRef.current = instance;
            return true;
          };

          const failInit = (message) => {
            finish(() => reject(new Error(message)));
          };

          try {
            if (checkoutApi && typeof checkoutApi.init === 'function') {
              const maybeReturn = checkoutApi.init(initConfig, (error, instance) => {
                if (runId !== worldpayInitGenerationRef.current) {
                  finish(() => resolve());
                  return;
                }
                if (error) {
                  failInit(error.message || 'Worldpay secure fields initialization failed.');
                  return;
                }
                if (!useInstance(instance)) {
                  failInit('Worldpay did not provide a valid checkout instance.');
                  return;
                }
                finish(() => resolve());
              });

              if (runId !== worldpayInitGenerationRef.current) {
                finish(() => resolve());
                return;
              }

              if (maybeReturn && useInstance(maybeReturn)) {
                finish(() => resolve());
                return;
              }

              const hangMs = 15000;
              setTimeout(() => {
                if (settled || runId !== worldpayInitGenerationRef.current) return;
                failInit('Worldpay secure fields are unavailable after initialization.');
              }, hangMs);
              return;
            }

            if (typeof checkoutApi === 'function') {
              const maybeReturn = checkoutApi(initConfig);
              if (runId !== worldpayInitGenerationRef.current) {
                finish(() => resolve());
                return;
              }
              if (maybeReturn && useInstance(maybeReturn)) {
                finish(() => resolve());
                return;
              }
              failInit('Worldpay checkout function did not create a usable instance.');
              return;
            }

            failInit('Worldpay checkout init method not found.');
          } catch (e) {
            reject(e);
          }
        });

        await initCheckout();
        if (!cancelled && runId === worldpayInitGenerationRef.current) setWorldpayReady(true);
      } catch (error) {
        if (!cancelled && runId === worldpayInitGenerationRef.current) {
          setWorldpayInitError(error.message || 'Worldpay initialization failed.');
          toast.error(error.message || 'Worldpay initialization failed.');
        }
      } finally {
        if (runId === worldpayInitGenerationRef.current) setLoadingWorldpay(false);
      }
    };

    initWorldpay();

    return () => {
      cancelled = true;
      checkoutInstanceRef.current = null;
    };
  }, [paymentMethod, totalAmount]);

  const worldpayBlocksPay =
    paymentMethod === 'worldpay-card' && totalAmount > 0 && (!worldpayReady || loadingWorldpay);
  const payButtonDisabled = submitDisabled || worldpayBlocksPay;
  const payButtonHint = (() => {
    if (isProcessingPayment) return null;
    if (!payButtonDisabled) return null;
    if (submitBlockedReason) return submitBlockedReason;
    if (paymentMethod !== 'worldpay-card' || totalAmount <= 0) return null;
    if (loadingWorldpay) return 'Secure card fields are still loading. Wait until the status shows “Worldpay fields ready”.';
    if (!worldpayReady) {
      return worldpayInitError || 'Card fields are not ready to take payment. Check for errors above or refresh the page.';
    }
    return null;
  })();

  const handleSubmit = async () => {
    try {
      if (paymentMethod === 'worldpay-card' && totalAmount > 0) {
        const instance = checkoutInstanceRef.current;
        const checkoutApi = getCheckoutApi();
        const payInstance =
          instance
          || (checkoutApi && typeof checkoutApi.generateSessionState === 'function' ? checkoutApi : null);

        if (loadingWorldpay || !worldpayReady || !payInstance) {
          toast.error('Worldpay is not ready yet. Please wait a second and try again.');
          return;
        }

        const sessionState = await worldpaySessionStateFromInstance(payInstance);
        await onSubmit({
          provider: 'worldpay',
          sessionState,
        });
        return;
      }

      await onSubmit({
        provider: paymentMethod === 'klarna-3' ? 'klarna' : 'manual',
      });
    } catch (error) {
      toast.error(error.message || 'Checkout failed.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>{title}</h3>
            <p className="text-xs text-gray-600 mt-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Secure checkout powered by Worldpay
            </p>
          </div>
          <div className="flex items-center gap-2">
            {paymentLogos.map((logo) => (
              <div key={logo.alt} className="rounded-lg bg-white px-3 py-1.5 border border-gray-200 shadow-sm">
                <img src={logo.src} alt={logo.alt} className="h-5 w-auto object-contain" />
              </div>
            ))}
          </div>
          <div className="text-sm font-semibold bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-3 py-2 whitespace-nowrap" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            {totalAmount > 0 ? `Total: GBP ${totalAmount.toFixed(2)}` : 'Total pending'}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
        {/* Form first to reduce scroll-to-input friction */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Contact & Delivery
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={customerInfo.name}
                onChange={(e) => onCustomerInfoChange({ ...customerInfo, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={customerInfo.email}
                onChange={(e) => onCustomerInfoChange({ ...customerInfo, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={customerInfo.phone}
                onChange={(e) => onCustomerInfoChange({ ...customerInfo, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-1"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              />
              <textarea
                placeholder="Delivery Address"
                value={customerInfo.address}
                onChange={(e) => onCustomerInfoChange({ ...customerInfo, address: e.target.value })}
                rows="2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-1"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Payment Method
            </h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {paymentOptions.map((option) => {
                const active = paymentMethod === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => onPaymentMethodChange(option.key)}
                    className={`w-full text-left rounded-xl border p-3 transition-colors ${
                      active ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{option.title}</p>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">
                        {option.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'worldpay-card' ? (
              <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-blue-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Worldpay Secure Card Entry
                  </p>
                  <span className="text-[10px] font-bold text-blue-900 border border-blue-300 px-2 py-0.5 rounded-full">LIVE GATEWAY READY</span>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <form id="worldpay-card-form" className="space-y-2">
                    {/*
                      Worldpay mounts iframes into these nodes. Use fixed height + min-w-0 (grid) per Access Checkout docs.
                      React Strict Mode: init is gated by runId so only the latest effect run owns the instance.
                    */}
                    <div
                      id="card-pan"
                      className="field w-full px-3 py-2 border border-blue-200 bg-white rounded-lg text-sm min-h-[44px] h-11 overflow-visible"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        id="card-expiry"
                        className="field w-full min-w-0 px-3 py-2 border border-blue-200 bg-white rounded-lg text-sm min-h-[44px] h-11 overflow-visible"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      />
                      <div
                        id="card-cvv"
                        className="field w-full min-w-0 px-3 py-2 border border-blue-200 bg-white rounded-lg text-sm min-h-[44px] h-11 overflow-visible"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      />
                    </div>
                  </form>
                  <div className="text-[11px] text-blue-700">
                    {loadingWorldpay ? 'Initializing Worldpay secure fields...' : worldpayReady ? 'Worldpay fields ready' : 'Preparing secure fields...'}
                  </div>
                  {worldpayInitError && (
                    <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-1">
                      {worldpayInitError}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
                <p className="text-xs font-semibold text-purple-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Klarna Pay in 3
                </p>
                <p className="text-xs text-purple-800 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {totalAmount > 0 ? `Estimated installment: GBP ${(totalAmount / 3).toFixed(2)} x 3` : 'Installment amount appears once quote is finalized.'}
                </p>
              </div>
            )}
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 text-blue-600"
              checked={acceptTerms}
              onChange={(e) => onAcceptTermsChange(e.target.checked)}
            />
            <span>I agree to the Terms & Conditions and understand this order will be processed securely.</span>
          </label>

          {payButtonHint && (
            <p
              className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              role="status"
            >
              {payButtonHint}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={payButtonDisabled}
            className={`w-full px-6 py-3.5 rounded-xl font-semibold text-white transition-colors ${
              payButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow'
            }`}
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            {submitLabel}
          </button>
        </div>

        {/* Sticky read-only right panel */}
        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Order Review
            </h4>
            <div className="space-y-2">
              {orderSummary}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold text-emerald-800 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Safe & Secure Checkout
            </p>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {paymentLogos.map((logo) => (
                <div key={`safe-${logo.alt}`} className="rounded-lg bg-white px-3 py-1.5 border border-emerald-200 shadow-sm">
                  <img src={logo.src} alt={logo.alt} className="h-5 w-auto object-contain" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {trustBadges.map((badge) => (
                <div key={badge.title} className="rounded-md border border-emerald-200 bg-white p-2">
                  <p className="text-[11px] font-bold text-emerald-800" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {badge.title}
                  </p>
                  <p className="text-[10px] text-emerald-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {badge.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonCheckout;
