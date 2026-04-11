import React, { useEffect, useState, useRef, useMemo } from 'react';
import NeonText from '../components/NeonText';
import { toPng } from 'html-to-image';
import { quoteService } from '../services/quoteService';
import { neonPricingService } from '../services/neonPricingService';
import { toast } from 'react-toastify';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { authService } from '../services/authService';
import DesignerAuthModal from '../components/DesignerAuthModal';
import { useNeonPreviewExit } from '../context/NeonPreviewExitContext';
import { useVatInclusive } from '../hooks/useVatInclusive';
import { grossFromNet, vatAmountFromNet } from '../utils/vatUtils';

const NEON_LIVE_BG_IMAGES = [
  { id: '1', src: '/NeonBg/1.jpg', label: 'Scene 1' },
  { id: '2', src: '/NeonBg/2.jpg', label: 'Scene 2' },
  { id: '3', src: '/NeonBg/3.jpg', label: 'Scene 3' },
  { id: '5', src: '/NeonBg/5.jpg', label: 'Scene 5' },
];

/** Single solid option for live preview — dark enough for neon to read clearly. */
const NEON_LIVE_BG_COLORS = [{ id: 'dark', label: 'Dark', hex: '#141620' }];

/** Tick + line styling so dimensions read on light or dark backdrops */
const dimLineClass = 'bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_0_2px_rgba(0,0,0,0.25)]';
/** Smaller ticks for compact text-local dimensions */
const dimLineSm = 'bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.3)]';

const NEON_ABOUT_POINTS = [
  {
    title: 'Hand-finished LED neon',
    body: 'Your design is built with flexible LED neon-style tubing on a backing cut to your text or shape—bright, efficient, and ready to mount.',
  },
  {
    title: 'Indoor and outdoor options',
    body: 'Choose the environment that matches where you will install it. Outdoor builds use a weather-appropriate specification so your sign can cope with the elements.',
  },
  {
    title: 'Sized to your space',
    body: 'Pick a preset size or enter custom dimensions. The live preview helps you visualise layout; final production follows the specifications you confirm at checkout.',
  },
  {
    title: 'What you see in the builder',
    body: 'The on-screen preview is a guide. Tube thickness, glow, and colours can look slightly different in real life depending on lighting and camera settings—we note this in the builder so expectations stay clear.',
  },
];

const NEON_BUILDER_FAQ = [
  {
    q: 'How accurate is the live preview?',
    a: 'The preview shows your text, font, colour, and approximate layout. Final appearance may vary slightly with manufacturing, ambient light, and how the sign is photographed. Colours especially can differ a little from screen to finished product.',
  },
  {
    q: 'What is the difference between indoor and outdoor?',
    a: 'Outdoor options are specified for exterior use (for example IP-rated builds where applicable). Indoor signs are intended for dry, interior spaces. Pick the option that matches where you will install your sign.',
  },
  {
    q: 'Do I get mounting hardware?',
    a: 'When you select the wall mounting screws option, your sign is intended to ship with pre-drilled holes and fixings suitable for typical wall installation. Always follow safe installation practices for your wall type.',
  },
  {
    q: 'Can I use a custom size?',
    a: 'Yes. Enable custom size and enter width and height in your preferred unit (mm, cm, or ft). Pricing updates as you complete your selections.',
  },
  {
    q: 'What happens after I continue to checkout?',
    a: 'Your choices—text, size, colours, and build options—are carried through so you can complete purchase or enquiry on the checkout flow. Double-check everything on the preview step before you continue.',
  },
  {
    q: 'Can I submit a logo instead of typing text?',
    a: 'Use “Submit a Logo / Artwork” at the top of this page to upload a file and request a tailored quote. That path is for custom artwork rather than the text-based builder.',
  },
];

