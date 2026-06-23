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

const DESIGN_TYPES = [
  'Shopfront and fascia signage',
  'Banners, posters and large-format print',
  'Business cards, flyers and leaflets',
  'Window graphics and vinyl layouts',
  'Neon sign artwork and layouts',
  'Vehicle graphics and promotional displays',
  'Menus, brochures and marketing collateral',
  'Social media graphics and campaign assets',
];

const DESIGN_PROCESS = [
  {
    step: '1',
    title: 'Share your brief',
    text: 'Tell us what you need designed, including size, colours, text, style and any brand guidelines. Upload reference images or logos if you have them.',
  },
  {
    step: '2',
    title: 'Pay securely online',
    text: 'Our design service is offered at a fixed price per design. Once payment is complete, your job is submitted to our in-house design team.',
  },
  {
    step: '3',
    title: 'Receive print-ready artwork',
    text: 'We create professional artwork delivered as a PDF or image file, ready for print or production through River Signs & Print.',
  },
];

const DESIGN_FAQS = [
  {
    q: 'What is included in the design service?',
    a: 'Each order includes one professional design based on your brief, supplied as a print-ready PDF or high-resolution image file. If you need revisions beyond the original scope, our team will confirm any additional work before proceeding.',
  },
  {
    q: 'What types of design can you create?',
    a: 'We design artwork for signage, banners, posters, business stationery, window graphics, neon layouts, vehicle graphics, menus, brochures and other marketing materials. If you are unsure whether your project is suitable, include details in your brief and we will advise.',
  },
  {
    q: 'How long does the design service take?',
    a: 'Turnaround depends on project complexity and current workload. Simple layouts are often completed quickly, while detailed signage or multi-element artwork may take longer. We will contact you if we need clarification on your brief.',
  },
  {
    q: 'Do you offer design services across the UK?',
    a: 'Yes. Our design team is based in Middlesbrough and we work with businesses throughout the UK. You can submit your brief online from anywhere and receive finished artwork digitally.',
  },
  {
    q: 'Can I use the design for printing with River Signs & Print?',
    a: 'Absolutely. Many customers use our design service alongside our print and signage production. Supplying production-ready artwork helps ensure colours, sizing and finishes are matched to our manufacturing process.',
  },
];

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
    const previousTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute('content') || '';

    document.title = 'Professional Design Service UK | Print & Signage | River Signs & Print';

    let descriptionTag = metaDescription;
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute(
      'content',
      'Professional print and signage design service from River Signs & Print in Middlesbrough. Fixed-price artwork for banners, business cards, window graphics, neon layouts and more — delivered UK-wide.',
    );

    return () => {
      document.title = previousTitle;
      if (previousDescription) {
        descriptionTag.setAttribute('content', previousDescription);
      } else {
        descriptionTag.remove();
      }
    };
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
          Professional print &amp; signage design service
        </h1>
        <p className="text-gray-600 mt-2 max-w-3xl" style={font}>
          Share your brief and reference files. Our in-house design team in Middlesbrough will create
          professional, print-ready artwork (PDF or image) for{' '}
          <strong>£{totalAmount.toFixed(2)}</strong> per design — ideal for businesses across the UK
          who need reliable signage, print and marketing artwork without hiring a separate designer.
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

      <div className="mt-16 pt-12 border-t border-gray-200 space-y-12">
        <section aria-labelledby="design-service-overview">
          <h2 id="design-service-overview" className="text-2xl font-bold text-gray-900 mb-4" style={font}>
            Affordable professional design for print, signage and marketing
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed" style={font}>
            <p>
              Not everyone has access to an in-house graphic designer — and that should not stop your
              business from launching a promotion, refreshing your shopfront or ordering new print
              materials. River Signs &amp; Print offers a straightforward online design service for
              companies that need high-quality artwork created to brief, without agency fees or long
              lead times.
            </p>
            <p>
              Based in Middlesbrough with over 30 years of experience in signage and print production,
              we understand what works on banners, boards, vinyl, neon and small-format print. That
              means your design is prepared with real-world production in mind: correct proportions,
              readable typography, practical colour choices and files that are ready to send straight
              to print.
            </p>
            <p>
              Whether you are a startup preparing your first business cards, a retailer planning a
              seasonal window campaign, or a trades business needing van graphics artwork, our design
              service gives you a simple way to get professional results online.
            </p>
          </div>
        </section>

        <section aria-labelledby="design-types-heading">
          <h2 id="design-types-heading" className="text-2xl font-bold text-gray-900 mb-4" style={font}>
            What we can design for you
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed" style={font}>
            Our team creates artwork for a wide range of print and signage applications. Common
            requests include:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DESIGN_TYPES.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3"
                style={font}
              >
                <span className="text-blue-600 mt-0.5 shrink-0" aria-hidden="true">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="design-process-heading">
          <h2 id="design-process-heading" className="text-2xl font-bold text-gray-900 mb-6" style={font}>
            How our design service works
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DESIGN_PROCESS.map((item) => (
              <li
                key={item.step}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold mb-3"
                  style={font}
                  aria-hidden="true"
                >
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2" style={font}>
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed" style={font}>
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="design-benefits-heading" className="bg-blue-50 rounded-2xl border border-blue-100 p-6 md:p-8">
          <h2 id="design-benefits-heading" className="text-2xl font-bold text-gray-900 mb-4" style={font}>
            Why choose River Signs &amp; Print for design?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700" style={font}>
            <p className="leading-relaxed">
              <strong className="text-gray-900">Production-aware design.</strong> We manufacture signage
              and print in-house, so your artwork is created with materials, sizing and finishing
              requirements already considered.
            </p>
            <p className="leading-relaxed">
              <strong className="text-gray-900">Fixed transparent pricing.</strong> Know the cost before
              you commit. Our design service is priced per design with no hidden setup fees.
            </p>
            <p className="leading-relaxed">
              <strong className="text-gray-900">UK-wide service.</strong> Submit your brief online from
              anywhere in the UK and receive finished files digitally — perfect for busy business owners
              and marketing teams.
            </p>
            <p className="leading-relaxed">
              <strong className="text-gray-900">One supplier for design and production.</strong> Order
              your design here, then move seamlessly into print, signage or fabrication with the same
              trusted team.
            </p>
          </div>
        </section>

        <section aria-labelledby="design-faq-heading">
          <h2 id="design-faq-heading" className="text-2xl font-bold text-gray-900 mb-6" style={font}>
            Design service FAQs
          </h2>
          <dl className="space-y-4">
            {DESIGN_FAQS.map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                <dt className="text-base font-bold text-gray-900 mb-2" style={font}>
                  {faq.q}
                </dt>
                <dd className="text-sm text-gray-600 leading-relaxed" style={font}>
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="design-cta-heading" className="text-center pb-4">
          <h2 id="design-cta-heading" className="text-xl font-bold text-gray-900 mb-2" style={font}>
            Ready to get started?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4" style={font}>
            Use the form above to submit your design brief. Our team in Middlesbrough will get to work
            on your artwork as soon as payment is received.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline"
            style={font}
          >
            Back to design brief form
          </button>
        </section>
      </div>
    </div>
  );
};

export default DesignServicePage;
