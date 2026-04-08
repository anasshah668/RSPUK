import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CommonCheckout from '../components/CommonCheckout';
import { paymentService } from '../services/paymentService';
import { useCart } from '../context/CartContext';

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
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderItems.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const amount = Number(checkoutData.amount) > 0 ? Number(checkoutData.amount) : 50;
  const sanitizedCustomerInfo = {
    name: String(customerInfo.name || '').trim(),
    email: String(customerInfo.email || '').trim().toLowerCase(),
    phone: String(customerInfo.phone || '').trim(),
    address: String(customerInfo.address || '').trim(),
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedCustomerInfo.email);
  const isPhoneValid = /^[+0-9()\-\s]{7,20}$/.test(sanitizedCustomerInfo.phone);

  const handleCheckout = async (paymentPayload = null) => {
    if (isPaying) return;
    if (!sanitizedCustomerInfo.name || !sanitizedCustomerInfo.email || !sanitizedCustomerInfo.phone || !sanitizedCustomerInfo.address) {
      toast.error('Please complete all contact details.');
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
        if (!paymentPayload?.sessionState) {
          throw new Error('Secure card session was not generated. Please re-enter card details and try again.');
        }
        const paymentResult = await paymentService.chargeWorldpay({
          sessionState: paymentPayload.sessionState,
          amount,
          currency: 'GBP',
          orderReference: `CHECKOUT-${Date.now()}`,
          customerInfo: sanitizedCustomerInfo,
          billingAddress: {
            address1: sanitizedCustomerInfo.address,
            countryCode: 'GB',
          },
        });
        paymentId = paymentResult?.paymentId || null;
      }

      addToCart(
        {
          id: `checkout-${Date.now()}`,
          type: 'checkout-order',
          title: checkoutData.title,
          description: checkoutData.description,
          paymentMethod,
          paymentId,
          price: amount,
          quantity: 1,
          customer: sanitizedCustomerInfo,
        },
        1
      );

      toast.success('Payment processed and order added to cart!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
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
          totalAmount={amount}
          orderSummary={(
            <>
              {(checkoutData.summary || []).map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}:</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-blue-700">£{amount.toFixed(2)}</span>
              </div>
            </>
          )}
          customerInfo={customerInfo}
          onCustomerInfoChange={setCustomerInfo}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          acceptTerms={acceptTerms}
          onAcceptTermsChange={setAcceptTerms}
          onSubmit={handleCheckout}
          submitDisabled={
            isPaying
            || !sanitizedCustomerInfo.name
            || !sanitizedCustomerInfo.email
            || !sanitizedCustomerInfo.phone
            || !sanitizedCustomerInfo.address
            || !isEmailValid
            || !isPhoneValid
            || !acceptTerms
          }
          submitLabel={isPaying ? 'Processing Payment...' : 'Pay Securely'}
        />
      </div>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </div>
  );
};

export default CheckoutPage;