const CustomNeonBuilder = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { setPreviewExitGuardActive, confirmLeavePreview } = useNeonPreviewExit();
  const previewRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [builderMode, setBuilderMode] = useState('design-light');
  const [currentStep, setCurrentStep] = useState(1); // 1: Custom Design, 2: Preview → checkout page
  const [showBuildOptions, setShowBuildOptions] = useState(true);
  const [previewNeonOn, setPreviewNeonOn] = useState(true);
  const [previewZoom, setPreviewZoom] = useState(1.3);
  const [neonConfig, setNeonConfig] = useState({
    text: 'Start Typing',
    font: 'Allura',
    color: '#ff4df0',
    size: 40,
    glowIntensity: 8,
    letterSpacing: 2,
    flicker: false,

    // Build options — null until customer selects (single-choice fields defaulted below)
    environment: null,
    jacket: null,
    backgroundStyle: 'cut-to-shape',
    backgroundColor: null,
    mountingOption: 'wall-mounting-screws',
    addOnShape: 'none',
    tubeThickness: null,
    remoteDimmer: null,
    powerMode: null,
  });
  const [selectedSize, setSelectedSize] = useState(null);
  const [customSizeEnabled, setCustomSizeEnabled] = useState(false);
  const [customSize, setCustomSize] = useState({ width: '', height: '', unit: 'cm' });
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
  const [neonApiPrice, setNeonApiPrice] = useState(null);
  const [neonPricingLoading, setNeonPricingLoading] = useState(false);
  const [neonPricingSource, setNeonPricingSource] = useState('fallback');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [designerAuthOpen, setDesignerAuthOpen] = useState(false);
  /** Which gated action opened the auth modal: preview, download, or basket */
  const [designerAuthIntent, setDesignerAuthIntent] = useState(null);
  const [liveViewBackdrop, setLiveViewBackdrop] = useState(() => ({
    kind: 'color',
    hex: NEON_LIVE_BG_COLORS[0].hex,
  }));
  const livePreviewTextSize = Math.round(neonConfig.size * 1.38);

  const livePreviewBackdropStyle =
    liveViewBackdrop.kind === 'image'
      ? {
          backgroundImage: `url(${liveViewBackdrop.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'transparent',
        }
      : {
          backgroundImage: 'none',
          backgroundColor: liveViewBackdrop.hex,
        };

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
    { name: 'Allura', label: 'Allura' },
    { name: 'Great Vibes', label: 'Great Vibes' },
    { name: 'Alex Brush', label: 'Alex Brush' },
    { name: 'Caveat', label: 'Caveat' },
    { name: 'Dancing Script', label: 'Dancing Script' },
    { name: 'Italianno', label: 'Italianno' },
    { name: 'Kalam', label: 'Kalam' },
    { name: 'Lobster', label: 'Lobster' },
    { name: 'Pacifico', label: 'Pacifico' },
    { name: 'Parisienne', label: 'Parisienne' },
    { name: 'Sacramento', label: 'Sacramento' },
    { name: 'Satisfy', label: 'Satisfy' },
    { name: 'Tangerine', label: 'Tangerine' },
    { name: 'Yellowtail', label: 'Yellowtail' },
    { name: 'Anton', label: 'Anton' },
    { name: 'Archivo Black', label: 'Archivo Black' },
    { name: 'Barlow Condensed', label: 'Barlow Condensed' },
    { name: 'Bebas Neue', label: 'Bebas Neue' },
    { name: 'Permanent Marker', label: 'Permanent Marker' },
    { name: 'Inter', label: 'Inter' },
    { name: 'Lexend Deca', label: 'Lexend Deca' },
    { name: 'Lato', label: 'Lato' },
    { name: 'Merriweather', label: 'Merriweather' },
    { name: 'Montserrat', label: 'Montserrat' },
    { name: 'Nunito', label: 'Nunito' },
    { name: 'Open Sans', label: 'Open Sans' },
    { name: 'Oswald', label: 'Oswald' },
    { name: 'Playfair Display', label: 'Playfair Display' },
    { name: 'Poppins', label: 'Poppins' },
    { name: 'Quicksand', label: 'Quicksand' },
    { name: 'Raleway', label: 'Raleway' },
    { name: 'Roboto', label: 'Roboto' },
    { name: 'Roboto Serif', label: 'Roboto Serif' },
    { name: 'Rubik', label: 'Rubik' },
    { name: 'Arial', label: 'Arial' },
    { name: 'Comic Sans MS', label: 'Comic Sans MS' },
    { name: 'Courier New', label: 'Courier New' },
    { name: 'Garamond', label: 'Garamond' },
    { name: 'Georgia', label: 'Georgia' },
    { name: 'Helvetica', label: 'Helvetica' },
    { name: 'Impact', label: 'Impact' },
    { name: 'Lucida Console', label: 'Lucida Console' },
    { name: 'Monaco', label: 'Monaco' },
    { name: 'Palatino', label: 'Palatino' },
    { name: 'Tahoma', label: 'Tahoma' },
    { name: 'Times New Roman', label: 'Times New Roman' },
    { name: 'Trebuchet MS', label: 'Trebuchet MS' },
    { name: 'Verdana', label: 'Verdana' },
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

  const pricingSelectionComplete = useMemo(() => {
    const bg = neonConfig.backgroundColor;
    const shape = neonConfig.addOnShape;
    return (
      Boolean(selectedSize?.width && selectedSize?.height) &&
      (neonConfig.environment === 'indoor' || neonConfig.environment === 'outdoor') &&
      (neonConfig.jacket === 'coloured' || neonConfig.jacket === 'white') &&
      ['white', 'black', 'silver', 'yellow'].includes(bg) &&
      neonConfig.mountingOption === 'wall-mounting-screws' &&
      (shape === 'none' || shape === 'heart' || shape === 'star') &&
      (neonConfig.tubeThickness === 'classic' || neonConfig.tubeThickness === 'bold') &&
      (neonConfig.remoteDimmer === 'yes' || neonConfig.remoteDimmer === 'no') &&
      (neonConfig.powerMode === 'battery-operated' || neonConfig.powerMode === 'power-adaptor')
    );
  }, [
    selectedSize?.width,
    selectedSize?.height,
    neonConfig.environment,
    neonConfig.jacket,
    neonConfig.backgroundColor,
    neonConfig.mountingOption,
    neonConfig.addOnShape,
    neonConfig.tubeThickness,
    neonConfig.remoteDimmer,
    neonConfig.powerMode,
  ]);

  const NEON_TEXT_PLACEHOLDER = 'Start Typing';
  const isCustomNeonTextValid = useMemo(() => {
    const t = (neonConfig.text || '').trim();
    if (!t) return false;
    return t.toLowerCase() !== NEON_TEXT_PLACEHOLDER.toLowerCase();
  }, [neonConfig.text]);

  const canProceedToPreview = useMemo(
    () => pricingSelectionComplete && isCustomNeonTextValid,
    [pricingSelectionComplete, isCustomNeonTextValid],
  );

  const buildMissingSelectionMessages = () => {
    const msgs = [];
    if (!isCustomNeonTextValid) msgs.push('enter your sign text (replace the placeholder)');
    if (!selectedSize?.width || !selectedSize?.height) msgs.push('select sign width and height');
    if (!(neonConfig.environment === 'indoor' || neonConfig.environment === 'outdoor')) {
      msgs.push('choose indoor or outdoor');
    }
    if (!(neonConfig.jacket === 'white' || neonConfig.jacket === 'coloured')) {
      msgs.push('choose jacket colour');
    }
    if (!['white', 'black', 'silver', 'yellow'].includes(neonConfig.backgroundColor)) {
      msgs.push('choose a background colour');
    }
    if (neonConfig.mountingOption !== 'wall-mounting-screws') {
      msgs.push('confirm wall mounting');
    }
    if (!['none', 'heart', 'star'].includes(neonConfig.addOnShape)) {
      msgs.push('choose an add-on shape (or none)');
    }
    if (!(neonConfig.tubeThickness === 'classic' || neonConfig.tubeThickness === 'bold')) {
      msgs.push('choose tube thickness');
    }
    if (!(neonConfig.remoteDimmer === 'yes' || neonConfig.remoteDimmer === 'no')) {
      msgs.push('choose remote dimmer');
    }
    if (!(neonConfig.powerMode === 'battery-operated' || neonConfig.powerMode === 'power-adaptor')) {
      msgs.push('choose power mode');
    }
    return msgs;
  };

  /** Shown when there is no successful API response yet (no size, or request failed). */
  const fallbackEstimatedAmount = 0;
  const estimatedAmount = neonApiPrice != null ? neonApiPrice : fallbackEstimatedAmount;
  const vatInclusive = useVatInclusive();
  const neonNet = estimatedAmount;
  const neonVat = vatAmountFromNet(neonNet);
  const neonGross = grossFromNet(neonNet);
  const neonMainDisplay = vatInclusive ? neonGross : neonNet;

  useEffect(() => {
    const guardOn = builderMode === 'design-light' && currentStep === 2;
    setPreviewExitGuardActive(guardOn);
    return () => setPreviewExitGuardActive(false);
  }, [builderMode, currentStep, setPreviewExitGuardActive]);

  useEffect(() => {
    if (builderMode !== 'design-light' || currentStep !== 2) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [builderMode, currentStep]);

  useEffect(() => {
    if (builderMode !== 'design-light') {
      setNeonApiPrice(null);
      setNeonPricingSource('fallback');
      setNeonPricingLoading(false);
      return undefined;
    }

    const hasSize = Boolean(selectedSize?.width && selectedSize?.height);
    if (!hasSize) {
      setNeonApiPrice(null);
      setNeonPricingSource('fallback');
      setNeonPricingLoading(false);
      return undefined;
    }

    let cancelled = false;
    setNeonPricingLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await neonPricingService.calculate({
          width: selectedSize?.width || '',
          height: selectedSize?.height || '',
          environment: neonConfig.environment,
          jacket: neonConfig.jacket,
          tubeThickness: neonConfig.tubeThickness,
          remoteDimmer: neonConfig.remoteDimmer,
          powerMode: neonConfig.powerMode,
          addOnShape: neonConfig.addOnShape,
          backgroundColor: neonConfig.backgroundColor,
          presetPrice:
            selectedSize?.price != null && Number(selectedSize.price) > 0
              ? Number(selectedSize.price)
              : undefined,
        });
        if (!cancelled) {
          setNeonApiPrice(Number(res.price));
          setNeonPricingSource('api');
        }
      } catch {
        if (!cancelled) {
          setNeonApiPrice(null);
          setNeonPricingSource('fallback');
        }
      } finally {
        if (!cancelled) {
          setNeonPricingLoading(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    builderMode,
    selectedSize?.width,
    selectedSize?.height,
    selectedSize?.price,
    neonConfig.environment,
    neonConfig.jacket,
    neonConfig.tubeThickness,
    neonConfig.remoteDimmer,
    neonConfig.powerMode,
    neonConfig.addOnShape,
    neonConfig.backgroundColor,
  ]);

  const neonSpecSummaryRows = useMemo(() => {
    const textRaw = (neonConfig.text || '').trim();
    const textDisplay = `${textRaw}${neonConfig.addOnShape === 'heart' ? ' ♡' : neonConfig.addOnShape === 'star' ? ' ☆' : ''}`;
    const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Not selected');
    const dim = selectedSize
      ? `${selectedSize.width} × ${selectedSize.height}${
          selectedSize.label ? ` • ${selectedSize.label}` : ''
        }${selectedSize.widthFt ? ` • ${selectedSize.widthFt}` : ''}${
          selectedSize.lettersPerLine != null ? ` • ${selectedSize.lettersPerLine} letters/line` : ''
        }`
      : 'Not selected';
    const bgStyle =
      neonConfig.backgroundStyle === 'cut-to-shape'
        ? 'Cut to shape'
        : neonConfig.backgroundStyle || '—';

    return [
      { key: 'text', label: 'Text', value: textDisplay },
      {
        key: 'sizeType',
        label: 'Size type',
        value: !selectedSize ? 'Not selected' : selectedSize.id === 'custom' ? 'Custom' : 'Preset',
      },
      { key: 'dimensions', label: 'Dimensions', value: dim },
      { key: 'font', label: 'Font', value: neonConfig.font },
      { key: 'color', label: 'Tube colour', value: neonConfig.color, variant: 'color' },
      {
        key: 'previewSize',
        label: 'Preview text size',
        value: `${neonConfig.size}px (on-screen guide only)`,
      },
      { key: 'glow', label: 'Glow intensity', value: String(neonConfig.glowIntensity) },
      { key: 'spacing', label: 'Letter spacing', value: `${neonConfig.letterSpacing}px` },
      { key: 'flicker', label: 'Flicker effect', value: neonConfig.flicker ? 'On' : 'Off' },
      {
        key: 'env',
        label: 'Environment',
        value:
          neonConfig.environment === 'outdoor'
            ? 'Outdoor (IP67)'
            : neonConfig.environment === 'indoor'
              ? 'Indoor'
              : 'Not selected',
      },
      {
        key: 'jacket',
        label: 'Jacket',
        value:
          neonConfig.jacket === 'white'
            ? 'White'
            : neonConfig.jacket === 'coloured'
              ? 'Coloured'
              : 'Not selected',
      },
      { key: 'backing', label: 'Backing style', value: bgStyle },
      {
        key: 'bgcol',
        label: 'Background colour',
        value: neonConfig.backgroundColor ? cap(neonConfig.backgroundColor) : 'Not selected',
      },
      {
        key: 'tube',
        label: 'Tube thickness',
        value:
          neonConfig.tubeThickness === 'classic'
            ? 'Classic (6mm)'
            : neonConfig.tubeThickness === 'bold'
              ? 'Bold (8mm)'
              : 'Not selected',
      },
      {
        key: 'dimmer',
        label: 'Remote dimmer',
        value:
          neonConfig.remoteDimmer === 'yes'
            ? 'Yes'
            : neonConfig.remoteDimmer === 'no'
              ? 'No'
              : 'Not selected',
      },
      {
        key: 'power',
        label: 'Power mode',
        value:
          neonConfig.powerMode === 'battery-operated'
            ? 'Battery operated'
            : neonConfig.powerMode === 'power-adaptor'
              ? 'Power adaptor'
              : 'Not selected',
      },
      {
        key: 'mount',
        label: 'Mounting',
        value:
          neonConfig.mountingOption === 'wall-mounting-screws'
            ? 'Wall mounting screws'
            : 'Not selected',
      },
      {
        key: 'addon',
        label: 'Add-on shape',
        value:
          neonConfig.addOnShape === 'heart'
            ? 'Heart'
            : neonConfig.addOnShape === 'star'
              ? 'Star'
              : neonConfig.addOnShape === 'none'
                ? 'None'
                : 'Not selected',
      },
    ];
  }, [
    neonConfig.text,
    neonConfig.addOnShape,
    neonConfig.font,
    neonConfig.color,
    neonConfig.size,
    neonConfig.glowIntensity,
    neonConfig.letterSpacing,
    neonConfig.flicker,
    neonConfig.environment,
    neonConfig.jacket,
    neonConfig.backgroundStyle,
    neonConfig.backgroundColor,
    neonConfig.tubeThickness,
    neonConfig.remoteDimmer,
    neonConfig.powerMode,
    neonConfig.mountingOption,
    selectedSize,
  ]);

  const neonCheckoutSummary = useMemo(
    () => [
      ...neonSpecSummaryRows,
      {
        key: 'subEx',
        label: 'Subtotal (ex VAT)',
        value: neonPricingLoading ? 'Updating…' : `£${neonNet.toFixed(2)}`,
      },
      {
        key: 'vat20',
        label: 'VAT (20%)',
        value: neonPricingLoading ? 'Updating…' : `£${neonVat.toFixed(2)}`,
      },
      {
        key: 'totInc',
        label: 'Total (inc VAT)',
        value: neonPricingLoading ? 'Updating…' : `£${neonGross.toFixed(2)}`,
      },
      {
        key: 'vatNote',
        label: 'Matches header VAT',
        value: neonPricingLoading
          ? 'Updating…'
          : vatInclusive
            ? `Main price shown: £${neonGross.toFixed(2)} inc VAT`
            : `Main price shown: £${neonNet.toFixed(2)} ex VAT`,
      },
      {
        key: 'pricingSrc',
        label: 'Pricing basis',
        value: neonPricingSource === 'api' ? 'Live admin pricing' : 'Offline estimate',
      },
    ],
    [neonSpecSummaryRows, neonPricingLoading, neonNet, neonVat, neonGross, neonPricingSource, vatInclusive],
  );

  const handleNext = () => {
    if (currentStep === 1) {
      if (!canProceedToPreview) {
        const missing = buildMissingSelectionMessages();
        toast.error(
          missing.length
            ? `Please complete: ${missing.join('; ')}`
            : 'Please complete all required options to continue.',
        );
        return;
      }
      setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      if (!canProceedToPreview) {
        const missing = buildMissingSelectionMessages();
        toast.error(
          missing.length
            ? `Please complete: ${missing.join('; ')}`
            : 'Please complete all required options before checkout.',
        );
        return;
      }
      navigate('/checkout', {
        state: {
          checkoutData: {
            title: 'Custom Neon Sign Checkout',
            description: 'Complete your custom neon sign purchase securely.',
            amount: estimatedAmount,
            amountBasis: 'net',
            summary: [
              ...neonSpecSummaryRows.map((row) => ({
                label: row.label,
                value: String(row.value),
              })),
              {
                label: 'Pricing basis',
                value: neonPricingSource === 'api' ? 'Live admin pricing' : 'Offline estimate',
              },
            ],
          },
        },
      });
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const bumpPreviewZoom = (delta) => {
    setPreviewZoom((z) => {
      const n = Math.round((z + delta) * 100) / 100;
      return Math.min(1.55, Math.max(0.65, n));
    });
  };

  const previewControlBtn =
    'px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const previewControlOn = 'bg-blue-600 border-blue-500 text-white';
  const previewControlOff = 'bg-black/50 border-white/20 text-white hover:bg-black/65';

  const handleDownload = async () => {
    const element = document.getElementById('neon-preview-export');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 3,
        quality: 1.0,
        width: element.offsetWidth,
        height: element.offsetHeight,
        cacheBust: true,
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

  const validateDesignerSession = async () => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated()) return false;
    try {
      await authService.getProfile();
      return true;
    } catch (e) {
      // Only block when the server rejects the token. Missing profile route, network, etc.
      // should not force the auth modal for users who are already signed in.
      if (e?.status === 401) return false;
      return true;
    }
  };

  const openDesignerAuth = (intent) => {
    setDesignerAuthIntent(intent);
    setDesignerAuthOpen(true);
  };

  const closeDesignerAuth = () => {
    setDesignerAuthOpen(false);
    setDesignerAuthIntent(null);
  };

  const addNeonToBasket = () => {
    const summaryPayload = neonCheckoutSummary.map(({ label, value }) => ({ label, value: String(value) }));
    const textLine = summaryPayload.find((s) => s.label === 'Text')?.value || (neonConfig.text || '').trim();
    addToCart(
      {
        id: `custom-neon-${Date.now()}`,
        type: 'custom-neon',
        title: 'Custom Neon Sign',
        description: textLine.length > 140 ? `${textLine.slice(0, 137)}…` : textLine,
        price: Number(estimatedAmount) || 0,
        quantity: 1,
        summary: summaryPayload,
      },
      1,
    );
    toast.success('Added to basket');
    window.dispatchEvent(new CustomEvent('rspuk-basket-open'));
  };

  const handleDesignerAuthSuccess = async () => {
    if (designerAuthIntent === 'preview') setShowPreview(true);
    if (designerAuthIntent === 'download') await handleDownload();
    if (designerAuthIntent === 'basket') addNeonToBasket();
  };

  const handlePreviewProtected = async () => {
    if (await validateDesignerSession()) {
      setShowPreview(true);
      return;
    }
    openDesignerAuth('preview');
  };

  const handleDownloadProtected = async () => {
    if (await validateDesignerSession()) {
      await handleDownload();
      return;
    }
    openDesignerAuth('download');
  };

  const handleAddToBasketProtected = async () => {
    if (!canProceedToPreview) {
      toast.error('Please complete all options on the design step before adding to basket.');
      return;
    }
    if (await validateDesignerSession()) {
      addNeonToBasket();
      return;
    }
    openDesignerAuth('basket');
  };

  const handleContinueExploreProducts = async () => {
    if (!(await confirmLeavePreview())) return;
    navigate('/');
    window.setTimeout(() => {
      const el = document.getElementById('products');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
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
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 lg:sticky lg:top-24 lg:col-span-7">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Live Preview
              </h3>
              <div className="flex flex-col gap-3">
                <div className="rounded-xl relative overflow-visible shadow-inner border border-gray-200/80">
                  <div
                    id="neon-preview-export"
                    className="relative overflow-visible rounded-xl min-h-[360px] md:min-h-[440px] lg:min-h-[520px] flex items-start justify-center px-6 md:px-8 pb-8 md:pb-10 pt-14 md:pt-20 lg:pt-24"
                    style={livePreviewBackdropStyle}
                  >
                    <div
                      className="relative z-10 w-full max-w-full flex justify-center origin-top transition-transform duration-150 ease-out will-change-transform"
                      style={{ transform: `scale(${previewZoom})` }}
                    >
                      {selectedSize?.width && selectedSize?.height ? (
                        <div className="inline-flex flex-col items-center w-fit max-w-full mx-auto pointer-events-none">
                          <div className="flex flex-row items-stretch gap-1 sm:gap-1.5 w-fit max-w-full">
                            <div className="w-3.5 sm:w-4 shrink-0 flex flex-col self-stretch pr-0.5" aria-hidden>
                              <div className="relative flex-1 min-h-[1.5rem] w-full">
                                <div
                                  className={`absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 rounded-full ${dimLineSm}`}
                                />
                                <div
                                  className={`absolute left-1/2 top-0 -translate-x-1/2 h-px w-1.5 ${dimLineSm}`}
                                />
                                <div
                                  className={`absolute left-1/2 bottom-0 -translate-x-1/2 h-px w-1.5 ${dimLineSm}`}
                                />
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">
                                  <span
                                    className="inline-block rounded px-1 py-px text-[8px] sm:text-[9px] font-semibold text-white bg-black/60 backdrop-blur-sm border border-white/15 leading-tight"
                                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                  >
                                    {selectedSize.height}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0 flex flex-col items-stretch">
                              <NeonText
                                text={`${neonConfig.text}${neonConfig.addOnShape === 'heart' ? ' ♡' : neonConfig.addOnShape === 'star' ? ' ☆' : ''}`}
                                font={neonConfig.font}
                                color={neonConfig.color}
                                size={livePreviewTextSize}
                                glowIntensity={neonConfig.glowIntensity}
                                letterSpacing={neonConfig.letterSpacing}
                                flicker={neonConfig.flicker}
                                tubeLit={previewNeonOn}
                                thinTube
                                compactForDimensions
                                containerClassName="!items-center justify-center"
                              />
                              <div className="relative w-full h-5 mt-1 flex items-center justify-center">
                                <div className={`absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 ${dimLineSm}`} />
                                <div
                                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-px h-1.5 ${dimLineSm}`}
                                />
                                <div
                                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-px h-1.5 ${dimLineSm}`}
                                />
                                <span
                                  className="relative z-10 rounded px-1 py-px text-[8px] sm:text-[9px] font-semibold text-white bg-black/60 backdrop-blur-sm border border-white/15 leading-tight max-w-full truncate"
                                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                  title={`${selectedSize.width}${selectedSize.widthFt ? ` (${selectedSize.widthFt})` : ''}`}
                                >
                                  {selectedSize.width}
                                  {selectedSize.widthFt ? ` (${selectedSize.widthFt})` : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <NeonText
                          text={`${neonConfig.text}${neonConfig.addOnShape === 'heart' ? ' ♡' : neonConfig.addOnShape === 'star' ? ' ☆' : ''}`}
                          font={neonConfig.font}
                          color={neonConfig.color}
                          size={livePreviewTextSize}
                          glowIntensity={neonConfig.glowIntensity}
                          letterSpacing={neonConfig.letterSpacing}
                          flicker={neonConfig.flicker}
                          tubeLit={previewNeonOn}
                          thinTube
                          minHeightClass="min-h-[300px] md:min-h-[380px] lg:min-h-[440px]"
                          containerClassName="!items-start justify-center !pt-2 !pb-10 md:!pt-3 md:!pb-14"
                        />
                      )}
                    </div>
                  </div>
                  <div
                    className="absolute top-4 right-4 z-30 flex flex-wrap items-center justify-end gap-1.5 rounded-lg bg-black/65 backdrop-blur-sm border border-white/15 px-2 py-2 max-w-[min(100%,280px)]"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    <span className="text-[10px] font-semibold text-white/80 uppercase w-full sm:w-auto sm:mr-1">Tube</span>
                    <button
                      type="button"
                      onClick={() => setPreviewNeonOn(true)}
                      className={`${previewControlBtn} ${previewNeonOn ? previewControlOn : previewControlOff}`}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewNeonOn(false)}
                      className={`${previewControlBtn} ${!previewNeonOn ? previewControlOn : previewControlOff}`}
                    >
                      Off
                    </button>
                    <span className="hidden sm:inline w-px h-5 bg-white/25 mx-0.5" aria-hidden />
                    <button
                      type="button"
                      onClick={() => bumpPreviewZoom(-0.1)}
                      disabled={previewZoom <= 0.65}
                      className={`${previewControlBtn} ${previewControlOff}`}
                      title="Zoom out"
                    >
                      −
                    </button>
                    <span className="text-[11px] font-bold text-white tabular-nums min-w-[2.75rem] text-center">
                      {Math.round(previewZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => bumpPreviewZoom(0.1)}
                      disabled={previewZoom >= 1.55}
                      className={`${previewControlBtn} ${previewControlOff}`}
                      title="Zoom in"
                    >
                      +
                    </button>
                  </div>
                  <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded text-xs font-semibold inline-flex" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Live Preview
                    </div>
                  </div>
                </div>
                <p className="text-xs text-amber-800/90 border border-amber-200/80 bg-amber-50/60 rounded-lg px-3 py-2.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Colours may vary in real life compared to what you see in this preview.
                </p>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-3 md:px-4 md:py-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Live view background
                  </p>
                  <div className="flex flex-row flex-nowrap items-center gap-3 overflow-x-auto pb-0.5">
                    {NEON_LIVE_BG_COLORS.map((c) => {
                      const selected = liveViewBackdrop.kind === 'color' && liveViewBackdrop.hex === c.hex;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setLiveViewBackdrop({ kind: 'color', hex: c.hex })}
                          aria-label={`Background ${c.label}`}
                          aria-pressed={selected}
                          title={c.label}
                          className={`shrink-0 w-[72px] h-[72px] md:w-20 md:h-20 rounded-lg border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                            selected
                              ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      );
                    })}
                    <span
                      className="hidden sm:block w-px h-14 bg-gray-200 shrink-0"
                      aria-hidden
                    />
                    {NEON_LIVE_BG_IMAGES.map((img) => {
                      const selected = liveViewBackdrop.kind === 'image' && liveViewBackdrop.src === img.src;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setLiveViewBackdrop({ kind: 'image', src: img.src })}
                          aria-label={`Use ${img.label}`}
                          aria-pressed={selected}
                          className={`shrink-0 w-[72px] h-[72px] md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                            selected
                              ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src={img.src} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Design controls */}
            <div className="bg-white rounded-xl shadow-lg p-5 md:p-6 lg:col-span-5">
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

                  {/* Build Options */}
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
                          {neonConfig.backgroundColor ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              Selected
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              Pick colour
                            </span>
                          )}
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
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          neonConfig.mountingOption === 'wall-mounting-screws'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
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
                          { key: 'heart', label: 'Heart', icon: '♡' },
                          { key: 'star', label: 'Star', icon: '☆' },
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

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mt-4">
                    <p
                      className="text-xs font-semibold text-emerald-900 uppercase tracking-wide"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      Price from your selections
                    </p>
                    <p className="text-xl font-bold text-emerald-800 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {neonPricingLoading ? 'Updating…' : `£${neonMainDisplay.toFixed(2)}`}
                    </p>
                    <p className="text-[11px] text-emerald-800/90 mt-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {vatInclusive ? 'Shown inc. VAT (header)' : 'Shown ex. VAT (header)'}
                    </p>
                    <p className="text-[10px] text-emerald-900/75 mt-1.5 leading-snug" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      £{neonNet.toFixed(2)} ex VAT · £{neonGross.toFixed(2)} inc VAT (20%) — same switch as the site header.
                    </p>
                    {neonPricingSource !== 'api' ? (
                      <p className="text-[11px] text-emerald-900/80 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Using built-in estimate — check API connection
                      </p>
                    ) : null}
                  </div>

                  {/* Quick Info */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-800 space-y-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      <p>
                        💡 <strong>Tip:</strong> Your text, font, and colour update the live preview as you type.
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

      case 2: // Preview Step
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Preview
              </h3>
              <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Review all selected options before moving to checkout.
              </p>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-blue-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Estimated total
                  </p>
                  <p className="text-2xl font-bold text-blue-800" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {neonPricingLoading ? '…' : `£${neonMainDisplay.toFixed(2)}`}
                  </p>
                  <p className="text-[11px] text-blue-900/85 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {vatInclusive ? 'inc. VAT' : 'ex. VAT'} · £{neonNet.toFixed(2)} ex / £{neonGross.toFixed(2)} inc
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {neonSpecSummaryRows.map((row) => (
                    <div key={row.key} className="rounded-lg border border-gray-200 bg-white p-3">
                      <p className="text-[11px] font-semibold text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        {row.label}
                      </p>
                      {row.variant === 'color' ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                            style={{ backgroundColor: row.value }}
                          />
                          <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            {row.value}
                          </p>
                        </div>
                      ) : (
                        <p
                          className="text-sm font-bold text-gray-900 mt-1 break-words"
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          {row.value}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-stretch gap-3">
                  <button
                    type="button"
                    onClick={handleAddToBasketProtected}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to basket
                  </button>
                  <button
                    type="button"
                    onClick={handleContinueExploreProducts}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-blue-800 bg-white border-2 border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    Continue exploring products and services
                  </button>
                </div>
                <p className="text-xs text-gray-600 max-w-2xl" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Open the basket in the site header to review items. Sign in is required so you can track orders and chat with our team about your quote.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const designerAuthModalCopy =
    designerAuthIntent === 'basket'
      ? {
          title: 'Sign in to add to basket',
          subtitle:
            'Sign in or create a free account to save your neon to your basket. Order tracking and quote discussions with our team are available when you are signed in.',
          verifyOtpButtonLabel: 'Verify & add to basket',
          signInButtonLabel: 'Sign In & add to basket',
        }
      : {
          title: 'Sign in to preview & download',
          subtitle: '',
          verifyOtpButtonLabel: 'Verify & Continue',
          signInButtonLabel: 'Sign In & Continue',
        };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 max-w-[1600px]">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={async () => {
              if (!(await confirmLeavePreview())) return;
              navigate('/');
            }}
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
              onClick={async () => {
                if (
                  builderMode === 'design-light' &&
                  currentStep === 2 &&
                  !(await confirmLeavePreview())
                ) {
                  return;
                }
                setBuilderMode('submit-artwork');
              }}
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
              { step: 2, label: 'Preview', icon: '👀' },
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
                {index < 1 && (
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
                type="button"
                onClick={handlePreviewProtected}
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
                type="button"
                onClick={handleDownloadProtected}
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
          
          {currentStep <= 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-colors bg-blue-600 hover:bg-blue-700"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              {currentStep === 2 ? 'Continue to checkout' : 'Next'}
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

        <section
          className="mt-14 md:mt-16 space-y-8 pb-6"
          aria-labelledby="neon-impact-heading neon-about-heading"
        >
          <div className="relative overflow-hidden rounded-xl border border-blue-500/25 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl px-6 py-10 md:px-10 md:py-12">
            <div
              className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl"
              aria-hidden
            />
            <p
              className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-300/95 mb-3"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Built around what you choose
            </p>
            <h2
              id="neon-impact-heading"
              className="relative text-2xl md:text-3xl lg:text-[2rem] xl:text-4xl font-bold leading-[1.15] tracking-tight max-w-4xl"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              What you like—illuminated with precision and care.
            </h2>
            <p
              className="relative mt-4 text-sm md:text-base text-slate-200/95 max-w-2xl leading-relaxed"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Your words, palette, and build options are deliberate. We turn that intent into a finished sign you will be proud to install—clear process, honest preview expectations, and craftsmanship that respects the vision you define in this builder.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
            <h2
              id="neon-about-heading"
              className="text-xl md:text-2xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              About custom neon signs
            </h2>
            <p className="text-sm text-gray-600 mb-6 max-w-3xl" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Every sign is configured by you in this builder, then produced to match the options you confirm. Below is a quick overview of what you are ordering and how the process works.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {NEON_ABOUT_POINTS.map((item) => (
                <li
                  key={item.title}
                  className="rounded-lg border border-gray-100 bg-gray-50/80 p-4"
                >
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
            <h2
              className="text-xl md:text-2xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Frequently asked questions
            </h2>
            <p className="text-sm text-gray-600 mb-5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Quick answers about the builder, preview, and ordering. Open a question to read more.
            </p>
            <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              {NEON_BUILDER_FAQ.map((item, index) => {
                const open = openFaqIndex === index;
                return (
                  <div key={item.q} className="bg-white">
                    <button
                      type="button"
                      id={`faq-trigger-${index}`}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${index}`}
                      onClick={() => setOpenFaqIndex(open ? null : index)}
                      className="w-full flex items-center justify-between gap-3 text-left px-4 py-3.5 hover:bg-gray-50 transition-colors"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      <span className="text-sm font-semibold text-gray-900 pr-2">{item.q}</span>
                      <span
                        className={`shrink-0 text-gray-500 text-lg leading-none w-6 text-center transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden
                      >
                        ▼
                      </span>
                    </button>
                    <div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${index}`}
                      className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="overflow-hidden">
                        <p
                          className="px-4 pb-4 pt-0 text-sm text-gray-600 leading-relaxed border-t border-transparent"
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
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

            {/* Preview Content — same scene background as Live Preview */}
            <div
              className="rounded-xl px-12 pt-16 pb-20 min-h-[500px] flex items-start justify-center relative overflow-hidden border border-white/10"
              style={livePreviewBackdropStyle}
            >
              <div
                className="relative z-10 w-full origin-top transition-transform duration-150 ease-out"
                style={{ transform: `scale(${previewZoom})` }}
              >
                <NeonText
                  text={`${neonConfig.text}${neonConfig.addOnShape === 'heart' ? ' ♡' : neonConfig.addOnShape === 'star' ? ' ☆' : ''}`}
                  font={neonConfig.font}
                  color={neonConfig.color}
                  size={Math.round(neonConfig.size * 1.62)}
                  glowIntensity={neonConfig.glowIntensity}
                  letterSpacing={neonConfig.letterSpacing}
                  flicker={neonConfig.flicker}
                  tubeLit={previewNeonOn}
                  thinTube
                  minHeightClass="min-h-[300px] md:min-h-[360px]"
                  containerClassName="!items-start justify-center !pt-2 !pb-8"
                />
              </div>
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 rounded-lg bg-black/65 backdrop-blur-sm border border-white/15 px-2 py-2"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                <span className="text-[10px] font-semibold text-white/80 uppercase">Tube</span>
                <button
                  type="button"
                  onClick={() => setPreviewNeonOn(true)}
                  className={`${previewControlBtn} ${previewNeonOn ? previewControlOn : previewControlOff}`}
                >
                  On
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewNeonOn(false)}
                  className={`${previewControlBtn} ${!previewNeonOn ? previewControlOn : previewControlOff}`}
                >
                  Off
                </button>
                <span className="w-px h-5 bg-white/25 mx-0.5" aria-hidden />
                <button
                  type="button"
                  onClick={() => bumpPreviewZoom(-0.1)}
                  disabled={previewZoom <= 0.65}
                  className={`${previewControlBtn} ${previewControlOff}`}
                  title="Zoom out"
                >
                  −
                </button>
                <span className="text-[11px] font-bold text-white tabular-nums min-w-[2.75rem] text-center">
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => bumpPreviewZoom(0.1)}
                  disabled={previewZoom >= 1.55}
                  className={`${previewControlBtn} ${previewControlOff}`}
                  title="Zoom in"
                >
                  +
                </button>
              </div>
            </div>

            {/* Download Button in Modal */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleDownloadProtected}
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

      <DesignerAuthModal
        open={designerAuthOpen}
        onClose={closeDesignerAuth}
        onAuthenticated={handleDesignerAuthSuccess}
        title={designerAuthModalCopy.title}
        subtitle={designerAuthModalCopy.subtitle}
        verifyOtpButtonLabel={designerAuthModalCopy.verifyOtpButtonLabel}
        signInButtonLabel={designerAuthModalCopy.signInButtonLabel}
      />
    </div>
  );
};

export default CustomNeonBuilder;
