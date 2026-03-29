import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { productService } from '../services/productService';
import { quoteService } from '../services/quoteService';
import { encryptId, createSlug } from '../utils/encryption';
import { getRoutePath } from '../config/routes.config';
import { getFeaturedSignageBySlug } from '../data/featuredSignageData';

const getInitialFormState = (productType) => ({
  productType: productType || '',
  width: '',
  height: '',
  unit: 'mm',
  quantity: '1',
  usage: 'indoor',
  installationRequired: 'no',
  deliveryRequired: 'no',
  notes: '',

  textContent: '',
  letterHeight: '',
  letterDepth: '',
  numberOfLetters: '',
  material: 'acrylic',
  faceColor: '',
  sideColor: '',
  lightingType: 'frontlit',
  ledColor: 'white',
  mountingType: 'wall',

  depth: '',
  frameMaterial: 'aluminum',
  faceMaterial: 'acrylic',
  lighting: 'yes',
  sided: 'single-sided',

  flexType: 'frontlit',
  frameIncluded: 'yes',
  printingType: 'uv',

  lightType: 'led',
  lightboxFrameType: 'aluminum',
  brightnessLevel: 'standard',

  boardType: 'foam-board',
  thickness: '',
  lamination: 'yes',
  finish: 'matte',

  rushOrder: 'no',
  designServiceRequired: 'no',
  installationLocation: '',
});

