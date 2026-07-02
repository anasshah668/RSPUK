import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { quoteService } from '../services/quoteService';
import { featuredSignagePricingService } from '../services/featuredSignagePricingService';
import { getFeaturedSignageBySlug } from '../data/featuredSignageData';
import FeaturedPriceSummary from '../components/FeaturedPriceSummary';
import { useFeaturedSignagePrice } from '../hooks/useFeaturedSignagePrice';
import { buildFeaturedPricingInput } from '../utils/featuredSignagePricing';
import { readVatInclusiveFromStorage, payableFromNet } from '../utils/vatUtils';
import { getRoutePath } from '../config/routes.config';

const font = { fontFamily: 'Lexend Deca, system-ui, sans-serif' };

const FLOW_STEPS = [
  { id: 'form', label: 'Your details' },
  { id: 'preview', label: 'Review & choose' },
  { id: 'success', label: 'Done' },
];

const formatFieldLabel = (key) =>
  String(key)
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());

const StepIndicator = ({ currentStep }) => {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.id === currentStep);
  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-3" style={font}>
      {FLOW_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isComplete = index < currentIndex;
        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : isComplete
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isComplete ? '✓' : index + 1}
            </span>
            <span className={`text-xs font-semibold sm:text-sm ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
              {step.label}
            </span>
            {index < FLOW_STEPS.length - 1 ? (
              <span className="hidden sm:inline text-slate-300" aria-hidden="true">
                →
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};

const getInitialFormState = (productType) => ({
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  customerCompany: '',
  customerEmail: '',

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
});

const FeaturedQuoteRequestPage = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const signageItem = getFeaturedSignageBySlug(categorySlug);
  const [step, setStep] = useState('form'); // form | preview | success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artwork, setArtwork] = useState(null);
  const [formData, setFormData] = useState(() => getInitialFormState(signageItem?.title || ''));

  const heading = signageItem?.heading || signageItem?.title || 'Featured Signage';
  const heroImage = signageItem?.images?.[0] || `${import.meta.env.BASE_URL}hero.jpg`;

  const renderInput = (name, label, type = 'text', placeholder = '', required = false, disabled = false) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700" style={font}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        type={type}
        value={formData[name]}
        onChange={(e) => setFormData((prev) => ({ ...prev, [name]: e.target.value }))}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 ${
          disabled ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''
        }`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={font}
      />
    </div>
  );

  const renderSelect = (name, label, options, disabled = false) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700" style={font}>
        {label}
      </label>
      <select
        value={formData[name]}
        onChange={(e) => setFormData((prev) => ({ ...prev, [name]: e.target.value }))}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 ${
          disabled ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-200 bg-white'
        }`}
        disabled={disabled}
        style={font}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderDetailGrid = (entries) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entries
        .filter(([, value]) => value !== '' && value != null && value !== 'N/A')
        .map(([key, value]) => (
          <div key={key} className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{formatFieldLabel(key)}</p>
            <p className="mt-0.5 text-sm font-medium text-slate-900">{String(value)}</p>
          </div>
        ))}
    </div>
  );

  const productSpecificInputs = useMemo(() => {
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
  }, [categorySlug, formData]);

  const pricingInput = useMemo(
    () => buildFeaturedPricingInput(categorySlug, formData, productSpecificInputs),
    [categorySlug, formData, productSpecificInputs]
  );

  const pricingDepsKey = JSON.stringify(pricingInput);
  const { pricing, loading: pricingLoading, error: pricingError, displayTotal, vatInclusive } =
    useFeaturedSignagePrice(pricingInput, pricingDepsKey);

  const orderPayload = useMemo(() => {
    const quantityNum = Math.max(1, Number(formData.quantity) || 1);
    const globalInputsRaw = {
      productType: formData.productType || heading,
      width: formData.width,
      height: formData.height,
      unit: formData.unit,
      quantity: quantityNum,
      usage: formData.usage,
      installationRequired: formData.installationRequired === 'yes',
      deliveryRequired: formData.deliveryRequired === 'yes',
    };
    // prune empty/null/undefined
    const globalInputs = Object.fromEntries(
      Object.entries(globalInputsRaw).filter(([, v]) => !(v === '' || v === null || v === undefined))
    );
    const productInputsPruned = Object.fromEntries(
      Object.entries(productSpecificInputs || {}).filter(([, v]) => !(v === '' || v === null || v === undefined))
    );

    const unitNet = pricing?.unitPrice ?? 0;
    const totalNet = pricing?.total ?? 0;
    const vatInc = readVatInclusiveFromStorage();
    const totalDisplay = payableFromNet(totalNet, vatInc);

    return {
      source: 'featured-signage-order',
      category: categorySlug,
      productType: formData.productType || heading,
      customer: {
        name: formData.customerName,
        phone: formData.customerPhone,
        email: formData.customerEmail,
        address: formData.customerAddress,
        company: formData.customerCompany,
      },
      globalInputs,
      productSpecificInputs: productInputsPruned,
      notes: formData.notes || '',
      pricing: pricing
        ? {
            unitPriceNet: unitNet,
            totalNet,
            totalDisplay,
            vatInclusive: vatInc,
            breakdown: pricing.breakdown,
            currency: pricing.currency,
          }
        : null,
      orderItems: [{ name: `${heading} - Custom`, qty: quantityNum, price: unitNet, image: heroImage }],
      itemsPrice: totalNet,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: totalNet,
      total: totalNet,
      paymentMethod: 'quote',
      shippingAddress: {
        address: formData.customerAddress || 'TBD',
        city: 'TBD',
        postalCode: 'TBD',
        country: 'United Kingdom',
      },
      metadata: { submittedFrom: 'featured-quote-screen', featuredCategorySlug: categorySlug },
    };
  }, [categorySlug, formData, heading, heroImage, productSpecificInputs, pricing]);

  const buildCheckoutSummary = (payload) => {
    const rows = [
      { label: 'Product', value: payload.productType || heading },
      { label: 'Customer', value: formData.customerName || '—' },
      { label: 'Email', value: formData.customerEmail || '—' },
      { label: 'Phone', value: formData.customerPhone || '—' },
    ];
    const g = payload.globalInputs || {};
    if (g.width && g.height) {
      rows.push({ label: 'Size', value: `${g.width} × ${g.height} ${g.unit || ''}`.trim() });
    }
    if (g.quantity !== undefined) rows.push({ label: 'Quantity', value: String(g.quantity) });
    if (g.usage) rows.push({ label: 'Use', value: String(g.usage) });
    if (g.installationRequired !== undefined) {
      rows.push({ label: 'Installation', value: g.installationRequired ? 'Yes' : 'No' });
    }
    if (g.deliveryRequired !== undefined) {
      rows.push({ label: 'Delivery', value: g.deliveryRequired ? 'Yes' : 'No' });
    }
    Object.entries(payload.productSpecificInputs || {}).forEach(([key, value]) => {
      if (value !== '' && value != null) {
        rows.push({ label: formatFieldLabel(key), value: String(value) });
      }
    });
    if (Array.isArray(payload.pricing?.breakdown)) {
      payload.pricing.breakdown.forEach((line) => {
        rows.push({ label: line.label, value: `£${Number(line.amount).toFixed(2)}` });
      });
    }
    return rows;
  };

  const handlePayNow = () => {
    const totalNet = orderPayload.pricing?.totalNet ?? 0;
    if (!(totalNet > 0)) {
      toast.error('Unable to proceed to checkout — price is not available.');
      return;
    }
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Please complete your contact details before paying.');
      setStep('form');
      return;
    }
    navigate(getRoutePath('checkout'), {
      state: {
        checkoutData: {
          title: `${heading} — Custom order`,
          description: `Featured signage order for ${formData.customerName}`,
          amount: totalNet,
          amountBasis: 'net',
          source: 'featured-signage-order',
          summary: buildCheckoutSummary(orderPayload),
          artworkPreviewUrl: heroImage,
          selectedAttributes: {
            category: categorySlug,
            globalInputs: orderPayload.globalInputs,
            productSpecificInputs: orderPayload.productSpecificInputs,
          },
        },
      },
    });
  };

  const handleBookServices = () => {
    navigate(getRoutePath('designService'), {
      state: {
        fromFeaturedQuote: true,
        productType: heading,
        categorySlug,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
      },
    });
  };

  const handleContactUs = () => {
    window.location.href = '/#contact';
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.customerEmail || !formData.productType) {
      toast.error('Please fill Name, Email, Phone and Product Type.');
      return;
    }
    if (!formData.width || !formData.height || !formData.quantity) {
      toast.error('Please fill Width, Height and Quantity.');
      return;
    }
    try {
      const snapshot = await featuredSignagePricingService.calculate(pricingInput);
      if (!snapshot?.complete) {
        toast.error('Unable to calculate price. Check your inputs and admin pricing.');
        return;
      }
      if (!(snapshot.total > 0)) {
        toast.error('Pricing is £0 — set rates in Admin → Featured pricing for this category.');
        return;
      }
    } catch (err) {
      toast.error(err?.message || 'Unable to calculate price.');
      return;
    }
    setStep('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let finalPricing = pricing;
      try {
        finalPricing = await featuredSignagePricingService.calculate(pricingInput);
      } catch {
        /* use last estimate if recalc fails */
      }
      const totalNet = finalPricing?.total ?? 0;
      const vatInc = readVatInclusiveFromStorage();
      const totalDisplay = payableFromNet(totalNet, vatInc);

      const composed = {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
        projectType: orderPayload.productType,
        quantity: orderPayload.globalInputs?.quantity ?? undefined,
        idealSignWidth: orderPayload.globalInputs?.width ?? undefined,
        country: 'United Kingdom',
        additionalInfo: `Featured Request • ${categorySlug}

