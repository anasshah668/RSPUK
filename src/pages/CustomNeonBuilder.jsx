import React, { useEffect, useState, useRef } from 'react';
import NeonText from '../components/NeonText';
import CommonCheckout from '../components/CommonCheckout';
import { useCart } from '../context/CartContext';
import { toPng } from 'html-to-image';
import { quoteService } from '../services/quoteService';
import { paymentService } from '../services/paymentService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useNavigate } from 'react-router-dom';

const CustomNeonBuilder = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const previewRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [builderMode, setBuilderMode] = useState('design-light');
  const [currentStep, setCurrentStep] = useState(1); // 1: Custom Design, 2: Pricing, 3: Preview, 4: Checkout
  const [showEffects, setShowEffects] = useState(false);
  const [showBuildOptions, setShowBuildOptions] = useState(false);
  const [neonConfig, setNeonConfig] = useState({
    text: 'Start Typing',
    font: 'Pacifico',
    color: '#ff4df0',
    size: 40,
    glowIntensity: 8,
    letterSpacing: 2,
    flicker: false,

    // New "Design a Light" options
    environment: 'indoor', // indoor | outdoor
    jacket: 'coloured', // coloured | white
    backgroundStyle: 'cut-to-shape', // cut-to-shape
    backgroundColor: 'white', // white | black | silver | yellow
    mountingOption: 'wall-mounting-screws', // wall-mounting-screws
    addOnShape: 'none', // none | heart | star
    tubeThickness: 'bold', // classic | bold
    remoteDimmer: 'yes', // yes | no
    powerMode: 'power-adaptor', // battery-operated | power-adaptor
  });
  const [selectedSize, setSelectedSize] = useState(null);
  const [customSizeEnabled, setCustomSizeEnabled] = useState(false);
  const [customSize, setCustomSize] = useState({ width: '', height: '', unit: 'cm' });
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('worldpay-card');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [countries, setCountries] = useState([{ code: 'GB', name: 'United Kingdom' }]);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [logoQuoteForm, setLogoQuoteForm] = useState({
    name: '',
    country: 'United Kingdom',
    phone: '',
    email: '',
    additionalInfo: '',
    idealSignWidth: '',
    quantity: '1',
    artwork: null,
  });
  const artworkInputRef = useRef(null);
  const fontPickerRef = useRef(null);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontPicker, setShowFontPicker] = useState(false);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
        const data = await res.json();
        const list = (data || [])
          .map((item) => ({
            code: item.cca2,
            name: item?.name?.common,
          }))
          .filter((item) => item.code && item.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        if (list.length > 0) {
          setCountries(list);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
      }
    };

    loadCountries();
  }, []);

  const neonSizeWidths = [
    { widthCm: 40, widthFt: '1.3ft', lettersPerLine: 4 },
    { widthCm: 60, widthFt: '2ft', lettersPerLine: 10 },
    { widthCm: 80, widthFt: '2.6ft', lettersPerLine: 13 },
    { widthCm: 100, widthFt: '3.3ft', lettersPerLine: 16 },
    { widthCm: 120, widthFt: '4.1ft', lettersPerLine: 20 },
    { widthCm: 140, widthFt: '4.6ft', lettersPerLine: 24 },
    { widthCm: 160, widthFt: '5.2ft', lettersPerLine: 26 },
    { widthCm: 180, widthFt: '5.9ft', lettersPerLine: 30 },
    { widthCm: 200, widthFt: '6.5ft', lettersPerLine: 34 },
    { widthCm: 300, widthFt: '9.8ft', lettersPerLine: 34 },
    { widthCm: 350, widthFt: '11.4ft', lettersPerLine: 34 },
  ];

  // Height options (cm) - customer can choose after selecting width
  const neonHeightOptionsCm = [8, 12, 16, 20, 24, 28, 32, 36, 40];

  const fonts = [
    { name: 'Pacifico', label: 'Pacifico' },
    { name: 'Dancing Script', label: 'Dancing Script' },
    { name: 'Great Vibes', label: 'Great Vibes' },
    { name: 'Kalam', label: 'Kalam' },
    { name: 'Lexend Deca', label: 'Lexend Deca' },
    { name: 'Arial', label: 'Arial' },
    { name: 'Helvetica', label: 'Helvetica' },
    { name: 'Verdana', label: 'Verdana' },
    { name: 'Tahoma', label: 'Tahoma' },
    { name: 'Trebuchet MS', label: 'Trebuchet MS' },
    { name: 'Times New Roman', label: 'Times New Roman' },
    { name: 'Georgia', label: 'Georgia' },
    { name: 'Garamond', label: 'Garamond' },
    { name: 'Palatino', label: 'Palatino' },
    { name: 'Courier New', label: 'Courier New' },
    { name: 'Lucida Console', label: 'Lucida Console' },
    { name: 'Monaco', label: 'Monaco' },
    { name: 'Impact', label: 'Impact' },
    { name: 'Comic Sans MS', label: 'Comic Sans MS' },
    { name: 'Montserrat', label: 'Montserrat' },
    { name: 'Roboto', label: 'Roboto' },
    { name: 'Poppins', label: 'Poppins' },
    { name: 'Open Sans', label: 'Open Sans' },
    { name: 'Lato', label: 'Lato' },
    { name: 'Raleway', label: 'Raleway' },
    { name: 'Nunito', label: 'Nunito' },
    { name: 'Merriweather', label: 'Merriweather' },
    { name: 'Playfair Display', label: 'Playfair Display' },
    { name: 'Oswald', label: 'Oswald' },
  ];
  const filteredFonts = fonts.filter((font) =>
    font.label.toLowerCase().includes((fontSearch || '').toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontPickerRef.current && !fontPickerRef.current.contains(event.target)) {
        setShowFontPicker(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getEstimatedAmount = () => {
    if (selectedSize?.price && selectedSize.price > 0) return Number(selectedSize.price);

    const widthRaw = selectedSize?.width || '';
    const heightRaw = selectedSize?.height || '';
    const widthNum = parseFloat(widthRaw) || 0;
    const heightNum = parseFloat(heightRaw) || 0;

    const widthUnit = widthRaw.includes('ft') ? 'ft' : widthRaw.includes('mm') ? 'mm' : 'cm';
    const heightUnit = heightRaw.includes('ft') ? 'ft' : heightRaw.includes('mm') ? 'mm' : 'cm';

    const widthCm = widthUnit === 'ft' ? widthNum * 30.48 : widthUnit === 'mm' ? widthNum / 10 : widthNum;
    const heightCm = heightUnit === 'ft' ? heightNum * 30.48 : heightUnit === 'mm' ? heightNum / 10 : heightNum;

    const base = 59;
    const areaPart = Math.max(0, widthCm * 0.9 + heightCm * 1.2);
    const addonPart = neonConfig.environment === 'outdoor' ? 25 : 0;
    const total = base + areaPart + addonPart;

    return Math.max(10, Number(total.toFixed(2)));
  };

  const estimatedAmount = getEstimatedAmount();

  const handleNext = () => {
    if (currentStep === 1 && !selectedSize) {
      toast.error('Please select a size to continue.');
      return;
    }
    if (currentStep === 3) {
      navigate('/checkout', {
        state: {
          checkoutData: {
            title: 'Custom Neon Sign Checkout',
            description: 'Complete your custom neon sign purchase securely.',
            amount: estimatedAmount,
            summary: [
              {
                label: 'Text',
                value: `${neonConfig.text}${neonConfig.addOnShape === 'heart' ? ' ♥' : neonConfig.addOnShape === 'star' ? ' ★' : ''}`,
              },
              {
                label: 'Size',
                value: selectedSize ? `${selectedSize.width} x ${selectedSize.height}` : 'Not selected',
              },
              {
                label: 'Build',
                value: `${neonConfig.environment === 'outdoor' ? 'Outdoor' : 'Indoor'} • ${neonConfig.tubeThickness === 'classic' ? 'Classic Tube' : 'Bold Tube'}`,
              },
            ],
          },
        },
      });
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCheckout = async (paymentPayload = null) => {
    if (!selectedSize) {
      toast.error('Please select a size to continue.');
      return;
    }
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast.error('Please complete all contact details.');
      return;
    }
    if (!acceptTerms) {
      toast.error('Please accept the Terms & Conditions to continue.');
      return;
    }
    try {
      let paymentId = null;
      if (paymentMethod === 'worldpay-card' && paymentPayload?.sessionState) {
        const paymentResult = await paymentService.chargeWorldpay({
          sessionState: paymentPayload.sessionState,
          amount: estimatedAmount,
          currency: 'GBP',
          orderReference: `NEON-${Date.now()}`,
          customerInfo,
        });
        paymentId = paymentResult?.paymentId || null;
      }

      const order = {
        id: `neon-${Date.now()}`,
        type: 'neon-sign',
        config: neonConfig,
        size: selectedSize,
        paymentMethod,
        paymentId,
        price: estimatedAmount,
        quantity: 1
      };
      addToCart(order, 1);
      toast.success('Order added to cart!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('neon-preview-export');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#1f2937',
        pixelRatio: 3,
        quality: 1.0,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      const link = document.createElement('a');
      link.download = `neon-sign-${neonConfig.text.replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export image. Please try again.');
    }
  };

  const handleLogoQuoteSubmit = async (e) => {
    e.preventDefault();

    if (!logoQuoteForm.name || !logoQuoteForm.email || !logoQuoteForm.phone) {
      toast.error('Please fill in Name, Email, and Phone.');
      return;
    }

    if (!logoQuoteForm.artwork) {
      toast.error('Please upload your logo/artwork/design.');
      return;
    }

    try {
      setQuoteSubmitting(true);
      await quoteService.createLogoArtworkQuote({
        name: logoQuoteForm.name,
        country: logoQuoteForm.country || 'United Kingdom',
        phone: logoQuoteForm.phone,
        email: logoQuoteForm.email,
        projectType: 'Logo & Artwork Quote',
        quoteType: 'logo-artwork',
        idealSignWidth: logoQuoteForm.idealSignWidth,
        quantity: logoQuoteForm.quantity,
        additionalInfo: logoQuoteForm.additionalInfo,
        message: logoQuoteForm.additionalInfo,
        artwork: logoQuoteForm.artwork,
      });

      toast.success('Quote request submitted successfully. We will beat any price and get back to you soon.');
      setLogoQuoteForm({
        name: '',
        country: 'United Kingdom',
        phone: '',
        email: '',
        additionalInfo: '',
        idealSignWidth: '',
        quantity: '1',
        artwork: null,
      });
      if (artworkInputRef.current) {
        artworkInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Quote submission failed:', error);
      toast.error(error.message || 'Failed to submit quote. Please try again.');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Design Step
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Live Preview */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 lg:sticky lg:top-24 lg:col-span-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Live Preview
              </h3>
              <div className="bg-gray-900 rounded-xl p-4 md:p-5 min-h-[280px] md:min-h-[320px] flex items-center justify-center relative overflow-hidden">
                    {/* Dark background with subtle pattern */}
                    <div className="absolute inset-0 opacity-10 z-0" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                    <div
                      className="relative z-10 w-full lg:scale-90 xl:scale-100 origin-center transition-transform"
                      id="neon-preview-export"
                    >
                      <NeonText
                        text={`${neonConfig.text}${neonConfig.addOnShape === 'heart' ? ' ♥' : neonConfig.addOnShape === 'star' ? ' ★' : ''}`}
                        font={neonConfig.font}
                        color={neonConfig.color}
                        size={neonConfig.size}
                        glowIntensity={neonConfig.glowIntensity}
                        letterSpacing={neonConfig.letterSpacing}
                        flicker={neonConfig.flicker}
                    minHeightClass="min-h-[240px] md:min-h-[280px]"
                      />
                    </div>
                    <div className="absolute top-4 left-4 z-20 space-y-2">
                      <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded text-xs font-semibold inline-flex" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Live Preview
                      </div>
                      {selectedSize?.width && selectedSize?.height ? (
                        <div className="bg-black/60 backdrop-blur-sm text-white/90 px-3 py-1.5 rounded text-[11px] font-semibold inline-flex border border-white/10" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          {selectedSize.width} wide {selectedSize.widthFt ? `(${selectedSize.widthFt})` : ''} • {selectedSize.height} height
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

            {/* Right: Design controls */}
            <div className="bg-white rounded-xl shadow-lg p-5 md:p-6 lg:col-span-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Customize Your Neon Sign
              </h3>
                <div className="space-y-4">
                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Text
                    </label>
                    <input
                      type="text"
                      value={neonConfig.text}
                      onChange={(e) => setNeonConfig({ ...neonConfig, text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    />
                  </div>

                  {/* Font Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Font
                    </label>
                    <div className="relative" ref={fontPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowFontPicker((prev) => !prev)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ fontFamily: neonConfig.font }}
                      >
                        <span>{neonConfig.font}</span>
                        <span className="text-gray-500 text-xs">▼</span>
                      </button>
                      {showFontPicker && (
                        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                          <input
                            type="text"
                            value={fontSearch}
                            onChange={(e) => setFontSearch(e.target.value)}
                            placeholder="Search fonts..."
                            className="w-full px-3 py-2 text-sm border-b border-gray-200"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          />
                          <div className="max-h-60 overflow-y-auto">
                            {filteredFonts.length > 0 ? (
                              filteredFonts.map((font) => (
                                <button
                                  key={font.name}
                                  type="button"
                                  onClick={() => {
                                    setNeonConfig({ ...neonConfig, font: font.name });
                                    setShowFontPicker(false);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                  style={{ fontFamily: font.name }}
                                >
                                  {font.label}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                                No fonts found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Color
                    </label>
                    <input
                      type="color"
                      value={neonConfig.color}
                      onChange={(e) => setNeonConfig({ ...neonConfig, color: e.target.value })}
                      className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Select Size (moved here: right after color) */}
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Select Size
                      </p>
                      {selectedSize?.width && selectedSize?.height ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          {selectedSize.width} × {selectedSize.height}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          Choose a size
                        </span>
                      )}
                    </div>

                    {/* Custom size toggle */}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Use custom size
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-800" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600"
                          checked={customSizeEnabled}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            setCustomSizeEnabled(enabled);
                            if (!enabled) {
                              // Clear custom data but keep previously selected preset if any
                              setCustomSize({ width: '', height: '', unit: 'cm' });
                            } else {
                              // Initialize custom selection
                              const width = customSize.width || '';
                              const height = customSize.height || '';
                              if (width && height) {
                                setSelectedSize({
                                  id: 'custom',
                                  label: 'Custom size',
                                  width: `${width}${customSize.unit}`,
                                  height: `${height}${customSize.unit}`,
                                  widthFt: null,
                                  lettersPerLine: null,
                                  price: 0,
                                });
                              } else {
                                setSelectedSize(null);
                              }
                            }
                          }}
                        />
                        <span>Custom size</span>
                      </label>
                    </div>

                    {/* Custom size inputs */}
                    {customSizeEnabled && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Width
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={customSize.width}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCustomSize((p) => ({ ...p, width: value }));
                              const height = customSize.height;
                              if (value && height) {
                                setSelectedSize({
                                  id: 'custom',
                                  label: 'Custom size',
                                  width: `${value}${customSize.unit}`,
                                  height: `${height}${customSize.unit}`,
                                  widthFt: null,
                                  lettersPerLine: null,
                                  price: 0,
                                });
                              } else {
                                setSelectedSize(null);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g. 120"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Height
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={customSize.height}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCustomSize((p) => ({ ...p, height: value }));
                              const width = customSize.width;
                              if (width && value) {
                                setSelectedSize({
                                  id: 'custom',
                                  label: 'Custom size',
                                  width: `${width}${customSize.unit}`,
                                  height: `${value}${customSize.unit}`,
                                  widthFt: null,
                                  lettersPerLine: null,
                                  price: 0,
                                });
                              } else {
                                setSelectedSize(null);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g. 40"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Unit
                          </label>
                          <select
                            value={customSize.unit}
                            onChange={(e) => {
                              const unit = e.target.value;
                              setCustomSize((p) => ({ ...p, unit }));
                              const width = customSize.width;
                              const height = customSize.height;
                              if (width && height) {
                                setSelectedSize({
                                  id: 'custom',
                                  label: 'Custom size',
                                  width: `${width}${unit}`,
                                  height: `${height}${unit}`,
                                  widthFt: unit === 'cm' && customSize.width
                                    ? null
                                    : null,
                                  lettersPerLine: null,
                                  price: 0,
                                });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            <option value="mm">mm</option>
                            <option value="cm">cm</option>
                            <option value="ft">ft</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {neonSizeWidths.map((size) => (
                        <button
                          key={size.widthCm}
                          type="button"
                          onClick={() =>
                            !customSizeEnabled &&
                            setSelectedSize({
                              id: `w-${size.widthCm}`,
                              label: `${size.widthCm}cm wide`,
                              width: `${size.widthCm}cm`,
                              height: `${neonHeightOptionsCm[0]}cm`,
                              widthFt: size.widthFt,
                              lettersPerLine: size.lettersPerLine,
                              // Pricing is quote-based for these sizes unless you provide a price table
                              price: 0,
                            })
                          }
                          disabled={customSizeEnabled}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedSize?.width === `${size.widthCm}cm` && !customSizeEnabled
                              ? 'border-blue-600 bg-blue-50'
                              : customSizeEnabled
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{size.widthCm}cm wide</p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                ({size.widthFt}) • {size.lettersPerLine} letters per line
                              </p>
                            </div>
                            <p className="text-xs font-bold text-gray-600 whitespace-nowrap">Quote</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Height selection */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          Select Height
                        </p>
                        <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          {selectedSize?.height ? `Height: ${selectedSize.height}` : 'Select a width first'}
                        </p>
                      </div>
                      <div className="mt-2 grid grid-cols-5 gap-2">
                        {neonHeightOptionsCm.map((h) => {
                          const heightValue = `${h}cm`;
                          const disabled = !selectedSize?.width || customSizeEnabled;
                          const active = selectedSize?.height === heightValue;
                          return (
                            <button
                              key={h}
                              type="button"
                              disabled={disabled}
                              onClick={() => setSelectedSize((prev) => (prev ? { ...prev, height: heightValue } : prev))}
                              className={`px-2 py-2 rounded-lg border text-[11px] font-semibold transition-colors ${
                                disabled
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : active
                                    ? 'bg-blue-50 text-blue-700 border-blue-600'
                                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                              }`}
                              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                            >
                              {h}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Height in cm. (Example: 8, 12, 16…)
                      </p>
                    </div>
                  </div>

                  {/* Text & Effects (collapsed by default to reduce scrolling) */}
                  <div className="rounded-xl border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setShowEffects((v) => !v)}
                      className="w-full px-4 py-3 flex items-center justify-between gap-3"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-900">Text & Effects</p>
                        <p className="text-xs text-gray-600 mt-0.5">Text size, glow, spacing, flicker</p>
                      </div>
                      <span className="text-gray-500 text-sm">{showEffects ? '−' : '+'}</span>
                    </button>
                    {showEffects ? (
                      <div className="px-4 pb-4 space-y-4">
                        {/* Fixed defaults (no sliders) */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                            <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Text size</p>
                            <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>{neonConfig.size}px</p>
                          </div>
                          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                            <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Glow intensity</p>
                            <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>{neonConfig.glowIntensity}</p>
                          </div>
                        </div>

                        {/* Letter Spacing */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Letter Spacing: {neonConfig.letterSpacing}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={neonConfig.letterSpacing}
                            onChange={(e) => setNeonConfig({ ...neonConfig, letterSpacing: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        {/* Flicker toggle removed per request */}
                      </div>
                    ) : null}
                  </div>

                  {/* Build Options (collapsed by default to reduce scrolling) */}
                  <div className="rounded-xl border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setShowBuildOptions((v) => !v)}
                      className="w-full px-4 py-3 flex items-center justify-between gap-3"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-900">Build Options</p>
                        <p className="text-xs text-gray-600 mt-0.5">Indoor/outdoor, jacket, background, dimmer…</p>
                      </div>
                      <span className="text-gray-500 text-sm">{showBuildOptions ? '−' : '+'}</span>
                    </button>

                    {showBuildOptions ? (
                      <div className="px-4 pb-4 space-y-4">

                    {/* Indoor / Outdoor */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Indoor or Outdoor
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNeonConfig({ ...neonConfig, environment: 'indoor' })}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            neonConfig.environment === 'indoor'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          <p className="text-sm font-semibold text-gray-900">Indoor</p>
                          <p className="text-xs text-gray-600 mt-0.5">For indoor use only</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNeonConfig({ ...neonConfig, environment: 'outdoor' })}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            neonConfig.environment === 'outdoor'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          <p className="text-sm font-semibold text-gray-900">Outdoor</p>
                          <p className="text-xs text-gray-600 mt-0.5">IP67 Waterproof technology</p>
                        </button>
                      </div>
                    </div>

                    {/* Jacket */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Choose a Jacket
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNeonConfig({ ...neonConfig, jacket: 'coloured' })}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            neonConfig.jacket === 'coloured'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          <p className="text-sm font-semibold text-gray-900">Coloured Jacket</p>
                          <p className="text-xs text-gray-600 mt-0.5">Off-state matches selected color</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNeonConfig({ ...neonConfig, jacket: 'white' })}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            neonConfig.jacket === 'white'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          <p className="text-sm font-semibold text-gray-900">White Jacket</p>
                          <p className="text-xs text-gray-600 mt-0.5">Off-state is white</p>
                        </button>
                      </div>
                    </div>

                    {/* Background */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Choose Background
                      </label>
                      <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              Cut to shape
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              Acrylic background that follows the shape of your sign
                            </p>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Selected
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Background color
                          </p>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { key: 'white', label: 'White', swatch: '#ffffff', ring: 'ring-gray-200' },
                              { key: 'black', label: 'Black', swatch: '#0b1220', ring: 'ring-gray-300' },
                              { key: 'silver', label: 'Silver', swatch: '#cbd5e1', ring: 'ring-gray-200' },
                              { key: 'yellow', label: 'Yellow', swatch: '#facc15', ring: 'ring-yellow-200' },
                            ].map((c) => (
                              <button
                                key={c.key}
                                type="button"
                                onClick={() => setNeonConfig({ ...neonConfig, backgroundStyle: 'cut-to-shape', backgroundColor: c.key })}
                                className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                                  neonConfig.backgroundColor === c.key
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                                title={c.label}
                                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                              >
                                <span className={`mx-auto block w-6 h-6 rounded-full border border-gray-200 ring-1 ${c.ring}`} style={{ backgroundColor: c.swatch }} />
                                <span className="block text-[11px] font-semibold text-gray-700 mt-1">{c.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mounting */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Mounting Option
                      </label>
                      <button
                        type="button"
                        onClick={() => setNeonConfig({ ...neonConfig, mountingOption: 'wall-mounting-screws' })}
                        className="w-full p-3 rounded-lg border border-blue-600 bg-blue-50 text-left"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      >
                        <p className="text-sm font-semibold text-gray-900">Wall mounting screws</p>
                        <p className="text-xs text-gray-600 mt-0.5">Comes with pre drilled mounting holes and wall screws</p>
                      </button>
                    </div>

                    {/* Add a Heart or Star */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Add a Heart or Star (Optional)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'none', label: 'None', icon: '—' },
                          { key: 'heart', label: 'Heart', icon: '♥' },
                          { key: 'star', label: 'Star', icon: '★' },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setNeonConfig({ ...neonConfig, addOnShape: opt.key })}
                            className={`p-2.5 rounded-lg border transition-colors ${
                              neonConfig.addOnShape === opt.key
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            <div className="text-lg leading-none">{opt.icon}</div>
                            <div className="text-[11px] font-semibold text-gray-700 mt-1">{opt.label}</div>
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Adds the selected symbol to the end of your text in the preview.
                      </p>
                    </div>

                    {/* Tube Thickness */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Neon Tube Thickness
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNeonConfig({ ...neonConfig, tubeThickness: 'classic' })}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            neonConfig.tubeThickness === 'classic'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          <p className="text-sm font-semibold text-gray-900">Classic Tube</p>
                          <p className="text-xs text-gray-600 mt-0.5">6mm</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNeonConfig({ ...neonConfig, tubeThickness: 'bold' })}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            neonConfig.tubeThickness === 'bold'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          <p className="text-sm font-semibold text-gray-900">Bold Tube</p>
                          <p className="text-xs text-gray-600 mt-0.5">8mm (free upgrade)</p>
                        </button>
                      </div>
                    </div>

                    {/* Remote Dimmer */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Remote Dimmer
                      </label>
                      <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          Set your sign to any brightness or turn it on/off at the touch of a button
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setNeonConfig({ ...neonConfig, remoteDimmer: 'yes' })}
                            className={`p-2.5 rounded-lg border font-semibold text-sm transition-colors ${
                              neonConfig.remoteDimmer === 'yes'
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                            }`}
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setNeonConfig({ ...neonConfig, remoteDimmer: 'no' })}
                            className={`p-2.5 rounded-lg border font-semibold text-sm transition-colors ${
                              neonConfig.remoteDimmer === 'no'
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                            }`}
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Power Mode */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Power Mode
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNeonConfig({ ...neonConfig, powerMode: 'battery-operated' })}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            neonConfig.powerMode === 'battery-operated'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          <p className="text-sm font-semibold text-gray-900">Battery operated</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNeonConfig({ ...neonConfig, powerMode: 'power-adaptor' })}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            neonConfig.powerMode === 'power-adaptor'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          <p className="text-sm font-semibold text-gray-900">Power adaptor</p>
                        </button>
                      </div>
                    </div>
                    </div>
                    ) : null}
                  </div>

                  {/* Quick Info */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-800 space-y-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      <p>
                        💡 <strong>Tip:</strong> Adjust the glow intensity to make your neon sign more or less bright.
                        Higher values create a stronger glow effect.
                      </p>
                      <ul className="list-disc ml-4 space-y-1">
                        <li>Use <strong>Custom size</strong> for exact width/height; pick units in mm, cm, or ft.</li>
                        <li><strong>Wider width</strong> allows more letters per line; the preview updates live.</li>
                        <li>Select <strong>Outdoor</strong> if the sign is outside (IP67 waterproof build).</li>
                        <li>Add a <strong>Remote dimmer</strong> to control brightness from your sofa/bar.</li>
                        <li>Click <strong>Preview</strong> or <strong>Download</strong> to share your mockup.</li>
                      </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Pricing Step
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Pricing
              </h3>
              <p className="text-sm text-gray-600 mb-6" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Review estimated pricing before moving to final preview and secure checkout.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Estimated Price</p>
                  <p className="text-2xl font-bold text-blue-700 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {`£${estimatedAmount.toFixed(2)}`}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-200 p-4 bg-blue-50">
                  <p className="text-sm font-semibold text-blue-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Klarna Pay in 3</p>
                  <p className="text-sm font-bold text-blue-900 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {`From £${(estimatedAmount / 3).toFixed(2)} x 3`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Preview Step
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Preview
              </h3>
              <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Review all selected options before moving to checkout.
              </p>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Text</p>
                    <p className="text-sm font-bold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {`${neonConfig.text}${neonConfig.addOnShape === 'heart' ? ' ♥' : neonConfig.addOnShape === 'star' ? ' ★' : ''}`}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Size</p>
                    <p className="text-sm font-bold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {selectedSize ? `${selectedSize.width} x ${selectedSize.height}` : 'Not selected'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Font</p>
                    <p className="text-sm font-bold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>{neonConfig.font}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Color</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: neonConfig.color }} />
                      <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>{neonConfig.color}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Environment</p>
                    <p className="text-sm font-bold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {neonConfig.environment === 'outdoor' ? 'Outdoor (IP67)' : 'Indoor'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Jacket</p>
                    <p className="text-sm font-bold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {neonConfig.jacket === 'white' ? 'White' : 'Coloured'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Background</p>
                    <p className="text-sm font-bold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {`Cut to shape • ${neonConfig.backgroundColor}`}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Tube Thickness</p>
                    <p className="text-sm font-bold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {neonConfig.tubeThickness === 'classic' ? 'Classic (6mm)' : 'Bold (8mm)'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Remote Dimmer</p>
                    <p className="text-sm font-bold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {neonConfig.remoteDimmer === 'yes' ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Power Mode</p>
                    <p className="text-sm font-bold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {neonConfig.powerMode === 'battery-operated' ? 'Battery operated' : 'Power adaptor'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Checkout Step
        return (
          <CommonCheckout
            title="Review & Secure Checkout"
            totalAmount={estimatedAmount}
            orderSummary={(
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Text:</span>
                  <span className="font-semibold text-gray-900">
                    {`${neonConfig.text}${neonConfig.addOnShape === 'heart' ? ' ♥' : neonConfig.addOnShape === 'star' ? ' ★' : ''}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedSize ? `${selectedSize.width} x ${selectedSize.height}` : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-semibold text-gray-900">{neonConfig.environment === 'outdoor' ? 'Outdoor (IP67)' : 'Indoor'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Power Mode:</span>
                  <span className="font-semibold text-gray-900">{neonConfig.powerMode === 'battery-operated' ? 'Battery operated' : 'Power adaptor'}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-blue-700">
                    {`£${estimatedAmount.toFixed(2)}`}
                  </span>
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
            submitDisabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address || !acceptTerms}
            submitLabel="Pay Securely"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 max-w-[1600px]">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors text-sm mb-4"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Custom Neon Sign Builder
          </h1>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBuilderMode('design-light')}
              className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${
                builderMode === 'design-light'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <p className="font-semibold">Design a Light</p>
              <p className={`text-xs mt-1 ${builderMode === 'design-light' ? 'text-white/90' : 'text-gray-600'}`}>
                Build and customize your neon sign live.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setBuilderMode('submit-artwork')}
              className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${
                builderMode === 'submit-artwork'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <p className="font-semibold">Submit a Logo / Artwork</p>
              <p className={`text-xs mt-1 ${builderMode === 'submit-artwork' ? 'text-white/90' : 'text-gray-600'}`}>
                Request a tailored quote with your design file.
              </p>
            </button>
          </div>
        </div>

        {builderMode === 'design-light' ? (
          <>
        {/* Stepper */}
        <div className="mb-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            {[
              { step: 1, label: 'Custom Design', icon: '✏️' },
              { step: 2, label: 'Pricing', icon: '💷' },
              { step: 3, label: 'Preview', icon: '👀' },
              { step: 4, label: 'Checkout', icon: '🛒' }
            ].map((item, index) => (
              <React.Fragment key={item.step}>
                <div className="flex items-center">
                  <div className={`flex flex-col items-center ${currentStep >= item.step ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                      currentStep >= item.step
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {currentStep > item.step ? '✓' : item.step}
                    </div>
                    <span className="mt-2 text-sm font-semibold" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {item.label}
                    </span>
                  </div>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > item.step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="mt-8 max-w-5xl mx-auto flex justify-between items-center gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Back
          </button>
          
          {/* Preview and Download buttons - only show on step 1 */}
          {currentStep === 1 && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          )}
          
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                'bg-blue-600 hover:bg-blue-700'
              }`}
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Next
            </button>
          ) : null}
        </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              LOGO &amp; ARTWORK QUOTE
            </h2>
            <p className="text-gray-600 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Fill in the form below, providing details about the sign that you'd like to create. Upload an image or logo to request a quote.
            </p>
            <p className="text-sm font-semibold text-blue-700 mb-6" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              We Will Beat Any Price (GET A FREE QUOTE)
            </p>

            <form onSubmit={handleLogoQuoteSubmit} className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={logoQuoteForm.name}
                onChange={(e) => setLogoQuoteForm({ ...logoQuoteForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                required
              />
              <select
                value={logoQuoteForm.country}
                onChange={(e) => setLogoQuoteForm({ ...logoQuoteForm, country: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Phone"
                value={logoQuoteForm.phone}
                onChange={(e) => setLogoQuoteForm({ ...logoQuoteForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={logoQuoteForm.email}
                onChange={(e) => setLogoQuoteForm({ ...logoQuoteForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                required
              />
              <input
                type="text"
                placeholder="Ideal sign width (e.g. 120cm)"
                value={logoQuoteForm.idealSignWidth}
                onChange={(e) => setLogoQuoteForm({ ...logoQuoteForm, idealSignWidth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              />
              <input
                type="number"
                min="1"
                placeholder="Quantity"
                value={logoQuoteForm.quantity}
                onChange={(e) => setLogoQuoteForm({ ...logoQuoteForm, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              />
              <div className="md:col-span-2">
                <textarea
                  rows="4"
                  placeholder="Any other information we should know before quoting?"
                  value={logoQuoteForm.additionalInfo}
                  onChange={(e) => setLogoQuoteForm({ ...logoQuoteForm, additionalInfo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                />
              </div>
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Upload your logo / artwork / design
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={artworkInputRef}
                  onChange={(e) => setLogoQuoteForm({ ...logoQuoteForm, artwork: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  required
                />
                {logoQuoteForm.artwork && (
                  <p className="text-xs text-gray-600 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Selected file: {logoQuoteForm.artwork.name}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                    quoteSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  {quoteSubmitting ? 'Submitting...' : 'Get a Tailored Quote'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Preview Content */}
            <div className="bg-gray-900 rounded-xl p-12 min-h-[500px] flex items-center justify-center relative overflow-hidden">
              {/* Dark background with subtle pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
              <div className="relative z-10 w-full">
                <NeonText
                  text={neonConfig.text}
                  font={neonConfig.font}
                  color={neonConfig.color}
                  size={neonConfig.size * 1.5}
                  glowIntensity={neonConfig.glowIntensity}
                  letterSpacing={neonConfig.letterSpacing}
                  flicker={neonConfig.flicker}
                  minHeightClass="min-h-[300px] md:min-h-[360px]"
                />
              </div>
            </div>

            {/* Download Button in Modal */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </div>
  );
};

export default CustomNeonBuilder;
