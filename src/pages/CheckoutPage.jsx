import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CommonCheckout from '../components/CommonCheckout';
import { paymentService } from '../services/paymentService';
import { useCart } from '../context/CartContext';
import { useVatInclusive } from '../hooks/useVatInclusive';
import { grossFromNet, payableFromNet, vatAmountFromNet } from '../utils/vatUtils';
import { formatPaymentErrorForToast } from '../utils/formatPaymentChargeError';

const sliderItems = [
  {
    title: 'Secure Payments',
    text: 'All card details are captured through hosted Worldpay secure fields.',
  },
  {
    title: 'Fast Processing',
    text: 'Payments are authorized quickly so your order can move to production immediately.',
  },
  {
    title: 'Trusted Methods',
    text: 'Pay with Visa, Mastercard, American Express, Maestro, or Klarna Pay in 3.',
  },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const vatInclusive = useVatInclusive();

  const checkoutData = location.state?.checkoutData || {
    title: 'Custom Neon Sign',
    description: 'Standalone secure checkout',
    amount: 50,
    summary: [
      { label: 'Product', value: 'Custom Neon Sign' },
      { label: 'Size', value: '120cm x 24cm' },
      { label: 'Build', value: 'Indoor • Bold Tube' },
    ],
  };

  const [activeSlide, setActiveSlide] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('worldpay-card');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderItems.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const netAmount = Number(checkoutData.amount) > 0 ? Number(checkoutData.amount) : 50;
  const isNeonNetCheckout = checkoutData.amountBasis === 'net';
  const payAmount = isNeonNetCheckout ? payableFromNet(netAmount, vatInclusive) : netAmount;
  const sanitizedCustomerInfo = {
    name: String(customerInfo.name || '').trim(),
    email: String(customerInfo.email || '').trim().toLowerCase(),
    phone: String(customerInfo.phone || '').trim(),
    address: String(customerInfo.address || '').trim(),
    city: String(customerInfo.city || '').trim(),
    postalCode: String(customerInfo.postalCode || '').trim(),
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedCustomerInfo.email);
  const isPhoneValid = /^[+0-9()\-\s]{7,30}$/.test(sanitizedCustomerInfo.phone);
  const isUkPostcodeLoose = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(sanitizedCustomerInfo.postalCode.replace(/\s+/g, ' ').trim());

  const submitBlockedReason = (() => {
    if (isPaying) return null;
    if (!sanitizedCustomerInfo.name) return 'Enter your full name in Contact & Delivery.';
    if (!sanitizedCustomerInfo.email) return 'Enter your email address.';
    if (!isEmailValid) return 'Enter a valid email address.';
    if (!sanitizedCustomerInfo.phone) return 'Enter your phone number.';
    if (!isPhoneValid) return 'Enter a valid phone number (digits, spaces, + and brackets allowed).';
    if (!sanitizedCustomerInfo.address) return 'Enter your street address.';
    if (!sanitizedCustomerInfo.city) return 'Enter your city or town.';
    if (!sanitizedCustomerInfo.postalCode) return 'Enter your postcode.';
    if (!isUkPostcodeLoose) return 'Enter a valid UK postcode (e.g. SW1A 1AA).';
    if (!acceptTerms) return 'Tick the box to accept the Terms & Conditions.';
    return null;
  })();

  const handleCheckout = async (paymentPayload = null) => {
    if (isPaying) return;
    if (!sanitizedCustomerInfo.name || !sanitizedCustomerInfo.email || !sanitizedCustomerInfo.phone
      || !sanitizedCustomerInfo.address || !sanitizedCustomerInfo.city || !sanitizedCustomerInfo.postalCode) {
      toast.error('Please complete all contact and address fields (including city and postcode).');
      return;
    }
    if (!isUkPostcodeLoose) {
      toast.error('Please enter a valid UK postcode.');
      return;
    }
    if (!isEmailValid) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!isPhoneValid) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    if (!acceptTerms) {
      toast.error('Please accept the Terms & Conditions to continue.');
      return;
    }

    try {
      setIsPaying(true);
      let paymentId = null;
      if (paymentMethod === 'worldpay-card') {
        const sessionForCharge = paymentPayload?.sessionHref || paymentPayload?.sessionState;
        if (!sessionForCharge) {
          throw new Error('Secure card session was not generated. Please re-enter card details and try again.');
        }
        const paymentResult = await paymentService.chargeWorldpay({
          sessionState: sessionForCharge,
          amount: payAmount,
          currency: 'GBP',
          orderReference: `CHECKOUT-${Date.now()}`,
          customerInfo: sanitizedCustomerInfo,
          billingAddress: {
            address1: sanitizedCustomerInfo.address,
            city: sanitizedCustomerInfo.city,
            postalCode: sanitizedCustomerInfo.postalCode,
            countryCode: 'GB',
          },
          orderDetails: {
            title: checkoutData.title,
            description: checkoutData.description,
            summary: checkoutData.summary || [],
          },
        });
        paymentId = paymentResult?.paymentId || null;

        const ref = paymentResult?.orderReference || paymentId || '—';
        const receiptEmailSent = Boolean(paymentResult?.receiptEmailSent);
        const receiptEmailReason = paymentResult?.receiptEmailReason ?? null;

        await addToCart(
          {
            id: `checkout-${Date.now()}`,
            type: 'checkout-order',
            title: checkoutData.title,
            description: checkoutData.description,
            paymentMethod,
            paymentId,
            price: payAmount,
            quantity: 1,
            customer: sanitizedCustomerInfo,
          },
          1
        );

        navigate('/payment-success', {
          replace: true,
          state: {
            paymentSuccess: true,
            orderReference: ref,
            paymentId,
            amount: payAmount,
            currency: 'GBP',
            email: sanitizedCustomerInfo.email,
            customerName: sanitizedCustomerInfo.name,
            orderTitle: checkoutData.title,
            receiptEmailSent,
            receiptEmailReason,
          },
        });
        return;
      }

      toast.success('Your order details have been saved. Complete payment when card checkout is available.');

      await addToCart(
        {
          id: `checkout-${Date.now()}`,
          type: 'checkout-order',
          title: checkoutData.title,
          description: checkoutData.description,
          paymentMethod,
          paymentId,
          price: payAmount,
          quantity: 1,
          customer: sanitizedCustomerInfo,
        },
        1
      );

      navigate('/');
    } catch (error) {
      toast.error(formatPaymentErrorForToast(error));
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl space-y-6">
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Secure Checkout
              </h1>
              <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Complete your payment safely with Worldpay.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Back Home
            </button>
          </div>
        </div>

        {/* Slider-only section as requested */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-xl text-white shadow-lg p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-200" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Checkout Highlights
          </p>
          <h2 className="text-xl font-bold mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            {sliderItems[activeSlide].title}
          </h2>
          <p className="text-sm text-blue-100 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            {sliderItems[activeSlide].text}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {sliderItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${idx === activeSlide ? 'w-7 bg-white' : 'w-2.5 bg-white/40'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <CommonCheckout
          title={checkoutData.title || 'Secure Checkout'}
          totalAmount={payAmount}
          orderSummary={(
            <>
              {(checkoutData.summary || []).map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}:</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
              {isNeonNetCheckout ? (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2 text-sm" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  <p className="text-xs text-gray-500">
                    Custom neon is priced <strong>ex VAT</strong>. Totals below follow the header VAT switch (UK 20%).
                  </p>
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal (ex VAT)</span>
                    <span className="font-semibold tabular-nums">£{netAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>VAT (20%)</span>
                    <span className="font-semibold tabular-nums">£{vatAmountFromNet(netAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Total (inc VAT)</span>
                    <span className="font-semibold tabular-nums">£{grossFromNet(netAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-dashed border-gray-200">
                    <span>Due now {vatInclusive ? '(inc VAT)' : '(ex VAT)'}</span>
                    <span className="text-blue-700 tabular-nums">£{payAmount.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-blue-700">£{netAmount.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
          customerInfo={customerInfo}
          onCustomerInfoChange={setCustomerInfo}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          acceptTerms={acceptTerms}
          onAcceptTermsChange={setAcceptTerms}
          onSubmit={handleCheckout}
          submitBlockedReason={submitBlockedReason}
          isProcessingPayment={isPaying}
          submitDisabled={
            isPaying
            || !sanitizedCustomerInfo.name
            || !sanitizedCustomerInfo.email
            || !sanitizedCustomerInfo.phone
            || !sanitizedCustomerInfo.address
            || !sanitizedCustomerInfo.city
            || !sanitizedCustomerInfo.postalCode
            || !isEmailValid
            || !isPhoneValid
            || !isUkPostcodeLoose
            || !acceptTerms
          }
          submitLabel={isPaying ? 'Processing Payment...' : 'Pay Securely'}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
