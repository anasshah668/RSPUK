import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import QRCode from 'qrcode';
import { productTemplates } from '../utils/productTemplates';
import { getProductPrintAreas, validatePrintArea,  } from '../config/productPrintAreas';
import { useAuth } from '../context/AuthContext';
import DesignerAuthModal from '../components/DesignerAuthModal';
import { useSelector } from 'react-redux';

import { useNavigate, useLocation } from 'react-router-dom';

const ProductDesigner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const savedDraft = useSelector((state) => state.designerSession?.productDetailDraft);
  
  // Get props from query params first, then fallback to location state.
  const searchParams = new URLSearchParams(location.search);
  const productType = searchParams.get('productType') || location.state?.productType || 'pen';
  const productCategory = searchParams.get('productCategory') || location.state?.productCategory || null;
  const selectedSizeParam =
    searchParams.get('size') ||
    searchParams.get('option_size') ||
    '';
  const sidePrintedParam =
    searchParams.get('sidePrinted') ||
    searchParams.get('option_sideprinted') ||
    location.state?.sidesPrinted ||
    '';
  const canvasRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [zoom, setZoom] = useState(90);
  const [activeTool, setActiveTool] = useState('select');
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('text'); // uploads | text | background | qr | elements
  const [elementsUpdate, setElementsUpdate] = useState(0); // Force re-render of elements list
  const [iconResultsByCategory, setIconResultsByCategory] = useState({});
  const [iconLoadingByCategory, setIconLoadingByCategory] = useState({});
  const [iconErrorByCategory, setIconErrorByCategory] = useState({});
  const [categoryQueries, setCategoryQueries] = useState({});
  const [showAllByCategory, setShowAllByCategory] = useState({});
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundPanelTab, setBackgroundPanelTab] = useState('colour');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundPatternQuery, setBackgroundPatternQuery] = useState('');
  const [backgroundStyle, setBackgroundStyle] = useState({ kind: 'solid', color: '#ffffff' });
  const [customPatternOptions, setCustomPatternOptions] = useState({
    type: 'dots',
    foreground: '#0f766e',
    background: '#ffffff',
    imageDataUrl: '',
    imageMode: 'single',
  });
  const [qrText, setQrText] = useState('');
  const [qrSize, setQrSize] = useState(160);
  const [qrColor, setQrColor] = useState('#000000');
  const [selectedObject, setSelectedObject] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activePrintSide, setActivePrintSide] = useState('front');
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isSwitchingSide, setIsSwitchingSide] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [show3DPreviewModal, setShow3DPreviewModal] = useState(false);
  const [previewRotationY, setPreviewRotationY] = useState(-24);
  const previewRotationTargetRef = useRef(-24);
  const fontPickerRef = useRef(null);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [designerAuthOpen, setDesignerAuthOpen] = useState(false);
  const sideDesignsRef = useRef({ front: [], back: [] });
  const sideBackgroundsRef = useRef({
    front: { kind: 'solid', color: '#ffffff' },
    back: { kind: 'solid', color: '#ffffff' },
  });
  const [sidePreviewUrls, setSidePreviewUrls] = useState({ front: '', back: '' });
  const activePrintSideRef = useRef('front');
  const isDoubleSidedRef = useRef(false);
  const pendingExportRef = useRef(false);

  const [currentProductType, setCurrentProductType] = useState(productType);
  const [dynamicPrintAreas, setDynamicPrintAreas] = useState([]);

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

  const isDoubleSided = ['double-sided', 'double sided', 'double', 'both', 'both-sides']
    .includes(String(sidePrintedParam || '').trim().toLowerCase());

  useEffect(() => {
    if (!isDoubleSided && activePrintSide !== 'front') {
      setActivePrintSide('front');
    }
  }, [isDoubleSided, activePrintSide]);

  useEffect(() => {
    if (!isDoubleSided) {
      sideBackgroundsRef.current.back = sideBackgroundsRef.current.front;
    }
  }, [isDoubleSided]);

  useEffect(() => {
    activePrintSideRef.current = activePrintSide;
  }, [activePrintSide]);

  useEffect(() => {
    isDoubleSidedRef.current = isDoubleSided;
  }, [isDoubleSided]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontPickerRef.current && !fontPickerRef.current.contains(event.target)) {
        setShowFontPicker(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (designerAuthOpen || showCancelModal || show3DPreviewModal) {
      setShowFontPicker(false);
    }
  }, [designerAuthOpen, showCancelModal, show3DPreviewModal]);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, []);

  const isGuideObject = (obj) => {
    const name = obj?.name || '';
    return (
      name === 'product-placeholder' ||
      name.startsWith('safe-fill-') ||
      name === 'product-base-image' ||
      name.startsWith('print-area-') ||
      name.startsWith('cut-line-') ||
      name.startsWith('safe-area-') ||
      name.startsWith('drag-metric-') ||
      name.startsWith('dimension-guide-')
    );
  };

  const isTextObject = (obj) => ['text', 'i-text', 'textbox'].includes(obj?.type);

  const generateSidePreview = async (side, objectJsonList) => {
    const canvasWidth = sizedCanvas?.width || productTemplate?.dimensions?.width || 600;
    const canvasHeight = sizedCanvas?.height || productTemplate?.dimensions?.height || 400;
    const tempCanvasEl = document.createElement('canvas');
    const previewCanvas = new fabric.StaticCanvas(tempCanvasEl, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
    });

    try {
      const previewBackgroundStyle = sideBackgroundsRef.current[side] || { kind: 'solid', color: '#ffffff' };
      const previewSafeArea = safeConstraintAreas[0] || fullCanvasArea;
      const previewSafeBounds = previewSafeArea?.bounds || {
        left: 0,
        top: 0,
        right: canvasWidth,
        bottom: canvasHeight,
      };
      const previewSafeFill = new fabric.Rect({
        left: previewSafeBounds.left,
        top: previewSafeBounds.top,
        width: Math.max(1, previewSafeBounds.right - previewSafeBounds.left),
        height: Math.max(1, previewSafeBounds.bottom - previewSafeBounds.top),
        fill: '#ffffff',
        selectable: false,
        evented: false,
      });

      if (previewBackgroundStyle?.kind === 'pattern' && previewBackgroundStyle.patternConfig) {
        const previewPattern = createFabricPattern(
          previewBackgroundStyle.patternConfig.type,
          previewBackgroundStyle.patternConfig.foreground,
          previewBackgroundStyle.patternConfig.background
        );
        if (previewPattern) {
          previewSafeFill.set('fill', previewPattern);
        }
      } else if (previewBackgroundStyle?.kind === 'image' && previewBackgroundStyle.imageSrc) {
        const previewImageFill = await createImageFillForSafeArea(
          previewSafeFill,
          previewBackgroundStyle.imageSrc,
          previewBackgroundStyle.mode || 'single'
        );
        if (previewImageFill) {
          previewSafeFill.set('fill', previewImageFill);
        }
      } else {
        previewSafeFill.set(
          'fill',
          previewBackgroundStyle?.color === 'transparent'
            ? 'transparent'
            : (previewBackgroundStyle?.color || '#ffffff')
        );
      }

      previewCanvas.add(previewSafeFill);

      if (objectJsonList?.length) {
        await new Promise((resolve) => {
          fabric.util.enlivenObjects(objectJsonList, (objs) => {
            objs.forEach((o) => previewCanvas.add(o));
            resolve();
          });
        });
      }
      previewCanvas.renderAll();
      const previewUrl = previewCanvas.toDataURL({
        format: 'png',
        multiplier: 2,
        enableRetinaScaling: true,
      });
      setSidePreviewUrls((prev) => ({ ...prev, [side]: previewUrl }));
    } catch (error) {
      console.warn('Side preview generation failed:', error);
    } finally {
      previewCanvas.dispose();
    }
  };

  const saveCurrentSideDesign = (side) => {
    if (!canvas || !side) return;
    const userObjects = canvas
      .getObjects()
      .filter((obj) => !isGuideObject(obj))
      .map((obj) =>
        obj.toObject([
          'name',
          'originX',
          'originY',
          'selectable',
          'evented',
          'hasControls',
          'hasBorders',
          'lockMovementX',
          'lockMovementY',
        ])
      );
    sideDesignsRef.current[side] = userObjects;
    sideBackgroundsRef.current[side] = backgroundStyle;
    if (isDoubleSided) {
      void generateSidePreview(side, userObjects);
    }
  };

  const loadSideDesign = async (side) => {
    if (!canvas || !side) return;

    const existingUserObjects = canvas.getObjects().filter((obj) => !isGuideObject(obj));
    existingUserObjects.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();

    const savedObjects = sideDesignsRef.current[side] || [];
    const savedBackground = sideBackgroundsRef.current[side] || { kind: 'solid', color: '#ffffff' };
    setBackgroundStyle(savedBackground);
    if (!savedObjects.length) {
      canvas.renderAll();
      setElementsUpdate((prev) => prev + 1);
      return;
    }

    await new Promise((resolve) => {
      fabric.util.enlivenObjects(savedObjects, (enlivenedObjects) => {
        enlivenedObjects.forEach((obj) => canvas.add(obj));
        canvas.renderAll();
        setElementsUpdate((prev) => prev + 1);
        resolve();
      });
    });
  };

  const handleSideSwitch = async (nextSide) => {
    if (!isDoubleSided || !canvas || !nextSide || nextSide === activePrintSide || isSwitchingSide) return;
    setIsSwitchingSide(true);
    try {
      saveCurrentSideDesign(activePrintSide);
      await loadSideDesign(nextSide);
      setActivePrintSide(nextSide);
      const existingObjects = sideDesignsRef.current[nextSide] || [];
      if (existingObjects.length && !sidePreviewUrls[nextSide]) {
        void generateSidePreview(nextSide, existingObjects);
      }
    } finally {
      setIsSwitchingSide(false);
    }
  };

  const iconifyCategories = [
    { id: 'socials', label: 'Socials', defaultQuery: 'social logo' },
    { id: 'contacts', label: 'Contacts', defaultQuery: 'contact phone email' },
    { id: 'shapes', label: 'Shapes', defaultQuery: 'shape geometric' },
    { id: 'arrows', label: 'Arrows', defaultQuery: 'arrow line' },
    { id: 'safety', label: 'Safety', defaultQuery: 'warning prohibition safety sign' },
    { id: 'packaging', label: 'Packaging', defaultQuery: 'recycle package symbol' },
    { id: 'wedding', label: 'Wedding', defaultQuery: 'wedding decoration icon' },
    { id: 'kids', label: 'Kids', defaultQuery: 'kids school toy icon' },
  ];

  async function searchIcons(query) {
    const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.icons || [];
  }

  const handleCategoryQueryChange = (categoryId, value) => {
    setCategoryQueries((prev) => ({ ...prev, [categoryId]: value }));
  };

  const toggleShowAllForCategory = (categoryId) => {
    setShowAllByCategory((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  useEffect(() => {
    if (sidebarTab !== 'elements') return;

    iconifyCategories.forEach(async (category) => {
      const query = (categoryQueries[category.id] || category.defaultQuery || '').trim();
      if (!query) {
        setIconResultsByCategory((prev) => ({ ...prev, [category.id]: [] }));
        return;
      }

      setIconLoadingByCategory((prev) => ({ ...prev, [category.id]: true }));
      setIconErrorByCategory((prev) => ({ ...prev, [category.id]: '' }));
      try {
        const icons = await searchIcons(query);
        setIconResultsByCategory((prev) => ({ ...prev, [category.id]: icons }));
      } catch (error) {
        setIconErrorByCategory((prev) => ({ ...prev, [category.id]: 'Failed to load icons' }));
      } finally {
        setIconLoadingByCategory((prev) => ({ ...prev, [category.id]: false }));
      }
    });
  }, [sidebarTab, categoryQueries]);

  const parseCanvasDimensionsFromSize = (sizeLabel) => {
    if (!sizeLabel) return null;
    const normalizedLabel = String(sizeLabel)
      .replace(/\+/g, ' ')
      .replace(/[xX]/g, ' x ')
      .trim()
      .toLowerCase();

    const standardPaperSizes = {
      a0: { widthMm: 841, heightMm: 1189 },
      a1: { widthMm: 594, heightMm: 841 },
      a2: { widthMm: 420, heightMm: 594 },
      a3: { widthMm: 297, heightMm: 420 },
      a4: { widthMm: 210, heightMm: 297 },
      a5: { widthMm: 148, heightMm: 210 },
      a6: { widthMm: 105, heightMm: 148 },
    };

    let widthMm = null;
    let heightMm = null;

    const paperMatch = normalizedLabel.match(/\b(a[0-6])\b/);
    if (paperMatch) {
      const paperSize = standardPaperSizes[paperMatch[1]];
      if (paperSize) {
        widthMm = paperSize.widthMm;
        heightMm = paperSize.heightMm;

        if (normalizedLabel.includes('landscape')) {
          [widthMm, heightMm] = [heightMm, widthMm];
        } else if (normalizedLabel.includes('portrait')) {
          widthMm = Math.min(paperSize.widthMm, paperSize.heightMm);
          heightMm = Math.max(paperSize.widthMm, paperSize.heightMm);
        }
      }
    }

    if (!widthMm || !heightMm) {
      const matches = normalizedLabel.match(/(\d+(?:\.\d+)?)/g);
      if (!matches || matches.length < 2) return null;
      widthMm = Number(matches[0]);
      heightMm = Number(matches[1]);
    }

    if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm) || widthMm <= 0 || heightMm <= 0) {
      return null;
    }

    // Keep real proportion while fitting a fixed, practical design viewport.
    // Large products still appear larger than small ones, but never oversized on screen.
    const maxWidth = 940;
    const maxHeight = 500;
    const scale = Math.min(maxWidth / widthMm, maxHeight / heightMm);
    const width = Math.max(240, Math.round(widthMm * scale));
    const height = Math.max(180, Math.round(heightMm * scale));

    return { width, height, widthMm, heightMm };
  };

  const backgroundColorSwatches = [
    'transparent',
    '#000000',
    '#5b5b5b',
    '#7a7a7a',
    '#a8a8a8',
    '#d4d4d8',
    '#ffffff',
    '#ef4444',
    '#f2645d',
    '#d95eb6',
    '#b06ad5',
    '#7c4ce3',
    '#5b21d9',
    '#58b7d8',
    '#7cd0da',
    '#5aa7ea',
    '#586de8',
    '#2d52a8',
    '#58b86a',
    '#c5f36a',
    '#f9dc67',
    '#f7bf60',
  ];

  const backgroundPatternPresets = [
    { id: 'dots-teal', name: 'Teal Dots', type: 'dots', foreground: '#0f766e', background: '#ffffff', category: 'Simple' },
    { id: 'dots-gold', name: 'Gold Dots', type: 'dots', foreground: '#f59e0b', background: '#fffaf0', category: 'Simple' },
    { id: 'stripes-sand', name: 'Sand Stripes', type: 'stripes', foreground: '#d6b68a', background: '#f7efe3', category: 'Nature' },
    { id: 'stripes-night', name: 'Night Stripes', type: 'stripes', foreground: '#f59e0b', background: '#3a3d52', category: 'Bold' },
    { id: 'grid-sage', name: 'Sage Grid', type: 'grid', foreground: '#bfd8bf', background: '#f6faf4', category: 'Nature' },
    { id: 'grid-blue', name: 'Blue Grid', type: 'grid', foreground: '#bfdbfe', background: '#eff6ff', category: 'Simple' },
    { id: 'diagonal-berry', name: 'Berry Diagonal', type: 'diagonal', foreground: '#b91c1c', background: '#fff7f7', category: 'Bold' },
    { id: 'diagonal-lavender', name: 'Lavender Diagonal', type: 'diagonal', foreground: '#8b5cf6', background: '#faf5ff', category: 'Floral' },
  ];

  const freeBackgroundLibrary = (() => {
    const buildCategory = (category, type, palettePairs) =>
      palettePairs.map(([foreground, background], index) => ({
        id: `free-${category.toLowerCase()}-${type}-${index + 1}`,
        name: `${category} ${index + 1}`,
        type,
        foreground,
        background,
        category,
      }));

    return [
      ...buildCategory('Floral', 'dots', [
        ['#c084fc', '#faf5ff'],
        ['#ec4899', '#fff1f7'],
        ['#8b5cf6', '#f5f3ff'],
        ['#fb7185', '#fff1f2'],
        ['#e879f9', '#fdf4ff'],
        ['#a855f7', '#faf5ff'],
        ['#f43f5e', '#fff1f2'],
        ['#d946ef', '#fdf4ff'],
        ['#f472b6', '#fff1f7'],
        ['#c026d3', '#faf5ff'],
      ]),
      ...buildCategory('Nature', 'grid', [
        ['#86efac', '#f0fdf4'],
        ['#65a30d', '#f7fee7'],
        ['#16a34a', '#f0fdf4'],
        ['#10b981', '#ecfdf5'],
        ['#84cc16', '#f7fee7'],
        ['#22c55e', '#f0fdf4'],
        ['#15803d', '#ecfdf5'],
        ['#4d7c0f', '#f7fee7'],
        ['#14b8a6', '#f0fdfa'],
        ['#0f766e', '#f0fdfa'],
      ]),
      ...buildCategory('Geometric', 'diagonal', [
        ['#334155', '#f8fafc'],
        ['#1e40af', '#eff6ff'],
        ['#1d4ed8', '#dbeafe'],
        ['#0f172a', '#f1f5f9'],
        ['#3730a3', '#eef2ff'],
        ['#4338ca', '#e0e7ff'],
        ['#2563eb', '#eff6ff'],
        ['#475569', '#f8fafc'],
        ['#6366f1', '#eef2ff'],
        ['#0ea5e9', '#f0f9ff'],
      ]),
      ...buildCategory('Luxury', 'stripes', [
        ['#d97706', '#fffbeb'],
        ['#ca8a04', '#fefce8'],
        ['#b45309', '#fffbeb'],
        ['#92400e', '#fff7ed'],
        ['#7c2d12', '#fff7ed'],
        ['#a16207', '#fefce8'],
        ['#c2410c', '#fff7ed'],
        ['#78350f', '#fef3c7'],
        ['#eab308', '#fefce8'],
        ['#f59e0b', '#fffbeb'],
      ]),
      ...buildCategory('Festive', 'dots', [
        ['#dc2626', '#fef2f2'],
        ['#ea580c', '#fff7ed'],
        ['#b91c1c', '#fef2f2'],
        ['#c2410c', '#fff7ed'],
        ['#059669', '#ecfdf5'],
        ['#0f766e', '#f0fdfa'],
        ['#7c3aed', '#f5f3ff'],
        ['#db2777', '#fdf2f8'],
        ['#2563eb', '#eff6ff'],
        ['#7c2d12', '#fff7ed'],
      ]),
    ];
  })();

  const createPatternDataUrl = (type, foreground, background, tileSize = 64) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = tileSize;
    offscreen.height = tileSize;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, tileSize, tileSize);

    ctx.strokeStyle = foreground;
    ctx.fillStyle = foreground;
    ctx.lineWidth = Math.max(1, tileSize * 0.06);

    switch (type) {
      case 'stripes':
        for (let y = 8; y < tileSize; y += 16) {
          ctx.fillRect(0, y, tileSize, 6);
        }
        break;
      case 'grid':
        for (let i = 0; i <= tileSize; i += 16) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, tileSize);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(tileSize, i);
          ctx.stroke();
        }
        break;
      case 'diagonal':
        for (let i = -tileSize; i <= tileSize * 2; i += 18) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i - tileSize, tileSize);
          ctx.stroke();
        }
        break;
      case 'dots':
      default:
        for (let x = 12; x < tileSize; x += 20) {
          for (let y = 12; y < tileSize; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
    }

    return offscreen.toDataURL('image/png');
  };

  const createFabricPattern = (type, foreground, background, tileSize = 64) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = tileSize;
    offscreen.height = tileSize;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, tileSize, tileSize);

    ctx.strokeStyle = foreground;
    ctx.fillStyle = foreground;
    ctx.lineWidth = Math.max(1, tileSize * 0.06);

    switch (type) {
      case 'stripes':
        for (let y = 8; y < tileSize; y += 16) {
          ctx.fillRect(0, y, tileSize, 6);
        }
        break;
      case 'grid':
        for (let i = 0; i <= tileSize; i += 16) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, tileSize);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(tileSize, i);
          ctx.stroke();
        }
        break;
      case 'diagonal':
        for (let i = -tileSize; i <= tileSize * 2; i += 18) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i - tileSize, tileSize);
          ctx.stroke();
        }
        break;
      case 'dots':
      default:
        for (let x = 12; x < tileSize; x += 20) {
          for (let y = 12; y < tileSize; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
    }

    return new fabric.Pattern({
      source: offscreen,
      repeat: 'repeat',
    });
  };

  const loadImageElement = (src) =>
    new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error('Missing image source'));
        return;
      }

      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = src;
    });

  const createImageFillForSafeArea = async (safeFillObject, imageSrc, mode = 'single') => {
    if (!safeFillObject || !imageSrc) return null;

    const image = await loadImageElement(imageSrc);
    const targetWidth = Math.max(1, Math.round(safeFillObject.width || 1));
    const targetHeight = Math.max(1, Math.round(safeFillObject.height || 1));
    const offscreen = document.createElement('canvas');
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    if (mode === 'repeat') {
      const maxTileEdge = 160;
      const scale = Math.min(1, maxTileEdge / Math.max(image.width, image.height));
      offscreen.width = Math.max(24, Math.round(image.width * scale));
      offscreen.height = Math.max(24, Math.round(image.height * scale));
      ctx.drawImage(image, 0, 0, offscreen.width, offscreen.height);
      return new fabric.Pattern({
        source: offscreen,
        repeat: 'repeat',
      });
    }

    offscreen.width = targetWidth;
    offscreen.height = targetHeight;
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    const scale = Math.max(targetWidth / image.width, targetHeight / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const offsetX = (targetWidth - drawWidth) / 2;
    const offsetY = (targetHeight - drawHeight) / 2;
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    return new fabric.Pattern({
      source: offscreen,
      repeat: 'no-repeat',
    });
  };

  const sizedCanvas = parseCanvasDimensionsFromSize(selectedSizeParam);

  
  // Get print areas from new config based on category, fallback to old templates
  // Normalize category - handle t-shirt variations
  let category = productCategory || currentProductType;
  if (category) {
    category = category.toLowerCase().trim();
    // Handle t-shirt category variations
    if (category === 'tshirt' || category === 't-shirt' || category === 't shirt') {
      category = 'tshirts'; // Use plural form to match config
    }
  }
  const configPrintAreas = getProductPrintAreas(category, currentProductType);
  const productTemplate = configPrintAreas 
    ? { 
        ...configPrintAreas, 
        dimensions: configPrintAreas.dimensions || { width: 500, height: 600 },
        printAreas: configPrintAreas.printAreas?.map(area => validatePrintArea(area, configPrintAreas.dimensions)) || []
      }
    : (productTemplates[currentProductType] || productTemplates.pen);

  const getScaledTemplatePrintAreas = () => {
    const sourceAreas = Array.isArray(productTemplate?.printAreas) ? productTemplate.printAreas : [];
    if (!sourceAreas.length) return [];

    if (!sizedCanvas?.width || !sizedCanvas?.height) return sourceAreas;

    const baseWidth = productTemplate?.dimensions?.width || sizedCanvas.width;
    const baseHeight = productTemplate?.dimensions?.height || sizedCanvas.height;
    const scaleX = sizedCanvas.width / baseWidth;
    const scaleY = sizedCanvas.height / baseHeight;

    return sourceAreas.map((area) => {
      const baseBounds = area?.bounds || {
        left: area.x || 0,
        top: area.y || 0,
        right: (area.x || 0) + (area.width || 0),
        bottom: (area.y || 0) + (area.height || 0),
      };

      const scaledArea = {
        ...area,
        x: (area.x || 0) * scaleX,
        y: (area.y || 0) * scaleY,
        width: (area.width || 0) * scaleX,
        height: (area.height || 0) * scaleY,
        bounds: {
          left: baseBounds.left * scaleX,
          top: baseBounds.top * scaleY,
          right: baseBounds.right * scaleX,
          bottom: baseBounds.bottom * scaleY,
        },
      };

      return validatePrintArea(scaledArea, { width: sizedCanvas.width, height: sizedCanvas.height });
    });
  };

  const createFullCanvasArea = () => {
    const canvasWidth = sizedCanvas?.width || productTemplate?.dimensions?.width || 600;
    const canvasHeight = sizedCanvas?.height || productTemplate?.dimensions?.height || 400;
    return [{
      id: 'full-canvas',
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      bounds: {
        left: 0,
        top: 0,
        right: canvasWidth,
        bottom: canvasHeight,
      },
    }];
  };

  const templateScaledAreas = getScaledTemplatePrintAreas();
  const effectivePrintAreas = dynamicPrintAreas.length > 0
    ? dynamicPrintAreas
    : (templateScaledAreas.length > 0 ? templateScaledAreas : createFullCanvasArea());
  const canvasWidthForGuides = sizedCanvas?.width || productTemplate?.dimensions?.width || 600;
  const canvasHeightForGuides = sizedCanvas?.height || productTemplate?.dimensions?.height || 400;
  const fullCanvasArea = {
    id: 'whole-canvas',
    x: 0,
    y: 0,
    width: canvasWidthForGuides,
    height: canvasHeightForGuides,
    bounds: {
      left: 0,
      top: 0,
      right: canvasWidthForGuides,
      bottom: canvasHeightForGuides,
    },
  };
  // Safe-area inset scales with canvas size so guides work consistently for every size.
  const SAFE_AREA_INSET_RATIO = 0.04; // 4% of shorter edge
  const SAFE_AREA_INSET_MIN_PX = 8;
  const SAFE_AREA_INSET_MAX_PX = 28;
  const safeConstraintAreas = [fullCanvasArea].map((area) => {
    const bounds = area?.bounds || {
      left: area.x || 0,
      top: area.y || 0,
      right: (area.x || 0) + (area.width || 0),
      bottom: (area.y || 0) + (area.height || 0),
    };

    const areaWidth = Math.max(1, bounds.right - bounds.left);
    const areaHeight = Math.max(1, bounds.bottom - bounds.top);
    const shorterEdge = Math.min(areaWidth, areaHeight);
    const ratioInset = shorterEdge * SAFE_AREA_INSET_RATIO;
    const rawInset = Math.max(SAFE_AREA_INSET_MIN_PX, Math.min(SAFE_AREA_INSET_MAX_PX, ratioInset));

    const inset = Number.isFinite(rawInset) ? rawInset : SAFE_AREA_INSET_MIN_PX;
    const safeLeft = bounds.left + inset;
    const safeTop = bounds.top + inset;
    const safeRight = bounds.right - inset;
    const safeBottom = bounds.bottom - inset;

    return {
      ...area,
      bounds: {
        left: safeLeft,
        top: safeTop,
        right: safeRight,
        bottom: safeBottom,
      },
      x: safeLeft,
      y: safeTop,
      width: Math.max(1, safeRight - safeLeft),
      height: Math.max(1, safeBottom - safeTop),
    };
  });
  const displayWidthMm = Math.round(sizedCanvas?.widthMm || productTemplate?.dimensions?.width || 0);
  const displayHeightMm = Math.round(sizedCanvas?.heightMm || productTemplate?.dimensions?.height || 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasWidth = sizedCanvas?.width || productTemplate.dimensions.width;
    const canvasHeight = sizedCanvas?.height || productTemplate.dimensions.height;

    // If canvas already exists, check if we need to resize or recreate
    if (canvas) {
      const currentWidth = canvas.getWidth();
      const currentHeight = canvas.getHeight();
      
      // If dimensions match, just resize the canvas without recreating
      if (currentWidth === canvasWidth && currentHeight === canvasHeight) {
        return;
      }
      
      // If dimensions changed, resize the canvas
      try {
        if (canvasRef.current && canvasRef.current.parentNode) {
          canvas.setDimensions({
            width: canvasWidth,
            height: canvasHeight
          });
          canvas.renderAll();
            return;
        }
      } catch (error) {
        console.error('Error resizing canvas:', error);
        // If resize fails, dispose and recreate
        try {
          if (canvasRef.current && canvasRef.current.parentNode) {
            canvas.dispose();
          }
        } catch (disposeError) {
          console.error('Error disposing canvas:', disposeError);
        }
      }
    }

    // Create new canvas with optimized settings for smooth dragging
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: null, // Transparent background to preserve transparency in exports
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      skipTargetFind: false,
      // Enable smooth interactions
      enableRetinaScaling: true,
      // Performance optimizations
      stateful: false
    });

    // Guard against race conditions where callbacks call renderAll() after unmount/dispose.
    const originalRenderAll = fabricCanvas.renderAll.bind(fabricCanvas);
    fabricCanvas.renderAll = (...args) => {
      if (!fabricCanvas.contextContainer || !fabricCanvas.lowerCanvasEl) {
        return fabricCanvas;
      }
      try {
        return originalRenderAll(...args);
      } catch (error) {
        console.warn('Skipped unsafe canvas render:', error?.message || error);
        return fabricCanvas;
      }
    };

    // Clean blank canvas background for fresh designing experience.
    const placeholder = new fabric.Rect({
      width: canvasWidth,
      height: canvasHeight,
      fill: '#f5f5f5',
      selectable: false,
      evented: false,
      name: 'product-placeholder'
    });
    fabricCanvas.add(placeholder);
    fabricCanvas.sendToBack(placeholder);

    // Draw cut line and safe area guides.
    const printAreasToUse = [fullCanvasArea];
    
    printAreasToUse.forEach((area) => {
      const areaWidth = area.bounds.right - area.bounds.left;
      const areaHeight = area.bounds.bottom - area.bounds.top;
      const areaCenterX = (area.bounds.left + area.bounds.right) / 2;
      const areaCenterY = (area.bounds.top + area.bounds.bottom) / 2;
      const cutStroke = 1.5;
      const cutInset = cutStroke / 2;
      const cutWidth = Math.max(1, areaWidth - cutStroke);
      const cutHeight = Math.max(1, areaHeight - cutStroke);
      const cutLineGuide = new fabric.Rect({
        // Inset by half stroke so edges don't get clipped.
        left: areaCenterX - areaWidth / 2 + cutInset,
        top: areaCenterY - areaHeight / 2 + cutInset,
        width: cutWidth,
        height: cutHeight,
        fill: 'transparent',
        stroke: '#facc15',
        strokeWidth: cutStroke,
        // Dashed cut line for better visibility
        strokeDashArray: [8, 4],
        selectable: false,
        evented: false,
        name: `cut-line-${area.id}`,
        excludeFromExport: true
      });
      fabricCanvas.add(cutLineGuide);

      const safeArea = safeConstraintAreas.find((a) => a.id === area.id) || area;
      const safeWidth = safeArea.bounds.right - safeArea.bounds.left;
      const safeHeight = safeArea.bounds.bottom - safeArea.bounds.top;
      const safeCenterX = (safeArea.bounds.left + safeArea.bounds.right) / 2;
      const safeCenterY = (safeArea.bounds.top + safeArea.bounds.bottom) / 2;
      const safeStroke = 1;
      const safeInset = safeStroke / 2;
      const safeGuideWidth = Math.max(1, safeWidth - safeStroke);
      const safeGuideHeight = Math.max(1, safeHeight - safeStroke);
      const safeFill = new fabric.Rect({
        left: safeCenterX - safeWidth / 2,
        top: safeCenterY - safeHeight / 2,
        width: safeWidth,
        height: safeHeight,
        fill: '#ffffff',
        selectable: false,
        evented: false,
        name: `safe-fill-${area.id}`,
      });
      fabricCanvas.add(safeFill);

      const safeGuide = new fabric.Rect({
        // Inset by half stroke so edges don't get clipped.
        left: safeCenterX - safeWidth / 2 + safeInset,
        top: safeCenterY - safeHeight / 2 + safeInset,
        width: safeGuideWidth,
        height: safeGuideHeight,
        fill: 'transparent',
        stroke: '#84cc16',
        strokeWidth: safeStroke,
        // Solid line (no dashes)
        strokeDashArray: null,
        selectable: false,
        evented: false,
        name: `safe-area-${area.id}`,
        excludeFromExport: true
      });
      fabricCanvas.add(safeGuide);
      // Keep guides visible above placeholder/background.
      fabricCanvas.sendToBack(placeholder);
      fabricCanvas.moveTo(safeFill, 1);
      fabricCanvas.bringToFront(cutLineGuide);
      fabricCanvas.bringToFront(safeGuide);
    });

    // Hard boundary: users cannot place objects outside the cut line (whole canvas).
    const cutConstraintAreas = [fullCanvasArea];
    const printAreasForConstraints = cutConstraintAreas;
    let renderRequestId = null;

    const clearDragMetrics = () => {
      const metricObjects = fabricCanvas.getObjects().filter((obj) => obj.name?.startsWith('drag-metric-'));
      metricObjects.forEach((obj) => fabricCanvas.remove(obj));
    };

    const addMetricLabel = (text, left, top) =>
      new fabric.Text(String(text), {
        left,
        top,
        originX: 'center',
        originY: 'center',
        fontSize: 12,
        fontWeight: 600,
        fill: '#ffffff',
        backgroundColor: '#0f766e',
        selectable: false,
        evented: false,
        excludeFromExport: true,
        name: 'drag-metric-label',
      });

    const renderDragMetrics = (obj, areaBounds) => {
      if (!obj || !areaBounds) return;
      clearDragMetrics();

      const bounds = obj.getBoundingRect();
      const objLeft = bounds.left;
      const objTop = bounds.top;
      const objRight = bounds.left + bounds.width;
      const objBottom = bounds.top + bounds.height;
      const objCenterX = objLeft + bounds.width / 2;
      const objCenterY = objTop + bounds.height / 2;

      const topDistance = Math.max(0, objTop - areaBounds.top);
      const bottomDistance = Math.max(0, areaBounds.bottom - objBottom);
      const leftDistance = Math.max(0, objLeft - areaBounds.left);
      const rightDistance = Math.max(0, areaBounds.right - objRight);

      const lineProps = {
        stroke: '#0f766e',
        strokeWidth: 1.5,
        strokeDashArray: [6, 4],
        selectable: false,
        evented: false,
        excludeFromExport: true,
      };

      const metricObjects = [
        new fabric.Line([objCenterX, areaBounds.top, objCenterX, objTop], { ...lineProps, name: 'drag-metric-line-top' }),
        new fabric.Line([objCenterX, objBottom, objCenterX, areaBounds.bottom], { ...lineProps, name: 'drag-metric-line-bottom' }),
        new fabric.Line([areaBounds.left, objCenterY, objLeft, objCenterY], { ...lineProps, name: 'drag-metric-line-left' }),
        new fabric.Line([objRight, objCenterY, areaBounds.right, objCenterY], { ...lineProps, name: 'drag-metric-line-right' }),
        addMetricLabel(topDistance.toFixed(2), objCenterX, areaBounds.top + topDistance / 2),
        addMetricLabel(bottomDistance.toFixed(2), objCenterX, objBottom + bottomDistance / 2),
        addMetricLabel(leftDistance.toFixed(2), areaBounds.left + leftDistance / 2, objCenterY),
        addMetricLabel(rightDistance.toFixed(2), objRight + rightDistance / 2, objCenterY),
      ];

      metricObjects.forEach((item) => {
        item.set({ name: `drag-metric-${item.name || 'item'}` });
        fabricCanvas.add(item);
        fabricCanvas.bringToFront(item);
      });
    };
    
    // Helper function: object must be fully inside at least one allowed area.
    const isObjectWithinPrintArea = (obj, printAreas) => {
      if (!printAreas || printAreas.length === 0) return true;
      
      // Skip base image and guide overlays
      if (
        obj.name === 'product-base-image' ||
        (obj.name && (obj.name.startsWith('print-area-') || obj.name.startsWith('cut-line-') || obj.name.startsWith('safe-area-'))) ||
        (obj.name && obj.name.startsWith('dimension-guide-')) ||
        (obj.name && obj.name.startsWith('drag-metric-'))
      ) {
        return true;
      }
      
      const objBounds = obj.getBoundingRect();
      const objLeft = objBounds.left;
      const objTop = objBounds.top;
      const objRight = objBounds.left + objBounds.width;
      const objBottom = objBounds.top + objBounds.height;
      
      // Check if object is fully contained by any allowed area
      for (const area of printAreas) {
        const areaBounds = area.bounds || {
          left: area.x,
          top: area.y,
          right: area.x + area.width,
          bottom: area.y + area.height
        };

        const fullyWithin =
          objLeft >= areaBounds.left &&
          objTop >= areaBounds.top &&
          objRight <= areaBounds.right &&
          objBottom <= areaBounds.bottom;

        if (fullyWithin) return true;
      }
      
      return false;
    };

    // Clamp object position inside area bounds.
    const constrainObjectToBounds = (obj, areaBounds) => {
      const bounds = obj.getBoundingRect();
      let deltaX = 0;
      let deltaY = 0;

      if (bounds.left < areaBounds.left) {
        deltaX = areaBounds.left - bounds.left;
      } else if (bounds.left + bounds.width > areaBounds.right) {
        deltaX = areaBounds.right - (bounds.left + bounds.width);
      }

      if (bounds.top < areaBounds.top) {
        deltaY = areaBounds.top - bounds.top;
      } else if (bounds.top + bounds.height > areaBounds.bottom) {
        deltaY = areaBounds.bottom - (bounds.top + bounds.height);
      }

      if (deltaX !== 0 || deltaY !== 0) {
        obj.set({
          left: (obj.left || 0) + deltaX,
          top: (obj.top || 0) + deltaY,
        });
        obj.setCoords();
      }
    };
    
    // Enable smooth rendering during movement with optimized rendering
    fabricCanvas.on('object:moving', (e) => {
      const obj = e.target;
      
      // Skip base image and guide overlays
      if (
        obj.name === 'product-base-image' ||
        (obj.name && (obj.name.startsWith('print-area-') || obj.name.startsWith('cut-line-') || obj.name.startsWith('safe-area-'))) ||
        (obj.name && obj.name.startsWith('dimension-guide-')) ||
        (obj.name && obj.name.startsWith('drag-metric-'))
      ) {
        return;
      }
      
      // Check if object is within print area and change cursor accordingly
      const isWithinBounds = isObjectWithinPrintArea(obj, printAreasForConstraints);
      
      if (isWithinBounds) {
        fabricCanvas.defaultCursor = 'move';
        fabricCanvas.hoverCursor = 'move';
        if (fabricCanvas.upperCanvasEl) {
          fabricCanvas.upperCanvasEl.style.cursor = 'move';
        }
        if (fabricCanvas.lowerCanvasEl) {
          fabricCanvas.lowerCanvasEl.style.cursor = 'move';
        }
      } else {
        fabricCanvas.defaultCursor = 'not-allowed';
        fabricCanvas.hoverCursor = 'not-allowed';
        if (fabricCanvas.upperCanvasEl) {
          fabricCanvas.upperCanvasEl.style.cursor = 'not-allowed';
        }
        if (fabricCanvas.lowerCanvasEl) {
          fabricCanvas.lowerCanvasEl.style.cursor = 'not-allowed';
        }

        // Prevent object from going outside cut line by clamping to bounds immediately.
        const areaBounds = printAreasForConstraints[0]?.bounds;
        if (areaBounds) {
          constrainObjectToBounds(obj, areaBounds);
        }
      }

      const areaBounds = printAreasForConstraints[0]?.bounds;
      if (areaBounds) {
        renderDragMetrics(obj, areaBounds);
      }
      
      // Use requestAnimationFrame for smooth rendering
      if (renderRequestId) {
        cancelAnimationFrame(renderRequestId);
      }
      renderRequestId = requestAnimationFrame(() => {
        if (fabricCanvas) {
        fabricCanvas.renderAll();
        }
        renderRequestId = null;
      });
    });

    // Handle object modified (after movement) - final constraint check
    fabricCanvas.on('object:modified', (e) => {
      const obj = e.target;
      
      // Reset cursor to default
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.hoverCursor = 'move';
      if (fabricCanvas.upperCanvasEl) {
        fabricCanvas.upperCanvasEl.style.cursor = 'default';
      }
      if (fabricCanvas.lowerCanvasEl) {
        fabricCanvas.lowerCanvasEl.style.cursor = 'default';
      }
      
      // Final hard constraint at drag end.
      if (printAreasForConstraints.length > 0) {
        const areaBounds = printAreasForConstraints[0]?.bounds;
        if (areaBounds) {
          constrainObjectToBounds(obj, areaBounds);
        }
      }
      clearDragMetrics();
    });
    
    // Handle mouse move to show error cursor when hovering outside print area
    fabricCanvas.on('mouse:move', (e) => {
      const activeObject = fabricCanvas.getActiveObject();
      
      // Only show error cursor if an object is selected and being moved
      if (activeObject && activeObject !== e.target) {
        // Check if the active object would be outside bounds at current mouse position
        const pointer = fabricCanvas.getPointer(e.e);
        const isWithinBounds = isObjectWithinPrintArea(activeObject, printAreasForConstraints);
        
        if (!isWithinBounds && printAreasForConstraints.length > 0) {
          fabricCanvas.defaultCursor = 'not-allowed';
          fabricCanvas.hoverCursor = 'not-allowed';
          if (fabricCanvas.upperCanvasEl) {
            fabricCanvas.upperCanvasEl.style.cursor = 'not-allowed';
          }
        } else {
          fabricCanvas.defaultCursor = 'move';
          fabricCanvas.hoverCursor = 'move';
          if (fabricCanvas.upperCanvasEl) {
            fabricCanvas.upperCanvasEl.style.cursor = 'move';
          }
        }
      }
    });

    // Handle object selection
    fabricCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
    });

    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
      clearDragMetrics();
    });

    fabricCanvas.on('mouse:up', () => {
      clearDragMetrics();
    });

    // Enable text editing on double-click
    fabricCanvas.on('mouse:dblclick', (e) => {
      const obj = e.target;
      if (isTextObject(obj)) {
        obj.enterEditing();
        fabricCanvas.renderAll();
      }
    });

    // Update selected object when text is modified
    fabricCanvas.on('text:changed', (e) => {
      if (e.target === selectedObject) {
        setSelectedObject(e.target);
      }
    });

    // Save state for undo/redo
    const saveState = () => {
      const json = JSON.stringify(fabricCanvas.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    };

    fabricCanvas.on('object:added', () => {
      saveState();
      setElementsUpdate(prev => prev + 1); // Update elements list
      if (isDoubleSidedRef.current) {
        saveCurrentSideDesign(activePrintSideRef.current);
      }
    });
    fabricCanvas.on('object:removed', () => {
      saveState();
      setElementsUpdate(prev => prev + 1); // Update elements list
      if (isDoubleSidedRef.current) {
        saveCurrentSideDesign(activePrintSideRef.current);
      }
    });
    fabricCanvas.on('object:modified', () => {
      saveState();
      setElementsUpdate(prev => prev + 1); // Update elements list
      if (isDoubleSidedRef.current) {
        saveCurrentSideDesign(activePrintSideRef.current);
      }
    });

    setCanvas(fabricCanvas);

    return () => {
      // Only dispose if canvas still exists and element is still in DOM
      if (fabricCanvas) {
        try {
          // Check if the canvas element still exists in the DOM
          if (canvasRef.current && canvasRef.current.parentNode) {
      fabricCanvas.dispose();
          } else {
            // If element is not in DOM, just clear the canvas state
            try {
              fabricCanvas.clear();
            } catch (clearError) {
              // Ignore clear errors
            }
          }
        } catch (error) {
          // Silently handle disposal errors - canvas might already be disposed
          console.warn('Canvas disposal warning (this is usually safe to ignore):', error.message);
        }
      }
    };
  }, [currentProductType, dynamicPrintAreas, sizedCanvas?.width, sizedCanvas?.height, sizedCanvas?.widthMm, sizedCanvas?.heightMm]);

  // Handle panning when hand tool is active
  useEffect(() => {
    if (!canvas) return;

    let isDragging = false;
    let lastPanX = 0;
    let lastPanY = 0;

    const handleMouseDown = (e) => {
      // Only handle pan if pan tool is active
      if (activeTool === 'pan') {
        e.e.preventDefault();
        e.e.stopPropagation();
        isDragging = true;
        setIsPanning(true);
        
        // Use screen coordinates for smooth panning
        lastPanX = e.e.clientX;
        lastPanY = e.e.clientY;
        
        // Deselect any active objects when starting to pan
        canvas.discardActiveObject();
        canvas.renderAll();
        
        canvas.defaultCursor = 'grabbing';
        canvas.hoverCursor = 'grabbing';
        canvas.selection = false;
        if (canvas.upperCanvasEl) {
          canvas.upperCanvasEl.style.cursor = 'grabbing';
        }
        if (canvas.lowerCanvasEl) {
          canvas.lowerCanvasEl.style.cursor = 'grabbing';
        }
      }
    };

    const handleMouseMove = (e) => {
      if (activeTool === 'pan') {
        if (isDragging) {
          e.e.preventDefault();
          e.e.stopPropagation();
          
          // Calculate delta in screen coordinates
          const deltaX = e.e.clientX - lastPanX;
          const deltaY = e.e.clientY - lastPanY;
          
          // Update viewport transform
          const vpt = canvas.viewportTransform;
          vpt[4] += deltaX;
          vpt[5] += deltaY;
          
          // Update last position
          lastPanX = e.e.clientX;
          lastPanY = e.e.clientY;
          
          // Render with requestAnimationFrame for smoothness
          canvas.requestRenderAll();
        } else {
          // Show grab cursor when hovering
          canvas.defaultCursor = 'grab';
          canvas.hoverCursor = 'grab';
          if (canvas.upperCanvasEl) {
            canvas.upperCanvasEl.style.cursor = 'grab';
          }
          if (canvas.lowerCanvasEl) {
            canvas.lowerCanvasEl.style.cursor = 'grab';
          }
        }
      }
    };

    const handleMouseUp = (e) => {
      if (activeTool === 'pan' && isDragging) {
        e.e.preventDefault();
        e.e.stopPropagation();
        isDragging = false;
        setIsPanning(false);
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
        if (canvas.upperCanvasEl) {
          canvas.upperCanvasEl.style.cursor = 'grab';
        }
        if (canvas.lowerCanvasEl) {
          canvas.lowerCanvasEl.style.cursor = 'grab';
        }
      }
    };

    // Also handle mouse leave to reset dragging state
    const handleMouseLeave = () => {
      if (isDragging) {
        isDragging = false;
        setIsPanning(false);
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';
        if (canvas.upperCanvasEl) {
          canvas.upperCanvasEl.style.cursor = 'grab';
        }
        if (canvas.lowerCanvasEl) {
          canvas.lowerCanvasEl.style.cursor = 'grab';
        }
      }
    };

    // Disable object selection when pan tool is active
    if (activeTool === 'pan') {
      canvas.selection = false;
      canvas.defaultCursor = 'grab';
      canvas.hoverCursor = 'grab';
      if (canvas.upperCanvasEl) {
        canvas.upperCanvasEl.style.cursor = 'grab';
      }
      if (canvas.lowerCanvasEl) {
        canvas.lowerCanvasEl.style.cursor = 'grab';
      }
    } else {
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
      if (canvas.upperCanvasEl) {
        canvas.upperCanvasEl.style.cursor = 'default';
      }
      if (canvas.lowerCanvasEl) {
        canvas.lowerCanvasEl.style.cursor = 'default';
      }
    }

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:out', handleMouseLeave);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:out', handleMouseLeave);
    };
  }, [canvas, activeTool]);

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' 
      ? Math.min(zoom + 10, 200) 
      : Math.max(zoom - 10, 25);
    
    setZoom(newZoom);
    if (canvas) {
      const zoomRatio = newZoom / 100;
      const center = canvas.getCenter();
      
      // Apply zoom
      canvas.setZoom(zoomRatio);
      
      // Adjust viewport to keep content centered and visible
      const vpt = canvas.viewportTransform;
      const canvasEl = canvas.getElement();
      const canvasWidth = canvasEl.width;
      const canvasHeight = canvasEl.height;
      
      // Center the viewport after zoom
      vpt[4] = (canvasWidth / 2) - (center.left * zoomRatio);
      vpt[5] = (canvasHeight / 2) - (center.top * zoomRatio);
      
      canvas.renderAll();
    }
  };

  const addText = () => {
    if (!canvas) return;

    const printAreasToUse = effectivePrintAreas;
    const printArea = printAreasToUse[0];
    
    if (!printArea) return;
    
    const text = new fabric.IText(textInput.trim() || 'Double-click to edit', {
      left: printArea.bounds.left + 10,
      top: printArea.bounds.top + 10,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textColor,
      editable: true, // Enable text editing
      name: 'user-text',
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockUniScaling: false,
      transparentCorners: false,
      cornerColor: '#4285f4',
      cornerSize: 10,
      borderColor: '#4285f4',
      borderScaleFactor: 1.5,
      padding: 5,
      perPixelTargetFind: true,
      // Optimize for smooth dragging
      objectCaching: false,
      statefullCache: false,
      noScaleCache: false,
      // Cursor settings
      moveCursor: 'move',
      hoverCursor: 'move',
      // Enable free movement
      lockMovementX: false,
      lockMovementY: false,
      // Text editing settings
      editingBorderColor: '#4285f4',
      // No background for text
      textBackgroundColor: 'transparent'
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    text.enterEditing();
    text.selectAll();
    setTextInput('');
    setActiveTool('select');
    setIsLeftDrawerOpen(false);
  };

  // Text toolbar helpers
  const handleFontFamilyChange = (family) => {
    setFontFamily(family);
    if (isTextObject(selectedObject) && canvas) {
      selectedObject.set('fontFamily', family);
      canvas.renderAll();
    }
  };

  const changeFontSizeStep = (delta) => {
    setFontSize((prev) => {
      const next = Math.min(72, Math.max(8, prev + delta));
      if (isTextObject(selectedObject) && canvas) {
        selectedObject.set('fontSize', next);
        canvas.renderAll();
      }
      return next;
    });
  };

  const toggleTextStyle = (style) => {
    if (!isTextObject(selectedObject) || !canvas) return;
    if (style === 'bold') {
      const current = selectedObject.fontWeight === 'bold' ? 'normal' : 'bold';
      selectedObject.set('fontWeight', current);
    } else if (style === 'italic') {
      const current = selectedObject.fontStyle === 'italic' ? 'normal' : 'italic';
      selectedObject.set('fontStyle', current);
    } else if (style === 'underline') {
      selectedObject.set('underline', !selectedObject.underline);
    }
    canvas.renderAll();
  };

  const toggleCapitalization = () => {
    if (!isTextObject(selectedObject) || !canvas) return;
    const currentText = selectedObject.text || '';
    const isUpper = currentText === currentText.toUpperCase();
    selectedObject.set('text', isUpper ? currentText.toLowerCase() : currentText.toUpperCase());
    canvas.renderAll();
  };

  const setTextAlign = (align) => {
    if (!isTextObject(selectedObject) || !canvas) return;
    selectedObject.set('textAlign', align);
    canvas.renderAll();
  };

  const changeLetterSpacing = (delta) => {
    if (!isTextObject(selectedObject) || !canvas) return;
    const current = selectedObject.charSpacing || 0;
    const next = Math.max(0, current + delta);
    selectedObject.set('charSpacing', next);
    canvas.renderAll();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        const printAreasToUse = effectivePrintAreas;
        const printArea = printAreasToUse[0];
        
        if (!printArea) return;
        
        img.scaleToWidth(100);
        img.set({
          left: printArea.bounds.left + 10,
          top: printArea.bounds.top + 10,
          name: 'user-image',
          // Optimize for smooth dragging
          objectCaching: false,
          statefullCache: false,
          noScaleCache: false,
          lockMovementX: false,
          lockMovementY: false,
          selectable: true,
          evented: true
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setIsLeftDrawerOpen(false);
      });
    };
    reader.readAsDataURL(file);
  };

  const setPrintingColor = (color) => {
    setTextColor(color);
    if (isTextObject(selectedObject) && canvas) {
      selectedObject.set('fill', color);
      canvas.renderAll();
    }
  };

  const getSafeFillObjects = (activeCanvas = canvas) =>
    activeCanvas?.getObjects().filter((obj) => obj?.name?.startsWith('safe-fill-')) || [];

  const ensureSafeFillLayerOrder = (activeCanvas = canvas) => {
    if (!activeCanvas) return;

    const objects = activeCanvas.getObjects();
    const placeholderIndex = objects.findIndex((obj) => obj?.name === 'product-placeholder');
    if (placeholderIndex === -1) return;

    const safeFillObjects = objects.filter((obj) => obj?.name?.startsWith('safe-fill-'));
    safeFillObjects.forEach((safeFillObject, index) => {
      activeCanvas.moveTo(safeFillObject, placeholderIndex + 1 + index);
    });
  };

  const applyBackgroundFill = (fill, nextColor = backgroundColor) => {
    if (!canvas) return;
    const safeFillObjects = getSafeFillObjects(canvas);
    if (!safeFillObjects.length) return;

    safeFillObjects.forEach((safeFillObject) => {
      safeFillObject.set('fill', fill);
    });
    ensureSafeFillLayerOrder(canvas);
    canvas.renderAll();
    setBackgroundColor(nextColor);
  };

  const applySolidBackground = (color) => {
    const nextStyle = { kind: 'solid', color };
    setBackgroundStyle(nextStyle);
    sideBackgroundsRef.current[activePrintSideRef.current] = nextStyle;
    applyBackgroundFill(color === 'transparent' ? 'transparent' : color, color);
  };

  const applyPatternBackground = (patternConfig) => {
    if (!patternConfig) return;
    const nextStyle = { kind: 'pattern', patternConfig };
    setBackgroundStyle(nextStyle);
    sideBackgroundsRef.current[activePrintSideRef.current] = nextStyle;
    const fabricPattern = createFabricPattern(
      patternConfig.type,
      patternConfig.foreground,
      patternConfig.background
    );
    if (!fabricPattern) return;
    applyBackgroundFill(fabricPattern, patternConfig.background);
  };

  const applyImageBackground = async (imageSrc, mode = 'single') => {
    if (!canvas || !imageSrc) return;

    const safeFillObjects = getSafeFillObjects(canvas);
    if (!safeFillObjects.length) return;

    const fills = await Promise.all(
      safeFillObjects.map((safeFillObject) => createImageFillForSafeArea(safeFillObject, imageSrc, mode))
    );

    safeFillObjects.forEach((safeFillObject, index) => {
      if (fills[index]) {
        safeFillObject.set('fill', fills[index]);
      }
    });

    const nextStyle = { kind: 'image', imageSrc, mode };
    setBackgroundStyle(nextStyle);
    sideBackgroundsRef.current[activePrintSideRef.current] = nextStyle;
    ensureSafeFillLayerOrder(canvas);
    canvas.renderAll();
  };

  const renderBackgroundStyle = async (style) => {
    if (!canvas || !style) return;

    if (style.kind === 'pattern' && style.patternConfig) {
      const fabricPattern = createFabricPattern(
        style.patternConfig.type,
        style.patternConfig.foreground,
        style.patternConfig.background
      );
      if (fabricPattern) {
        applyBackgroundFill(fabricPattern, style.patternConfig.background);
      }
      return;
    }

    if (style.kind === 'image' && style.imageSrc) {
      const safeFillObjects = getSafeFillObjects(canvas);
      if (!safeFillObjects.length) return;

      const fills = await Promise.all(
        safeFillObjects.map((safeFillObject) => createImageFillForSafeArea(safeFillObject, style.imageSrc, style.mode || 'single'))
      );

      safeFillObjects.forEach((safeFillObject, index) => {
        if (fills[index]) {
          safeFillObject.set('fill', fills[index]);
        }
      });

      ensureSafeFillLayerOrder(canvas);
      canvas.renderAll();
      setBackgroundColor('#ffffff');
      return;
    }

    applyBackgroundFill(
      style.color === 'transparent' ? 'transparent' : (style.color || '#ffffff'),
      style.color || '#ffffff'
    );
  };

  const handleCustomPatternImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;

      setCustomPatternOptions((prev) => ({ ...prev, imageDataUrl: result }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  useEffect(() => {
    if (!canvas) return;
    void renderBackgroundStyle(backgroundStyle);
  }, [canvas, backgroundStyle]);

  const addQrCode = async () => {
    if (!canvas || !qrText.trim()) return;
    
    const printAreasToUse = effectivePrintAreas;
    const printArea = printAreasToUse[0];
    
    if (!printArea) return;

    try {
      const dataUrl = await QRCode.toDataURL(qrText, {
        width: qrSize,
        margin: 0,
        color: {
          dark: qrColor,
          light: '#00000000'
        }
      });

      fabric.Image.fromURL(dataUrl, (img) => {
        const bounds = printArea.bounds;
        img.set({
          left: bounds.left + 10,
          top: bounds.top + 10,
          name: 'qr-code',
          // Optimize for smooth dragging
          objectCaching: false,
          statefullCache: false,
          noScaleCache: false,
          lockMovementX: false,
          lockMovementY: false,
          selectable: true,
          evented: true
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setIsLeftDrawerOpen(false);
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const deleteSelected = () => {
    if (!canvas) return;
    
    // Get the active object from canvas (more reliable than selectedObject state)
    const activeObject = canvas.getActiveObject();
    const activeObjects = canvas.getActiveObjects();
    
    if (activeObjects && activeObjects.length > 0) {
      // Handle multiple selected objects
      activeObjects.forEach(obj => {
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
      setSelectedObject(null);
      setElementsUpdate(prev => prev + 1);
    } else if (activeObject) {
      // Handle single selected object
      canvas.remove(activeObject);
      canvas.renderAll();
      setSelectedObject(null);
      setElementsUpdate(prev => prev + 1);
    } else if (selectedObject) {
      // Fallback to selectedObject state
    canvas.remove(selectedObject);
    canvas.renderAll();
    setSelectedObject(null);
      setElementsUpdate(prev => prev + 1);
    }
  };

  // Keyboard event handler for Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Delete or Backspace is pressed
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas) {
        // Don't delete if user is typing in an input field or textarea
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        
        // Don't delete if user is editing text on canvas
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.isEditing) {
          return;
        }
        
        // Prevent default behavior (e.g., going back in browser)
        e.preventDefault();
        
        // Get the active object from canvas
        const obj = canvas.getActiveObject();
        const objs = canvas.getActiveObjects();
        
        if (objs && objs.length > 0) {
          // Handle multiple selected objects
          objs.forEach(object => {
            // Don't delete guide overlays or base image
            if (
              object.name &&
              (
                object.name.startsWith('print-area-') ||
                object.name.startsWith('cut-line-') ||
                object.name.startsWith('safe-area-') ||
                object.name.startsWith('drag-metric-') ||
                object.name === 'product-base-image'
              )
            ) {
              return;
            }
            canvas.remove(object);
          });
          canvas.discardActiveObject();
          canvas.renderAll();
          setSelectedObject(null);
          setElementsUpdate(prev => prev + 1);
        } else if (obj) {
          // Don't delete guide overlays or base image
          if (
            obj.name &&
            (
              obj.name.startsWith('print-area-') ||
              obj.name.startsWith('cut-line-') ||
              obj.name.startsWith('safe-area-') ||
              obj.name.startsWith('drag-metric-') ||
              obj.name === 'product-base-image'
            )
          ) {
            return;
          }
          // Handle single selected object
          canvas.remove(obj);
          canvas.renderAll();
          setSelectedObject(null);
          setElementsUpdate(prev => prev + 1);
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas]);

  // Add icon to canvas
  const addIconToCanvas = (svgString, name) => {
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }
    
    const printAreasToUse = effectivePrintAreas;
    const printArea = printAreasToUse[0];
    
    if (!printArea) {
      console.error('Print area not available');
      return;
    }

    try {
      // Ensure SVG has proper dimensions and replace currentColor
      let svg = svgString;
      
      // Replace currentColor with black for better visibility (case insensitive)
      svg = svg.replace(/currentColor/gi, '#000000');
      
      // Ensure SVG has width and height if not present
      if (!svg.includes('width=') && !svg.includes('height=')) {
        svg = svg.replace('<svg', '<svg width="24" height="24"');
      }

      // Create SVG data URL with proper encoding
      // Use unescape for better compatibility with special characters
      const encodedSvg = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

      fabric.Image.fromURL(
        svgDataUrl,
        (img) => {
          if (!img) {
            console.error('Failed to load image from SVG:', name);
            // Try alternative method using fabric.util.loadImage
            const imgElement = new Image();
            imgElement.crossOrigin = 'anonymous';
            imgElement.onload = () => {
              const fabricImg = new fabric.Image(imgElement, {
                left: printArea.bounds.left + (printArea.bounds.right - printArea.bounds.left) / 2,
                top: printArea.bounds.top + 20,
                scaleX: 60 / imgElement.width,
                scaleY: 60 / imgElement.height,
                originX: 'center',
                originY: 'top',
                name: `icon-${name}`,
                objectCaching: false,
                lockMovementX: false,
                lockMovementY: false,
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true
              });
              canvas.add(fabricImg);
              canvas.setActiveObject(fabricImg);
              canvas.renderAll();
              setElementsUpdate(prev => prev + 1);
            };
            imgElement.onerror = () => {
              console.error('Failed to load SVG as image:', name);
            };
            imgElement.src = svgDataUrl;
            return;
          }

          // Scale the image to a reasonable size
          const targetSize = 60;
          const imgWidth = img.width || 24;
          const imgHeight = img.height || 24;
          const scale = targetSize / Math.max(imgWidth, imgHeight);
          
          img.scale(scale);
          
          // Calculate position to center in print area or offset slightly
          const centerX = printArea.bounds.left + (printArea.bounds.right - printArea.bounds.left) / 2;
          const left = centerX - (imgWidth * scale) / 2;
          const top = printArea.bounds.top + 20;

          img.set({
            left: left,
            top: top,
            name: `icon-${name}`,
            objectCaching: false,
            lockMovementX: false,
            lockMovementY: false,
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          
          // Update elements list
          setElementsUpdate(prev => prev + 1);
        },
        {
          crossOrigin: 'anonymous'
        }
      );
    } catch (error) {
      console.error('Error adding icon to canvas:', error, name);
    }
  };

  const addIconifyIconToCanvas = async (iconName) => {
    if (!iconName) return;
    try {
      const res = await fetch(`https://api.iconify.design/${encodeURIComponent(iconName)}.svg`);
      if (!res.ok) throw new Error(`Icon fetch failed: ${res.status}`);
      const svgText = await res.text();
      addIconToCanvas(svgText, iconName);
      setIsLeftDrawerOpen(false);
    } catch (error) {
      console.error('Error adding Iconify icon:', error);
    }
  };

  // Add emoji to canvas
  const addEmojiToCanvas = (emoji) => {
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }
    
    const printAreasToUse = effectivePrintAreas;
    const printArea = printAreasToUse[0];
    
    if (!printArea) {
      console.error('Print area not available');
      return;
    }

    try {
      const text = new fabric.Text(emoji, {
        left: printArea.bounds.left + (printArea.bounds.right - printArea.bounds.left) / 2,
        top: printArea.bounds.top + 20,
        fontSize: 40,
        fontFamily: 'Arial',
        name: `emoji-${emoji}`,
        selectable: true,
        evented: true,
        objectCaching: false,
        lockMovementX: false,
        lockMovementY: false,
        originX: 'center',
        originY: 'top',
        hasControls: true,
        hasBorders: true
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      
      // Update elements list
      setElementsUpdate(prev => prev + 1);
      setIsLeftDrawerOpen(false);
    } catch (error) {
      console.error('Error adding emoji to canvas:', error);
    }
  };

  // Add shape to canvas
  const addShapeToCanvas = (shapeType) => {
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }
    
    const printAreasToUse = effectivePrintAreas;
    const printArea = printAreasToUse[0];
    
    if (!printArea) {
      console.error('Print area not available');
      return;
    }

    try {
      let shape;
      const centerX = printArea.bounds.left + (printArea.bounds.right - printArea.bounds.left) / 2;
      const topY = printArea.bounds.top + 20;
      
      const baseProps = {
        fill: textColor,
        stroke: textColor,
        strokeWidth: 2,
        name: `shape-${shapeType}`,
        selectable: true,
        evented: true,
        objectCaching: false,
        lockMovementX: false,
        lockMovementY: false,
        hasControls: true,
        hasBorders: true
      };

      switch (shapeType) {
        case 'circle':
          shape = new fabric.Circle({
            ...baseProps,
            radius: 30,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'top'
          });
          break;
        case 'rect':
          shape = new fabric.Rect({
            ...baseProps,
            width: 60,
            height: 60,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'top'
          });
          break;
        case 'triangle':
          shape = new fabric.Triangle({
            ...baseProps,
            width: 60,
            height: 60,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'top'
          });
          break;
        case 'line':
          shape = new fabric.Line([-30, 0, 30, 0], {
            ...baseProps,
            fill: '',
            stroke: textColor,
            strokeWidth: 3,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'center'
          });
          break;
        case 'ellipse':
          shape = new fabric.Ellipse({
            ...baseProps,
            rx: 30,
            ry: 20,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'top'
          });
          break;
        case 'polygon':
          shape = new fabric.Polygon([
            { x: 0, y: 30 },
            { x: 30, y: 0 },
            { x: 60, y: 30 },
            { x: 45, y: 60 },
            { x: 15, y: 60 }
          ], {
            ...baseProps,
            left: centerX,
            top: topY,
            originX: 'center',
            originY: 'top'
          });
          break;
        case 'star':
          // Create a 5-pointed star
          const points = [];
          const outerRadius = 30;
          const innerRadius = 15;
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            points.push({
              x: radius * Math.cos(angle - Math.PI / 2),
              y: radius * Math.sin(angle - Math.PI / 2)
            });
          }
          shape = new fabric.Polygon(points, {
            ...baseProps,
            left: centerX,
            top: topY + 30,
            originX: 'center',
            originY: 'center'
          });
          break;
        case 'arrow':
          // Create an arrow using a path
          shape = new fabric.Path('M -30 0 L 10 0 L 10 -15 L 30 0 L 10 15 L 10 0 Z', {
            ...baseProps,
            fill: textColor,
            stroke: textColor,
            left: centerX,
            top: topY + 30,
            originX: 'center',
            originY: 'center'
          });
          break;
        default:
          return;
      }

      if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
        
        // Update elements list
        setElementsUpdate(prev => prev + 1);
        setIsLeftDrawerOpen(false);
      }
    } catch (error) {
      console.error('Error adding shape to canvas:', error);
    }
  };

  const christmasElements = [
    { name: 'Wreath 1', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" fill="none" stroke="#1f6f3a" stroke-width="8" stroke-dasharray="6 8"/><circle cx="60" cy="60" r="30" fill="none" stroke="#2f855a" stroke-width="4"/></svg>' },
    { name: 'Wreath 2', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="none" stroke="#166534" stroke-width="7"/><circle cx="60" cy="60" r="32" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="4 6"/></svg>' },
    { name: 'Snowflake', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g stroke="#0ea5e9" stroke-width="6" stroke-linecap="round"><line x1="60" y1="10" x2="60" y2="110"/><line x1="10" y1="60" x2="110" y2="60"/><line x1="25" y1="25" x2="95" y2="95"/><line x1="95" y1="25" x2="25" y2="95"/></g></svg>' },
    { name: 'Gift', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="18" y="42" width="84" height="62" rx="6" fill="#ef4444"/><rect x="18" y="42" width="84" height="16" fill="#f59e0b"/><rect x="54" y="42" width="12" height="62" fill="#fde68a"/><path d="M60 42c-7-10-22-8-22 1 0 7 10 10 22 8m0-9c7-10 22-8 22 1 0 7-10 10-22 8" fill="none" stroke="#facc15" stroke-width="5"/></svg>' },
    { name: 'Bell', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M26 78h68l-8-12V49c0-14-11-26-26-26s-26 12-26 26v17z" fill="#facc15"/><circle cx="60" cy="88" r="8" fill="#d97706"/></svg>' },
    { name: 'Candy Cane', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M72 20c14 0 24 10 24 24 0 10-7 18-16 20v32c0 8-6 14-14 14s-14-6-14-14V54" fill="none" stroke="#ef4444" stroke-width="14" stroke-linecap="round"/><path d="M72 20c14 0 24 10 24 24" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="6 8"/></svg>' },
    { name: 'Tree', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><polygon points="60,12 18,84 102,84" fill="#16a34a"/><rect x="52" y="84" width="16" height="24" fill="#92400e"/><circle cx="60" cy="12" r="5" fill="#facc15"/></svg>' },
    { name: 'Bauble', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="52" y="18" width="16" height="10" rx="2" fill="#6b7280"/><circle cx="60" cy="68" r="34" fill="#dc2626"/><path d="M38 62c12-8 32-8 44 0" stroke="#fecaca" stroke-width="6" fill="none"/></svg>' },
  ];

  const brushStrokeElements = [
    { name: 'Brush 1', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M16 90c14-26 27-45 44-64 10 3 20 9 30 19-16 21-36 38-62 45z" fill="#1f2937"/></svg>' },
    { name: 'Brush 2', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M20 24c16 9 33 34 35 64-13 6-27 8-39 7 4-20 5-43 4-71z" fill="#111827"/></svg>' },
    { name: 'Brush 3', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M14 68c20-20 44-31 86-35-9 15-22 40-49 60-18-4-29-11-37-25z" fill="#374151"/></svg>' },
    { name: 'Brush 4', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M10 35c25 2 53 16 86 44-16 9-39 18-71 18-13-16-16-37-15-62z" fill="#111827"/></svg>' },
    { name: 'Brush 5', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M25 18c22 20 37 43 45 80-17 2-34 0-52-7 0-23 2-46 7-73z" fill="#1f2937"/></svg>' },
    { name: 'Brush 6', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M12 84c24-6 54-6 96 2-18 12-44 21-80 20-10-7-14-14-16-22z" fill="#4b5563"/></svg>' },
    { name: 'Brush 7', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M19 16c31 14 56 37 79 74-19 4-39 7-64 4-14-22-19-46-15-78z" fill="#111827"/></svg>' },
    { name: 'Brush 8', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M8 54c34-18 68-23 103-14-18 25-48 49-89 63-11-12-15-28-14-49z" fill="#374151"/></svg>' },
  ];

  const animalEmojis = ['🦜', '🦩', '🐦', '🐘', '🦁', '🐯', '🦊', '🐼', '🐬', '🦋', '🦄', '🐢'];
  const floralElements = [
    { name: 'Rose Flower', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="58" cy="45" r="20" fill="#f472b6"/><circle cx="48" cy="44" r="10" fill="#f9a8d4"/><circle cx="66" cy="42" r="9" fill="#ec4899"/><path d="M58 64v38" stroke="#166534" stroke-width="5"/><ellipse cx="47" cy="78" rx="10" ry="6" fill="#65a30d"/></svg>' },
    { name: 'Yellow Flower', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g fill="#facc15"><ellipse cx="60" cy="32" rx="9" ry="16"/><ellipse cx="60" cy="32" rx="9" ry="16" transform="rotate(60 60 32)"/><ellipse cx="60" cy="32" rx="9" ry="16" transform="rotate(120 60 32)"/></g><circle cx="60" cy="32" r="7" fill="#ca8a04"/><path d="M60 40v62" stroke="#166534" stroke-width="5"/></svg>' },
    { name: 'Floral Branch', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M20 95c30-10 48-29 70-72" stroke="#374151" stroke-width="4" fill="none"/><circle cx="53" cy="54" r="8" fill="#fda4af"/><circle cx="74" cy="35" r="7" fill="#f9a8d4"/><circle cx="38" cy="69" r="7" fill="#fbcfe8"/></svg>' },
    { name: 'Leaf Flower', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 96V34" stroke="#166534" stroke-width="5"/><ellipse cx="60" cy="28" rx="12" ry="8" fill="#22c55e"/><ellipse cx="44" cy="44" rx="12" ry="7" fill="#16a34a" transform="rotate(-25 44 44)"/><ellipse cx="76" cy="50" rx="12" ry="7" fill="#16a34a" transform="rotate(25 76 50)"/></svg>' },
    { name: 'Daisy', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g fill="#f8fafc"><ellipse cx="60" cy="36" rx="6" ry="15"/><ellipse cx="60" cy="36" rx="6" ry="15" transform="rotate(45 60 36)"/><ellipse cx="60" cy="36" rx="6" ry="15" transform="rotate(90 60 36)"/><ellipse cx="60" cy="36" rx="6" ry="15" transform="rotate(135 60 36)"/></g><circle cx="60" cy="36" r="7" fill="#eab308"/><path d="M60 43v58" stroke="#15803d" stroke-width="5"/></svg>' },
    { name: 'Bloom', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g fill="#fb7185"><circle cx="60" cy="30" r="10"/><circle cx="44" cy="40" r="10"/><circle cx="76" cy="40" r="10"/><circle cx="50" cy="24" r="8"/><circle cx="70" cy="24" r="8"/></g><circle cx="60" cy="34" r="6" fill="#fde68a"/><path d="M60 44v56" stroke="#166534" stroke-width="5"/></svg>' },
  ];
  const foodEmojis = ['🌮', '🍟', '🌯', '🍔', '🍕', '🍩', '🥤', '🍜', '🍣', '🍪', '🧁', '🥗'];
  const babyEmojis = ['🌙', '☁️', '🚀', '⭐', '🍼', '🧸', '🐣', '🪁', '🎠', '🧩', '🫧', '🛏️'];
  const kidsEmojis = ['✏️', '🖍️', '📘', '🧒', '🎒', '🎨', '🧩', '⚽', '🎲', '🧠', '🪀', '🎈'];
  const safetyElements = [
    { name: 'No Fire', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#fff" stroke="#dc2626" stroke-width="12"/><path d="M60 28c12 14 8 23 0 32-8-9-12-18 0-32z" fill="#111827"/><line x1="24" y1="96" x2="96" y2="24" stroke="#dc2626" stroke-width="12"/></svg>' },
    { name: 'Warning', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><polygon points="60,10 112,104 8,104" fill="#fde047" stroke="#111827" stroke-width="6"/><rect x="55" y="42" width="10" height="30" fill="#111827"/><circle cx="60" cy="84" r="5" fill="#111827"/></svg>' },
    { name: 'Exit Sign', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="8" y="24" width="104" height="72" rx="6" fill="#15803d"/><text x="18" y="78" font-size="26" fill="#fff" font-family="Arial" font-weight="700">EXIT</text><path d="M72 42h28v36H72z" fill="#f8fafc"/><path d="M22 42h34l-10-9m10 9-10 9" stroke="#f8fafc" stroke-width="6" fill="none" stroke-linecap="round"/></svg>' },
    { name: 'First Aid', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" fill="#0ea5e9"/><rect x="52" y="30" width="16" height="60" fill="#fff"/><rect x="30" y="52" width="60" height="16" fill="#fff"/></svg>' },
    { name: 'No Entry', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#dc2626"/><rect x="24" y="52" width="72" height="16" fill="#fff"/></svg>' },
    { name: 'Alert Circle', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#fef3c7" stroke="#f59e0b" stroke-width="8"/><rect x="55" y="30" width="10" height="40" fill="#b45309"/><circle cx="60" cy="84" r="6" fill="#b45309"/></svg>' },
  ];
  const packagingElements = [
    { name: 'Open Jar 6M', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="60" cy="34" rx="38" ry="12" fill="none" stroke="#111827" stroke-width="4"/><rect x="22" y="36" width="76" height="54" rx="8" fill="none" stroke="#111827" stroke-width="4"/><text x="43" y="76" font-size="20" fill="#111827" font-family="Arial">6M</text></svg>' },
    { name: 'Do Not Tumble Dry', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="18" y="18" width="84" height="84" fill="none" stroke="#111827" stroke-width="5"/><circle cx="60" cy="60" r="20" fill="none" stroke="#111827" stroke-width="5"/><line x1="26" y1="94" x2="94" y2="26" stroke="#111827" stroke-width="6"/></svg>' },
    { name: 'Recycle Leaf', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 22c16 0 30 14 30 30 0 17-13 35-30 46-17-11-30-29-30-46 0-16 14-30 30-30z" fill="none" stroke="#166534" stroke-width="5"/><path d="M60 34v42M46 58h28" stroke="#166534" stroke-width="4"/><path d="M20 72l14-10v20zM100 48l-14 10V38z" fill="#166534"/></svg>' },
    { name: 'Recycling', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M48 22l12 20H36zM92 54l-24 2 12-20zM24 82l12-20 12 20z" fill="#6b7280"/><path d="M60 42l14 24H46zM56 70h28M20 82h28" stroke="#6b7280" stroke-width="5" fill="none"/></svg>' },
    { name: 'Fragile', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="18" y="18" width="84" height="84" fill="none" stroke="#111827" stroke-width="4"/><path d="M60 28v64M44 44l16-16 16 16M44 76l16 16 16-16" stroke="#111827" stroke-width="6" fill="none" stroke-linecap="round"/></svg>' },
    { name: 'Keep Dry', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M24 84h72" stroke="#111827" stroke-width="4"/><path d="M34 84c0-16 11-29 26-29s26 13 26 29" fill="none" stroke="#111827" stroke-width="4"/><path d="M60 24l-8 14h16z" fill="#0ea5e9"/></svg>' },
  ];
  const arrowElements = [
    { name: 'Arrow Right', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M14 60h68l-18-20h22l20 20-20 20H64l18-20H14z" fill="#0f766e"/></svg>' },
    { name: 'Arrow Left', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M106 60H38l18-20H34L14 60l20 20h22L38 60h68z" fill="#0f766e"/></svg>' },
    { name: 'Arrow Up', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 14l20 20H64v72H56V34H40z" fill="#f97316"/></svg>' },
    { name: 'Arrow Down', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 106l-20-20h16V14h8v72h16z" fill="#f97316"/></svg>' },
    { name: 'Chevron Right', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M34 24l36 36-36 36" fill="none" stroke="#14b8a6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    { name: 'Double Arrow', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M16 60h88M76 40l20 20-20 20M44 40l20 20-20 20" fill="none" stroke="#0ea5e9" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  ];
  const frameElements = [
    { name: 'Frame Floral', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="14" y="14" width="92" height="92" fill="none" stroke="#16a34a" stroke-width="3"/><path d="M18 38c10-4 18-12 22-20M102 82c-10 4-18 12-22 20" stroke="#15803d" stroke-width="3" fill="none"/></svg>' },
    { name: 'Frame Thin', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="18" y="18" width="84" height="84" fill="none" stroke="#9ca3af" stroke-width="4"/><rect x="28" y="28" width="64" height="64" fill="none" stroke="#d1d5db" stroke-width="2"/></svg>' },
    { name: 'Frame Stack', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="18" y="24" width="70" height="70" fill="none" stroke="#d1d5db" stroke-width="4"/><rect x="30" y="14" width="70" height="70" fill="none" stroke="#9ca3af" stroke-width="4"/></svg>' },
    { name: 'Frame Rounded', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="16" y="16" width="88" height="88" rx="12" fill="none" stroke="#94a3b8" stroke-width="5"/><rect x="26" y="26" width="68" height="68" rx="8" fill="none" stroke="#cbd5e1" stroke-width="3"/></svg>' },
    { name: 'Frame Badge', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><polygon points="60,10 74,22 92,22 98,40 110,54 102,70 106,88 88,94 74,108 56,100 38,104 28,88 12,78 18,60 10,42 28,32 38,16 56,20" fill="none" stroke="#a855f7" stroke-width="4"/></svg>' },
    { name: 'Frame Circle', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="none" stroke="#10b981" stroke-width="5"/><circle cx="60" cy="60" r="34" fill="none" stroke="#6ee7b7" stroke-width="3"/></svg>' },
  ];
  const toolsElements = [
    { name: 'Paint Roller', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="16" y="24" width="64" height="20" rx="6" fill="#cbd5e1"/><path d="M80 34h12l12 12" stroke="#111827" stroke-width="5" fill="none"/><rect x="90" y="46" width="12" height="44" rx="4" fill="#2563eb"/><rect x="94" y="86" width="18" height="10" rx="3" transform="rotate(35 94 86)" fill="#f97316"/></svg>' },
    { name: 'Tool Set', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="14" y="18" width="92" height="84" rx="8" fill="#fde68a"/><path d="M28 34l10 10M38 34l-10 10" stroke="#6b7280" stroke-width="5"/><circle cx="60" cy="60" r="14" fill="#ef4444"/><circle cx="60" cy="60" r="7" fill="#1d4ed8"/><rect x="76" y="34" width="22" height="10" rx="3" fill="#16a34a"/></svg>' },
    { name: 'Cutter', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M24 84l48-60 24 24-48 60z" fill="#f59e0b"/><rect x="58" y="44" width="20" height="8" fill="#111827"/><circle cx="74" cy="78" r="13" fill="#2563eb"/><circle cx="74" cy="78" r="6" fill="#f8fafc"/></svg>' },
    { name: 'Hammer Wrench', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M20 88l38-38 12 12-38 38z" fill="#f97316"/><path d="M74 20c8 0 14 6 14 14 0 3-1 6-3 8l-8-8-8 8-8-8c2-8 8-14 13-14z" fill="#9ca3af"/><path d="M56 66l20-20 26 26-20 20z" fill="#94a3b8"/></svg>' },
    { name: 'Screwdriver', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="18" y="62" width="56" height="14" rx="7" fill="#2563eb"/><rect x="70" y="64" width="28" height="10" rx="4" fill="#6b7280"/><rect x="96" y="62" width="12" height="14" rx="3" fill="#111827"/></svg>' },
    { name: 'Spanner', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M84 20a18 18 0 0 0-18 18l8 8-24 24-8-8a18 18 0 1 0 6 20l26-26 8 8a18 18 0 1 0 2-44z" fill="#9ca3af"/></svg>' },
  ];
  const signageElements = [
    { name: 'No Entry Hand', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#fff" stroke="#ef4444" stroke-width="9"/><path d="M38 72V54c0-5 8-5 8 0v10h4V50c0-6 8-6 8 0v14h4V52c0-6 8-6 8 0v20z" fill="#111827"/><line x1="25" y1="95" x2="95" y2="25" stroke="#ef4444" stroke-width="10"/></svg>' },
    { name: 'No Person', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#fff" stroke="#ef4444" stroke-width="9"/><circle cx="60" cy="38" r="8" fill="#111827"/><rect x="54" y="48" width="12" height="28" fill="#111827"/><line x1="25" y1="95" x2="95" y2="25" stroke="#ef4444" stroke-width="10"/></svg>' },
    { name: 'No Walking', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#fff" stroke="#ef4444" stroke-width="9"/><circle cx="62" cy="36" r="7" fill="#111827"/><path d="M58 46l10 10-6 10m-4-8-10 10m18 0 10 10" stroke="#111827" stroke-width="6" fill="none" stroke-linecap="round"/><line x1="25" y1="95" x2="95" y2="25" stroke="#ef4444" stroke-width="10"/></svg>' },
    { name: 'No Running', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#fff" stroke="#ef4444" stroke-width="9"/><circle cx="65" cy="34" r="7" fill="#111827"/><path d="M58 46l12 8-6 10m-6-2-10 10m16 0 12 8" stroke="#111827" stroke-width="6" fill="none" stroke-linecap="round"/><line x1="25" y1="95" x2="95" y2="25" stroke="#ef4444" stroke-width="10"/></svg>' },
    { name: 'No Smoking', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#fff" stroke="#ef4444" stroke-width="9"/><rect x="30" y="58" width="48" height="8" fill="#111827"/><rect x="78" y="58" width="10" height="8" fill="#ef4444"/><line x1="25" y1="95" x2="95" y2="25" stroke="#ef4444" stroke-width="10"/></svg>' },
    { name: 'No Phone', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#fff" stroke="#ef4444" stroke-width="9"/><rect x="44" y="32" width="32" height="54" rx="6" fill="none" stroke="#111827" stroke-width="6"/><circle cx="60" cy="78" r="3" fill="#111827"/><line x1="25" y1="95" x2="95" y2="25" stroke="#ef4444" stroke-width="10"/></svg>' },
  ];
  const weddingElements = [
    { name: 'Wedding Cake', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="30" y="72" width="60" height="22" rx="5" fill="#f8fafc" stroke="#111827" stroke-width="3"/><rect x="38" y="50" width="44" height="20" rx="5" fill="#f8fafc" stroke="#111827" stroke-width="3"/><rect x="46" y="32" width="28" height="16" rx="5" fill="#f8fafc" stroke="#111827" stroke-width="3"/><circle cx="60" cy="28" r="4" fill="#f472b6"/></svg>' },
    { name: 'Gift Box', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="24" y="42" width="72" height="54" rx="6" fill="#f8fafc" stroke="#111827" stroke-width="4"/><rect x="56" y="42" width="8" height="54" fill="#111827"/><rect x="24" y="56" width="72" height="8" fill="#111827"/><path d="M60 42c-7-8-16-6-16 0m16 0c7-8 16-6 16 0" stroke="#111827" stroke-width="3" fill="none"/></svg>' },
    { name: 'Microphone', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="46" y="22" width="28" height="42" rx="14" fill="none" stroke="#111827" stroke-width="5"/><path d="M38 58a22 22 0 0 0 44 0M60 80v18M44 98h32" stroke="#111827" stroke-width="5" fill="none" stroke-linecap="round"/></svg>' },
    { name: 'Floral Circle', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="38" fill="none" stroke="#d1d5db" stroke-width="3"/><path d="M22 66c8-16 22-28 38-32M98 66c-8-16-22-28-38-32" stroke="#86efac" stroke-width="3" fill="none"/></svg>' },
    { name: 'Rings', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="50" cy="64" r="20" fill="none" stroke="#111827" stroke-width="5"/><circle cx="72" cy="56" r="20" fill="none" stroke="#9ca3af" stroke-width="5"/></svg>' },
    { name: 'Heart Frame', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 98S18 72 18 45c0-13 10-23 23-23 8 0 15 4 19 10 4-6 11-10 19-10 13 0 23 10 23 23 0 27-42 53-42 53z" fill="none" stroke="#ec4899" stroke-width="5"/></svg>' },
  ];
  const lineElements = [
    { name: 'Solid Line', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><line x1="14" y1="60" x2="106" y2="60" stroke="#111827" stroke-width="5"/></svg>' },
    { name: 'Dashed Line', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><line x1="14" y1="60" x2="106" y2="60" stroke="#6b7280" stroke-width="4" stroke-dasharray="6 6"/></svg>' },
    { name: 'Curly Line', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M14 64c12-16 24-16 36 0s24 16 36 0 24-16 36 0" fill="none" stroke="#6b7280" stroke-width="4"/></svg>' },
    { name: 'Double Line', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><line x1="14" y1="54" x2="106" y2="54" stroke="#111827" stroke-width="3"/><line x1="14" y1="66" x2="106" y2="66" stroke="#111827" stroke-width="3"/></svg>' },
    { name: 'Wave Line', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M14 60c8 0 8-10 16-10s8 10 16 10 8-10 16-10 8 10 16 10 8-10 16-10 8 10 16 10" fill="none" stroke="#475569" stroke-width="4"/></svg>' },
    { name: 'Dotted Line', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><line x1="14" y1="60" x2="106" y2="60" stroke="#6b7280" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 9"/></svg>' },
  ];

  const matchesElementSearch = (label) => {
    const q = elementSearch.trim().toLowerCase();
    if (!q) return true;
    return String(label || '').toLowerCase().includes(q);
  };

  const undo = () => {
    if (historyIndex > 0 && canvas) {
      const newIndex = historyIndex - 1;
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && canvas) {
      const newIndex = historyIndex + 1;
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const exportDesign = async () => {
    if (!canvas) return;

    const waitForRender = () => new Promise((resolve) => setTimeout(resolve, 80));

    const captureCurrentCanvasPage = async () => {
      const currentZoom = canvas.getZoom();
      const currentVpt = canvas.viewportTransform.slice();
      const objects = canvas.getObjects();
      const hiddenObjects = [];

      canvas.setZoom(1);
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      objects.forEach((obj) => {
        if (
          obj.name &&
          (
            obj.name.startsWith('print-area-') ||
            obj.name.startsWith('cut-line-') ||
            obj.name.startsWith('safe-area-') ||
            obj.name.startsWith('drag-metric-')
          )
        ) {
          obj.visible = false;
          hiddenObjects.push(obj);
        }
      });

      const baseImage = canvas.getObjects().find((obj) => obj.name === 'product-base-image');
      if (baseImage) {
        baseImage.set({
          visible: true,
          excludeFromExport: false,
        });
        canvas.sendToBack(baseImage);
      }

      objects.forEach((obj) => {
        if (
          obj.name &&
          !obj.name.startsWith('print-area-') &&
          !obj.name.startsWith('cut-line-') &&
          !obj.name.startsWith('safe-area-') &&
          !obj.name.startsWith('drag-metric-') &&
          obj.name !== 'product-placeholder'
        ) {
          obj.set({
            visible: true,
            excludeFromExport: false,
          });
        }
      });

      canvas.renderAll();
      await waitForRender();

      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
        enableRetinaScaling: true,
      });

      canvas.setZoom(currentZoom);
      canvas.setViewportTransform(currentVpt);
      hiddenObjects.forEach((obj) => {
        obj.visible = true;
      });
      canvas.renderAll();

      return {
        dataURL,
        width: canvas.getWidth(),
        height: canvas.getHeight(),
      };
    };

    const currentSide = activePrintSideRef.current;

    try {
      const { jsPDF } = await import('jspdf');

      if (isDoubleSided) {
        saveCurrentSideDesign(currentSide);
      }

      const sidesToExport = isDoubleSided ? ['front', 'back'] : [currentSide];
      const pages = [];

      for (const side of sidesToExport) {
        if (isDoubleSided && side !== activePrintSideRef.current) {
          await loadSideDesign(side);
          activePrintSideRef.current = side;
          setActivePrintSide(side);
          await waitForRender();
          await renderBackgroundStyle(sideBackgroundsRef.current[side] || { kind: 'solid', color: '#ffffff' });
          await waitForRender();
        } else if (isDoubleSided) {
          await renderBackgroundStyle(sideBackgroundsRef.current[side] || { kind: 'solid', color: '#ffffff' });
          await waitForRender();
        }

        pages.push(await captureCurrentCanvasPage());
      }

      const firstPage = pages[0];
      const pdf = new jsPDF({
        orientation: firstPage.width >= firstPage.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [firstPage.width, firstPage.height],
        compress: true,
      });

      pages.forEach((page, index) => {
        if (index > 0) {
          pdf.addPage(
            [page.width, page.height],
            page.width >= page.height ? 'landscape' : 'portrait'
          );
        }
        pdf.addImage(page.dataURL, 'PNG', 0, 0, page.width, page.height, undefined, 'FAST');
      });

      const formattedDate = new Date().toISOString().slice(0, 10);
      pdf.save(`Artwork_${formattedDate}.pdf`);

      if (isDoubleSided && currentSide !== activePrintSideRef.current) {
        await loadSideDesign(currentSide);
        activePrintSideRef.current = currentSide;
        setActivePrintSide(currentSide);
        await waitForRender();
        await renderBackgroundStyle(sideBackgroundsRef.current[currentSide] || { kind: 'solid', color: '#ffffff' });
      }
    } catch (error) {
      console.error('Error exporting design:', error);
      try { const { toast } = await import('react-toastify'); toast.error('Error exporting design. Please try again.'); } catch(_) {}
    }
  };

  const handleSaveAndDownload = () => {
    if (isAuthenticated() && localStorage.getItem('token')) {
      exportDesign();
      return;
    }
    pendingExportRef.current = true;
    setDesignerAuthOpen(true);
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleOpen3DPreview = async () => {
    if (isDoubleSided) {
      saveCurrentSideDesign(activePrintSideRef.current);
      await Promise.all([
        generateSidePreview('front', sideDesignsRef.current.front || []),
        generateSidePreview('back', sideDesignsRef.current.back || []),
      ]);
    } else {
      saveCurrentSideDesign('front');
      await generateSidePreview('front', sideDesignsRef.current.front || []);
    }

    const initialRotation = isDoubleSided ? -22 : -10;
    previewRotationTargetRef.current = initialRotation;
    setPreviewRotationY(initialRotation);
    setShow3DPreviewModal(true);
  };

  useEffect(() => {
    if (!show3DPreviewModal) return;

    let rafId = null;
    const tick = () => {
      setPreviewRotationY((prev) => {
        const target = previewRotationTargetRef.current;
        const next = prev + (target - prev) * 0.12;
        return Math.abs(target - next) < 0.08 ? target : next;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [show3DPreviewModal]);

  const confirmCancel = () => {
    setShowCancelModal(false);
    const fallbackPath = location.state?.fromPath || '/';
    navigate(savedDraft?.returnPath || fallbackPath);
  };

  const updateSelectedObject = (property, value) => {
    if (!selectedObject || !canvas) return;
    
    selectedObject.set(property, value);
    canvas.renderAll();
  };

  const handleSidebarTabClick = (tab, tool = 'select') => {
    if (tab === 'text') {
      setActiveTool('text');
      setSidebarTab('text');
      addText();
      return;
    }

    setActiveTool(tool);
    setSidebarTab(tab);
    setIsLeftDrawerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-0 flex min-h-0 bg-gray-100 overflow-hidden">
      {/* Left Sidebar (Icon Rail + Panel) */}
      <div className={`flex h-full min-h-0 flex-shrink-0 overflow-hidden transition-all duration-300 ${isLeftDrawerOpen ? 'w-[368px]' : 'w-20'}`}>
        {/* Icon Rail */}
        <div className="w-20 h-full min-h-0 bg-white border-r border-gray-200 py-4 flex flex-col items-center gap-4 overflow-y-auto">
          <button
            onClick={() => handleSidebarTabClick('uploads', 'select')}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Uploads"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sidebarTab === 'uploads' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V3m0 0l3 3m-3-3L9 6" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Uploads</span>
          </button>

          <button
            onClick={() => handleSidebarTabClick('text', 'text')}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Text"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sidebarTab === 'text' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 6v14m8-14v14" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Text</span>
          </button>

          <button
            onClick={() => handleSidebarTabClick('background', 'select')}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Backgrounds"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sidebarTab === 'background' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8M8 13h4M14 13h2M8 17h8" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Bg</span>
          </button>

          <button
            onClick={() => handleSidebarTabClick('qr', 'select')}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="QR code"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sidebarTab === 'qr' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 2v-2h2v2h-2z" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>QR</span>
          </button>

          <button
            onClick={() => handleSidebarTabClick('elements', 'select')}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Elements"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sidebarTab === 'elements' ? 'bg-emerald-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Elements</span>
          </button>
        </div>

        {/* Panel */}
        {isLeftDrawerOpen && (
        <div className="w-72 h-full min-h-0 bg-white shadow-lg p-4 flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-between mb-5 flex-shrink-0">
            <h3 className="font-bold text-gray-900">
              {sidebarTab === 'uploads' ? 'Uploads' : sidebarTab === 'text' ? 'Text' : sidebarTab === 'elements' ? 'Elements' : sidebarTab === 'background' ? 'Backgrounds' : 'QR Code'}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSidebarTab('text')}
                className="text-xs px-2 py-1 rounded hover:bg-gray-100 text-gray-600"
                title="Reset panel"
              >
                Reset
              </button>
              <button
                onClick={() => setIsLeftDrawerOpen(false)}
                className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-600 flex items-center justify-center"
                title="Close panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1">
          {/* Elements Library */}
          {sidebarTab === 'elements' && (
            <div className="space-y-6">
              {iconifyCategories.map((category) => {
                const query = categoryQueries[category.id] ?? category.defaultQuery;
                const icons = iconResultsByCategory[category.id] || [];
                const isLoading = iconLoadingByCategory[category.id];
                const error = iconErrorByCategory[category.id];
                const visibleIcons = (showAllByCategory[category.id] ? icons : icons.slice(0, 8));

                return (
                  <div key={category.id}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{category.label}</h4>
                      <button
                        onClick={() => toggleShowAllForCategory(category.id)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        {showAllByCategory[category.id] ? 'Show less' : 'View all'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => handleCategoryQueryChange(category.id, e.target.value)}
                      placeholder={`Search ${category.label.toLowerCase()} icons`}
                      className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    />
                    {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                    {isLoading ? (
                      <p className="text-xs text-gray-500 mb-2">Loading icons...</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-3">
                        {visibleIcons.map((iconName) => (
                          <button
                            key={iconName}
                            onClick={() => addIconifyIconToCanvas(iconName)}
                            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center"
                            title={iconName}
                          >
                            <img
                              src={`https://api.iconify.design/${encodeURIComponent(iconName)}.svg?width=28&height=28`}
                              alt={iconName}
                              className="w-7 h-7"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {false && (
                <>
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={elementSearch}
                  onChange={(e) => setElementSearch(e.target.value)}
                  placeholder="Browse our free resources"
                  className="w-full p-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Social Icons */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Socials</h4>
                  <button 
                    onClick={() => setShowAllSocials(!showAllSocials)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllSocials ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Instagram', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><linearGradient id="ig-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f09433"/><stop offset="25%" stop-color="#e6683c"/><stop offset="50%" stop-color="#dc2743"/><stop offset="75%" stop-color="#cc2366"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs><path fill="url(#ig-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' },
                    { name: 'WhatsApp', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' },
                    { name: 'WhatsApp Outline', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' },
                    { name: 'X (Twitter)', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
                    { name: 'Facebook', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
                    { name: 'LinkedIn', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0077B5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' },
                    { name: 'YouTube', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
                    { name: 'TikTok', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>' }
                  ].filter((icon) => matchesElementSearch(icon.name)).slice(0, showAllSocials ? undefined : 4).map((icon, idx) => (
                    <button
                      key={idx}
                      onClick={() => addIconToCanvas(icon.svg, icon.name)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center"
                      title={icon.name}
                    >
                      <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Emojis */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Emojis</h4>
                  <button 
                    onClick={() => setShowAllEmojis(!showAllEmojis)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllEmojis ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {['😇', '😢', '😊', '😮', '❤️', '👍', '🎉', '⭐', '🔥', '💯', '🎊', '✨', '🌟', '💫', '🎈', '🎁']
                    .filter((emoji) => matchesElementSearch(emoji))
                    .slice(0, showAllEmojis ? undefined : 4)
                    .map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => addEmojiToCanvas(emoji)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-2xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contacts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Contacts</h4>
                  <button 
                    onClick={() => setShowAllContacts(!showAllContacts)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllContacts ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Globe', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' },
                    { name: 'Thumbs Up', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>' },
                    { name: 'Email', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' },
                    { name: 'Location', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
                    { name: 'Phone', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' },
                    { name: 'At Symbol', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>' },
                    { name: 'Calendar', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
                    { name: 'Clock', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>' }
                  ].filter((icon) => matchesElementSearch(icon.name)).slice(0, showAllContacts ? undefined : 4).map((icon, idx) => (
                    <button
                      key={idx}
                      onClick={() => addIconToCanvas(icon.svg, icon.name)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center text-gray-700"
                      title={icon.name}
                    >
                      <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Shapes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Shapes</h4>
                  <button 
                    onClick={() => setShowAllShapes(!showAllShapes)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllShapes ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Circle', type: 'circle' },
                    { name: 'Rectangle', type: 'rect' },
                    { name: 'Triangle', type: 'triangle' },
                    { name: 'Line', type: 'line' },
                    { name: 'Ellipse', type: 'ellipse' },
                    { name: 'Polygon', type: 'polygon' },
                    { name: 'Star', type: 'star' },
                    { name: 'Arrow', type: 'arrow' }
                  ].filter((shape) => matchesElementSearch(shape.name)).slice(0, showAllShapes ? undefined : 4).map((shape, idx) => (
                    <button
                      key={idx}
                      onClick={() => addShapeToCanvas(shape.type)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center text-gray-700"
                      title={shape.name}
                    >
                      {shape.type === 'circle' && <div className="w-8 h-8 rounded-full border-2 border-gray-700"></div>}
                      {shape.type === 'rect' && <div className="w-8 h-8 border-2 border-gray-700"></div>}
                      {shape.type === 'triangle' && <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-gray-700"></div>}
                      {shape.type === 'line' && <div className="w-8 h-0.5 bg-gray-700"></div>}
                      {shape.type === 'ellipse' && <div className="w-8 h-5 rounded-full border-2 border-gray-700"></div>}
                      {shape.type === 'polygon' && <div className="w-8 h-8 border-2 border-gray-700 transform rotate-45"></div>}
                      {shape.type === 'star' && <div className="w-8 h-8 text-gray-700 text-xl">★</div>}
                      {shape.type === 'arrow' && <div className="w-8 h-8 text-gray-700 text-xl">→</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Christmas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Christmas</h4>
                  <button
                    onClick={() => setShowAllChristmas(!showAllChristmas)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllChristmas ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {christmasElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllChristmas ? undefined : 4)
                    .map((icon, idx) => (
                      <button
                        key={idx}
                        onClick={() => addIconToCanvas(icon.svg, icon.name)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center"
                        title={icon.name}
                      >
                        <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Brush Strokes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Brush Strokes</h4>
                  <button
                    onClick={() => setShowAllBrushStrokes(!showAllBrushStrokes)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllBrushStrokes ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {brushStrokeElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllBrushStrokes ? undefined : 4)
                    .map((icon, idx) => (
                      <button
                        key={idx}
                        onClick={() => addIconToCanvas(icon.svg, icon.name)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center"
                        title={icon.name}
                      >
                        <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Animals */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Animals</h4>
                  <button
                    onClick={() => setShowAllAnimals(!showAllAnimals)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllAnimals ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {animalEmojis
                    .filter((emoji) => matchesElementSearch(emoji))
                    .slice(0, showAllAnimals ? undefined : 4)
                    .map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => addEmojiToCanvas(emoji)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-2xl"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                </div>
              </div>

              {/* Floral */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Floral</h4>
                  <button onClick={() => setShowAllFloral(!showAllFloral)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllFloral ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {floralElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllFloral ? undefined : 4)
                    .map((icon, idx) => (
                      <button
                        key={idx}
                        onClick={() => addIconToCanvas(icon.svg, icon.name)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center"
                        title={icon.name}
                      >
                        <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Food & Beverage */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Food & Beverage</h4>
                  <button onClick={() => setShowAllFood(!showAllFood)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllFood ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {foodEmojis
                    .filter((emoji) => matchesElementSearch(emoji))
                    .slice(0, showAllFood ? undefined : 4)
                    .map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => addEmojiToCanvas(emoji)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-2xl"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                </div>
              </div>

              {/* Baby */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Baby</h4>
                  <button onClick={() => setShowAllBaby(!showAllBaby)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllBaby ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {babyEmojis
                    .filter((emoji) => matchesElementSearch(emoji))
                    .slice(0, showAllBaby ? undefined : 4)
                    .map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => addEmojiToCanvas(emoji)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-2xl"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                </div>
              </div>

              {/* Kids */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Kids</h4>
                  <button onClick={() => setShowAllKids(!showAllKids)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllKids ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {kidsEmojis
                    .filter((emoji) => matchesElementSearch(emoji))
                    .slice(0, showAllKids ? undefined : 4)
                    .map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => addEmojiToCanvas(emoji)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-2xl"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                </div>
              </div>

              {/* Safety */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Safety</h4>
                  <button onClick={() => setShowAllSafety(!showAllSafety)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllSafety ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {safetyElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllSafety ? undefined : 4)
                    .map((icon, idx) => (
                      <button
                        key={idx}
                        onClick={() => addIconToCanvas(icon.svg, icon.name)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center"
                        title={icon.name}
                      >
                        <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Packaging */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Packaging</h4>
                  <button onClick={() => setShowAllPackaging(!showAllPackaging)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllPackaging ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {packagingElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllPackaging ? undefined : 4)
                    .map((icon, idx) => (
                      <button
                        key={idx}
                        onClick={() => addIconToCanvas(icon.svg, icon.name)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center"
                        title={icon.name}
                      >
                        <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Arrows */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Arrows</h4>
                  <button onClick={() => setShowAllArrows(!showAllArrows)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllArrows ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {arrowElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllArrows ? undefined : 4)
                    .map((icon, idx) => (
                      <button
                        key={idx}
                        onClick={() => addIconToCanvas(icon.svg, icon.name)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center"
                        title={icon.name}
                      >
                        <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Frames */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Frames</h4>
                  <button onClick={() => setShowAllFrames(!showAllFrames)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllFrames ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {frameElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllFrames ? undefined : 4)
                    .map((icon, idx) => (
                      <button
                        key={idx}
                        onClick={() => addIconToCanvas(icon.svg, icon.name)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center"
                        title={icon.name}
                      >
                        <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Tools */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Tools</h4>
                  <button onClick={() => setShowAllTools(!showAllTools)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllTools ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {toolsElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllTools ? undefined : 4)
                    .map((icon, idx) => (
                      <button key={idx} onClick={() => addIconToCanvas(icon.svg, icon.name)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center" title={icon.name}>
                        <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Signage */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Signage</h4>
                  <button onClick={() => setShowAllSignage(!showAllSignage)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllSignage ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {signageElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllSignage ? undefined : 4)
                    .map((icon, idx) => (
                      <button key={idx} onClick={() => addIconToCanvas(icon.svg, icon.name)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center" title={icon.name}>
                        <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Wedding */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Wedding</h4>
                  <button onClick={() => setShowAllWedding(!showAllWedding)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllWedding ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {weddingElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllWedding ? undefined : 4)
                    .map((icon, idx) => (
                      <button key={idx} onClick={() => addIconToCanvas(icon.svg, icon.name)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center" title={icon.name}>
                        <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Lines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Lines</h4>
                  <button onClick={() => setShowAllLines(!showAllLines)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    {showAllLines ? 'Show less' : 'View all'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {lineElements
                    .filter((icon) => matchesElementSearch(icon.name))
                    .slice(0, showAllLines ? undefined : 4)
                    .map((icon, idx) => (
                      <button key={idx} onClick={() => addIconToCanvas(icon.svg, icon.name)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center justify-center" title={icon.name}>
                        <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                      </button>
                    ))}
                </div>
              </div>
                </>
              )}
            </div>
          )}

          {/* Uploads */}
          {sidebarTab === 'uploads' && (
            <div className="space-y-4">
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="w-full p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Upload Image
              </button>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Upload artwork (PNG/JPG). Drag and resize it inside the green print area.
              </p>
            </div>
          )}

          {/* Text */}
          {sidebarTab === 'text' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Text Added
                </p>
                <p className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Click the Text tool to place a new text box on the canvas. Double-click any text on the canvas to type and edit it.
                </p>
              </div>
            </div>
          )}

          {/* Backgrounds */}
          {sidebarTab === 'background' && (
            <div className="space-y-5">
              <div className="flex items-center gap-6 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setBackgroundPanelTab('colour')}
                  className={`pb-3 text-sm font-semibold transition-colors ${
                    backgroundPanelTab === 'colour'
                      ? 'text-emerald-700 border-b-2 border-emerald-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Colour
                </button>
                <button
                  type="button"
                  onClick={() => setBackgroundPanelTab('patterns')}
                  className={`pb-3 text-sm font-semibold transition-colors ${
                    backgroundPanelTab === 'patterns'
                      ? 'text-emerald-700 border-b-2 border-emerald-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Patterns
                </button>
              </div>

              {backgroundPanelTab === 'colour' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    {backgroundColorSwatches.map((color) => {
                      const isTransparent = color === 'transparent';
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => applySolidBackground(color)}
                          className="relative h-11 rounded-lg border border-gray-200 overflow-hidden hover:scale-[1.02] transition-transform"
                          title={isTransparent ? 'Transparent' : color}
                        >
                          {isTransparent ? (
                            <div className="w-full h-full bg-[linear-gradient(45deg,#f8fafc_25%,#e5e7eb_25%,#e5e7eb_50%,#f8fafc_50%,#f8fafc_75%,#e5e7eb_75%,#e5e7eb_100%)] bg-[length:16px_16px]">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-0.5 bg-red-500 rotate-[-45deg]" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full" style={{ backgroundColor: color }} />
                          )}
                        </button>
                      );
                    })}

                    <label className="h-11 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                      <input
                        type="color"
                        value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                        onChange={(e) => applySolidBackground(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-xl text-emerald-700">+</span>
                    </label>
                  </div>

                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Apply a solid colour or transparent background to the full design area.
                  </p>
                </div>
              )}

              {backgroundPanelTab === 'patterns' && (
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={() => applyPatternBackground(customPatternOptions)}
                    className="w-full p-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors font-semibold"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Create Your Pattern
                  </button>

                  <input
                    type="text"
                    value={backgroundPatternQuery}
                    onChange={(e) => setBackgroundPatternQuery(e.target.value)}
                    placeholder="Browse our free resources"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  />

                  <div className="space-y-4">
                    {['Simple', 'Nature', 'Bold', 'Floral'].map((category) => {
                      const visiblePatterns = backgroundPatternPresets.filter((pattern) => {
                        const matchesCategory = pattern.category === category;
                        const query = backgroundPatternQuery.trim().toLowerCase();
                        const matchesQuery =
                          !query ||
                          pattern.name.toLowerCase().includes(query) ||
                          pattern.type.toLowerCase().includes(query) ||
                          pattern.category.toLowerCase().includes(query);
                        return matchesCategory && matchesQuery;
                      });

                      if (!visiblePatterns.length) return null;

                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {category}
                            </h4>
                            <span className="text-xs font-semibold text-emerald-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              View All
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {visiblePatterns.map((pattern) => (
                              <button
                                key={pattern.id}
                                type="button"
                                onClick={() => applyPatternBackground(pattern)}
                                className="text-left"
                                title={pattern.name}
                              >
                                <div
                                  className="h-24 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                  style={{
                                    backgroundImage: `url(${createPatternDataUrl(pattern.type, pattern.foreground, pattern.background)})`,
                                    backgroundRepeat: 'repeat',
                                    backgroundSize: '56px 56px',
                                    backgroundColor: pattern.background,
                                  }}
                                />
                                <p className="mt-1 text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                                  {pattern.name}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Free Background Library
                      </h4>
                      <span className="text-xs font-semibold text-emerald-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        50 Included
                      </span>
                    </div>
                    <p className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      All presets are built-in and free to use with no API cost.
                    </p>

                    {['Floral', 'Nature', 'Geometric', 'Luxury', 'Festive'].map((category) => {
                      const query = backgroundPatternQuery.trim().toLowerCase();
                      const visiblePatterns = freeBackgroundLibrary.filter((pattern) => {
                        const matchesCategory = pattern.category === category;
                        const matchesQuery =
                          !query ||
                          pattern.name.toLowerCase().includes(query) ||
                          pattern.type.toLowerCase().includes(query) ||
                          pattern.category.toLowerCase().includes(query);
                        return matchesCategory && matchesQuery;
                      });

                      if (!visiblePatterns.length) return null;

                      return (
                        <div key={`free-${category}`} className="space-y-2">
                          <h5 className="text-xs font-semibold uppercase tracking-wide text-emerald-800" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            {category}
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            {visiblePatterns.map((pattern) => (
                              <button
                                key={pattern.id}
                                type="button"
                                onClick={() => applyPatternBackground(pattern)}
                                className="text-left"
                                title={`${pattern.name} (Free)`}
                              >
                                <div
                                  className="h-20 rounded-xl border border-emerald-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                  style={{
                                    backgroundImage: `url(${createPatternDataUrl(pattern.type, pattern.foreground, pattern.background)})`,
                                    backgroundRepeat: 'repeat',
                                    backgroundSize: '56px 56px',
                                    backgroundColor: pattern.background,
                                  }}
                                />
                                <p className="mt-1 text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                                  {pattern.name}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Custom Pattern
                    </h4>
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-3 space-y-3">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Upload image
                          </p>
                          <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Use one image as a safe-area background or repeat it as a pattern.
                          </p>
                        </div>
                        <label
                          className="px-3 h-11 rounded-xl bg-emerald-700 text-white cursor-pointer hover:bg-emerald-800 transition-colors inline-flex items-center justify-center gap-2 shadow-sm text-sm font-semibold self-start"
                          title="Upload background image"
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCustomPatternImageUpload}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      {customPatternOptions.imageDataUrl && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setCustomPatternOptions((prev) => ({ ...prev, imageMode: 'single' }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                customPatternOptions.imageMode === 'single'
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                  : 'border-gray-300 bg-white text-gray-700'
                              }`}
                              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                            >
                              Single Image
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomPatternOptions((prev) => ({ ...prev, imageMode: 'repeat' }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                customPatternOptions.imageMode === 'repeat'
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                  : 'border-gray-300 bg-white text-gray-700'
                              }`}
                              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                            >
                              Repeat as Pattern
                            </button>
                          </div>

                          <div
                            className="h-24 rounded-xl border border-gray-200 overflow-hidden"
                            style={{
                              backgroundImage: `url(${customPatternOptions.imageDataUrl})`,
                              backgroundRepeat: customPatternOptions.imageMode === 'repeat' ? 'repeat' : 'no-repeat',
                              backgroundPosition: 'center',
                              backgroundSize: customPatternOptions.imageMode === 'repeat' ? '96px auto' : 'cover',
                              backgroundColor: '#ffffff',
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => applyImageBackground(customPatternOptions.imageDataUrl, customPatternOptions.imageMode)}
                            className="w-full p-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors font-semibold"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            Apply Uploaded Image
                          </button>
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Pattern type
                      </label>
                      <select
                        value={customPatternOptions.type}
                        onChange={(e) => setCustomPatternOptions((prev) => ({ ...prev, type: e.target.value }))}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      >
                        <option value="dots">Dots</option>
                        <option value="stripes">Stripes</option>
                        <option value="grid">Grid</option>
                        <option value="diagonal">Diagonal</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Pattern colour
                        <input
                          type="color"
                          value={customPatternOptions.foreground}
                          onChange={(e) => setCustomPatternOptions((prev) => ({ ...prev, foreground: e.target.value }))}
                          className="mt-1 w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </label>
                      <label className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Base colour
                        <input
                          type="color"
                          value={customPatternOptions.background}
                          onChange={(e) => setCustomPatternOptions((prev) => ({ ...prev, background: e.target.value }))}
                          className="mt-1 w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </label>
                    </div>
                    <div
                      className="h-20 rounded-xl border border-gray-200"
                      style={{
                        backgroundImage: `url(${createPatternDataUrl(
                          customPatternOptions.type,
                          customPatternOptions.foreground,
                          customPatternOptions.background
                        )})`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '56px 56px',
                        backgroundColor: customPatternOptions.background,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => applyPatternBackground(customPatternOptions)}
                      className="w-full p-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-semibold"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      Apply Pattern
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QR Code */}
          {sidebarTab === 'qr' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  QR content
                </label>
                <textarea
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  rows={3}
                  placeholder="Enter URL or text for QR code"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Size: {qrSize}px
                </label>
                <input
                  type="range"
                  min="80"
                  max="260"
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  QR color
                </label>
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-xl cursor-pointer"
                />
              </div>
              <button
                onClick={addQrCode}
                className="w-full p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-semibold"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Add QR Code
              </button>
              <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                The QR code will be placed inside the active print area. You can move and resize it like other elements.
              </p>
            </div>
          )}

          {/* Selected object editor */}
          {selectedObject && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Edit Selected</h4>
                <span className="text-xs text-gray-500">{selectedObject.type}</span>
              </div>

              {isTextObject(selectedObject) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Edit Text Content
                    </label>
                    <textarea
                      value={selectedObject.text || ''}
                      onChange={(e) => {
                        selectedObject.set('text', e.target.value);
                        canvas.renderAll();
                      }}
                      onBlur={() => canvas.renderAll()}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Type your text here..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Double-click on canvas to edit directly</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Font Family
                    </label>
                    <select
                      value={selectedObject.fontFamily || fontFamily}
                      onChange={(e) => {
                        selectedObject.set('fontFamily', e.target.value);
                        canvas.renderAll();
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Lexend Deca">Lexend Deca</option>
                      <option value="Roboto Serif">Roboto Serif</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Font Size: {Math.round(selectedObject.fontSize)}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="120"
                      value={selectedObject.fontSize}
                      onChange={(e) => updateSelectedObject('fontSize', Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>8px</span>
                      <span>120px</span>
                  </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedObject.fill || textColor}
                      onChange={(e) => {
                        selectedObject.set('fill', e.target.value);
                        canvas.renderAll();
                      }}
                      className="w-full h-12 border border-gray-300 rounded-xl cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Line Height: {selectedObject.lineHeight ? selectedObject.lineHeight.toFixed(1) : '1.0'}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={selectedObject.lineHeight || 1}
                      onChange={(e) => updateSelectedObject('lineHeight', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        selectedObject.set('fontWeight', selectedObject.fontWeight === 'bold' ? 'normal' : 'bold');
                        canvas.renderAll();
                      }}
                      className={`p-2 rounded-lg border transition-colors ${
                        selectedObject.fontWeight === 'bold' 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold">Bold</span>
                    </button>
                    <button
                      onClick={() => {
                        selectedObject.set('fontStyle', selectedObject.fontStyle === 'italic' ? 'normal' : 'italic');
                        canvas.renderAll();
                      }}
                      className={`p-2 rounded-lg border transition-colors ${
                        selectedObject.fontStyle === 'italic' 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="italic">Italic</span>
                    </button>
                    <button
                      onClick={() => {
                        selectedObject.set('underline', !selectedObject.underline);
                        canvas.renderAll();
                      }}
                      className={`p-2 rounded-lg border transition-colors ${
                        selectedObject.underline 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="underline">Underline</span>
                    </button>
                    <button
                      onClick={() => {
                        const current = selectedObject.textAlign || 'left';
                        const next = current === 'left' ? 'center' : current === 'center' ? 'right' : 'left';
                        selectedObject.set('textAlign', next);
                        canvas.renderAll();
                      }}
                      className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Align: {selectedObject.textAlign || 'left'}
                    </button>
                  </div>
                </>
              )}

              {/* Image/Object editing */}
              {(selectedObject.type === 'image' || selectedObject.type === 'i-text') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Opacity: {Math.round((selectedObject.opacity || 1) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(selectedObject.opacity || 1) * 100}
                      onChange={(e) => updateSelectedObject('opacity', Number(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (!canvas || !selectedObject) return;
                    const obj = selectedObject;
                    const cloned = obj.clone();
                    cloned.set({
                      left: obj.left + 20,
                      top: obj.top + 20
                    });
                    canvas.add(cloned);
                    canvas.setActiveObject(cloned);
                    canvas.renderAll();
                    setSelectedObject(cloned);
                  }}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Duplicate
                </button>
              <button
                onClick={deleteSelected}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Delete
              </button>
              </div>

              <div className="pt-2 border-t border-gray-300">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Layer Order
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (!canvas || !selectedObject) return;
                      canvas.bringToFront(selectedObject);
                      canvas.renderAll();
                    }}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Bring to Front
                  </button>
                  <button
                    onClick={() => {
                      if (!canvas || !selectedObject) return;
                      canvas.sendToBack(selectedObject);
                      canvas.renderAll();
                    }}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Send to Back
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              <strong>Print Area:</strong> Green dashed boxes indicate where printing will occur. Keep your design inside them.
            </p>
          </div>
          </div>
        </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex min-h-0 flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="bg-white shadow-md p-3 flex items-center justify-between gap-2 flex-shrink-0 overflow-visible">
          {/* Hand tool + Zoom controls + product selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Hand/Pan Tool */}
            <button
              onClick={() => setActiveTool(activeTool === 'pan' ? 'select' : 'pan')}
              className={`w-9 h-9 flex items-center justify-center border rounded-lg transition-colors ${
                activeTool === 'pan' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
              title="Hand Tool (Pan)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </button>

            {/* Zoom controls */}
            <button 
              onClick={() => handleZoom('out')}
              className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="font-semibold text-gray-700 min-w-[60px] text-center text-sm" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              {zoom}%
            </span>
            <button 
              onClick={() => handleZoom('in')}
              className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

          </div>

          {/* Text formatting toolbar */}
          <div className="flex-1 min-w-0 overflow-visible px-2">
            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
            {/* Font family (searchable, previewed) */}
            <div className="relative min-w-[190px] z-[20]" ref={fontPickerRef}>
              <button
                type="button"
                onClick={() => setShowFontPicker((prev) => !prev)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: isTextObject(selectedObject) ? selectedObject.fontFamily || fontFamily : fontFamily }}
              >
                <span className="truncate">{isTextObject(selectedObject) ? selectedObject.fontFamily || fontFamily : fontFamily}</span>
                <svg className="w-4 h-4 text-gray-500 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFontPicker && (
                <div className="absolute z-[25] mt-2 w-[320px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden whitespace-normal">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      value={fontSearch}
                      onChange={(e) => setFontSearch(e.target.value)}
                      placeholder="Search fonts..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredFonts.length > 0 ? (
                      filteredFonts.map((font) => (
                        <button
                          key={font.name}
                          type="button"
                          onClick={() => {
                            handleFontFamilyChange(font.name);
                            setShowFontPicker(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {font.label}
                            </span>
                            <span className="text-xs text-gray-500 leading-tight" style={{ fontFamily: font.name }}>
                              The quick brown fox
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-3 text-sm text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        No fonts found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Font size with +/- */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => changeFontSizeStep(-1)}
                className="px-2 py-1 text-sm hover:bg-gray-100"
              >
                −
              </button>
              <div className="px-3 text-sm border-l border-r border-gray-300 min-w-[60px] text-center">
                {isTextObject(selectedObject) ? Math.round(selectedObject.fontSize) : fontSize}px
              </div>
              <button
                onClick={() => changeFontSizeStep(1)}
                className="px-2 py-1 text-sm hover:bg-gray-100"
              >
                +
              </button>
            </div>

            {/* Styles: Bold, Italic, Underline */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => toggleTextStyle('bold')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.fontWeight === 'bold' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Bold"
              >
                <span className="font-bold">B</span>
              </button>
              <button
                onClick={() => toggleTextStyle('italic')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.fontStyle === 'italic' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Italic"
              >
                <span className="italic">I</span>
              </button>
              <button
                onClick={() => toggleTextStyle('underline')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.underline ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Underline"
              >
                <span className="underline">U</span>
              </button>
            </div>

            {/* Capitalize */}
            <button
              onClick={toggleCapitalization}
              className="flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700"
              title="Capitalize"
            >
              <span className="font-semibold">AG</span>
              <span className="hidden md:inline">Capitalize</span>
            </button>

            {/* Alignment */}
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => setTextAlign('left')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.textAlign === 'left' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Align Left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h12M4 10h8M4 14h12M4 18h8" />
                </svg>
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.textAlign === 'center' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Align Center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12M8 10h8M6 14h12M8 18h8" />
                </svg>
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`w-8 h-8 flex items-center justify-center rounded ${selectedObject?.textAlign === 'right' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Align Right"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h12M10 10h10M8 14h12M10 18h10" />
                </svg>
              </button>
            </div>

              {/* Letter spacing */}
              <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => changeLetterSpacing(-50)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700"
                title="Decrease spacing"
              >
                <span className="text-xs">A−</span>
              </button>
              <button
                onClick={() => changeLetterSpacing(50)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700"
                title="Increase spacing"
              >
                <span className="text-xs">A+</span>
              </button>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0 ml-2">
            <button 
              onClick={handleCancelClick}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm whitespace-nowrap"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm whitespace-nowrap"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Review & Confirm
            </button>
          </div>
        </div>

        {/* Canvas + Side selector */}
        <div className="flex-1 flex min-h-0 bg-gray-200">
          <div className="flex-1 overflow-auto p-2 md:p-3" id="canvas-container">
            <div className="flex items-center justify-center h-full">
              <div className="relative inline-block pt-10 px-4 pb-14" style={{ maxWidth: 'calc(100% - 1rem)', maxHeight: 'calc(100% - 1rem)' }}>
                {/* Reference labels */}
                <div className="absolute -top-1 right-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-gray-700 bg-yellow-300">
                    Cut line
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-gray-700 bg-lime-300">
                    Safe area
                  </span>
                </div>

                {/* Canvas card */}
                <div className="relative bg-white shadow-2xl rounded-lg p-2 inline-block">
                  {/* Left dimension line - fully outside canvas/card */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-6 h-[calc(100%+8px)] flex flex-col items-center justify-center">
                    <div className="w-px flex-1 bg-gray-300" />
                    <div
                      className="py-1 text-gray-400 text-[11px] font-medium whitespace-nowrap leading-none bg-gray-200"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      {displayHeightMm}mm
                    </div>
                    <div className="w-px flex-1 bg-gray-300" />
                  </div>

                  <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />

                  {/* Bottom dimension line - fully outside canvas/card */}
                  <div className="absolute left-0 right-0 top-full mt-4 flex items-center">
                    <div className="h-px flex-1 bg-gray-300" />
                  <div className="px-3 text-gray-400 text-[11px] font-medium whitespace-nowrap" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {displayWidthMm}mm
                    </div>
                    <div className="h-px flex-1 bg-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isDoubleSided && (
            <div className="w-64 bg-white border-l border-gray-200 p-3 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Print Sides
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => handleSideSwitch('front')}
                  disabled={isSwitchingSide}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    activePrintSide === 'front'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${isSwitchingSide ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Front Print</p>
                  <div className="mt-2 h-20 rounded-md border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                    {sidePreviewUrls.front ? (
                      <img src={sidePreviewUrls.front} alt="Front preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[11px] text-gray-400" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>No preview yet</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Design front side artwork</p>
                </button>

                <button
                  onClick={() => handleSideSwitch('back')}
                  disabled={isSwitchingSide}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    activePrintSide === 'back'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${isSwitchingSide ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Back Print</p>
                  <div className="mt-2 h-20 rounded-md border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                    {sidePreviewUrls.back ? (
                      <img src={sidePreviewUrls.back} alt="Back preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[11px] text-gray-400" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>No preview yet</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Design back side artwork</p>
                </button>
              </div>

              <div className="mt-4 p-2 rounded-md bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Currently editing: <span className="font-semibold text-gray-800">{activePrintSide === 'front' ? 'Front Print' : 'Back Print'}</span>
                </p>
                {isSwitchingSide && (
                  <p className="text-[11px] text-emerald-700 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Switching side...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="bg-white shadow-md p-3 flex items-center justify-between flex-shrink-0">
          <div className="text-gray-600 font-medium" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            {isDoubleSided
              ? `Page ${activePrintSide === 'front' ? '1/2' : '2/2'}`
              : 'Page 1/1'}
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
            <button 
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button 
              onClick={handleOpen3DPreview}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
            <button 
              onClick={handleSaveAndDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save & Download
            </button>
          </div>
        </div>
      </div>

      <DesignerAuthModal
        open={designerAuthOpen}
        onClose={() => {
          setDesignerAuthOpen(false);
          pendingExportRef.current = false;
        }}
        onAuthenticated={async () => {
          if (pendingExportRef.current) {
            pendingExportRef.current = false;
            exportDesign();
          }
        }}
        title="Continue to Download"
        subtitle="Please sign in to save and download your design."
        verifyOtpButtonLabel="Verify & Download"
        signInButtonLabel="Sign In & Download"
      />

      {show3DPreviewModal && (
        <div
          className="fixed inset-0 z-[75] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseMove={(event) => {
            const previewContainer = event.currentTarget.querySelector('[data-3d-preview-container]');
            if (!previewContainer) return;
            const rect = previewContainer.getBoundingClientRect();
            const relativeX = event.clientX - rect.left;
            const ratio = (relativeX / Math.max(1, rect.width)) * 2 - 1;
            // Tuned for controlled movement with less cursor travel.
            previewRotationTargetRef.current = Math.max(-155, Math.min(155, ratio * 110));
          }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-[0_25px_60px_-12px_rgba(15,23,42,0.35)] overflow-hidden"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-3d-title"
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 id="preview-3d-title" className="text-base font-semibold text-slate-900">
                  3D Artwork Preview
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  Move your cursor to rotate and inspect the artwork in 3D.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShow3DPreviewModal(false)}
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-4 bg-[radial-gradient(circle_at_center,#ffffff_0%,#f8fafc_58%,#e2e8f0_100%)]">
              <div className="mx-auto flex items-center justify-center min-h-[260px]" style={{ perspective: '2000px' }}>
                <div
                  data-3d-preview-container="true"
                  className="relative"
                  style={{
                    width: 'min(420px, 78vw)',
                    aspectRatio: `${displayWidthMm || 210} / ${displayHeightMm || 148}`,
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(14deg) rotateY(${previewRotationY}deg)`,
                    transition: 'none',
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-[20px] border border-slate-200 bg-white shadow-[0_50px_120px_-28px_rgba(15,23,42,0.35)] overflow-hidden"
                    style={{
                      transform: 'translateZ(16px)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {sidePreviewUrls.front ? (
                      <img src={sidePreviewUrls.front} alt="Front 3D preview" className="w-full h-full object-contain bg-white" style={{ imageRendering: 'auto' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">Front preview unavailable</div>
                    )}
                  </div>

                  {isDoubleSided && (
                    <div
                      className="absolute inset-0 rounded-[20px] border border-slate-200 bg-white shadow-[0_50px_120px_-28px_rgba(15,23,42,0.28)] overflow-hidden"
                      style={{
                        transform: 'rotateY(180deg) translateZ(16px)',
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      {sidePreviewUrls.back ? (
                        <img src={sidePreviewUrls.back} alt="Back 3D preview" className="w-full h-full object-contain bg-white" style={{ imageRendering: 'auto' }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">Back preview unavailable</div>
                      )}
                    </div>
                  )}

                  <div
                    className="absolute top-[6px] bottom-[6px] right-0 w-8 rounded-r-[14px] bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300"
                    style={{
                      transform: 'rotateY(90deg) translateZ(16px)',
                      transformOrigin: 'right center',
                    }}
                  />
                </div>
              </div>
              <div className="mt-2 text-center text-xs text-slate-500">
                Move cursor left or right to rotate the preview.
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)] border border-slate-200 overflow-hidden"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-design-title"
          >
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 id="cancel-design-title" className="text-base font-semibold text-slate-900">
                Leave Designer?
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Your unsaved changes may be lost. Are you sure you want to cancel?
              </p>
            </div>
            <div className="px-5 py-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors text-sm font-semibold"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDesigner;
