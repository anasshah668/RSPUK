import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DesignerAuthModal from '../components/DesignerAuthModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { designService } from '../services/designService';
import { getRoutePath } from '../config/routes.config';

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

const PROJECT_TITLE_OPTIONS = [...DESIGN_TYPES, 'Other'];
const OTHER_TITLE_VALUE = 'Other';

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
  const { addToCart, clearCart, cartItems } = useCart();

  const [pricing, setPricing] = useState({ price: 50, currency: 'GBP', vatInclusive: true });
  const [step, setStep] = useState('form');
  const [submitting, setSubmitting] = useState(false);
  const [addingToBasket, setAddingToBasket] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [requestDoc, setRequestDoc] = useState(null);

  const [titleOption, setTitleOption] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [titleDropdownOpen, setTitleDropdownOpen] = useState(false);
  const [productType, setProductType] = useState('');
  const [brief, setBrief] = useState('');
  const [referenceFiles, setReferenceFiles] = useState([]);

  const title = titleOption === OTHER_TITLE_VALUE ? customTitle : titleOption;
  const titleDropdownRef = useRef(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signup');
  const pendingSubmitRef = useRef(false);

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
    if (step === 'choose' && !isAuthenticated()) {
      setStep('form');
      setRequestId('');
      setRequestDoc(null);
      openAuthModal('signin');
      toast.error('Please sign in to continue.');
    }
  }, [authReady, step, user]);

  useEffect(() => {
    designService.getPrice().then(setPricing).catch(() => {});
  }, []);

  useEffect(() => {
    if (!titleDropdownOpen) return undefined;
    const handleClickOutside = (event) => {
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(event.target)) {
        setTitleDropdownOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setTitleDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [titleDropdownOpen]);

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
      toast.error(
        titleOption === OTHER_TITLE_VALUE && !customTitle.trim()
          ? 'Please enter your project title.'
          : 'Please select a project title and enter a design brief.',
      );
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
      setStep('choose');
      toast.success('Brief saved. Add it to your basket or continue to checkout.');
    } catch (err) {
      toast.error(err?.message || 'Could not create design request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!title.trim() || !brief.trim()) {
      toast.error(
        titleOption === OTHER_TITLE_VALUE && !customTitle.trim()
          ? 'Please enter your project title.'
          : 'Please select a project title and enter a design brief.',
      );
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

  const buildDesignServiceLine = () => {
    const projectTitle = requestDoc?.title || title.trim();
    const briefText = String(requestDoc?.brief || brief || '').trim();
    const price = Number(requestDoc?.priceAmount) > 0 ? Number(requestDoc.priceAmount) : totalAmount;
    const id = requestDoc?._id || requestId;
    return {
      id: `design-service-${id}`,
      type: 'design-service',
      title: 'Professional Design Service',
      name: 'Professional Design Service',
      description: projectTitle,
      price,
      quantity: 1,
      designServiceRequestId: id,
      summary: [
        { label: 'Project', value: projectTitle },
        { label: 'Product / format', value: requestDoc?.productType || productType.trim() || '—' },
        {
          label: 'Brief',
          value: briefText.length > 180 ? `${briefText.slice(0, 177)}…` : briefText || '—',
        },
        { label: 'Price', value: `£${price.toFixed(2)}` },
      ],
    };
  };

  const handleAddToBasket = async () => {
    if (!isAuthenticated()) {
      openAuthModal('signin');
      toast.error('Please sign in to add to basket.');
      return;
    }
    if (!requestDoc?._id && !requestId) {
      toast.error('Design request is missing. Please submit your brief again.');
      return;
    }
    setAddingToBasket(true);
    try {
      const line = buildDesignServiceLine();
      // Design-service add should not keep leftover neon/products from earlier sessions.
      if (cartItems.length > 0) {
        await clearCart();
      }
      await addToCart(line, 1);
      toast.success('Design service added to basket');
      window.dispatchEvent(
        new CustomEvent('rspuk-basket-open', {
          detail: { highlightId: line.id },
        }),
      );
    } catch (err) {
      toast.error(err?.message || 'Could not add to basket.');
    } finally {
      setAddingToBasket(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated()) {
      openAuthModal('signin');
      toast.error('Please sign in to checkout.');
      return;
    }
    if (!requestDoc?._id && !requestId) {
      toast.error('Design request is missing. Please submit your brief again.');
      return;
    }
    const line = buildDesignServiceLine();
    navigate(getRoutePath('checkout'), {
      state: {
        checkoutData: {
          title: line.title,
          description: line.description,
          amount: line.price,
          type: 'design-service',
          designServiceRequestId: line.designServiceRequestId,
          summary: line.summary,
        },
        checkoutItems: [line],
      },
    });
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
              <label className="block text-sm font-semibold text-gray-800 mb-2" style={font}>
                Project title *
              </label>
              <div className="relative" ref={titleDropdownRef}>
                <button
                  type="button"
                  onClick={() => setTitleDropdownOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={titleDropdownOpen}
                  className={`group flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm shadow-sm transition ${
                    titleDropdownOpen
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : titleOption
                        ? 'border-gray-300 hover:border-blue-300'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={font}
                >
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate font-medium ${
                        titleOption ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {titleOption || 'Select a project title…'}
                    </span>
                    {titleOption && titleOption !== OTHER_TITLE_VALUE ? (
                      <span className="mt-0.5 block truncate text-xs text-gray-500">
                        Chosen for your design brief
                      </span>
                    ) : null}
                    {titleOption === OTHER_TITLE_VALUE ? (
                      <span className="mt-0.5 block truncate text-xs text-gray-500">
                        Enter a custom title below
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                      titleDropdownOpen
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-500 group-hover:border-blue-100 group-hover:text-blue-600'
                    }`}
                  >
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${titleDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {titleDropdownOpen && (
                  <div
                    role="listbox"
                    aria-label="Project title options"
                    className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-gray-200/70"
                  >
                    <div className="max-h-72 overflow-y-auto py-1.5">
                      {PROJECT_TITLE_OPTIONS.map((option) => {
                        const selected = titleOption === option;
                        const isOther = option === OTHER_TITLE_VALUE;
                        return (
                          <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setTitleOption(option);
                              if (option !== OTHER_TITLE_VALUE) setCustomTitle('');
                              setTitleDropdownOpen(false);
                            }}
                            className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition ${
                              selected
                                ? 'bg-blue-50 text-blue-900'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            style={font}
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {selected ? (
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block text-sm font-medium ${selected ? 'text-blue-900' : 'text-gray-900'}`}>
                                {option}
                              </span>
                              {isOther ? (
                                <span className="mt-0.5 block text-xs text-gray-500">
                                  Not listed? Type your own project title
                                </span>
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {titleOption === OTHER_TITLE_VALUE && (
                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-blue-800" style={font}>
                    Custom project title
                  </label>
                  <input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. A5 leaflet for spring promotion"
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    style={font}
                    required
                    autoFocus
                  />
                </div>
              )}

              {!titleOption ? (
                <p className="mt-2 text-xs text-gray-500" style={font}>
                  Pick a type from the list, or choose Other to write your own.
                </p>
              ) : null}
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
              {submitting ? 'Saving…' : 'Continue'}
            </button>
          </div>
        </form>
      )}

      {step === 'choose' && requestDoc && isAuthenticated() && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50 p-5" style={font}>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Brief saved</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">{requestDoc.title}</h2>
            <p className="mt-2 text-sm text-gray-600">
              Choose how you want to continue — add this design service to your basket, or go straight to checkout.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" style={font}>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Order summary</h3>
            <dl className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {orderSummaryRows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-gray-500 shrink-0">{row.label}</dt>
                  <dd className="text-gray-900 font-medium text-right">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Your brief</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{requestDoc.brief}</p>
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

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToBasket}
                disabled={addingToBasket}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-blue-600 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                style={font}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {addingToBasket ? 'Adding…' : 'Add to basket'}
              </button>
              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={addingToBasket}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                style={font}
              >
                Proceed to checkout
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500" style={font}>
              Open the basket in the header anytime to review items. Payment is completed at checkout.
            </p>
          </div>

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
        subtitle="Sign in or create an account to save your brief, then add to basket or checkout."
        benefits={[
          'Save your design request to your account',
          'Add to basket or checkout securely',
          'Track progress from My Account',
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