const FeaturedSignageCategoryPage = ({ categorySlug }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHeroImage, setActiveHeroImage] = useState('');
  const [orderFlowStep, setOrderFlowStep] = useState(null); // null | form | preview | success
  const [previewPayload, setPreviewPayload] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [designFile, setDesignFile] = useState(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });

  const signageItem = getFeaturedSignageBySlug(categorySlug);
  const pageCopy = {
    heading: signageItem?.heading || signageItem?.title || 'Featured Signage',
    blurb:
      signageItem?.blurb ||
      'Explore premium signage options tailored for your project requirements.',
    longDescription:
      signageItem?.longDescription ||
      'We provide custom signage design, production, and installation support to help businesses stand out with confidence.',
    details:
      signageItem?.details ||
      'Every project is tailored for material, finish, and visibility requirements based on your location and branding goals.',
    highlights: signageItem?.highlights || [],
  };
  const [formData, setFormData] = useState(() => getInitialFormState(signageItem?.title || ''));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.list();
        const matched = (data?.products || []).filter(
          (product) => String(product?.category || '').toLowerCase() === String(categorySlug || '').toLowerCase()
        );
        setProducts(matched);
      } catch (error) {
        console.error('Error loading featured category products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  const galleryImages = useMemo(() => signageItem?.images || [], [signageItem]);

  const usesList = useMemo(() => {
    if (Array.isArray(signageItem?.uses) && signageItem.uses.length > 0) return signageItem.uses;
    const byCategory = {
      '3d-built-up-letters': ['Shopfront identity', 'Office reception branding', 'Retail fascia upgrades', 'Hospitality and venues'],
      '2d-box-signage': ['Retail fascia panels', 'Mall units', 'Compact brand panels', 'Tenant signage'],
      'flex-face': ['Large fascia runs', 'Showrooms and depots', 'Retail parks', 'Billboard-style displays'],
      'lightbox': ['Menu boards', 'Wayfinding', 'Retail brand panels', 'POS displays'],
      'printed-board': ['Point of sale', 'Event branding', 'Wayfinding and safety', 'Outdoor temporary signage'],
      'posters': ['Campaigns and offers', 'Events and gigs', 'Window displays', 'Internal comms'],
      'pvc-banners': ['Outdoor promotions', 'Events and fairs', 'Construction hoardings', 'Temporary branding'],
      'correx-foamex-aluminium-prints': ['Estate boards', 'Wall branding', 'Directional signage', 'Premium displays'],
      'backlit-prints': ['Lightboxes', 'Transport hubs', 'Hospitality menus', 'Retail displays'],
      'canvas-prints': ['Office decor', 'Studios and galleries', 'Hospitality interiors', 'Retail ambience'],
      'printed-vinyl': ['Window graphics', 'Wall wraps', 'Promotional decals', 'Brand takeovers'],
      'frosted-vinyl': ['Office privacy', 'Meeting rooms', 'Reception glazing', 'Brand motifs'],
      'one-way-vision': ['Storefront glazing', 'Vehicle windows', 'Public-facing glass', 'Transport ads'],
      'cut-vinyl': ['Opening hours', 'Logos and lettering', 'Directional text', 'Minimal branding'],
      'privacy-films': ['Partition glazing', 'Clinics and treatment rooms', 'Meeting suites', 'Reception areas'],
    };
    return byCategory[String(categorySlug || '').toLowerCase()] || [
      'Retail and commercial spaces',
      'Events and exhibitions',
      'Wayfinding and brand panels',
      'Short and long-term installs',
    ];
  }, [signageItem?.uses, categorySlug]);

  const faqsList = useMemo(() => {
    if (Array.isArray(signageItem?.faqs) && signageItem.faqs.length > 0) return signageItem.faqs;
    return [
      {
        q: 'How do I choose the right material or specification?',
        a: 'Tell us where the sign will live, how long it should last, and your target look. We’ll recommend material, finish and mounting options tailored to your environment and budget.',
      },
      {
        q: 'Do you offer design assistance or templates?',
        a: 'Yes. We can supply artwork templates and provide design assistance if required. For complex builds, our team will help translate your brand into production-ready artwork.',
      },
      {
        q: 'What are the typical lead times?',
        a: 'Standard lead times vary by product and quantity. As a guide, smaller print jobs are typically 2–5 working days, with larger fabricated signage taking longer. Rush options may be available.',
      },
      {
        q: 'Can you handle installation or shipping?',
        a: 'We can ship UK-wide and can coordinate installation for many signage types. Share your location and access constraints so we can advise the best route.',
      },
    ];
  }, [signageItem?.faqs]);

  useEffect(() => {
    setActiveHeroImage(galleryImages[0] || `${import.meta.env.BASE_URL}hero.jpg`);
  }, [galleryImages, categorySlug]);

  useEffect(() => {
    setFormData(getInitialFormState(signageItem?.title || ''));
    setDesignFile(null);
    setOrderFlowStep(null);
    setPreviewPayload(null);
  }, [categorySlug, signageItem?.title]);

  const goToProductDetail = (product) => {
    const productId = product?._id;
    if (!productId) return;
    const encryptedId = encryptId(productId);
    const productName = createSlug(product?.name || 'product');
    navigate(getRoutePath('productDetail', { category: categorySlug, productName, encryptedId }));
  };

  const openOrderForm = () => {
    navigate(`/featured/${categorySlug}/requirements`);
  };

  const closeOrderForm = () => {
    if (!isSubmittingOrder) {
      setOrderFlowStep(null);
      setPreviewPayload(null);
    }
  };

  useEffect(() => {
    if (!orderFlowStep) return;
    const id = setTimeout(() => {
      const el = document.getElementById('featured-order-flow-screen');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
    return () => clearTimeout(id);
  }, [orderFlowStep]);

  const getProductSpecificInputs = () => {
    switch (categorySlug) {
      case '3d-built-up-letters':
        return {
          textContent: formData.textContent,
          letterHeight: formData.letterHeight,
          letterDepth: formData.letterDepth,
          numberOfLetters: formData.numberOfLetters,
          material: formData.material,
          faceColor: formData.faceColor,
          sideColor: formData.sideColor,
          lightingType: formData.lightingType,
          ledColor: formData.ledColor,
          mountingType: formData.mountingType,
        };
      case '2d-box-signage':
        return {
          depth: formData.depth,
          frameMaterial: formData.frameMaterial,
          faceMaterial: formData.faceMaterial,
          lighting: formData.lighting,
          sided: formData.sided,
          mountingType: formData.mountingType,
        };
      case 'flex-face':
        return {
          flexType: formData.flexType,
          frameIncluded: formData.frameIncluded,
          printingType: formData.printingType,
          lighting: formData.lighting,
        };
      case 'lightbox':
        return {
          depth: formData.depth,
          lightType: formData.lightType,
          frameType: formData.lightboxFrameType,
          faceMaterial: formData.faceMaterial,
          brightnessLevel: formData.brightnessLevel,
          usage: formData.usage,
        };
      case 'printed-board':
        return {
          boardType: formData.boardType,
          thickness: formData.thickness,
          lamination: formData.lamination,
          finish: formData.finish,
        };
      default:
        return {};
    }
  };

  const buildOrderPayload = () => {
    if (!formData.width || !formData.height || !formData.quantity) {
      return null;
    }

    const quantityNum = Math.max(1, Number(formData.quantity) || 1);
    const globalInputs = {
      productType: formData.productType || pageCopy.heading,
      width: formData.width,
      height: formData.height,
      unit: formData.unit,
      quantity: quantityNum,
      usage: formData.usage,
      installationRequired: formData.installationRequired === 'yes',
      deliveryRequired: formData.deliveryRequired === 'yes',
    };
    const productSpecificInputs = getProductSpecificInputs();
    const advancedInputs = {
      rushOrder: formData.rushOrder === 'yes',
      designServiceRequired: formData.designServiceRequired === 'yes',
      installationLocation: formData.installationLocation || '',
      bulkDiscountAuto: true,
      deliveryCostAuto: true,
    };

    const orderPayload = {
      source: 'featured-signage-order',
      category: categorySlug,
      productType: formData.productType || pageCopy.heading,
      globalInputs,
      productSpecificInputs,
      advancedInputs,
      notes: formData.notes || '',
      designUploadName: designFile?.name || '',

      // Send common order schema fields for compatibility with admin/orders API.
      orderItems: [
        {
          name: `${pageCopy.heading} - Custom`,
          qty: quantityNum,
          price: 0,
          image: activeHeroImage || galleryImages[0] || '',
        },
      ],
      itemsPrice: 0,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 0,
      total: 0,
      paymentMethod: 'quote',
      shippingAddress: {
        address: 'TBD',
        city: 'TBD',
        postalCode: 'TBD',
        country: 'United Kingdom',
      },
      metadata: {
        submittedFrom: 'featured-signage-page',
        featuredCategorySlug: categorySlug,
      },
    };
  };

  const handleContinueToPreview = (e) => {
    e.preventDefault();
    const payload = buildOrderPayload();
    if (!payload) {
      toast.error('Please fill width, height and quantity.');
      return;
    }
    setPreviewPayload(payload);
    setOrderFlowStep('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSubmit = async () => {
    const orderPayload = previewPayload || buildOrderPayload();
    if (!orderPayload) {
      toast.error('Please fill width, height and quantity.');
      setOrderFlowStep('form');
      return;
    }

    // For quotes (Let's go), collect minimal contact then submit as quote (no login required)
    setContactOpen(true);
  };

  const renderSelect = (name, label, options) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
        {label}
      </label>
      <select
        value={formData[name]}
        onChange={(e) => setFormData((prev) => ({ ...prev, [name]: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-white"
        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderInput = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
        {label}
      </label>
      <input
        type={type}
        value={formData[name]}
        onChange={(e) => setFormData((prev) => ({ ...prev, [name]: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5"
        placeholder={placeholder}
        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-blue-200 text-sm tracking-wide uppercase mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Featured Signage
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{pageCopy.heading}</h1>
              <p className="text-gray-200 leading-relaxed max-w-2xl" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {pageCopy.blurb}
              </p>
              <p className="text-gray-300 leading-relaxed max-w-2xl mt-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {pageCopy.longDescription}
              </p>
              <p className="text-gray-300 leading-relaxed max-w-2xl mt-2 text-sm" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {pageCopy.details}
              </p>
              {pageCopy.highlights.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {pageCopy.highlights.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-white/10 text-blue-100 border border-white/20"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/get-free-quote')}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Get a Free Quote
                </button>
                <button
                  type="button"
                  onClick={openOrderForm}
                  className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold border border-white/30 hover:bg-white/20 transition-colors"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Let&apos;s Go
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl p-[1px] bg-gradient-to-br from-white/70 via-blue-200/50 to-slate-300/40 shadow-2xl">
                <div className="bg-white/95 rounded-3xl p-3 md:p-4">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src={activeHeroImage || galleryImages[0] || `${import.meta.env.BASE_URL}hero.jpg`}
                      alt={pageCopy.heading}
                      className="w-full h-[320px] md:h-[360px] object-cover transition-transform duration-700 hover:scale-[1.03]"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    <div className="absolute left-4 bottom-4 right-4">
                      <p className="text-white text-lg font-semibold drop-shadow" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        {pageCopy.heading}
                      </p>
                      <p className="text-blue-100 text-xs mt-1 line-clamp-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Crafted for visibility, durability, and premium brand presentation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {galleryImages[1] && (
                <div className="hidden md:block absolute -bottom-6 -left-6 w-32 h-24 rounded-xl overflow-hidden border-4 border-white shadow-xl">
                  <img
                    src={galleryImages[1]}
                    alt={`${pageCopy.heading} sample`}
                    className="w-full h-full object-cover cursor-pointer"
                    draggable={false}
                    onClick={() => setActiveHeroImage(galleryImages[1])}
                  />
                </div>
              )}
              {galleryImages[2] && (
                <div className="hidden md:block absolute -top-5 -right-5 w-28 h-20 rounded-xl overflow-hidden border-4 border-white shadow-xl">
                  <img
                    src={galleryImages[2]}
                    alt={`${pageCopy.heading} detail`}
                    className="w-full h-full object-cover cursor-pointer"
                    draggable={false}
                    onClick={() => setActiveHeroImage(galleryImages[2])}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact modal for quote submission */}
      {contactOpen && (
        <section className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Your contact details</h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setContactOpen(false)}
                disabled={contactSubmitting}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Mobile number"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={contactSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                disabled={contactSubmitting || !contact.name || !contact.email || !contact.phone}
                onClick={async () => {
                  const orderPayload = previewPayload || buildOrderPayload();
                  if (!orderPayload) return;
                  const composed = {
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone,
                    projectType: pageCopy.heading,
                    quantity: orderPayload?.globalInputs?.quantity,
                    idealSignWidth: orderPayload?.globalInputs?.width,
                    country: 'United Kingdom',
                    additionalInfo: `Featured Request • ${categorySlug}\n\nGlobal Inputs:\n${JSON.stringify(orderPayload?.globalInputs || {}, null, 2)}\n\nDetails:\n${JSON.stringify(orderPayload?.productSpecificInputs || {}, null, 2)}\n\nAdvanced:\n${JSON.stringify(orderPayload?.advancedInputs || {}, null, 2)}\n\nNotes:\n${orderPayload?.notes || ''}`,
                  };
                  try {
                    setContactSubmitting(true);
                    await quoteService.create(composed);
                    setContactOpen(false);
                    setOrderFlowStep('success');
                    toast.success('Thanks! We will share your quote via your given email.');
                    setFormData(getInitialFormState(signageItem?.title || pageCopy.heading));
                    setDesignFile(null);
                    setPreviewPayload(orderPayload);
                  } catch (err) {
                    toast.error(err?.message || 'Unable to submit quote. Please try again.');
                  } finally {
                    setContactSubmitting(false);
                  }
                }}
              >
                Submit quote
              </button>
            </div>
          </div>
        </section>
      )}

      <section id="featured-projects-section" className="py-10 md:py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Projects</h2>
              <button
                type="button"
                onClick={openOrderForm}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Let&apos;s Start Your Project
              </button>
            </div>
            <p className="text-gray-600 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Browse uploaded category visuals and live products from your catalog.
            </p>
          </div>

          {galleryImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {galleryImages.map((imageSrc, idx) => (
                <button
                  key={`${imageSrc}-${idx}`}
                  type="button"
                  onClick={() => setActiveHeroImage(imageSrc)}
                  className={`relative rounded-xl overflow-hidden bg-white border shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md ${
                    activeHeroImage === imageSrc ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
                  }`}
                  style={{ transitionDelay: `${idx * 60}ms` }}
                >
                  <img
                    src={imageSrc}
                    alt={`${pageCopy.heading} project ${idx + 1}`}
                    className="w-full h-36 object-cover transition-transform duration-700 hover:scale-105"
                    draggable={false}
                  />
                  <span
                    className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
                      activeHeroImage === imageSrc ? 'bg-blue-500' : 'bg-white/80'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <p className="mt-3 text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Loading products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
              <p className="text-lg font-semibold text-gray-900">No products available yet</p>
              <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Add products in this category from admin to populate this page.
              </p>
              <button
                type="button"
                onClick={() => navigate('/get-free-quote')}
                className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Request a Quote
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <article
                  key={product._id}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                  onClick={() => {
                    const productImage = product?.images?.[0]?.url;
                    if (productImage) setActiveHeroImage(productImage);
                    goToProductDetail(product);
                  }}
                >
                  <div className="h-56 bg-gray-100">
                    <img
                      src={product?.images?.[0]?.url || galleryImages[0] || `${import.meta.env.BASE_URL}hero.jpg`}
                      alt={product?.name || 'Product'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      draggable={false}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product?.name}</h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {product?.description || 'Custom signage solution available in multiple finishes.'}
                    </p>
                    <p className="mt-3 text-blue-700 font-semibold" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {typeof product?.basePrice === 'number' ? `From £${product.basePrice}` : 'Get pricing'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )} */}
        </div>
      </section>

      {/* Uses Section */}
      <section className="bg-white py-12 md:py-14 border-t border-gray-200">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Common uses</h2>
            <p className="text-base text-gray-600 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Where {pageCopy.heading.toLowerCase()} is most effective.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {usesList.map((useItem, idx) => (
              <div key={`${useItem}-${idx}`} className="rounded-xl border border-gray-200 p-4 bg-gray-50 hover:bg-white hover:shadow-sm transition">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.207-10.707a1 1 0 00-1.414-1.414L9 8.586 7.707 7.293a1 1 0 00-1.414 1.414L9 11.414l4.207-4.121z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{useItem}</p>
                    <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Practical application where this product delivers strong results.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-12 md:py-14 border-t border-gray-200">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Frequently asked questions</h2>
            <p className="text-base text-gray-600 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Everything you need to know about {pageCopy.heading.toLowerCase()}.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-200 overflow-hidden">
            {faqsList.map((item, idx) => {
              const isOpen = expandedFaqIndex === idx;
              return (
                <div key={`${item.q}-${idx}`} className="p-4 md:p-5">
                  <button
                    type="button"
                    className="w-full flex items-start justify-between gap-4 text-left"
                    onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-gray-900">{item.q}</span>
                    <span className={`flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${isOpen ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-700'}`}>
                      <svg
                        className={`w-4 h-4 transform transition ${isOpen ? 'rotate-45' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`mt-2 text-sm text-gray-700 overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    {item.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {orderFlowStep && (
        <section id="featured-order-flow-screen" className="bg-gray-50 border-t border-gray-200 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Get a Free Quote</h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {orderFlowStep === 'form' && 'Complete the form, review your details, then submit.'}
                    {orderFlowStep === 'preview' && 'Preview your details before final submission.'}
                    {orderFlowStep === 'success' && 'Your request has been submitted successfully.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeOrderForm}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
                  disabled={isSubmittingOrder}
                >
                  Close
                </button>
              </div>

              {orderFlowStep === 'form' && (
                <form onSubmit={handleContinueToPreview} className="p-6 space-y-8">
              <section>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Global Inputs</h4>
                  <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    These details apply to all product types.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('productType', 'Product Type')}
                  {renderInput('quantity', 'Quantity', 'number')}
                  {renderInput('width', 'Width', 'number')}
                  {renderInput('height', 'Height', 'number')}
                  {renderSelect('unit', 'Unit', [
                    { value: 'mm', label: 'mm' },
                    { value: 'inch', label: 'inch' },
                    { value: 'ft', label: 'ft' },
                  ])}
                  {renderSelect('usage', 'Indoor or Outdoor Use', [
                    { value: 'indoor', label: 'Indoor' },
                    { value: 'outdoor', label: 'Outdoor' },
                  ])}
                  {renderSelect('installationRequired', 'Installation Required', [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                  ])}
                  {renderSelect('deliveryRequired', 'Delivery Required', [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                  ])}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Design Upload (optional)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setDesignFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5"
                      accept="image/*,.pdf,.ai,.eps,.svg"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorySlug === '3d-built-up-letters' && (
                    <>
                      {renderInput('textContent', 'Text / Letters Content')}
                      {renderInput('letterHeight', 'Letter Height', 'number')}
                      {renderInput('letterDepth', 'Letter Depth (Thickness)', 'number')}
                      {renderInput('numberOfLetters', 'Number of Letters (optional)', 'number')}
                      {renderSelect('material', 'Material', [
                        { value: 'acrylic', label: 'Acrylic' },
                        { value: 'metal', label: 'Metal' },
                        { value: 'aluminum', label: 'Aluminum' },
                      ])}
                      {renderInput('faceColor', 'Face Color')}
                      {renderInput('sideColor', 'Side Color')}
                      {renderSelect('lightingType', 'Lighting Type', [
                        { value: 'frontlit', label: 'Frontlit' },
                        { value: 'backlit', label: 'Backlit' },
                        { value: 'halo', label: 'Halo' },
                        { value: 'none', label: 'None' },
                      ])}
                      {renderSelect('ledColor', 'LED Color', [
                        { value: 'white', label: 'White' },
                        { value: 'warm', label: 'Warm' },
                        { value: 'rgb', label: 'RGB' },
                      ])}
                      {renderSelect('mountingType', 'Mounting Type', [
                        { value: 'wall', label: 'Wall' },
                        { value: 'raceway', label: 'Raceway' },
                        { value: 'hanging', label: 'Hanging' },
                      ])}
                    </>
                  )}
                  {categorySlug === '2d-box-signage' && (
                    <>
                      {renderInput('depth', 'Depth', 'number')}
                      {renderSelect('frameMaterial', 'Frame Material', [
                        { value: 'ms', label: 'MS' },
                        { value: 'aluminum', label: 'Aluminum' },
                      ])}
                      {renderSelect('faceMaterial', 'Face Material', [
                        { value: 'flex', label: 'Flex' },
                        { value: 'acrylic', label: 'Acrylic' },
                      ])}
                      {renderSelect('lighting', 'Lighting', [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                      ])}
                      {renderSelect('sided', 'Single-sided or Double-sided', [
                        { value: 'single-sided', label: 'Single-sided' },
                        { value: 'double-sided', label: 'Double-sided' },
                      ])}
                      {renderSelect('mountingType', 'Mounting Type', [
                        { value: 'wall', label: 'Wall' },
                        { value: 'pole', label: 'Pole' },
                        { value: 'hanging', label: 'Hanging' },
                      ])}
                    </>
                  )}
                  {categorySlug === 'flex-face' && (
                    <>
                      {renderSelect('flexType', 'Flex Type', [
                        { value: 'frontlit', label: 'Frontlit' },
                        { value: 'backlit', label: 'Backlit' },
                      ])}
                      {renderSelect('frameIncluded', 'Frame Included', [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                      ])}
                      {renderSelect('printingType', 'Printing Type', [
                        { value: 'eco-solvent', label: 'Eco Solvent' },
                        { value: 'uv', label: 'UV' },
                      ])}
                      {renderSelect('lighting', 'Lighting', [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                      ])}
                    </>
                  )}
                  {categorySlug === 'lightbox' && (
                    <>
                      {renderInput('depth', 'Depth', 'number')}
                      {renderSelect('lightType', 'Light Type', [{ value: 'led', label: 'LED' }])}
                      {renderSelect('lightboxFrameType', 'Frame Type', [
                        { value: 'aluminum', label: 'Aluminum' },
                        { value: 'acrylic', label: 'Acrylic' },
                      ])}
                      {renderSelect('faceMaterial', 'Face Material', [
                        { value: 'acrylic', label: 'Acrylic' },
                        { value: 'fabric', label: 'Fabric' },
                      ])}
                      {renderSelect('brightnessLevel', 'Brightness Level', [
                        { value: 'standard', label: 'Standard' },
                        { value: 'high', label: 'High' },
                      ])}
                    </>
                  )}
                  {categorySlug === 'printed-board' && (
                    <>
                      {renderSelect('boardType', 'Board Type', [
                        { value: 'foam-board', label: 'Foam Board' },
                        { value: 'pvc', label: 'PVC' },
                        { value: 'acrylic', label: 'Acrylic' },
                      ])}
                      {renderInput('thickness', 'Thickness')}
                      {renderSelect('lamination', 'Lamination', [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                      ])}
                      {renderSelect('finish', 'Finish', [
                        { value: 'matte', label: 'Matte' },
                        { value: 'gloss', label: 'Gloss' },
                      ])}
                    </>
                  )}
                </div>
              </section>

              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect('rushOrder', 'Rush Order', [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                  ])}
                  {renderSelect('designServiceRequired', 'Design Service Required', [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                  ])}
                  {renderInput('installationLocation', 'Installation Location')}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Notes
                    </label>
                    <textarea
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5"
                      placeholder="Add any extra details..."
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    />
                  </div>
                </div>
              </section>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={closeOrderForm}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  disabled={isSubmittingOrder}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                  disabled={isSubmittingOrder}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Continue to Preview
                </button>
              </div>
                </form>
              )}

              {orderFlowStep === 'preview' && (
                <div className="p-6 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-xs text-gray-500">Product</p>
                      <p className="font-semibold text-gray-900 mt-1">{previewPayload?.productType}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-xs text-gray-500">Size / Qty</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {previewPayload?.globalInputs?.width} x {previewPayload?.globalInputs?.height} {previewPayload?.globalInputs?.unit} • Qty {previewPayload?.globalInputs?.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Details Preview</p>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
{JSON.stringify(
  {
    globalInputs: previewPayload?.globalInputs,
    productSpecificInputs: previewPayload?.productSpecificInputs,
    advancedInputs: previewPayload?.advancedInputs,
    notes: previewPayload?.notes,
    designUploadName: previewPayload?.designUploadName || null,
  },
  null,
  2
)}
                    </pre>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setOrderFlowStep('form')}
                      className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                      disabled={isSubmittingOrder}
                    >
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleOrderSubmit}
                      className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                      disabled={isSubmittingOrder}
                    >
                      {isSubmittingOrder ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </div>
              )}

              {orderFlowStep === 'success' && (
                <div className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">
                    ✓
                  </div>
                  <h4 className="mt-4 text-2xl font-bold text-gray-900">Thank You</h4>
                  <p className="mt-2 text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Your request has been received. We will contact you shortly.
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOrderFlowStep('form')}
                      className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Submit Another
                    </button>
                    <button
                      type="button"
                      onClick={closeOrderForm}
                      className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    >
                      Back to Page
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default FeaturedSignageCategoryPage;

