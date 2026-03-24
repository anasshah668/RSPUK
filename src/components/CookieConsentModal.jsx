import React, { useEffect, useState } from 'react';
import { acceptCookieConsent, ensureClientId, hasCookieConsent, rejectCookieConsent } from '../utils/clientIdentity';

const CookieConsentModal = () => {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    ensureClientId();
    if (!hasCookieConsent()) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, [visible]);

  const handleAccept = () => {
    acceptCookieConsent();
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 280);
  };

  const handleReject = () => {
    rejectCookieConsent();
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 280);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center p-4 transition-all duration-300 ${
        animateIn ? 'bg-black/40 backdrop-blur-[1px]' : 'bg-black/0 backdrop-blur-0'
      }`}
    >
      <div
        className={`w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 ease-out ${
          animateIn ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-[0.985]'
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            We value your privacy
          </h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            We use cookies to improve site performance, provide a better browsing experience, and understand usage patterns.
            Choose <span className="font-semibold">Accept all</span> to enable full functionality and analytics, or
            <span className="font-semibold"> Reject all</span> to continue with essential cookies only.
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={handleReject}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Reject all
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentModal;