Estimated price (${vatInc ? 'Inc VAT' : 'Ex VAT'}): £${totalDisplay.toFixed(2)}
Net total (ex VAT): £${totalNet.toFixed(2)}
${finalPricing?.breakdown?.length ? `Breakdown:\n${finalPricing.breakdown.map((l) => `  ${l.label}: £${Number(l.amount).toFixed(2)}`).join('\n')}` : ''}

Global Inputs:
${JSON.stringify(orderPayload?.globalInputs || {}, null, 2)}

Details:
${JSON.stringify(orderPayload?.productSpecificInputs || {}, null, 2)}

Notes:
${(orderPayload?.notes || '').trim()}`.trim(),
      };
      if (artwork) {
        await quoteService.createLogoArtworkQuote({
          ...composed,
          artwork, // form-data field consumed by backend
        });
      } else {
        await quoteService.create(composed);
      }
      setStep('success');
      toast.success('Thanks! We will share your quote via your given email.');
    } catch (error) {
      console.error('Error creating featured quote:', error);
      toast.error(error.message || 'Unable to submit quote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white py-8 sm:py-12" style={font}>
      <div className="container mx-auto max-w-5xl px-4 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
          {/* Hero header */}
          <div className="relative border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white sm:px-8">
            <div className="absolute inset-0 opacity-20">
              <img src={heroImage} alt="" className="h-full w-full object-cover" aria-hidden="true" />
            </div>
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/10 sm:block">
                  <img src={heroImage} alt={heading} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Featured product</p>
                  <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Request a Quote</h1>
                  <p className="mt-2 max-w-xl text-sm text-slate-200">
                    {heading} — share your requirements and choose how you&apos;d like to proceed.
                  </p>
                </div>
              </div>
              <div className="shrink-0 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <StepIndicator currentStep={step} />
              </div>
            </div>
          </div>

          {step === 'form' && (
            <form onSubmit={handlePreview} className="space-y-8 p-6 sm:p-8">
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">1</span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Contact details</h2>
                    <p className="text-xs text-slate-500">We&apos;ll use this to send your quote and order updates.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {renderInput('customerName', 'Name', 'text', 'Your full name', true)}
                  {renderInput('customerPhone', 'Phone', 'tel', '07xxx xxxxxx', true)}
                  {renderInput('customerEmail', 'Email', 'email', 'you@company.com', true)}
                  {renderInput('customerCompany', 'Company name')}
                  <div className="md:col-span-2">{renderInput('customerAddress', 'Address', 'text', 'Street, city, postcode')}</div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">2</span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Project specifications</h2>
                    <p className="text-xs text-slate-500">Dimensions and options for your signage.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {renderInput('productType', 'Product type', 'text', '', true, true)}
                  {renderInput('quantity', 'Quantity', 'number')}
                  {renderInput('width', 'Width', 'number')}
                  {renderInput('height', 'Height', 'number')}
                  {renderSelect('unit', 'Unit', [
                    { value: 'mm', label: 'mm' },
                    { value: 'inch', label: 'inch' },
                    { value: 'ft', label: 'ft' },
                  ])}
                  {renderSelect('usage', 'Indoor or outdoor use', [
                    { value: 'indoor', label: 'Indoor' },
                    { value: 'outdoor', label: 'Outdoor' },
                  ])}
                  {renderSelect('installationRequired', 'Installation required', [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                  ])}
                  {renderSelect('deliveryRequired', 'Delivery required', [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                  ])}
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">3</span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Product details</h2>
                    <p className="text-xs text-slate-500">Options specific to {heading}.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {categorySlug === '3d-built-up-letters' && (
                    <>
                      {renderInput('textContent', 'Text / letters content')}
                      {renderInput('letterHeight', 'Letter height', 'number')}
                      {renderInput('letterDepth', 'Letter depth', 'number')}
                      {renderInput('numberOfLetters', 'Number of letters', 'number')}
                      {renderSelect(
                        'material',
                        'Material',
                        [
                          { value: 'acrylic', label: 'Acrylic' },
                          { value: 'metal', label: 'Metal' },
                          { value: 'aluminum', label: 'Aluminum' },
                        ],
                        true
                      )}
                      {renderSelect(
                        'lightingType',
                        'Lighting type',
                        [
                          { value: 'frontlit', label: 'Frontlit' },
                          { value: 'backlit', label: 'Backlit' },
                          { value: 'halo', label: 'Halo' },
                          { value: 'none', label: 'None' },
                        ],
                        true
                      )}
                      {renderSelect(
                        'ledColor',
                        'LED color',
                        [
                          { value: 'white', label: 'White' },
                          { value: 'warm', label: 'Warm' },
                          { value: 'rgb', label: 'RGB' },
                        ],
                        true
                      )}
                      {renderSelect(
                        'mountingType',
                        'Mounting type',
                        [
                          { value: 'wall', label: 'Wall' },
                          { value: 'raceway', label: 'Raceway' },
                          { value: 'hanging', label: 'Hanging' },
                        ],
                        true
                      )}
                    </>
                  )}
                  {categorySlug === '2d-box-signage' && (
                    <>
                      {renderInput('depth', 'Depth', 'number')}
                      {renderSelect('frameMaterial', 'Frame material', [
                        { value: 'ms', label: 'MS' },
                        { value: 'aluminum', label: 'Aluminum' },
                      ])}
                      {renderSelect('faceMaterial', 'Face material', [
                        { value: 'flex', label: 'Flex' },
                        { value: 'acrylic', label: 'Acrylic' },
                      ])}
                    </>
                  )}
                  {categorySlug === 'flex-face' && (
                    <>
                      {renderSelect('flexType', 'Flex type', [
                        { value: 'frontlit', label: 'Frontlit' },
                        { value: 'backlit', label: 'Backlit' },
                      ])}
                      {renderSelect('frameIncluded', 'Frame included', [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                      ])}
                      {renderSelect('printingType', 'Printing type', [
                        { value: 'eco-solvent', label: 'Eco Solvent' },
                        { value: 'uv', label: 'UV' },
                      ])}
                    </>
                  )}
                  {categorySlug === 'lightbox' && (
                    <>
                      {renderInput('depth', 'Depth', 'number')}
                      {renderSelect('lightboxFrameType', 'Frame type', [
                        { value: 'aluminum', label: 'Aluminum' },
                        { value: 'acrylic', label: 'Acrylic' },
                      ])}
                      {renderSelect('faceMaterial', 'Face material', [
                        { value: 'acrylic', label: 'Acrylic' },
                        { value: 'fabric', label: 'Fabric' },
                      ])}
                      {renderSelect('brightnessLevel', 'Brightness', [
                        { value: 'standard', label: 'Standard' },
                        { value: 'high', label: 'High' },
                      ])}
                    </>
                  )}
                  {categorySlug === 'printed-board' && (
                    <>
                      {renderSelect('boardType', 'Board type', [
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
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700" style={font}>
                      Notes
                    </label>
                    <textarea
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="Any special requirements, colours, or installation notes…"
                      style={font}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700" style={font}>
                      Reference image <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setArtwork(e.target.files?.[0] || null)}
                        className="w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Upload a reference photo or sketch to help us understand your vision.
                        {artwork ? ` Selected: ${artwork.name}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <FeaturedPriceSummary
                pricing={pricing}
                loading={pricingLoading}
                error={pricingError}
                displayTotal={displayTotal}
                vatInclusive={vatInclusive}
              />

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/featured/${categorySlug}`)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to product
                </button>
                <button
                  type="submit"
                  disabled={pricingLoading || !pricing?.complete}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Review &amp; choose next step →
                </button>
              </div>
            </form>
          )}

          {step === 'preview' && (
            <div className="space-y-6 p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Order summary */}
                <div className="space-y-4 lg:col-span-3">
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3">
                      <img src={heroImage} alt={heading} className="h-14 w-14 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Order preview</p>
                        <p className="font-semibold text-slate-900">{orderPayload.productType}</p>
                      </div>
                    </div>
                    <div className="space-y-4 p-4">
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</p>
                        {renderDetailGrid([
                          ['name', formData.customerName],
                          ['email', formData.customerEmail],
                          ['phone', formData.customerPhone],
                          ['company', formData.customerCompany || 'N/A'],
                          ['address', formData.customerAddress || 'N/A'],
                        ])}
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Project</p>
                        {renderDetailGrid([
                          ['product', orderPayload.productType],
                          ...(orderPayload.globalInputs.width && orderPayload.globalInputs.height
                            ? [
                                [
                                  'size',
                                  `${orderPayload.globalInputs.width} × ${orderPayload.globalInputs.height} ${orderPayload.globalInputs.unit || ''}`.trim(),
                                ],
                              ]
                            : []),
                          ...(orderPayload.globalInputs.quantity !== undefined
                            ? [['quantity', orderPayload.globalInputs.quantity]]
                            : []),
                          ...(orderPayload.globalInputs.usage
                            ? [['use', orderPayload.globalInputs.usage]]
                            : []),
                          ...(orderPayload.globalInputs.installationRequired !== undefined
                            ? [['installation', orderPayload.globalInputs.installationRequired ? 'Yes' : 'No']]
                            : []),
                          ...(orderPayload.globalInputs.deliveryRequired !== undefined
                            ? [['delivery', orderPayload.globalInputs.deliveryRequired ? 'Yes' : 'No']]
                            : []),
                        ])}
                      </div>
                      {Object.keys(orderPayload.productSpecificInputs || {}).length > 0 ? (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Product details</p>
                          {renderDetailGrid(Object.entries(orderPayload.productSpecificInputs))}
                        </div>
                      ) : null}
                      {formData.notes ? (
                        <div className="rounded-lg bg-amber-50 px-3 py-2">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">Notes</p>
                          <p className="mt-0.5 whitespace-pre-wrap text-sm text-amber-900">{formData.notes}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Pricing + actions */}
                <div className="space-y-4 lg:col-span-2">
                  {orderPayload.pricing ? (
                    <FeaturedPriceSummary
                      pricing={{
                        ...pricing,
                        complete: true,
                        total: orderPayload.pricing.totalNet,
                        quantity: orderPayload.globalInputs?.quantity,
                      }}
                      loading={false}
                      error={null}
                      displayTotal={orderPayload.pricing.totalDisplay}
                      vatInclusive={orderPayload.pricing.vatInclusive}
                    />
                  ) : null}

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-900">How would you like to proceed?</p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={!(orderPayload.pricing?.totalNet > 0)}
                        className="flex w-full items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 text-left text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-lg">💳</span>
                        <span>
                          <span className="block text-sm font-bold">Pay now</span>
                          <span className="block text-xs text-emerald-100">
                            Secure checkout — £{orderPayload.pricing?.totalDisplay?.toFixed(2) ?? '—'}
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/50 disabled:opacity-60"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-lg">📋</span>
                        <span>
                          <span className="block text-sm font-bold text-slate-900">
                            {isSubmitting ? 'Submitting…' : 'Submit quote request'}
                          </span>
                          <span className="block text-xs text-slate-500">We&apos;ll email you a formal quote</span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBookServices}
                        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-violet-300 hover:bg-violet-50/50"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-lg">🎨</span>
                        <span>
                          <span className="block text-sm font-bold text-slate-900">Book design services</span>
                          <span className="block text-xs text-slate-500">Work with our team on artwork &amp; layout</span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleContactUs}
                        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-amber-300 hover:bg-amber-50/50"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-lg">💬</span>
                        <span>
                          <span className="block text-sm font-bold text-slate-900">Contact us</span>
                          <span className="block text-xs text-slate-500">Speak to our team before you decide</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-start border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  ← Back to edit
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="px-6 py-14 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
                ✓
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">Quote submitted</h3>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                Thanks, {formData.customerName || 'there'}! We&apos;ll review your requirements and share your quote at{' '}
                <span className="font-medium text-slate-800">{formData.customerEmail}</span>.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate(`/featured/${categorySlug}`)}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Back to product page
                </button>
                <button
                  type="button"
                  onClick={handleContactUs}
                  className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Contact us
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedQuoteRequestPage;

