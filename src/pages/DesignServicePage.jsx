import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CommonCheckout from '../components/CommonCheckout';
import DesignerAuthModal from '../components/DesignerAuthModal';
import { useAuth } from '../context/AuthContext';
import { designService } from '../services/designService';
import { paymentService } from '../services/paymentService';
import { formatPaymentErrorForToast } from '../utils/formatPaymentChargeError';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const DesignServicePage = () => {
  const navigate = useNavigate();
  const { user, authReady, isAuthenticated } = useAuth();

  const [pricing, setPricing] = useState({ price: 50, currency: 'GBP', vatInclusive: true });
  const [step, setStep] = useState('form');
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [requestDoc, setRequestDoc] = useState(null);

  const [title, setTitle] = useState('');
  const [productType, setProductType] = useState('');
  const [brief, setBrief] = useState('');
  const [referenceFiles, setReferenceFiles] = useState([]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signup');
  const pendingSubmitRef = useRef(false);

  const [paymentMethod, setPaymentMethod] = useState('worldpay-card');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    if (!authReady) return;
    if (step === 'payment' && !isAuthenticated()) {
      setStep('form');
      setRequestId('');
      setRequestDoc(null);
      openAuthModal('signin');
      toast.error('Please sign in to complete payment.');
    }
  }, [authReady, step, user]);

  useEffect(() => {
    designService.getPrice().then(setPricing).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    setCustomerInfo((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
      address: prev.address || user.address?.street || '',
      city: prev.city || user.address?.city || '',
      postalCode: prev.postalCode || user.address?.zipCode || '',
    }));
  }, [user]);

  const totalAmount = useMemo(() => Number(pricing?.price) || 50, [pricing]);

  const orderSummaryRows = useMemo(
    () => [
      { label: 'Service', value: 'Professional design (PDF / image)' },
      { label: 'Price', value: `£${totalAmount.toFixed(2)}` },
      ...(requestDoc?.title ? [{ label: 'Project', value: requestDoc.title }] : []),
    ],
    [totalAmount, requestDoc?.title],
  );

  const orderSummary = useMemo(
    () => (
      <dl className="grid gap-2">
        {orderSummaryRows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 min-w-0">
            <dt className="text-gray-500 shrink-0">{row.label}</dt>
            <dd className="text-gray-900 font-medium text-right truncate" title={row.value}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    ),
    [orderSummaryRows],
  );

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setReferenceFiles(files);
  };

  const openAuthModal = (mode = 'signup') => {
    setAuthModalMode(mode === 'signin' ? 'signin' : 'signup');
    setAuthModalOpen(true);
  };

  const performCreateRequest = async () => {
    if (!isAuthenticated()) {
      pendingSubmitRef.current = true;
      openAuthModal('signin');
      return;
    }
    if (!title.trim() || !brief.trim()) {
      toast.error('Please enter a project title and design brief.');
      return;
    }
    if (!customerInfo.name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await designService.create({
        title: title.trim(),
        brief: brief.trim(),
        productType: productType.trim(),
        customerName: customerInfo.name.trim(),
        customerEmail: user?.email || customerInfo.email.trim(),
        customerPhone: customerInfo.phone.trim(),
        customerAddress: customerInfo.address.trim(),
        customerCity: customerInfo.city.trim(),
        customerPostalCode: customerInfo.postalCode.trim(),
        referenceFiles,
      });
      setRequestId(created._id);
      setRequestDoc(created);
      setStep('payment');
      toast.success('Brief saved. Complete payment to submit your design job.');
    } catch (err) {
      toast.error(err?.message || 'Could not create design request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!title.trim() || !brief.trim()) {
      toast.error('Please enter a project title and design brief.');
      return;
    }
    if (!customerInfo.name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!isAuthenticated() && !customerInfo.email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    if (!isAuthenticated()) {
      pendingSubmitRef.current = true;
      openAuthModal('signin');
      return;
    }
    await performCreateRequest();
  };

  const handleCustomerInfoChange = (next) => {
    setCustomerInfo({
      ...next,
      email: user?.email || next.email || '',
    });
  };

  const handlePayment = async ({ sessionState, sessionHref, provider }) => {
    if (!isAuthenticated()) {
      openAuthModal('signin');
      toast.error('Please sign in to complete payment.');
      return;
    }
    if (!requestId) {
      toast.error('Design request is missing. Please go back and submit your brief again.');
      return;
    }
    if (provider !== 'worldpay') {
      toast.info('Please use card payment for design service.');
      return;
    }
    if (!acceptTerms) {
      toast.error('Please accept the terms before paying.');
      return;
    }

    const accountEmail = String(user?.email || customerInfo.email || '').trim();
    if (!accountEmail) {
      toast.error('Your account email is required for payment.');
      return;
    }

    setPaying(true);
    try {
      const orderReference = `DS-${Date.now()}`;
      const result = await paymentService.chargeDesignServiceWorldpay({
        sessionState,
        sessionHref,
        amount: totalAmount,
        currency: pricing.currency || 'GBP',
        orderReference,
        customerInfo: {
          name: customerInfo.name || user?.name || '',
          email: accountEmail,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          postalCode: customerInfo.postalCode,
        },
        billingAddress: {
          address1: customerInfo.address,
          city: customerInfo.city,
          postalCode: customerInfo.postalCode,
          countryCode: 'GB',
        },
        orderDetails: {
          title: requestDoc?.title || title,
          description: 'Professional design service',
          designServiceRequestId: requestId,
          summary: orderSummaryRows,
        },
        lineItems: [
          {
            id: requestId,
            name: 'Professional Design Service',
            title: requestDoc?.title || title,
            type: 'design-service',
            quantity: 1,
            price: totalAmount,
          },
        ],
      });

      navigate('/payment-success', {
        state: {
          paymentSuccess: true,
          orderReference: result.orderReference,
          paymentId: result.paymentId,
          trackingId: result.trackingId,
          amount: result.amount,
          currency: result.currency || 'GBP',
          email: customerInfo.email,
          customerName: customerInfo.name,
          orderTitle: 'Professional Design Service',
          designServiceSuccess: true,
          receiptEmailSent: result.receiptEmailSent,
          receiptEmailReason: result.receiptEmailReason,
        },
      });
    } catch (err) {
      toast.error(formatPaymentErrorForToast(err));
    } finally {
      setPaying(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-600" style={font}>
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100 mb-3" style={font}>
          Design Service
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900" style={font}>
          We&apos;ll design it for you
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl" style={font}>
          Share your brief and reference files. Our team will create a print-ready design (PDF or image) for{' '}
          <strong>£{totalAmount.toFixed(2)}</strong> per design.
        </p>
      </div>

      {step === 'form' && (
        <form onSubmit={handleCreateRequest} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1" style={font}>
                Project title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A5 leaflet for spring promotion"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1" style={font}>
                Product / format (optional)
              </label>
              <input
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="e.g. Business card, banner, neon sign layout"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1" style={font}>
                Design brief *
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={6}
                placeholder="Describe colours, text, size, style, and anything else we should know..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1" style={font}>
                Reference files (optional, up to 5)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600"
              />
              {referenceFiles.length > 0 && (
                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                  {referenceFiles.map((f) => (
                    <li key={f.name}>{f.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900" style={font}>
                Contact information
              </h2>
              <p className="text-sm text-gray-600 mt-1" style={font}>
                So our design team can reach you if we need clarification on your brief.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={font}>
                  Full name *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={font}>
                  Email *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                  readOnly={Boolean(user?.email)}
                  placeholder="you@example.com"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm ${
                    user?.email
                      ? 'border-gray-200 bg-gray-50 text-gray-700'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={font}>
                  Phone number
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. 07xxx xxxxxx"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={font}>
                  Street address
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address (optional)"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={font}>
                  City / town
                </label>
                <input
                  type="text"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="City or town"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={font}>
                  Postcode
                </label>
                <input
                  type="text"
                  value={customerInfo.postalCode}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="e.g. TS1 1AA"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600" style={font}>
              Fixed price: <strong>£{totalAmount.toFixed(2)}</strong> (inc. VAT where applicable)
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg"
              style={font}
            >
              {submitting ? 'Saving...' : 'Continue to payment'}
            </button>
          </div>
        </form>
      )}

      {step === 'payment' && requestDoc && isAuthenticated() && (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" style={font}>
            Brief saved for <strong>{requestDoc.title}</strong>. Pay below to submit the job to our design team.
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-700" style={font}>
            <p className="font-semibold text-gray-900 mb-2">Your brief</p>
            <p className="whitespace-pre-wrap">{requestDoc.brief}</p>
            {requestDoc.referenceFiles?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {requestDoc.referenceFiles.map((file) => (
                  <a
                    key={file.url}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 underline"
                  >
                    {file.originalName || 'Reference file'}
                  </a>
                ))}
              </div>
            )}
          </div>

          <CommonCheckout
            title="Pay for design service"
            orderSummary={orderSummary}
            totalAmount={totalAmount}
            customerInfo={customerInfo}
            onCustomerInfoChange={handleCustomerInfoChange}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            acceptTerms={acceptTerms}
            onAcceptTermsChange={setAcceptTerms}
            onSubmit={handlePayment}
            submitDisabled={paying || !acceptTerms}
            isProcessingPayment={paying}
            submitLabel={paying ? 'Processing...' : `Pay £${totalAmount.toFixed(2)}`}
          />

          <button
            type="button"
            onClick={() => setStep('form')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
            style={font}
          >
            Back to edit brief
          </button>
        </div>
      )}

      <DesignerAuthModal
        open={authModalOpen}
        initialAuthMode={authModalMode}
        onClose={() => {
          setAuthModalOpen(false);
          pendingSubmitRef.current = false;
        }}
        onAuthenticated={async () => {
          if (pendingSubmitRef.current) {
            pendingSubmitRef.current = false;
            await performCreateRequest();
          }
        }}
        title="Sign in to continue"
        subtitle="Sign in or create an account to save your brief and proceed to payment."
        benefits={[
          'Save your design request to your account',
          'Pay securely and track progress from My Account',
          'Receive updates when your design is ready',
        ]}
        verifyOtpButtonLabel="Verify & continue"
        signInButtonLabel="Sign in & continue"
      />
    </div>
  );
};

export default DesignServicePage;
