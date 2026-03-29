import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { quoteService } from '../services/quoteService';
import { getFeaturedSignageBySlug } from '../data/featuredSignageData';

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
      <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
        {label}
      </label>
      <input
        type={type}
        value={formData[name]}
        onChange={(e) => setFormData((prev) => ({ ...prev, [name]: e.target.value }))}
        className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 ${disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
      />
    </div>
  );

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

  const orderPayload = useMemo(() => {
    const quantityNum = Math.max(1, Number(formData.quantity) || 1);
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
      globalInputs: {
        productType: formData.productType || heading,
        width: formData.width,
        height: formData.height,
        unit: formData.unit,
        quantity: quantityNum,
        usage: formData.usage,
        installationRequired: formData.installationRequired === 'yes',
        deliveryRequired: formData.deliveryRequired === 'yes',
      },
      productSpecificInputs,
      notes: formData.notes || '',
      orderItems: [{ name: `${heading} - Custom`, qty: quantityNum, price: 0, image: heroImage }],
      itemsPrice: 0,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 0,
      total: 0,
      paymentMethod: 'quote',
      shippingAddress: {
        address: formData.customerAddress || 'TBD',
        city: 'TBD',
        postalCode: 'TBD',
        country: 'United Kingdom',
      },
      metadata: { submittedFrom: 'featured-quote-screen', featuredCategorySlug: categorySlug },
    };
  }, [categorySlug, formData, heading, heroImage, productSpecificInputs]);

  const handlePreview = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.customerEmail || !formData.productType) {
      toast.error('Please fill Name, Email, Phone and Product Type.');
      return;
    }
    if (!formData.width || !formData.height || !formData.quantity) {
      toast.error('Please fill Width, Height and Quantity.');
      return;
    }
    setStep('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const composed = {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
        projectType: orderPayload.productType,
        quantity: orderPayload.globalInputs?.quantity,
        idealSignWidth: orderPayload.globalInputs?.width,
        country: 'United Kingdom',
        additionalInfo: `Featured Request • ${categorySlug}
        
Global Inputs:
${JSON.stringify(orderPayload?.globalInputs || {}, null, 2)}

Details:
${JSON.stringify(orderPayload?.productSpecificInputs || {}, null, 2)}

Notes:
${orderPayload?.notes || ''}`,
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Request a Quote</h1>
            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              {heading} — share your requirement and we will contact you shortly.
            </p>
          </div>

          {step === 'form' && (
            <form onSubmit={handlePreview} className="p-6 space-y-8">
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('customerName', 'Name', 'text', '', true)}
                  {renderInput('customerPhone', 'Phone', 'text', '', true)}
                  {renderInput('customerEmail', 'Email', 'email', '', true)}
                  {renderInput('customerCompany', 'Company Name')}
                  <div className="md:col-span-2">{renderInput('customerAddress', 'Address')}</div>
                </div>
              </section>

              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('productType', 'Product Type', 'text', '', true, true)}
                  {renderInput('quantity', 'Quantity', 'number')}
                  {renderInput('width', 'Width', 'number')}
                  {renderInput('height', 'Height', 'number')}
                  {renderSelect('unit', 'Unit', [{ value: 'mm', label: 'mm' }, { value: 'inch', label: 'inch' }, { value: 'ft', label: 'ft' }])}
                  {renderSelect('usage', 'Indoor or Outdoor Use', [{ value: 'indoor', label: 'Indoor' }, { value: 'outdoor', label: 'Outdoor' }])}
                  {renderSelect('installationRequired', 'Installation Required', [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }])}
                  {renderSelect('deliveryRequired', 'Delivery Required', [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }])}
                </div>
              </section>

              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorySlug === '3d-built-up-letters' && (<>
                    {renderInput('textContent', 'Text / Letters Content')}
                    {renderInput('letterHeight', 'Letter Height', 'number')}
                    {renderInput('letterDepth', 'Letter Depth', 'number')}
                    {renderInput('numberOfLetters', 'Number of Letters', 'number')}
                  </>)}
                  {categorySlug === '2d-box-signage' && (<>
                    {renderInput('depth', 'Depth', 'number')}
                    {renderSelect('frameMaterial', 'Frame Material', [{ value: 'ms', label: 'MS' }, { value: 'aluminum', label: 'Aluminum' }])}
                    {renderSelect('faceMaterial', 'Face Material', [{ value: 'flex', label: 'Flex' }, { value: 'acrylic', label: 'Acrylic' }])}
                  </>)}
                  {categorySlug === 'flex-face' && (<>
                    {renderSelect('flexType', 'Flex Type', [{ value: 'frontlit', label: 'Frontlit' }, { value: 'backlit', label: 'Backlit' }])}
                    {renderSelect('frameIncluded', 'Frame Included', [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }])}
                    {renderSelect('printingType', 'Printing Type', [{ value: 'eco-solvent', label: 'Eco Solvent' }, { value: 'uv', label: 'UV' }])}
                  </>)}
                  {categorySlug === 'lightbox' && (<>
                    {renderInput('depth', 'Depth', 'number')}
                    {renderSelect('lightboxFrameType', 'Frame Type', [{ value: 'aluminum', label: 'Aluminum' }, { value: 'acrylic', label: 'Acrylic' }])}
                    {renderSelect('faceMaterial', 'Face Material', [{ value: 'acrylic', label: 'Acrylic' }, { value: 'fabric', label: 'Fabric' }])}
                    {renderSelect('brightnessLevel', 'Brightness', [{ value: 'standard', label: 'Standard' }, { value: 'high', label: 'High' }])}
                  </>)}
                  {categorySlug === 'printed-board' && (<>
                    {renderSelect('boardType', 'Board Type', [{ value: 'foam-board', label: 'Foam Board' }, { value: 'pvc', label: 'PVC' }, { value: 'acrylic', label: 'Acrylic' }])}
                    {renderInput('thickness', 'Thickness')}
                    {renderSelect('lamination', 'Lamination', [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }])}
                    {renderSelect('finish', 'Finish', [{ value: 'matte', label: 'Matte' }, { value: 'gloss', label: 'Gloss' }])}
                  </>)}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Notes</label>
                    <textarea
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Reference Image (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setArtwork(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-700"
                    />
                    <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      You can upload a reference image to help us understand your requirements.
                    </p>
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => navigate(`/featured/${categorySlug}`)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Back</button>
              <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Preview Order</button>
              </div>
            </form>
          )}

          {step === 'preview' && (
            <div className="p-6 space-y-6">
              <div className="rounded-xl border border-gray-100 p-5 bg-gray-50">
                <p className="text-base font-semibold text-gray-900 mb-4">Preview</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Customer</p>
                    <p className="text-sm font-medium text-gray-900">{formData.customerName || '-'}</p>
                    <p className="text-sm text-gray-700">{formData.customerEmail || '-'}</p>
                    <p className="text-sm text-gray-700">{formData.customerPhone || '-'}</p>
                    <p className="text-sm text-gray-700 mt-1">{formData.customerCompany || 'N/A'}</p>
                    <p className="text-sm text-gray-700">{formData.customerAddress || 'N/A'}</p>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Project</p>
                    <p className="text-sm font-medium text-gray-900">{orderPayload.productType}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {orderPayload.globalInputs.width} x {orderPayload.globalInputs.height} {orderPayload.globalInputs.unit}
                    </p>
                    <p className="text-sm text-gray-700">Quantity: {orderPayload.globalInputs.quantity}</p>
                    <p className="text-sm text-gray-700 capitalize">Use: {orderPayload.globalInputs.usage}</p>
                    <p className="text-sm text-gray-700">
                      Installation: {orderPayload.globalInputs.installationRequired ? 'Yes' : 'No'} • Delivery: {orderPayload.globalInputs.deliveryRequired ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-white border border-gray-100 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Product Specific Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    {Object.entries(orderPayload.productSpecificInputs || {})
                      .filter(([, value]) => !(value === '' || value === null || value === undefined))
                      .map(([key, value]) => (
                        <div key={key} className="text-sm text-gray-800">
                          <span className="text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:
                          </span>{' '}
                          <span>{String(value)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {formData.notes ? (
                  <div className="mt-4 bg-white border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">Notes</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{formData.notes}</p>
                  </div>
                ) : null}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setStep('form')} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Back to Edit</button>
                <button type="button" onClick={handleSubmit} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Quote'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">✓</div>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">Quote Submitted</h3>
              <p className="mt-2 text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Thanks! We will share your quote via your given email.
              </p>
              <button type="button" onClick={() => navigate(`/featured/${categorySlug}`)} className="mt-6 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
                Back to Product Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedQuoteRequestPage;

