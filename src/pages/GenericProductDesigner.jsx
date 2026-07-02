import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';
import { ONLINE_DESIGN_TEMPLATES, TEMPLATE_CATEGORIES } from '../data/onlineDesignTemplates';
import { getRoutePath } from '../config/routes.config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import DesignerAuthModal from '../components/DesignerAuthModal';
import DesignReviewScreen from '../components/DesignReviewScreen';
import RefreshGuardModal, { useRefreshGuard } from '../components/RefreshGuardModal';
import { uploadService } from '../services/uploadService';
import { getProductPrintAreas } from '../config/productPrintAreas';
import { generateTemplateThumbnail } from '../utils/templateThumbnail';
import {
  applyCanvasDisplayZoom,
  extractFillColor,
  fitCanvasToWorkspace,
  getCanvasDisplaySize,
  getCanvasStageAvailSize,
  getTemplateBackgroundObject,
  isTemplateBackgroundObject,
  loadPageOntoCanvas,
  prepareCanvasForInteraction,
  resetCanvasViewport,
  scheduleCanvasOffsetSync,
  syncCanvasPointer,
  syncTemplateBackgroundFill,
  waitForCanvasLayout,
} from '../utils/templateCanvasLoader';
import {
  clearOnlineDesignerAutosave,
  loadOnlineDesignerAutosave,
  saveOnlineDesignerAutosave,
} from '../utils/onlineDesignerStorage';
import {
  hasCompletedOnlineDesignerTour,
  startOnlineDesignerTour,
} from '../utils/onlineDesignerTour';
import {
  DEFAULT_BACKGROUND_STYLE,
  applyCanvasBackgroundFill,
  backgroundColorSwatches,
  backgroundPatternPresets,
  createPatternDataUrl,
  createFabricPattern,
  createImageFillForArea,
  freeBackgroundLibrary,
  renderCanvasBackgroundStyle,
} from '../utils/designerBackground';
import {
  ICONIFY_CATEGORIES,
  fetchIconifySvg,
  getIconifyPreviewUrl,
  iconifySvgToDataUrl,
  searchIconifyIcons,
} from '../utils/designerIconify';

const DESIGN_CANVAS_DPI = 96;
const CANVAS_SIZE_UNITS = ['mm', 'cm', 'in'];

const pixelsToCanvasUnit = (pixels, unit) => {
  const inches = Number(pixels || 0) / DESIGN_CANVAS_DPI;
  if (unit === 'in') return inches;
  if (unit === 'cm') return inches * 2.54;
  return inches * 25.4;
};

const canvasUnitToPixels = (value, unit) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  const inches = unit === 'in' ? numeric : unit === 'cm' ? numeric / 2.54 : numeric / 25.4;
  return Math.max(1, Math.round(inches * DESIGN_CANVAS_DPI));
};

const formatCanvasUnitValue = (value, unit) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '';
  if (unit === 'in') return String(Math.round(numeric * 100) / 100);
  return String(Math.round(numeric * 10) / 10);
};

const emptyPage = (index, size = { width: 800, height: 400 }) => ({
  id: Date.now() + index,
  name: `Page ${index + 1}`,
  width: size.width,
  height: size.height,
  json: null,
  thumbnail: null,
  backgroundStyle: { ...DEFAULT_BACKGROUND_STYLE },
});

const clonePageRecord = (page) => ({
  ...page,
  backgroundStyle: page.backgroundStyle
    ? JSON.parse(JSON.stringify(page.backgroundStyle))
    : { ...DEFAULT_BACKGROUND_STYLE },
  json: page.json ? JSON.parse(JSON.stringify(page.json)) : null,
  thumbnail: page.thumbnail || null,
});

const QUICK_ICONS = [
  { name: 'Instagram', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#feda75"/><stop offset="25%" stop-color="#fa7e1e"/><stop offset="50%" stop-color="#d62976"/><stop offset="75%" stop-color="#962fbf"/><stop offset="100%" stop-color="#4f5bd5"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig)"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="17.2" cy="6.8" r="1.1" fill="#fff"/></svg>' },
  { name: 'WhatsApp', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#25D366" d="M12 2C6.48 2 2 6.26 2 11.34c0 1.86.52 3.64 1.5 5.2L2 22l5.72-1.46A9.7 9.7 0 0012 20.7C17.52 20.7 22 16.44 22 11.34S17.52 2 12 2z"/><path fill="#fff" d="M16.9 14.1c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.36.1-.48.1-.1.24-.26.36-.4.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.86.84-.86 2.04 0 1.2.88 2.36 1 2.52.12.16 1.74 2.66 4.22 3.72.59.26 1.05.42 1.41.54.59.18 1.13.16 1.56.1.48-.08 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/></svg>' },
  { name: 'Facebook', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.5h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.23 2.68.23v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.5h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>' },
  { name: 'Location', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#EF4444" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>' },
];

const QUICK_EMOJIS = ['😇', '😊', '😮', '❤️', '👍', '🎉', '⭐', '🔥', '💯', '✨', '🎁', '🚀'];

const TEXT_COLOR_SWATCHES = [
  '#000000',
  '#ffffff',
  '#111827',
  '#374151',
  '#ef4444',
  '#f59e0b',
  '#eab308',
  '#22c55e',
  '#0f766e',
  '#3b82f6',
  '#5b21d9',
  '#8b5cf6',
  '#ec4899',
  '#f2645d',
];

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const EXPORT_QUALITY_PRESETS = {
  low: { jpegQuality: 0.75, multiplier: 1, label: 'Low (smaller file)' },
  medium: { jpegQuality: 0.85, multiplier: 1.25, label: 'Medium (balanced)' },
  high: { jpegQuality: 0.95, multiplier: 2, label: 'High (best detail)' },
};

const DimensionArrow = ({ direction }) => {
  const paths = {
    up: 'M6 2 L2 6 h8 z',
    down: 'M6 10 L2 6 h8 z',
    left: 'M2 6 L6 2 v8 z',
    right: 'M10 6 L6 2 v8 z',
  };

  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 text-emerald-500" aria-hidden="true">
      <path fill="currentColor" d={paths[direction]} />
    </svg>
  );
};

const CanvasSizeGuides = ({ widthLabel, heightLabel, displayWidth, displayHeight, children }) => {
  const width = Math.max(Math.round(displayWidth), 1);
  const height = Math.max(Math.round(displayHeight), 1);
  const guideOffset = 44;

  return (
    <div className="inline-flex flex-col items-start select-none">
      <div className="flex items-start">
        <div
          className="relative mr-3 flex shrink-0 flex-col items-center justify-between"
          style={{ width: 28, height }}
          aria-hidden="true"
        >
          <DimensionArrow direction="up" />
          <div className="relative my-1 flex flex-1 items-center justify-center">
            <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-emerald-500" />
            <span
              className="relative z-10 rounded-md bg-emerald-50 px-1.5 py-1 text-[10px] font-bold tracking-wide text-emerald-700 ring-1 ring-emerald-200"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {heightLabel}
            </span>
          </div>
          <DimensionArrow direction="down" />
        </div>

        {children}
      </div>

      <div
        className="relative mt-3 flex items-center justify-between"
        style={{ width, marginLeft: guideOffset }}
        aria-hidden="true"
      >
        <DimensionArrow direction="left" />
        <div className="relative mx-1 flex flex-1 items-center justify-center">
          <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-emerald-500" />
          <span className="relative z-10 rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 ring-1 ring-emerald-200">
            {widthLabel}
          </span>
        </div>
        <DimensionArrow direction="right" />
      </div>
    </div>
  );
};

const ToolbarTooltip = ({ title, description, children }) => {
  const child = React.Children.only(children);
  const isDisabled = Boolean(child?.props?.disabled);

  return (
    <div className="group/tt relative inline-flex">
      {isDisabled ? <span className="absolute inset-0 z-10" aria-hidden="true" /> : null}
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-[60] w-max max-w-[260px] -translate-x-1/2 rounded-xl border border-slate-700/60 bg-slate-900 px-3.5 py-2.5 text-left opacity-0 shadow-[0_8px_30px_rgba(15,23,42,0.35)] transition-all duration-200 ease-out translate-y-1 group-hover/tt:translate-y-0 group-hover/tt:opacity-100 group-focus-within/tt:translate-y-0 group-focus-within/tt:opacity-100"
      >
        <p className="text-xs font-semibold text-white">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{description}</p>
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-[6px] border-transparent border-t-slate-900" />
      </div>
    </div>
  );
};

const SIDEBAR_TAB_META = {
  templates: { label: 'Templates', panelTitle: 'Start from a template' },
  insert: { label: 'Insert', panelTitle: 'Insert elements' },
  background: { label: 'Background', panelTitle: 'Backgrounds' },
  elements: { label: 'Elements', panelTitle: 'Icon library' },
  layers: { label: 'Layers', panelTitle: 'Layers' },
  qr: { label: 'QR Code', panelTitle: 'QR Code' },
  pages: { label: 'Pages', panelTitle: 'Page settings' },
  web: { label: 'Photos', panelTitle: 'Stock photos library' },
};

const isTextObject = (obj) => ['text', 'i-text', 'textbox'].includes(obj?.type);

// Quick-pick photo categories shown as chips in the Photos panel.
const PHOTO_CATEGORIES = [
  'Business',
  'Nature',
  'Food',
  'Technology',
  'People',
  'Abstract',
  'Travel',
  'Fashion',
  'Sports',
  'Architecture',
  'Background',
  'Texture',
];

// Openverse aspect_ratio values keyed by our friendly orientation labels.
const PHOTO_ORIENTATIONS = [
  { id: 'all', label: 'All' },
  { id: 'square', label: 'Square' },
  { id: 'tall', label: 'Portrait' },
  { id: 'wide', label: 'Landscape' },
];

const PHOTO_PAGE_SIZE = 30;

const FILLABLE_SHAPE_TYPES = ['rect', 'circle', 'triangle', 'ellipse', 'polygon', 'path'];

const CANVAS_JSON_PROPERTIES = [
  'name',
  'selectable',
  'evented',
  'editable',
  'lockMovementX',
  'lockMovementY',
  'lockScalingX',
  'lockScalingY',
  'lockRotation',
  'hasControls',
  'hasBorders',
  'hoverCursor',
  'objectCaching',
  'opacity',
  'rx',
  'ry',
  'imageFillSrc',
  'shapeFillColor',
  'imageFillZoom',
  'imageFillPanX',
  'imageFillPanY',
];

const exitCanvasTextEditing = (targetCanvas) => {
  if (!targetCanvas) return;
  targetCanvas.getObjects().forEach((obj) => {
    if (obj.isEditing) obj.exitEditing();
  });
};

const WATERMARK_LOGO_SRC = '/logo.png';

const DESIGNER_DRAG_MIME = 'application/x-rspuk-designer';

const startDesignerDrag = (event, payload) => {
  event.dataTransfer.setData(DESIGNER_DRAG_MIME, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = 'copy';
};

const renderSidebarTabIcon = (tabKey) => {
  switch (tabKey) {
    case 'templates':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a2 2 0 012-2h4v6H4V5zM14 3h4a2 2 0 012 2v4h-6V3zM4 13h6v8H6a2 2 0 01-2-2v-6zM14 13h6v6a2 2 0 01-2 2h-4v-8z" />
        </svg>
      );
    case 'insert':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    case 'background':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 9h8M8 13h4M14 13h2M8 17h8" />
        </svg>
      );
    case 'elements':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      );
    case 'layers':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4l9 5-9 5-9-5 9-5zM3 14l9 5 9-5M3 19l9 5 9-5" />
        </svg>
      );
    case 'qr':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth={1.75} d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 2v-2h2v2h-2z" />
        </svg>
      );
    case 'pages':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 6h8M8 10h8M8 14h5M6 4h12a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
        </svg>
      );
    case 'web':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 11h18M12 3c2.5 2.5 3.5 5.5 3.5 8s-1 5.5-3.5 8M12 3c-2.5 2.5-3.5 5.5-3.5 8s1 5.5 3.5 8" />
        </svg>
      );
    default:
      return null;
  }
};

const FONT_OPTIONS = [
  'Lexend Deca',
  'Arial',
  'Helvetica',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Palatino',
  'Courier New',
  'Lucida Console',
  'Monaco',
  'Impact',
  'Comic Sans MS',
  'Montserrat',
  'Roboto',
  'Poppins',
  'Open Sans',
  'Lato',
  'Raleway',
  'Nunito',
  'Merriweather',
  'Playfair Display',
  'Oswald'
];

const resolveProductDoubleSided = (rawValue) => {
  const normalized = String(rawValue || '').trim().toLowerCase();
  if (!normalized) return false;
  if (
    normalized.includes('double') ||
    normalized.includes('both') ||
    normalized === '2' ||
    normalized === 'two'
  ) {
    return true;
  }
  return false;
};

const humanizeProductOptionKey = (key) =>
  String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const GenericProductDesigner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const savedDraft = useSelector((state) => state.designerSession?.productDetailDraft);

  // Product mode: the same engine powers /product-designer, where the design is
  // tied to a specific product and ends in an order (preview + add to cart),
  // while /generic-product-designer stays a free-form Canva-like tool.
  const isProductMode = location.pathname.startsWith('/product-designer');
  const productSearchParams = new URLSearchParams(location.search);
  const productType =
    productSearchParams.get('productType') || location.state?.productType || 'pen';
  const productCategory =
    productSearchParams.get('productCategory') || location.state?.productCategory || null;
  const productOptionParams = (() => {
    const options = {};
    productSearchParams.forEach((value, key) => {
      if (!key.startsWith('option_')) return;
      options[key.slice(7).toLowerCase().replace(/[^a-z0-9]+/g, '_')] = value;
    });
    return options;
  })();
  const sidePrintedParam =
    productSearchParams.get('sidePrinted') ||
    productSearchParams.get('sidesPrinted') ||
    productOptionParams.sides_printed ||
    productOptionParams.side_printed ||
    location.state?.sidesPrinted ||
    '';
  const selectedSizeParam =
    productSearchParams.get('size') || productOptionParams.size || '';
  const isProductDoubleSided = resolveProductDoubleSided(sidePrintedParam);
  const productQuantity = Math.max(
    1,
    Number(productSearchParams.get('quantity') || savedDraft?.quantity || 1),
  );

  const canvasElRef = useRef(null);
  const canvasWorkspaceRef = useRef(null);
  const canvasStageRef = useRef(null);
  const canvasCardWrapperRef = useRef(null);
  // Screen-space pan offset (px) applied on top of the centered artboard.
  // Mutated imperatively (outside React state) so drag/zoom stay silky smooth
  // like a professional design tool (Figma/Canva-style transform panning).
  const panRef = useRef({ x: 0, y: 0 });
  const panSyncRafRef = useRef(null);
  const uploadRef = useRef(null);
  const projectLoadRef = useRef(null);
  const clipboardRef = useRef(null);
  const autosavePromptShownRef = useRef(false);
  const suppressPageLoadRef = useRef(false);
  const isApplyingTemplateRef = useRef(false);
  const pendingTemplateRef = useRef(null);
  const activeTemplateIdRef = useRef(null);
  const historyIndexRef = useRef(-1);
  const canvasHydratingRef = useRef(false);
  const activeToolRef = useRef('select');
  const loadTokenRef = useRef(0);

  const canvasTextEditorRef = useRef(null);
  const queueTextEditorFocusRef = useRef(null);
  const openCanvasTextEditorRef = useRef(() => {});
  const openBackgroundEditorRef = useRef(() => {});
  const openTextStyleEditorRef = useRef(() => {});
  const isCanvasDraggingRef = useRef(false);
  const canvasDropRef = useRef({});
  const sidebarScrollRef = useRef(null);
  const stickySidebarTextRef = useRef(null);
  const shapeImageInputRef = useRef(null);
  const shapeImageCacheRef = useRef(new Map());
  const watermarkLogoRef = useRef(null);
  const shapeImagePanDragRef = useRef(null);
  const isShapeImageAdjustModeRef = useRef(false);
  const enterShapeImageAdjustModeRef = useRef(() => {});
  const exitShapeImageAdjustModeRef = useRef(() => {});
  const skipExitAdjustModeRef = useRef(false);

  const [canvas, setCanvas] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState(isProductMode ? 'insert' : 'templates');
  const [selectedObject, setSelectedObject] = useState(null);
  const [transformDraft, setTransformDraft] = useState({
    x: '0',
    y: '0',
    w: '0',
    h: '0',
    rotation: '0',
  });
  const activeTransformFieldRef = useRef(null);
  const [shapeFillColor, setShapeFillColor] = useState('#3b82f6');
  const [shapeImageZoom, setShapeImageZoom] = useState(1);
  const [isShapeImageAdjustMode, setIsShapeImageAdjustMode] = useState(false);
  const [selectedTextDraft, setSelectedTextDraft] = useState('');
  const [textEditorActive, setTextEditorActive] = useState(false);
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false);
  const [textInput, setTextInput] = useState('Add your text');
  const [textColor, setTextColor] = useState('#111111');
  const [fontSize, setFontSize] = useState(42);
  const [fontFamily, setFontFamily] = useState('Lexend Deca');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundPanelTab, setBackgroundPanelTab] = useState('colour');
  const [backgroundPatternQuery, setBackgroundPatternQuery] = useState('');
  const [backgroundStyle, setBackgroundStyle] = useState({ ...DEFAULT_BACKGROUND_STYLE });
  const [customPatternOptions, setCustomPatternOptions] = useState({
    type: 'dots',
    foreground: '#0f766e',
    background: '#ffffff',
    imageDataUrl: '',
    imageMode: 'single',
  });
  const backgroundImageInputRef = useRef(null);
  const [qrText, setQrText] = useState('');
  const [qrSize, setQrSize] = useState(180);
  const [qrColor, setQrColor] = useState('#111111');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [webAssets, setWebAssets] = useState([]);
  const [webPage, setWebPage] = useState(1);
  const [webHasMore, setWebHasMore] = useState(false);
  const [webLoadingMore, setWebLoadingMore] = useState(false);
  const [webError, setWebError] = useState('');
  const [webOrientation, setWebOrientation] = useState('all');
  const [webActiveCategory, setWebActiveCategory] = useState('');
  const webSearchTokenRef = useRef(0);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [pages, setPages] = useState([emptyPage(0)]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [showAllEmojis, setShowAllEmojis] = useState(false);
  const [showAllShapes, setShowAllShapes] = useState(false);
  const [openInsertSection, setOpenInsertSection] = useState(null);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showAllByCategory, setShowAllByCategory] = useState({});
  const [canvasSizeUnit, setCanvasSizeUnit] = useState('mm');
  const [canvasWidthInput, setCanvasWidthInput] = useState(() =>
    formatCanvasUnitValue(pixelsToCanvasUnit(800, 'mm'), 'mm'),
  );
  const [canvasHeightInput, setCanvasHeightInput] = useState(() =>
    formatCanvasUnitValue(pixelsToCanvasUnit(400, 'mm'), 'mm'),
  );
  const [iconResultsByCategory, setIconResultsByCategory] = useState({});
  const [iconLoadingByCategory, setIconLoadingByCategory] = useState({});
  const [iconErrorByCategory, setIconErrorByCategory] = useState({});
  const [categoryQueries, setCategoryQueries] = useState({});
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(true);
  const [isExportingDesign, setIsExportingDesign] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [activeTool, setActiveTool] = useState('select');
  const [isPanning, setIsPanning] = useState(false);
  const [layerUpdate, setLayerUpdate] = useState(0);
  const [showAutosaveRestore, setShowAutosaveRestore] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [templateThumbnails, setTemplateThumbnails] = useState({});
  const [templateCategory, setTemplateCategory] = useState('All');
  const [templateQuery, setTemplateQuery] = useState('');
  const [applyingTemplateId, setApplyingTemplateId] = useState(null);
  const [templateSwitchModal, setTemplateSwitchModal] = useState({
    open: false,
    templateName: '',
    templatePageCount: 1,
    projectPageCount: 1,
  });
  const [showExitModal, setShowExitModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadModalContext, setDownloadModalContext] = useState(null);
  const [downloadForm, setDownloadForm] = useState({
    format: 'pdf',
    quality: 'high',
    pageScope: 'all',
    transparentBackground: false,
  });
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [designArtworkUrl, setDesignArtworkUrl] = useState('');
  const [designPdfFileName, setDesignPdfFileName] = useState('');
  const [isPreparingOrder, setIsPreparingOrder] = useState(false);
  const [isDownloadingArtwork, setIsDownloadingArtwork] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [designerAuthOpen, setDesignerAuthOpen] = useState(false);
  const [reviewAuthOpen, setReviewAuthOpen] = useState(false);
  const pendingReviewActionRef = useRef(null);
  const productInitDoneRef = useRef(false);
  const [show3DPreviewModal, setShow3DPreviewModal] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewRotationY, setPreviewRotationY] = useState(-22);
  const previewRotationTargetRef = useRef(-22);
  const [sidePreviewUrls, setSidePreviewUrls] = useState({ front: '', back: '' });

  const fontPickerRef = useRef(null);
  const pagesRef = useRef(pages);
  const currentPageIndexRef = useRef(currentPageIndex);
  const backgroundStyleRef = useRef(backgroundStyle);
  const zoomRef = useRef(zoom);
  // True when the user has manually zoomed in/out (so auto-fit shouldn't snap
  // the view back on layout changes). Reset whenever we fit-to-screen.
  const userZoomedRef = useRef(false);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const commitPagesState = (nextPages) => {
    pagesRef.current = nextPages;
    setPages(nextPages);
  };

  const setActivePageIndex = (index) => {
    currentPageIndexRef.current = index;
    setCurrentPageIndex(index);
  };

  const updatePagesFromRef = (updater) => {
    const nextPages = updater(pagesRef.current);
    commitPagesState(nextPages);
    return nextPages;
  };

  useEffect(() => {
    currentPageIndexRef.current = currentPageIndex;
  }, [currentPageIndex]);

  useEffect(() => {
    backgroundStyleRef.current = backgroundStyle;
  }, [backgroundStyle]);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  // Guard against accidental page reloads while there is work on the canvas.
  const refreshGuard = useRefreshGuard({
    enabled: () =>
      (canvas?.getObjects().length || 0) > 0 ||
      pagesRef.current.some((page) => page.json?.objects?.length),
  });

  const refreshCanvas = (targetCanvas = canvas) => {
    if (!targetCanvas) return;
    try {
      targetCanvas.calcOffset();
      targetCanvas.requestRenderAll();
    } catch {
      /* canvas may be mid-dispose */
    }
  };

  const applyTextToObject = (textObj, value) => {
    if (!canvas || !textObj || !isTextObject(textObj)) return;
    exitCanvasTextEditing(canvas);
    textObj.set('text', value);
    if (typeof textObj.initDimensions === 'function') {
      textObj.initDimensions();
    }
    textObj.setCoords();
    canvas.requestRenderAll();
    setLayerUpdate((prev) => prev + 1);
  };

  const handleSelectedTextDraftChange = (value) => {
    setSelectedTextDraft(value);
    if (selectedObject && isTextObject(selectedObject)) {
      applyTextToObject(selectedObject, value);
    }
  };

  const queueCanvasTextEditorFocus = (selectAll = true) => {
    if (isCanvasDraggingRef.current) return;
    if (queueTextEditorFocusRef.current) {
      cancelAnimationFrame(queueTextEditorFocusRef.current);
    }
    queueTextEditorFocusRef.current = requestAnimationFrame(() => {
      queueTextEditorFocusRef.current = requestAnimationFrame(() => {
        if (isCanvasDraggingRef.current) return;
        const el = canvasTextEditorRef.current;
        if (!el) return;
        el.focus();
        if (selectAll) el.select();
      });
    });
  };

  const openCanvasTextEditor = (textObj, { selectAll = true, focusEditor = true } = {}) => {
    if (!textObj || !isTextObject(textObj)) return;
    exitCanvasTextEditing(canvas);
    setTextEditorActive(true);
    setSelectedTextDraft(textObj.text || '');
    setSelectedObject(textObj);
    if (canvas) {
      canvas.setActiveObject(textObj);
      canvas.requestRenderAll();
    }
    if (focusEditor) {
      queueCanvasTextEditorFocus(selectAll);
    }
  };

  openCanvasTextEditorRef.current = openCanvasTextEditor;

  // Serialize a single fabric object, healing the object first if fabric's
  // native toObject() throws (e.g. malformed per-character text styles, which
  // make canvas.toJSON() crash and silently abort a whole page snapshot).
  const serializeObjectSafely = (obj, index) => {
    if (!obj) return null;
    try {
      return obj.toObject(CANVAS_JSON_PROPERTIES);
    } catch (firstError) {
      // Heal the most common offenders (bad text styles / clipPath) and retry.
      let restoreStyles;
      let restoreClip;
      try {
        if (obj.styles && typeof obj.styles === 'object') {
          restoreStyles = obj.styles;
          obj.styles = {};
        }
        if (obj.clipPath) {
          restoreClip = obj.clipPath;
          obj.clipPath = undefined;
        }
        const healed = obj.toObject(CANVAS_JSON_PROPERTIES);
        return healed;
      } catch (secondError) {
        console.warn('[serialize-object]', obj?.type, index, secondError);
        // Last resort: a minimal, always-serializable representation so the
        // object is not lost from the page snapshot.
        const fillColor = typeof obj.fill === 'string' ? obj.fill : undefined;
        return {
          type: obj.type || 'rect',
          left: obj.left ?? 0,
          top: obj.top ?? 0,
          width: obj.width ?? 0,
          height: obj.height ?? 0,
          scaleX: obj.scaleX ?? 1,
          scaleY: obj.scaleY ?? 1,
          angle: obj.angle ?? 0,
          opacity: obj.opacity ?? 1,
          fill: fillColor,
          radius: obj.radius,
          rx: obj.rx,
          ry: obj.ry,
          name: obj.name,
          text: obj.text,
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily,
          fontWeight: obj.fontWeight,
          fontStyle: obj.fontStyle,
          textAlign: obj.textAlign,
          lineHeight: obj.lineHeight,
          charSpacing: obj.charSpacing,
          imageFillSrc: obj.imageFillSrc,
          shapeFillColor: obj.shapeFillColor,
          imageFillZoom: obj.imageFillZoom,
          imageFillPanX: obj.imageFillPanX,
          imageFillPanY: obj.imageFillPanY,
        };
      } finally {
        if (restoreStyles !== undefined) obj.styles = restoreStyles;
        if (restoreClip !== undefined) obj.clipPath = restoreClip;
      }
    }
  };

  // Build a canvas JSON snapshot object-by-object so a single bad object can
  // never wipe the whole snapshot (which previously caused pages to revert).
  const buildCanvasJsonSafely = (targetCanvas) => {
    const objects = targetCanvas
      .getObjects()
      .map((obj, index) => serializeObjectSafely(obj, index))
      .filter(Boolean);

    const json = {
      version: fabric.version,
      objects,
    };

    const bg = targetCanvas.backgroundColor;
    if (bg) {
      if (typeof bg === 'string') {
        json.background = bg;
      } else if (typeof bg.toObject === 'function') {
        try {
          json.background = bg.toObject();
        } catch (bgError) {
          console.warn('[serialize-background]', bgError);
        }
      }
    }

    return json;
  };

  const safeCanvasToJson = (targetCanvas = canvas) => {
    if (!targetCanvas) return null;
    try {
      return targetCanvas.toJSON();
    } catch (error) {
      // Native serialization failed — fall back to the resilient path so the
      // page snapshot still succeeds and edits are not lost on page switch.
      try {
        return buildCanvasJsonSafely(targetCanvas);
      } catch (fallbackError) {
        console.warn('[canvas-to-json-fallback]', fallbackError);
        return null;
      }
    }
  };

  const commitPendingCanvasEdits = () => {
    if (!canvas) return;
    exitCanvasTextEditing(canvas);
    setTextEditorActive(false);
    canvas.calcOffset();
    canvas.requestRenderAll();
  };

  const buildPagesSnapshotFromCanvas = () => syncPageSnapshotAt(currentPageIndexRef.current);

  const syncPageSnapshotAt = (pageIndex = currentPageIndexRef.current, { includeThumbnail = true } = {}) => {
    if (!canvas) return null;

    commitPendingCanvasEdits();

    const snapshotJson = safeCanvasToJson(canvas);
    if (!snapshotJson) return null;

    let clonedJson;
    try {
      clonedJson = JSON.parse(JSON.stringify(snapshotJson));
    } catch (error) {
      console.warn('[page-snapshot-clone]', error);
      return null;
    }

    const snapshotThumb = includeThumbnail ? getCanvasThumbnail() : null;
    const nextBackground = backgroundStyleRef.current
      ? JSON.parse(JSON.stringify(backgroundStyleRef.current))
      : { ...DEFAULT_BACKGROUND_STYLE };

    const updatedPages = pagesRef.current.map((page, idx) => {
      if (idx !== pageIndex) return clonePageRecord(page);
      return {
        ...page,
        json: clonedJson,
        thumbnail: snapshotThumb || page.thumbnail,
        backgroundStyle: nextBackground,
      };
    });

    return updatedPages;
  };

  const buildProjectPagesSnapshot = (activeIndex = currentPageIndexRef.current) => {
    if (!canvas) return pagesRef.current.map(clonePageRecord);

    commitPendingCanvasEdits();

    const activeSnap = safeCanvasToJson(canvas);
    let activeJson = null;
    if (activeSnap) {
      try {
        activeJson = JSON.parse(JSON.stringify(activeSnap));
      } catch (error) {
        console.warn('[project-snapshot-clone]', error);
      }
    }

    const activeThumb = getCanvasThumbnail();
    const nextBackground = backgroundStyleRef.current
      ? JSON.parse(JSON.stringify(backgroundStyleRef.current))
      : { ...DEFAULT_BACKGROUND_STYLE };

    return pagesRef.current.map((page, idx) => {
      const cloned = clonePageRecord(page);
      if (idx !== activeIndex || !activeJson) return cloned;
      return {
        ...cloned,
        json: activeJson,
        thumbnail: activeThumb || cloned.thumbnail,
        backgroundStyle: nextBackground,
      };
    });
  };

  const restoreCanvasViewport = (targetCanvas, zoomLevel, viewportTransform) => {
    if (!targetCanvas) return;
    if (typeof zoomLevel === 'number') {
      targetCanvas.setZoom(zoomLevel);
    }
    if (Array.isArray(viewportTransform) && viewportTransform.length === 6) {
      targetCanvas.setViewportTransform(viewportTransform);
    }
    targetCanvas.calcOffset();
    targetCanvas.requestRenderAll();
  };

  const persistCanvasSnapshot = (pageIndex = currentPageIndexRef.current) => {
    const updatedPages = syncPageSnapshotAt(pageIndex);
    if (!updatedPages) return;

    commitPagesState(updatedPages);

    try {
      const serialized = JSON.stringify(updatedPages[pageIndex]?.json);
      if (serialized) {
        setHistory([serialized]);
        setHistoryIndex(0);
        historyIndexRef.current = 0;
      }
    } catch (error) {
      console.warn('[canvas-history]', error);
    }
  };

  const syncCanvasSizeInputs = (widthPx, heightPx, unit = canvasSizeUnit) => {
    setCanvasWidthInput(formatCanvasUnitValue(pixelsToCanvasUnit(widthPx, unit), unit));
    setCanvasHeightInput(formatCanvasUnitValue(pixelsToCanvasUnit(heightPx, unit), unit));
  };

  // Applies the current pan offset to the canvas card via CSS transform. Kept
  // outside React render so drag/zoom stay perfectly smooth (no re-render per
  // frame) — the same technique professional editors like Figma/Canva use.
  const applyPanTransform = () => {
    const el = canvasCardWrapperRef.current;
    if (!el) return;
    const { x, y } = panRef.current;
    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
  };

  const resetPan = () => {
    panRef.current = { x: 0, y: 0 };
    applyPanTransform();
  };

  // Fabric needs to know the on-screen position of its <canvas> element for hit
  // testing; re-sync it (throttled to one per frame) after every pan/zoom step.
  const requestOffsetSync = () => {
    if (panSyncRafRef.current) return;
    panSyncRafRef.current = requestAnimationFrame(() => {
      panSyncRafRef.current = null;
      if (canvas) syncCanvasPointer(canvas);
    });
  };

  // Zoom while keeping a specific screen point fixed in place (the classic
  // "zoom toward cursor" behaviour). When no anchor point is given, zooms
  // toward the center of the visible stage, so the whole canvas scales in
  // place instead of drifting toward a corner.
  const zoomAnchored = (nextZoomRaw, anchorClientPoint) => {
    if (!canvas) return;
    const nextZoom = Math.max(10, Math.min(300, Math.round(nextZoomRaw)));
    const prevZoom = zoomRef.current || 100;
    if (nextZoom === prevZoom) return;

    const stage = canvasStageRef.current;
    const ratio = nextZoom / prevZoom;

    if (stage) {
      const rect = stage.getBoundingClientRect();
      const stageCenterX = rect.left + rect.width / 2;
      const stageCenterY = rect.top + rect.height / 2;
      const anchor = anchorClientPoint || { x: stageCenterX, y: stageCenterY };
      const offsetX = anchor.x - stageCenterX;
      const offsetY = anchor.y - stageCenterY;
      panRef.current = {
        x: panRef.current.x * ratio + offsetX * (1 - ratio),
        y: panRef.current.y * ratio + offsetY * (1 - ratio),
      };
    }

    userZoomedRef.current = true;
    setZoom(nextZoom);
    applyCanvasDisplayZoom(canvas, nextZoom);
    applyPanTransform();
    scheduleCanvasOffsetSync(canvas);
  };

  // Single source of truth for fitting the artboard fully inside the visible
  // stage. Always measures the real stage element so oversized canvases never
  // require scrolling. Runs across a few animation frames so late layout
  // changes (restore banner, sidebar, fonts) can't leave the canvas oversized.
  const fitCanvasNow = () => {
    const stageEl = canvasStageRef.current || canvasWorkspaceRef.current;
    if (!canvas || !stageEl) return;
    const fittedZoom = fitCanvasToWorkspace(canvas, stageEl);
    userZoomedRef.current = false;
    resetPan();
    setZoom(fittedZoom);
    scheduleCanvasOffsetSync(canvas);
  };

  const fitCanvasStable = () => {
    fitCanvasNow();
    requestAnimationFrame(fitCanvasNow);
    setTimeout(fitCanvasNow, 120);
  };

  const applyCanvasSize = () => {
    if (!canvas) return;
    const width = canvasUnitToPixels(canvasWidthInput, canvasSizeUnit);
    const height = canvasUnitToPixels(canvasHeightInput, canvasSizeUnit);
    if (!width || !height) {
      toast.error('Enter valid width and height.');
      return;
    }

    canvas.setDimensions({ width, height });
    canvas.calcOffset();
    canvas.renderAll();
    updatePagesFromRef((prev) =>
      prev.map((page, idx) =>
        idx === currentPageIndexRef.current ? { ...page, width, height } : page,
      ),
    );
    syncCanvasSizeInputs(width, height);
    fitCanvasStable();
    refreshCanvas();
  };

  const handleCanvasSizeUnitChange = (nextUnit) => {
    if (!CANVAS_SIZE_UNITS.includes(nextUnit)) return;
    setCanvasSizeUnit(nextUnit);
  };

  const finalizeNewObject = (obj) => {
    if (!canvas || !obj) return;
    obj.set({ objectCaching: false });
    obj.setCoords();
    canvas.bringToFront(obj);
    canvas.setActiveObject(obj);
    setSelectedObject(obj);
    refreshCanvas();
    requestAnimationFrame(() => refreshCanvas());
  };

  const isShapeObject = (obj) => {
    if (!obj) return false;
    if (isTextObject(obj)) return false;
    if (obj.type === 'image') return false;
    if (canvas && isTemplateBackgroundObject(obj, canvas)) return false;
    return FILLABLE_SHAPE_TYPES.includes(obj.type);
  };

  // Bake image into shape-sized canvas with cover scaling + user zoom/pan.
  const buildCoverPatternCanvas = (imageEl, targetWidth, targetHeight, { zoom = 1, panX = 0, panY = 0 } = {}) => {
    const width = Math.max(1, Math.round(targetWidth));
    const height = Math.max(1, Math.round(targetHeight));
    const off = document.createElement('canvas');
    off.width = width;
    off.height = height;
    const ctx = off.getContext('2d');
    if (!ctx) return off;

    const imgW = imageEl.naturalWidth || imageEl.width || 1;
    const imgH = imageEl.naturalHeight || imageEl.height || 1;
    const coverScale = Math.max(width / imgW, height / imgH);
    const scale = coverScale * Math.max(1, zoom);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const dx = (width - drawW) / 2 + panX;
    const dy = (height - drawH) / 2 + panY;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(imageEl, dx, dy, drawW, drawH);
    return off;
  };

  const loadShapeImageElement = (imageUrl) =>
    new Promise((resolve, reject) => {
      if (!imageUrl) {
        reject(new Error('Missing image URL'));
        return;
      }
      const cached = shapeImageCacheRef.current.get(imageUrl);
      if (cached?.complete && cached.naturalWidth) {
        resolve(cached);
        return;
      }
      const imageEl = new Image();
      imageEl.crossOrigin = 'anonymous';
      imageEl.onload = () => {
        shapeImageCacheRef.current.set(imageUrl, imageEl);
        resolve(imageEl);
      };
      imageEl.onerror = () => reject(new Error('Could not load image'));
      imageEl.src = imageUrl;
    });

  const renderShapeImageFill = (shapeObj, imageEl) => {
    if (!canvas || !shapeObj || !imageEl) return;
    const shapeWidth = shapeObj.width || shapeObj.getScaledWidth() || 1;
    const shapeHeight = shapeObj.height || shapeObj.getScaledHeight() || 1;
    const zoom = shapeObj.imageFillZoom ?? 1;
    const panX = shapeObj.imageFillPanX ?? 0;
    const panY = shapeObj.imageFillPanY ?? 0;
    const source = buildCoverPatternCanvas(imageEl, shapeWidth, shapeHeight, { zoom, panX, panY });
    const pattern = new fabric.Pattern({ source, repeat: 'no-repeat' });
    shapeObj.set('fill', pattern);
    shapeObj.set('dirty', true);
    shapeObj.setCoords();
    canvas.requestRenderAll();
    setShapeImageZoom(zoom);
    setLayerUpdate((prev) => prev + 1);
  };

  const updateShapeImageTransform = (shapeObj, overrides = {}) => {
    if (!shapeObj?.imageFillSrc) return Promise.resolve();
    const zoom = overrides.zoom ?? shapeObj.imageFillZoom ?? 1;
    const panX = overrides.panX ?? shapeObj.imageFillPanX ?? 0;
    const panY = overrides.panY ?? shapeObj.imageFillPanY ?? 0;
    shapeObj.imageFillZoom = zoom;
    shapeObj.imageFillPanX = panX;
    shapeObj.imageFillPanY = panY;
    setShapeImageZoom(zoom);
    return loadShapeImageElement(shapeObj.imageFillSrc).then((imageEl) => {
      renderShapeImageFill(shapeObj, imageEl);
    });
  };

  const applyImageFillToShape = (shapeObj, imageUrl, { resetTransform = true } = {}) =>
    loadShapeImageElement(imageUrl).then((imageEl) => {
      shapeObj.imageFillSrc = imageEl.src;
      if (resetTransform) {
        shapeObj.imageFillZoom = 1;
        shapeObj.imageFillPanX = 0;
        shapeObj.imageFillPanY = 0;
      }
      renderShapeImageFill(shapeObj, imageEl);
      return shapeObj;
    });

  const rebuildShapeImageFill = (shapeObj) => {
    if (!shapeObj?.imageFillSrc) return;
    updateShapeImageTransform(shapeObj).catch((error) =>
      console.warn('[shape-image-refit]', error),
    );
  };

  const rebuildAllShapeImageFills = (targetCanvas = canvas) => {
    if (!targetCanvas) return;
    targetCanvas.getObjects().forEach((obj) => {
      if (obj?.imageFillSrc && isShapeObject(obj)) {
        rebuildShapeImageFill(obj);
      }
    });
  };

  const resetShapeImageTransform = (shapeObj = selectedObject) => {
    if (!isShapeObject(shapeObj) || !shapeObj.imageFillSrc) return;
    updateShapeImageTransform(shapeObj, { zoom: 1, panX: 0, panY: 0 })
      .then(() => toast.success('Image position reset'))
      .catch(() => toast.error('Could not reset image'));
  };

  const enterShapeImageAdjustMode = (shapeObj = selectedObject) => {
    if (!canvas || !isShapeObject(shapeObj) || !shapeObj.imageFillSrc) return;
    canvas.setActiveObject(shapeObj);
    setSelectedObject(shapeObj);
    shapeObj.set({
      lockMovementX: true,
      lockMovementY: true,
      hasControls: false,
      hasBorders: true,
      borderColor: '#10b981',
    });
    shapeObj.setCoords();
    skipExitAdjustModeRef.current = true;
    setIsShapeImageAdjustMode(true);
    isShapeImageAdjustModeRef.current = true;
    setShapeImageZoom(shapeObj.imageFillZoom ?? 1);
    canvas.defaultCursor = 'grab';
    canvas.hoverCursor = 'grab';
    canvas.requestRenderAll();
  };

  const exitShapeImageAdjustMode = () => {
    if (!canvas) {
      setIsShapeImageAdjustMode(false);
      isShapeImageAdjustModeRef.current = false;
      return;
    }
    const obj = canvas.getActiveObject();
    if (obj && isShapeObject(obj)) {
      obj.set({
        lockMovementX: false,
        lockMovementY: false,
        hasControls: true,
        hasBorders: true,
        borderColor: undefined,
      });
      obj.setCoords();
    }
    setIsShapeImageAdjustMode(false);
    isShapeImageAdjustModeRef.current = false;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
    canvas.requestRenderAll();
    saveHistoryState(canvas);
  };

  enterShapeImageAdjustModeRef.current = enterShapeImageAdjustMode;
  exitShapeImageAdjustModeRef.current = exitShapeImageAdjustMode;

  useEffect(() => {
    isShapeImageAdjustModeRef.current = isShapeImageAdjustMode;
  }, [isShapeImageAdjustMode]);

  const applyShapeFillColor = (color, shapeObj = selectedObject) => {
    if (!canvas || !isShapeObject(shapeObj)) return;
    exitShapeImageAdjustMode();
    shapeObj.set('fill', color);
    shapeObj.imageFillSrc = null;
    shapeObj.imageFillZoom = 1;
    shapeObj.imageFillPanX = 0;
    shapeObj.imageFillPanY = 0;
    shapeObj.shapeFillColor = color;
    shapeObj.set('dirty', true);
    canvas.requestRenderAll();
    setShapeFillColor(color);
    setLayerUpdate((prev) => prev + 1);
  };

  const handleShapeImageFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !isShapeObject(selectedObject)) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = typeof ev.target?.result === 'string' ? ev.target.result : '';
      if (!url) return;
      applyImageFillToShape(selectedObject, url)
        .then(() => {
          toast.success('Image added to shape');
          enterShapeImageAdjustMode(selectedObject);
        })
        .catch(() => toast.error('Could not add image to shape'));
    };
    reader.readAsDataURL(file);
  };

  const triggerShapeImageUpload = () => {
    if (!isShapeObject(selectedObject)) return;
    shapeImageInputRef.current?.click();
  };

  const removeShapeImageFill = () => {
    if (!isShapeObject(selectedObject)) return;
    const fallback = selectedObject.shapeFillColor || textColor || '#3b82f6';
    applyShapeFillColor(fallback, selectedObject);
    toast.success('Image removed from shape');
  };

  const handleShapeImageZoomChange = (value) => {
    const zoom = Number(value);
    if (!selectedObject?.imageFillSrc || !Number.isFinite(zoom)) return;
    setShapeImageZoom(zoom);
    updateShapeImageTransform(selectedObject, { zoom });
  };

  const toggleShapeImageAdjustMode = () => {
    if (isShapeImageAdjustMode) {
      exitShapeImageAdjustMode();
      return;
    }
    enterShapeImageAdjustMode(selectedObject);
  };

  useEffect(() => {
    if (!canvas) return undefined;

    let panRaf = null;

    const handleAdjustMouseDown = (opt) => {
      if (!isShapeImageAdjustModeRef.current) return;
      const obj = canvas.getActiveObject();
      if (!obj?.imageFillSrc || !isShapeObject(obj)) return;
      const pointer = canvas.getPointer(opt.e);
      if (!obj.containsPoint(new fabric.Point(pointer.x, pointer.y))) return;

      if (canvas._currentTransform) {
        canvas._currentTransform = null;
      }

      shapeImagePanDragRef.current = {
        object: obj,
        startPointer: { x: pointer.x, y: pointer.y },
        startPanX: obj.imageFillPanX || 0,
        startPanY: obj.imageFillPanY || 0,
      };
      canvas.setCursor('grabbing');
    };

    const handleAdjustMouseMove = (opt) => {
      const drag = shapeImagePanDragRef.current;
      if (!drag) return;

      const pointer = canvas.getPointer(opt.e);
      const deltaX = pointer.x - drag.startPointer.x;
      const deltaY = pointer.y - drag.startPointer.y;
      const angle = fabric.util.degreesToRadians(drag.object.angle || 0);
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);
      const scaleX = drag.object.scaleX || 1;
      const scaleY = drag.object.scaleY || 1;
      const panX = drag.startPanX + (deltaX * cos - deltaY * sin) / scaleX;
      const panY = drag.startPanY + (deltaX * sin + deltaY * cos) / scaleY;

      if (panRaf) cancelAnimationFrame(panRaf);
      panRaf = requestAnimationFrame(() => {
        loadShapeImageElement(drag.object.imageFillSrc).then((imageEl) => {
          drag.object.imageFillPanX = panX;
          drag.object.imageFillPanY = panY;
          renderShapeImageFill(drag.object, imageEl);
        });
      });
    };

    const handleAdjustMouseUp = () => {
      if (!shapeImagePanDragRef.current) return;
      shapeImagePanDragRef.current = null;
      if (isShapeImageAdjustModeRef.current) {
        canvas.setCursor('grab');
        saveHistoryState(canvas);
      }
    };

    const handleAdjustWheel = (opt) => {
      if (!isShapeImageAdjustModeRef.current) return;
      const obj = canvas.getActiveObject();
      if (!obj?.imageFillSrc) return;
      opt.e.preventDefault();
      opt.e.stopPropagation();
      const delta = opt.e.deltaY > 0 ? -0.08 : 0.08;
      const nextZoom = Math.max(1, Math.min(4, (obj.imageFillZoom || 1) + delta));
      updateShapeImageTransform(obj, { zoom: nextZoom }).then(() => saveHistoryState(canvas));
    };

    canvas.on('mouse:down', handleAdjustMouseDown);
    canvas.on('mouse:move', handleAdjustMouseMove);
    canvas.on('mouse:up', handleAdjustMouseUp);
    canvas.on('mouse:wheel', handleAdjustWheel);

    return () => {
      if (panRaf) cancelAnimationFrame(panRaf);
      canvas.off('mouse:down', handleAdjustMouseDown);
      canvas.off('mouse:move', handleAdjustMouseMove);
      canvas.off('mouse:up', handleAdjustMouseUp);
      canvas.off('mouse:wheel', handleAdjustWheel);
    };
  }, [canvas]);

  const findShapeAtPoint = (point) => {
    if (!canvas || !point) return null;
    const objects = canvas.getObjects();
    for (let i = objects.length - 1; i >= 0; i -= 1) {
      const obj = objects[i];
      if (!isShapeObject(obj)) continue;
      if (obj.visible === false) continue;
      obj.setCoords();
      if (obj.containsPoint(new fabric.Point(point.x, point.y))) {
        return obj;
      }
    }
    return null;
  };

  const currentPage = pages[currentPageIndex];
  const filteredFonts = FONT_OPTIONS.filter((font) =>
    font.toLowerCase().includes((fontSearch || '').toLowerCase())
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

  const getCanvasThumbnail = () => {
    if (!canvas) return null;
    try {
      if (!Array.isArray(canvas.viewportTransform) || canvas.viewportTransform.length < 6) {
        canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
      }
      const width = canvas.getWidth() || 500;
      const height = canvas.getHeight() || 500;
      const maxSide = Math.max(width, height);
      const multiplier = Math.min(1, 180 / maxSide);
      return canvas.toDataURL({
        format: 'png',
        quality: 0.9,
        multiplier,
      });
    } catch {
      return null;
    }
  };


  const saveHistoryState = (targetCanvas) => {
    if (canvasHydratingRef.current) return;
    const json = safeCanvasToJson(targetCanvas);
    if (!json) return;
    const serialized = JSON.stringify(json);
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndexRef.current + 1);
      trimmed.push(serialized);
      return trimmed.slice(-50);
    });
    setHistoryIndex((prev) => {
      const next = Math.min(prev + 1, 49);
      historyIndexRef.current = next;
      return next;
    });
  };

  const saveCurrentPageSnapshot = () => {
    const updatedPages = buildPagesSnapshotFromCanvas();
    if (!updatedPages) return;
    commitPagesState(updatedPages);
  };

  const addPage = () => {
    if (!canvas) return;

    const pageIndex = currentPageIndexRef.current;
    const basePages = syncPageSnapshotAt(pageIndex) ?? buildProjectPagesSnapshot(pageIndex);
    const source = basePages[pageIndex] || basePages[0];
    const newPage = emptyPage(basePages.length, {
      width: source?.width || 800,
      height: source?.height || 400,
    });
    const nextPages = [...basePages, newPage];
    const nextIndex = nextPages.length - 1;

    commitPagesState(nextPages);
    setActivePageIndex(nextIndex);
    loadPage(nextIndex);
    toast.success(`Page ${nextIndex + 1} added`);
  };

  const duplicatePage = () => {
    if (!canvas) return;

    const pageIndex = currentPageIndexRef.current;
    const basePages = syncPageSnapshotAt(pageIndex) ?? buildProjectPagesSnapshot(pageIndex);
    const source = basePages[pageIndex];
    if (!source) return;

    const clone = {
      ...clonePageRecord(source),
      id: Date.now() + Math.random(),
      name: `${source.name} Copy`,
    };
    const nextPages = [...basePages, clone];
    const nextIndex = nextPages.length - 1;

    commitPagesState(nextPages);
    setActivePageIndex(nextIndex);
    loadPage(nextIndex);
    toast.success('Page duplicated');
  };

  const persistBackgroundStyle = (nextStyle) => {
    setBackgroundStyle(nextStyle);
    updatePagesFromRef((prev) =>
      prev.map((page, idx) =>
        idx === currentPageIndexRef.current ? { ...page, backgroundStyle: nextStyle } : page,
      ),
    );
  };

  const applyBackgroundFill = async (fill, nextColor = backgroundColor) => {
    if (!canvas) return;
    syncTemplateBackgroundFill(canvas, fill);
    await applyCanvasBackgroundFill(canvas, fill);
    setBackgroundColor(nextColor);
  };

  const openBackgroundEditor = (bgObject = null) => {
    setIsLeftDrawerOpen(true);
    setActiveTab('background');
    setBackgroundPanelTab('colour');

    const source = bgObject || getTemplateBackgroundObject(canvas);
    if (source) {
      setBackgroundColor(extractFillColor(source.fill));
    } else if (backgroundStyleRef.current?.kind === 'solid') {
      setBackgroundColor(backgroundStyleRef.current.color || '#ffffff');
    }
  };

  openBackgroundEditorRef.current = openBackgroundEditor;

  const applySelectedTextColor = (color, textObj = selectedObject) => {
    setTextColor(color);
    if (!canvas || !textObj || !isTextObject(textObj)) return;
    textObj.set('fill', color);
    textObj.setCoords();
    canvas.requestRenderAll();
    setLayerUpdate((prev) => prev + 1);
    if (!canvasHydratingRef.current) {
      saveHistoryState(canvas);
    }
  };

  const openTextStyleEditor = (textObj = null) => {
    const source = textObj || selectedObject;
    if (source && isTextObject(source)) {
      const fill = typeof source.fill === 'string' ? source.fill : extractFillColor(source.fill);
      setTextColor(fill);
      setFontFamily(source.fontFamily || fontFamily);
      setFontSize(Math.round(source.fontSize || fontSize));
    }
    setIsLeftDrawerOpen(true);
    setActiveTab('insert');
    requestAnimationFrame(() => {
      sidebarScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const focusSidebarTextEditor = () => {
    setIsLeftDrawerOpen(true);
    setActiveTab('insert');
    requestAnimationFrame(() => {
      sidebarScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      requestAnimationFrame(() => {
        stickySidebarTextRef.current?.focus();
        stickySidebarTextRef.current?.select();
      });
    });
  };

  openTextStyleEditorRef.current = openTextStyleEditor;

  const applySolidBackground = async (color) => {
    const nextStyle = { kind: 'solid', color };
    persistBackgroundStyle(nextStyle);
    await applyBackgroundFill(color === 'transparent' ? 'transparent' : color, color);
  };

  const applyPatternBackground = async (patternConfig) => {
    if (!patternConfig) return;
    const nextStyle = { kind: 'pattern', patternConfig };
    persistBackgroundStyle(nextStyle);
    const fabricPattern = createFabricPattern(
      patternConfig.type,
      patternConfig.foreground,
      patternConfig.background,
    );
    if (!fabricPattern) return;
    await applyBackgroundFill(fabricPattern, patternConfig.background);
  };

  const applyImageBackground = async (imageSrc, mode = 'single') => {
    if (!canvas || !imageSrc) return;
    const fill = await createImageFillForArea(canvas.getWidth(), canvas.getHeight(), imageSrc, mode);
    if (!fill) return;
    const nextStyle = { kind: 'image', imageSrc, mode };
    persistBackgroundStyle(nextStyle);
    await applyBackgroundFill(fill, '#ffffff');
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

  const loadPage = async (index) => {
    if (!canvas) return;
    const target = pagesRef.current[index];
    if (!target) return;

    const token = (loadTokenRef.current += 1);
    const pageData = clonePageRecord(target);

    canvasHydratingRef.current = true;
    suppressPageLoadRef.current = true;

    try {
      const pageBackgroundStyle = pageData.backgroundStyle || { ...DEFAULT_BACKGROUND_STYLE };
      setBackgroundStyle(pageBackgroundStyle);
      setBackgroundColor(pageBackgroundStyle.color || '#ffffff');

      await loadPageOntoCanvas(canvas, pageData);
      rebuildAllShapeImageFills(canvas);

      // A newer load started while we awaited — abandon this stale one.
      if (token !== loadTokenRef.current) return;

      setBackgroundColor(
        pageBackgroundStyle.kind === 'solid'
          ? (pageBackgroundStyle.color || '#ffffff')
          : pageBackgroundStyle.patternConfig?.background || '#ffffff',
      );

      const fittedZoom = fitCanvasToWorkspace(canvas, canvasStageRef.current || canvasWorkspaceRef.current);
      resetPan();
      setZoom(fittedZoom);
      await waitForCanvasLayout();
      if (token !== loadTokenRef.current) return;
      prepareCanvasForInteraction(canvas);
      refreshCanvas();
    } finally {
      // Only the most recent load is allowed to clear the guards.
      if (token === loadTokenRef.current) {
        canvasHydratingRef.current = false;
        suppressPageLoadRef.current = false;
        if (canvas) scheduleCanvasOffsetSync(canvas);
      }
    }
  };

  useEffect(() => {
    if (!canvasElRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasElRef.current, {
      width: 800,
      height: 400,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      enableRetinaScaling: false
    });

    const finishCanvasTransform = (targetCanvas, target) => {
      if (!target) return;
      target.setCoords();
      targetCanvas.requestRenderAll();
      targetCanvas.fire('object:modified', { target });
    };

    fabricCanvas.on('selection:created', (e) => {
      if (skipExitAdjustModeRef.current) {
        skipExitAdjustModeRef.current = false;
      } else {
        exitShapeImageAdjustModeRef.current();
      }
      const obj = e.selected?.[0] || null;
      setSelectedObject(obj);
      if (isTemplateBackgroundObject(obj, fabricCanvas)) {
        openBackgroundEditorRef.current(obj);
        return;
      }
      if (isTextObject(obj)) {
        setTextEditorActive(false);
        setSelectedTextDraft(obj.text || '');
        setFontFamily(obj.fontFamily || fontFamily);
        setFontSize(Math.round(obj.fontSize || fontSize));
        setTextColor(typeof obj.fill === 'string' ? obj.fill : extractFillColor(obj.fill));
        openTextStyleEditorRef.current(obj);
      } else if (obj && FILLABLE_SHAPE_TYPES.includes(obj.type)) {
        setShapeFillColor(
          obj.shapeFillColor ||
            (typeof obj.fill === 'string' ? obj.fill : extractFillColor(obj.fill)),
        );
        setShapeImageZoom(obj.imageFillZoom ?? 1);
        if (!obj.imageFillSrc) {
          exitShapeImageAdjustModeRef.current();
        }
      }
    });
    fabricCanvas.on('selection:updated', (e) => {
      if (skipExitAdjustModeRef.current) {
        skipExitAdjustModeRef.current = false;
      } else {
        exitShapeImageAdjustModeRef.current();
      }
      const obj = e.selected?.[0] || null;
      setSelectedObject(obj);
      if (isTemplateBackgroundObject(obj, fabricCanvas)) {
        openBackgroundEditorRef.current(obj);
        return;
      }
      if (isTextObject(obj)) {
        if (!isCanvasDraggingRef.current) {
          setSelectedTextDraft(obj.text || '');
        }
        setFontFamily(obj.fontFamily || fontFamily);
        setFontSize(Math.round(obj.fontSize || fontSize));
        setTextColor(typeof obj.fill === 'string' ? obj.fill : extractFillColor(obj.fill));
        if (!isCanvasDraggingRef.current) {
          openTextStyleEditorRef.current(obj);
        }
      } else if (obj && FILLABLE_SHAPE_TYPES.includes(obj.type)) {
        setShapeFillColor(
          obj.shapeFillColor ||
            (typeof obj.fill === 'string' ? obj.fill : extractFillColor(obj.fill)),
        );
        setShapeImageZoom(obj.imageFillZoom ?? 1);
        if (!obj.imageFillSrc) {
          exitShapeImageAdjustModeRef.current();
        }
      }
    });
    fabricCanvas.on('selection:cleared', () => {
      exitShapeImageAdjustModeRef.current();
      setSelectedObject(null);
      setSelectedTextDraft('');
      setTextEditorActive(false);
    });
    fabricCanvas.on('object:added', () => {
      if (canvasHydratingRef.current) return;
      saveHistoryState(fabricCanvas);
      setLayerUpdate((prev) => prev + 1);
    });
    fabricCanvas.on('object:modified', (e) => {
      isCanvasDraggingRef.current = false;
      if (canvasHydratingRef.current) return;
      if (e.target) {
        e.target.setCoords();
        fabricCanvas.requestRenderAll();
      }
      saveHistoryState(fabricCanvas);
      setLayerUpdate((prev) => prev + 1);
    });
    fabricCanvas.on('object:removed', () => {
      if (canvasHydratingRef.current) return;
      saveHistoryState(fabricCanvas);
      setLayerUpdate((prev) => prev + 1);
    });
    fabricCanvas.on('mouse:down', (opt) => {
      if (activeToolRef.current !== 'select' || canvasHydratingRef.current) return;
      fabricCanvas.calcOffset();
      if (document.activeElement === canvasTextEditorRef.current) {
        canvasTextEditorRef.current.blur();
      }

      const target = opt.target;
      if (!target) {
        const bgObj = getTemplateBackgroundObject(fabricCanvas);
        if (bgObj) {
          fabricCanvas.setActiveObject(bgObj);
          fabricCanvas.requestRenderAll();
          setSelectedObject(bgObj);
        }
        openBackgroundEditorRef.current(bgObj);
        return;
      }
      if (isTemplateBackgroundObject(target, fabricCanvas)) {
        openBackgroundEditorRef.current(target);
        return;
      }
      if (isTextObject(target)) {
        openTextStyleEditorRef.current(target);
      }
    });

    fabricCanvas.on('mouse:dblclick', (e) => {
      const obj = e.target;
      if (obj?.imageFillSrc && FILLABLE_SHAPE_TYPES.includes(obj.type)) {
        enterShapeImageAdjustModeRef.current(obj);
        return;
      }
      if (!isTextObject(obj)) return;
      isCanvasDraggingRef.current = false;
      if (fabricCanvas._currentTransform) {
        fabricCanvas._currentTransform = null;
      }
      openCanvasTextEditorRef.current(obj, { selectAll: true, focusEditor: true });
    });

    fabricCanvas.on('text:editing:entered', (e) => {
      const obj = e.target;
      if (!obj) return;
      obj.exitEditing();
      openCanvasTextEditorRef.current(obj, { selectAll: true, focusEditor: true });
    });

    fabricCanvas.on('text:changed', (e) => {
      if (e.target) setLayerUpdate((prev) => prev + 1);
    });

    fabricCanvas.on('object:moving', () => {
      isCanvasDraggingRef.current = true;
      if (canvasTextEditorRef.current && document.activeElement === canvasTextEditorRef.current) {
        canvasTextEditorRef.current.blur();
      }
    });

    fabricCanvas.on('object:scaling', () => {
      isCanvasDraggingRef.current = true;
    });

    fabricCanvas.on('object:rotating', () => {
      isCanvasDraggingRef.current = true;
    });

    fabricCanvas.on('mouse:up', () => {
      isCanvasDraggingRef.current = false;
    });

    const handleWindowMouseUp = () => {
      const transform = fabricCanvas._currentTransform;
      if (!transform?.target) {
        isCanvasDraggingRef.current = false;
        return;
      }
      const target = transform.target;
      fabricCanvas._currentTransform = null;
      fabricCanvas.setCursor(fabricCanvas.defaultCursor || 'default');
      finishCanvasTransform(fabricCanvas, target);
      isCanvasDraggingRef.current = false;
    };

    window.addEventListener('mouseup', handleWindowMouseUp);

    setCanvas(fabricCanvas);
    saveHistoryState(fabricCanvas);

    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
      try {
        fabricCanvas.dispose();
      } catch (_) {}
    };
  }, []);

  // Load only once when the canvas is (re)created. All other page changes are
  // driven explicitly by goToPage/addPage/applyTemplate so there is a single,
  // deterministic load path (no races between an effect and manual loads).
  useEffect(() => {
    if (!canvas) return undefined;
    loadPage(currentPageIndexRef.current);
    return undefined;
  }, [canvas]);

  // In product mode, seed the pages from the product's print-area size and set
  // up Front/Back sides so the design maps cleanly onto the ordered product.
  useEffect(() => {
    if (!isProductMode || !canvas || productInitDoneRef.current) return;
    productInitDoneRef.current = true;

    const config = getProductPrintAreas(productCategory, productType);
    const dims = config?.dimensions || { width: 800, height: 400 };
    const sideNames = isProductDoubleSided ? ['Front', 'Back'] : ['Front'];
    const productPages = sideNames.map((name, index) => ({
      ...emptyPage(index, { width: dims.width, height: dims.height }),
      name,
    }));

    commitPagesState(productPages);
    setActivePageIndex(0);
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProductMode, canvas]);

  // Smoothly ease the 3D preview toward the cursor-driven target rotation.
  useEffect(() => {
    if (!show3DPreviewModal) return undefined;
    let rafId = null;
    const tick = () => {
      setPreviewRotationY((prev) => {
        const target = previewRotationTargetRef.current;
        const next = prev + (target - prev) * 0.1;
        return Math.abs(target - next) < 0.05 ? target : next;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [show3DPreviewModal]);

  useEffect(() => {
    if (!show3DPreviewModal) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShow3DPreviewModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [show3DPreviewModal]);

  const handlePreviewPointerMove = (event) => {
    const previewContainer = event.currentTarget.querySelector('[data-3d-preview-container]');
    if (!previewContainer) return;
    const rect = previewContainer.getBoundingClientRect();
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const relativeX = clientX - rect.left;
    const ratio = (relativeX / Math.max(1, rect.width)) * 2 - 1;
    previewRotationTargetRef.current = Math.max(-165, Math.min(165, ratio * 125));
  };

  useEffect(() => {
    if (!canvas) return;
    const page = pages[currentPageIndex];
    const widthPx = canvas.getWidth() || page?.width || 800;
    const heightPx = canvas.getHeight() || page?.height || 400;
    syncCanvasSizeInputs(widthPx, heightPx, canvasSizeUnit);
  }, [
    canvas,
    currentPageIndex,
    canvasSizeUnit,
    pages[currentPageIndex]?.width,
    pages[currentPageIndex]?.height,
  ]);

  const switchToPage = (index) => {
    if (index === currentPageIndexRef.current) return;
    if (index < 0 || index >= pagesRef.current.length) return;

    // Save the page we are leaving before we navigate away.
    const currentIndex = currentPageIndexRef.current;
    const updatedPages = syncPageSnapshotAt(currentIndex);
    if (updatedPages) {
      commitPagesState(updatedPages);
    }

    setActivePageIndex(index);
    loadPage(index);
  };

  useEffect(() => {
    if (!canvas) return;

    let timer = null;
    const updateThumb = () => {
      if (
        canvasHydratingRef.current ||
        suppressPageLoadRef.current ||
        isApplyingTemplateRef.current
      ) {
        return;
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (
          canvasHydratingRef.current ||
          suppressPageLoadRef.current ||
          isApplyingTemplateRef.current
        ) {
          return;
        }
        const thumbnail = getCanvasThumbnail();
        const pageIndex = currentPageIndexRef.current;
        if (!thumbnail) return;
        updatePagesFromRef((prev) =>
          prev.map((page, idx) => (idx === pageIndex ? { ...page, thumbnail } : page)),
        );
      }, 120);
    };

    canvas.on('object:added', updateThumb);
    canvas.on('object:modified', updateThumb);
    canvas.on('object:removed', updateThumb);
    updateThumb();

    return () => {
      if (timer) clearTimeout(timer);
      canvas.off('object:added', updateThumb);
      canvas.off('object:modified', updateThumb);
      canvas.off('object:removed', updateThumb);
    };
  }, [canvas, currentPageIndex]);

  useEffect(() => {
    if (!canvas) return undefined;

    const syncLayout = () => {
      if (canvasHydratingRef.current || isCanvasDraggingRef.current) return;
      syncCanvasPointer(canvas);
    };

    syncLayout();
    const t1 = setTimeout(syncLayout, 100);
    const t2 = setTimeout(() => {
      if (canvasHydratingRef.current || isCanvasDraggingRef.current) return;
      if (canvas.getActiveObject()?.isEditing) {
        syncCanvasPointer(canvas);
        return;
      }
      prepareCanvasForInteraction(canvas);
    }, 360);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isLeftDrawerOpen, canvas]);

  useEffect(() => {
    const stage = canvasStageRef.current || canvasWorkspaceRef.current;
    if (!canvas || !stage) return undefined;

    const onStageResize = () => {
      // Keep the artboard on screen when the available area changes (window
      // resize, sidebar/banner toggle) — but never override an intentional
      // manual zoom-in; in that case the user pans with the hand tool.
      if (!userZoomedRef.current) {
        const { width: availW, height: availH } = getCanvasStageAvailSize(stage);
        const displayW = canvas.lowerCanvasEl?.clientWidth || getCanvasDisplaySize(canvas, zoomRef.current).width;
        const displayH = canvas.lowerCanvasEl?.clientHeight || getCanvasDisplaySize(canvas, zoomRef.current).height;

        if (displayW > availW + 1 || displayH > availH + 1) {
          const fittedZoom = fitCanvasToWorkspace(canvas, stage);
          resetPan();
          setZoom(fittedZoom);
        }
      }

      if (!canvasHydratingRef.current && !isCanvasDraggingRef.current) {
        syncCanvasPointer(canvas);
      }
    };

    const ro = new ResizeObserver(onStageResize);
    ro.observe(stage);
    window.addEventListener('resize', onStageResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onStageResize);
    };
  }, [canvas]);

  useEffect(() => {
    if (!canvas?.upperCanvasEl) return undefined;

    const el = canvas.upperCanvasEl;
    const syncOffsetBeforeHitTest = () => {
      try {
        canvas.calcOffset();
      } catch {
        /* canvas may be mid-dispose */
      }
    };

    el.addEventListener('mousedown', syncOffsetBeforeHitTest, { capture: true });
    el.addEventListener('touchstart', syncOffsetBeforeHitTest, { capture: true, passive: true });

    return () => {
      el.removeEventListener('mousedown', syncOffsetBeforeHitTest, { capture: true });
      el.removeEventListener('touchstart', syncOffsetBeforeHitTest, { capture: true });
    };
  }, [canvas]);

  // Hand / pan tool: drag anywhere on the stage to pan the canvas. The pan is a
  // CSS transform applied directly to the canvas card (see applyPanTransform),
  // never a scroll — this is what keeps it smooth and reliable at any zoom.
  useEffect(() => {
    const stage = canvasStageRef.current;
    if (!canvas || !stage) return undefined;

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const beginDrag = (clientX, clientY) => {
      isDragging = true;
      setIsPanning(true);
      lastX = clientX;
      lastY = clientY;
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    };

    const onPointerDown = (event) => {
      if (activeToolRef.current !== 'pan') return;
      const point = event.touches?.[0] ?? event;
      event.preventDefault();
      beginDrag(point.clientX, point.clientY);
    };

    const onPointerMove = (event) => {
      if (!isDragging || activeToolRef.current !== 'pan') return;
      const point = event.touches?.[0] ?? event;
      event.preventDefault();
      const dx = point.clientX - lastX;
      const dy = point.clientY - lastY;
      lastX = point.clientX;
      lastY = point.clientY;
      panRef.current = { x: panRef.current.x + dx, y: panRef.current.y + dy };
      applyPanTransform();
      requestOffsetSync();
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      setIsPanning(false);
      syncCanvasPointer(canvas);
    };

    stage.addEventListener('mousedown', onPointerDown, { capture: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', endDrag);
    stage.addEventListener('touchstart', onPointerDown, { passive: false, capture: true });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', endDrag);

    if (activeTool === 'pan') {
      canvas.selection = false;
    } else {
      prepareCanvasForInteraction(canvas);
    }

    return () => {
      stage.removeEventListener('mousedown', onPointerDown, { capture: true });
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', endDrag);
      stage.removeEventListener('touchstart', onPointerDown, { capture: true });
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', endDrag);
    };
  }, [canvas, activeTool]);

  // Scroll wheel behaves like a professional design tool: plain wheel/trackpad
  // scroll pans the canvas, Ctrl/Cmd + wheel zooms toward the cursor.
  useEffect(() => {
    const stage = canvasStageRef.current;
    if (!canvas || !stage) return undefined;

    const onWheel = (event) => {
      event.preventDefault();

      if (event.ctrlKey || event.metaKey) {
        const prevZoom = zoomRef.current || 100;
        const nextZoom = prevZoom + (event.deltaY > 0 ? -10 : 10);
        zoomAnchored(nextZoom, { x: event.clientX, y: event.clientY });
        return;
      }

      panRef.current = {
        x: panRef.current.x - event.deltaX,
        y: panRef.current.y - event.deltaY,
      };
      applyPanTransform();
      requestOffsetSync();
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [canvas]);

  useEffect(() => {
    if (isProductMode || !canvas || autosavePromptShownRef.current) return;
    const saved = loadOnlineDesignerAutosave();
    if (saved?.pages?.length) {
      setShowAutosaveRestore(true);
      autosavePromptShownRef.current = true;
    }
  }, [canvas, isProductMode]);

  useEffect(() => {
    if (!canvas || isProductMode) return undefined;
    const persistAutosave = () => {
      if (isApplyingTemplateRef.current || suppressPageLoadRef.current || canvasHydratingRef.current) return;
      const activeIndex = currentPageIndexRef.current;
      const canvasJson = safeCanvasToJson(canvas);
      let activeJson = null;
      if (canvasJson) {
        try {
          activeJson = JSON.parse(JSON.stringify(canvasJson));
        } catch (error) {
          console.warn('[autosave-clone]', error);
        }
      }
      const activeBackground = backgroundStyleRef.current
        ? JSON.parse(JSON.stringify(backgroundStyleRef.current))
        : { ...DEFAULT_BACKGROUND_STYLE };
      const updatedPages = pagesRef.current.map((page, idx) => {
        if (idx !== activeIndex) return clonePageRecord(page);
        return {
          ...page,
          json: activeJson ?? page.json,
          backgroundStyle: activeBackground,
        };
      });
      saveOnlineDesignerAutosave({
        pages: updatedPages,
        currentPageIndex: activeIndex,
      });
      setLastSavedAt(Date.now());
    };

    const timer = setInterval(persistAutosave, 12000);
    const handleBeforeUnload = () => persistAutosave();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [canvas, currentPageIndex, isProductMode]);

  useEffect(() => {
    // Only build the (expensive) template previews while the Templates tab is
    // actually visible, and after the canvas has initialised, so opening the
    // designer stays fast and responsive on mobile.
    if (activeTab !== 'templates' || !canvas) return undefined;

    let cancelled = false;

    // Let the browser breathe between each thumbnail render so the main thread
    // never locks up long enough to trigger a "page unresponsive" warning.
    const yieldToBrowser = () =>
      new Promise((resolve) => {
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(() => resolve(), { timeout: 300 });
        } else {
          setTimeout(resolve, 16);
        }
      });

    (async () => {
      // Give the editor a chance to paint before doing heavy preview work.
      await yieldToBrowser();
      for (const template of ONLINE_DESIGN_TEMPLATES) {
        if (cancelled) break;
        if (templateThumbnails[template.id]) continue;
        const dataUrl = await generateTemplateThumbnail(template);
        if (cancelled) break;
        if (dataUrl) {
          setTemplateThumbnails((prev) => ({ ...prev, [template.id]: dataUrl }));
        }
        await yieldToBrowser();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, canvas]);

  useEffect(() => {
    if (hasCompletedOnlineDesignerTour()) return undefined;
    const timer = setTimeout(() => {
      startOnlineDesignerTour({
        onStepPrepare: (step) => {
          if (step === 'open-drawer') setIsLeftDrawerOpen(true);
        },
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const deletePage = () => {
    if (pagesRef.current.length <= 1) return;
    const idx = currentPageIndexRef.current;
    const nextPages = pagesRef.current.filter((_, i) => i !== idx);
    const nextIndex = Math.max(0, idx - 1);
    commitPagesState(nextPages);
    setActivePageIndex(nextIndex);
    loadPage(nextIndex);
  };

  // Zoom the whole canvas around the center of the visible stage, so the
  // artboard scales in/out in place instead of drifting toward a corner.
  const handleZoom = (value) => {
    zoomAnchored(value, null);
  };

  const addText = () => {
    if (!canvas || !textInput.trim()) return;
    const text = new fabric.Textbox(textInput, {
      left: 80,
      top: 80,
      width: 360,
      fontSize,
      fill: textColor,
      fontFamily,
      objectCaching: false,
      editable: false,
    });
    canvas.add(text);
    finalizeNewObject(text);
    openCanvasTextEditor(text, { selectAll: true });
  };

  const addShape = (type, left = 120, top = 120) => {
    if (!canvas) return;
    let obj;
    if (type === 'rect') {
      obj = new fabric.Rect({ left, top, width: 180, height: 120, fill: textColor, rx: 8, ry: 8 });
    } else if (type === 'circle') {
      obj = new fabric.Circle({ left, top, radius: 70, fill: textColor });
    } else if (type === 'triangle') {
      obj = new fabric.Triangle({ left, top, width: 140, height: 130, fill: textColor });
    } else if (type === 'ellipse') {
      obj = new fabric.Ellipse({ left, top, rx: 90, ry: 55, fill: textColor });
    } else if (type === 'polygon') {
      obj = new fabric.Polygon(
        [{ x: 0, y: 30 }, { x: 30, y: 0 }, { x: 70, y: 10 }, { x: 90, y: 45 }, { x: 40, y: 90 }, { x: 0, y: 70 }],
        { left, top, fill: textColor }
      );
    } else if (type === 'star') {
      const points = [];
      const outerRadius = 52;
      const innerRadius = 24;
      for (let i = 0; i < 10; i += 1) {
        const angle = (i * Math.PI) / 5;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
          x: radius * Math.cos(angle - Math.PI / 2),
          y: radius * Math.sin(angle - Math.PI / 2)
        });
      }
      obj = new fabric.Polygon(points, { left, top, fill: textColor, originX: 'center', originY: 'center' });
    } else if (type === 'arrow') {
      obj = new fabric.Path('M -30 0 L 10 0 L 10 -15 L 30 0 L 10 15 L 10 0 Z', {
        left,
        top,
        fill: textColor,
        stroke: textColor
      });
    } else {
      obj = new fabric.Line([0, 0, 220, 0], { left, top, stroke: textColor, strokeWidth: 4 });
    }
    obj.set({ objectCaching: false });
    canvas.add(obj);
    finalizeNewObject(obj);
  };

  const addEmojiToCanvas = (emoji, left = 180, top = 160) => {
    if (!canvas) return;
    const text = new fabric.Text(emoji, {
      left,
      top,
      fontSize: 44,
      selectable: true,
      evented: true,
      objectCaching: false,
    });
    canvas.add(text);
    finalizeNewObject(text);
  };

  const addIconToCanvas = (svgString, name, left = 160, top = 130) => {
    if (!canvas || !svgString) return;

    fabric.Image.fromURL(
      iconifySvgToDataUrl(svgString),
      (img) => {
        if (!img) return;
        const targetSize = 72;
        const scale = targetSize / Math.max(img.width || 24, img.height || 24, 1);
        img.set({
          left,
          top,
          scaleX: scale,
          scaleY: scale,
          name: `icon-${name}`,
          objectCaching: false,
        });
        canvas.add(img);
        finalizeNewObject(img);
      },
      { crossOrigin: 'anonymous' },
    );
  };

  const addIconifyIconToCanvas = async (iconName, left = 160, top = 130) => {
    if (!iconName) return;
    try {
      const svgText = await fetchIconifySvg(iconName);
      addIconToCanvas(svgText, iconName, left, top);
    } catch (error) {
      console.error('Error adding Iconify icon:', error);
      toast.error('Could not add that icon. Please try another.');
    }
  };

  const handleCategoryQueryChange = (categoryId, value) => {
    setCategoryQueries((prev) => ({ ...prev, [categoryId]: value }));
  };

  const toggleShowAllForCategory = (categoryId) => {
    setShowAllByCategory((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  useEffect(() => {
    if (activeTab !== 'elements') return undefined;

    let cancelled = false;
    ICONIFY_CATEGORIES.forEach(async (category) => {
      const query = (categoryQueries[category.id] || category.defaultQuery || '').trim();
      if (!query) {
        if (!cancelled) {
          setIconResultsByCategory((prev) => ({ ...prev, [category.id]: [] }));
        }
        return;
      }

      if (!cancelled) {
        setIconLoadingByCategory((prev) => ({ ...prev, [category.id]: true }));
        setIconErrorByCategory((prev) => ({ ...prev, [category.id]: '' }));
      }

      try {
        const icons = await searchIconifyIcons(query, 64, category.prefix || '');
        if (!cancelled) {
          setIconResultsByCategory((prev) => ({ ...prev, [category.id]: icons }));
        }
      } catch {
        if (!cancelled) {
          setIconErrorByCategory((prev) => ({ ...prev, [category.id]: 'Failed to load icons' }));
        }
      } finally {
        if (!cancelled) {
          setIconLoadingByCategory((prev) => ({ ...prev, [category.id]: false }));
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeTab, categoryQueries]);

  const addQrCode = async () => {
    if (!canvas || !qrText.trim()) return;
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
        if (!img) return;
        img.set({ left: 120, top: 120, name: 'qr-code', objectCaching: false });
        canvas.add(img);
        finalizeNewObject(img);
      });
    } catch (error) {
      console.error('Unable to generate QR code', error);
    }
  };

  const placeImageOnCanvas = (url, left = 100, top = 100) => {
    if (!canvas || !url) return;
    fabric.Image.fromURL(
      url,
      (img) => {
        if (!img) return;
        img.scaleToWidth(300);
        img.set({ left, top, objectCaching: false });
        canvas.add(img);
        finalizeNewObject(img);
      },
      { crossOrigin: 'anonymous' }
    );
  };

  const uploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      placeImageOnCanvas(ev.target?.result, 100, 100);
    };
    reader.readAsDataURL(file);
  };

  const mapPexelsResult = (item) => ({
    id: `px-${item.id}`,
    title: item.alt || item.photographer || 'Photo',
    thumb: item.src?.medium || item.src?.small || item.src?.original,
    url: item.src?.large2x || item.src?.large || item.src?.original,
    creator: item.photographer || '',
    source: 'Pexels',
    license: 'Free to use (Pexels)',
    width: item.width,
    height: item.height,
  });

  const mapOpenverseResult = (item) => ({
    id: `ov-${item.id}`,
    title: item.title || item.creator || 'Photo',
    thumb: item.thumbnail || item.url,
    url: item.url,
    creator: item.creator || '',
    source: item.source || 'Openverse',
    license: item.license || '',
    width: item.width,
    height: item.height,
  });

  const mapWikimediaResult = (item) => ({
    id: `wm-${item.pageid}`,
    title: item.title?.replace(/^File:/, '') || 'Photo',
    thumb: item.imageinfo?.[0]?.thumburl || item.imageinfo?.[0]?.url,
    url: item.imageinfo?.[0]?.url,
    creator: 'Wikimedia Commons',
    source: 'Wikimedia',
    license: 'CC',
    width: item.imageinfo?.[0]?.width,
    height: item.imageinfo?.[0]?.height,
  });

  // Best quality + most reliable when a free Pexels key is configured
  // (set VITE_PEXELS_API_KEY). Falls back to keyless sources otherwise.
  const fetchPexelsPhotos = async (query, page, orientation) => {
    const key = import.meta.env.VITE_PEXELS_API_KEY;
    if (!key) return null;
    try {
      const params = new URLSearchParams({
        query,
        page: String(page),
        per_page: String(PHOTO_PAGE_SIZE),
      });
      const orientationMap = { tall: 'portrait', wide: 'landscape', square: 'square' };
      if (orientationMap[orientation]) params.set('orientation', orientationMap[orientation]);
      const response = await fetch(`https://api.pexels.com/v1/search?${params.toString()}`, {
        headers: { Authorization: key },
      });
      if (!response.ok) return { results: [], hasMore: false };
      const data = await response.json();
      const results = (data?.photos || []).map(mapPexelsResult).filter((item) => item.url);
      return { results, hasMore: Boolean(data?.next_page) };
    } catch (error) {
      console.warn('[pexels]', error);
      return { results: [], hasMore: false };
    }
  };

  const fetchOpenversePhotos = async (query, page, orientation) => {
    try {
      const params = new URLSearchParams({
        q: query,
        page: String(page),
        page_size: String(PHOTO_PAGE_SIZE),
        license_type: 'commercial,modification',
        mature: 'false',
      });
      if (orientation && orientation !== 'all') {
        params.set('aspect_ratio', orientation);
      }
      const response = await fetch(`https://api.openverse.org/v1/images/?${params.toString()}`);
      if (!response.ok) return { results: [], hasMore: false };
      const data = await response.json();
      const results = (data?.results || []).map(mapOpenverseResult).filter((item) => item.url);
      const hasMore = Boolean(data?.page && data?.page_count && data.page < data.page_count);
      return { results, hasMore };
    } catch (error) {
      // Openverse is behind a Cloudflare bot-challenge for anonymous traffic and
      // may throw a CORS/network error — degrade gracefully to the next source.
      console.warn('[openverse]', error);
      return { results: [], hasMore: false };
    }
  };

  const fetchWikimediaPhotos = async (query, page) => {
    try {
      const offset = (page - 1) * PHOTO_PAGE_SIZE;
      const endpoint =
        `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
        `&gsrnamespace=6&gsrsearch=${encodeURIComponent(`${query} filetype:bitmap`)}` +
        `&gsrlimit=${PHOTO_PAGE_SIZE}&gsroffset=${offset}` +
        `&prop=imageinfo&iiprop=url|size&iiurlwidth=500&format=json&origin=*`;
      const response = await fetch(endpoint);
      if (!response.ok) return { results: [], hasMore: false };
      const data = await response.json();
      const pagesData = data?.query?.pages ? Object.values(data.query.pages) : [];
      const results = pagesData
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(mapWikimediaResult)
        .filter((item) => item.url);
      return { results, hasMore: Boolean(data?.continue) };
    } catch (error) {
      console.warn('[wikimedia]', error);
      return { results: [], hasMore: false };
    }
  };

  const searchWebAssets = async ({ page = 1, append = false, queryOverride, orientationOverride } = {}) => {
    const query = (queryOverride ?? searchQuery).trim();
    const orientation = orientationOverride ?? webOrientation;
    if (!query) {
      setWebAssets([]);
      setWebHasMore(false);
      setWebError('');
      return;
    }

    const token = ++webSearchTokenRef.current;
    if (append) {
      setWebLoadingMore(true);
    } else {
      setSearching(true);
      setWebError('');
    }

    try {
      let results = [];
      let hasMore = false;

      // Try sources in order of quality/reliability; each degrades gracefully.
      const pexels = await fetchPexelsPhotos(query, page, orientation);
      if (pexels && pexels.results.length) {
        results = pexels.results;
        hasMore = pexels.hasMore;
      }

      if (!results.length) {
        const openverse = await fetchOpenversePhotos(query, page, orientation);
        results = openverse.results;
        hasMore = openverse.hasMore;
      }

      if (!results.length) {
        const wikimedia = await fetchWikimediaPhotos(query, page);
        results = wikimedia.results;
        hasMore = wikimedia.hasMore;
      }

      if (token !== webSearchTokenRef.current) return;

      setWebAssets((prev) => {
        if (!append) return results;
        const seen = new Set(prev.map((item) => item.url));
        return [...prev, ...results.filter((item) => !seen.has(item.url))];
      });
      setWebPage(page);
      setWebHasMore(hasMore);
      if (!results.length && !append) {
        setWebError(`No photos found for "${query}". Try a different keyword or category.`);
      }
    } catch (error) {
      console.error('Web search failed', error);
      if (token !== webSearchTokenRef.current) return;
      if (!append) {
        setWebAssets([]);
        setWebError('Could not load photos right now. Please check your connection and try again.');
      }
      setWebHasMore(false);
    } finally {
      if (token === webSearchTokenRef.current) {
        setSearching(false);
        setWebLoadingMore(false);
      }
    }
  };

  const loadMoreWebAssets = () => {
    if (searching || webLoadingMore || !webHasMore) return;
    searchWebAssets({ page: webPage + 1, append: true });
  };

  // Debounced live search — types like a professional stock-photo picker.
  useEffect(() => {
    if (activeTab !== 'web') return undefined;
    const query = (webActiveCategory || searchQuery).trim();
    if (!query) return undefined;
    const timer = setTimeout(() => {
      searchWebAssets({
        page: 1,
        append: false,
        queryOverride: query,
        orientationOverride: webOrientation,
      });
    }, webActiveCategory && searchQuery === webActiveCategory ? 0 : 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, webOrientation, webActiveCategory, activeTab]);

  // Show a sensible default gallery the first time the Photos tab is opened.
  useEffect(() => {
    if (activeTab !== 'web' || webAssets.length || searching || searchQuery.trim()) return;
    setWebActiveCategory('Business');
    setSearchQuery('Business');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const addWebAssetToCanvas = (url) => {
    placeImageOnCanvas(url, 140, 140);
  };

  const placeImageOrFillShape = (url, left, top) => {
    if (!canvas || !url) return;
    const targetShape = findShapeAtPoint({ x: left, y: top });
    if (targetShape) {
      canvas.setActiveObject(targetShape);
      setSelectedObject(targetShape);
      applyImageFillToShape(targetShape, url)
        .then(() => {
          toast.success('Image added to shape');
          enterShapeImageAdjustMode(targetShape);
        })
        .catch(() => placeImageOnCanvas(url, left, top));
      return;
    }
    placeImageOnCanvas(url, left, top);
  };

  canvasDropRef.current = {
    placeImageOnCanvas,
    placeImageOrFillShape,
    addShape,
    addEmojiToCanvas,
    addIconToCanvas,
    addIconifyIconToCanvas,
  };

  useEffect(() => {
    if (!canvas) return undefined;

    const isLikelyImageUrl = (value) => {
      if (!value || typeof value !== 'string') return false;
      const trimmed = value.trim();
      if (!/^https?:\/\//i.test(trimmed) && !/^data:image\//i.test(trimmed)) return false;
      return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(trimmed) || /^data:image\//i.test(trimmed);
    };

    const getDropPoint = (e) => {
      canvas.calcOffset();
      return canvas.getPointer(e);
    };

    const handleDragEnter = (e) => {
      e.preventDefault();
      setIsCanvasDragOver(true);
    };

    const handleDragLeave = (e) => {
      if (e.currentTarget === e.target) {
        setIsCanvasDragOver(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      setIsCanvasDragOver(true);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsCanvasDragOver(false);

      const pointer = getDropPoint(e);
      const left = pointer?.x ?? 100;
      const top = pointer?.y ?? 100;
      const actions = canvasDropRef.current;

      const file = e.dataTransfer?.files?.[0];
      if (file && file.type?.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => actions.placeImageOrFillShape?.(ev.target?.result, left, top);
        reader.readAsDataURL(file);
        return;
      }

      const designerPayload = e.dataTransfer?.getData(DESIGNER_DRAG_MIME);
      if (designerPayload) {
        try {
          const payload = JSON.parse(designerPayload);
          if (payload.kind === 'shape') actions.addShape?.(payload.type, left, top);
          else if (payload.kind === 'emoji') actions.addEmojiToCanvas?.(payload.value, left, top);
          else if (payload.kind === 'image') actions.placeImageOrFillShape?.(payload.url, left, top);
          else if (payload.kind === 'icon') actions.addIconifyIconToCanvas?.(payload.name, left, top);
          else if (payload.kind === 'icon-svg') actions.addIconToCanvas?.(payload.svg, payload.name, left, top);
        } catch (error) {
          console.warn('[canvas-drop]', error);
        }
        return;
      }

      const uri = e.dataTransfer?.getData('text/uri-list') || '';
      const text = e.dataTransfer?.getData('text/plain') || '';
      const candidate = (uri || text).trim();
      if (isLikelyImageUrl(candidate)) {
        actions.placeImageOrFillShape?.(candidate, left, top);
      }
    };

    const targets = new Set(
      [
        canvas.upperCanvasEl,
        canvas.lowerCanvasEl,
        canvas.wrapperEl,
        canvasWorkspaceRef.current,
        canvasElRef.current?.parentElement,
      ].filter(Boolean),
    );

    targets.forEach((el) => {
      el.addEventListener('dragenter', handleDragEnter);
      el.addEventListener('dragleave', handleDragLeave);
      el.addEventListener('dragover', handleDragOver);
      el.addEventListener('drop', handleDrop);
    });

    return () => {
      setIsCanvasDragOver(false);
      targets.forEach((el) => {
        el.removeEventListener('dragenter', handleDragEnter);
        el.removeEventListener('dragleave', handleDragLeave);
        el.removeEventListener('dragover', handleDragOver);
        el.removeEventListener('drop', handleDrop);
      });
    };
  }, [canvas]);

  const removeSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects?.length) {
      activeObjects
        .filter((obj) => !isTemplateBackgroundObject(obj, canvas))
        .forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      return;
    }
    const obj = canvas.getActiveObject();
    if (!obj || isTemplateBackgroundObject(obj, canvas)) return;
    canvas.remove(obj);
    canvas.renderAll();
  };

  const undo = () => {
    if (!canvas || historyIndex <= 0) return;
    const next = historyIndex - 1;
    canvas.loadFromJSON(history[next], () => {
      rebuildAllShapeImageFills(canvas);
      canvas.renderAll();
      setHistoryIndex(next);
      setLayerUpdate((prev) => prev + 1);
    });
  };

  const redo = () => {
    if (!canvas || historyIndex >= history.length - 1) return;
    const next = historyIndex + 1;
    canvas.loadFromJSON(history[next], () => {
      rebuildAllShapeImageFills(canvas);
      canvas.renderAll();
      setHistoryIndex(next);
      setLayerUpdate((prev) => prev + 1);
    });
  };

  const duplicateSelected = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.clone((cloned) => {
      cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      setSelectedObject(cloned);
    });
  };

  const copySelected = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.clone((cloned) => {
      clipboardRef.current = cloned;
      toast.info('Copied to clipboard');
    });
  };

  const pasteClipboard = () => {
    if (!canvas || !clipboardRef.current) return;
    clipboardRef.current.clone((cloned) => {
      cloned.set({
        left: (clipboardRef.current.left || 0) + 20,
        top: (clipboardRef.current.top || 0) + 20,
        evented: true,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      setSelectedObject(cloned);
    });
  };

  const bringSelectionToFront = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringToFront(selectedObject);
    canvas.renderAll();
    setLayerUpdate((prev) => prev + 1);
  };

  const sendSelectionToBack = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendToBack(selectedObject);
    canvas.renderAll();
    setLayerUpdate((prev) => prev + 1);
  };

  const getCanvasLayers = () => {
    if (!canvas) return [];
    void layerUpdate;
    return canvas.getObjects().slice().reverse();
  };

  const getLayerLabel = (obj, index) => {
    if (canvas && isTemplateBackgroundObject(obj, canvas)) return 'Background';
    if (obj?.name) return obj.name.replace(/^icon-/, '');
    if (isTextObject(obj)) return (obj.text || 'Text').slice(0, 28);
    return obj?.type ? obj.type.charAt(0).toUpperCase() + obj.type.slice(1) : `Layer ${index + 1}`;
  };

  const selectLayerObject = (obj) => {
    if (!canvas || !obj) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
    setSelectedObject(obj);
    if (isTemplateBackgroundObject(obj, canvas)) {
      openBackgroundEditor(obj);
    } else if (isTextObject(obj)) {
      openTextStyleEditor(obj);
    }
  };

  const toggleLayerVisibility = (obj) => {
    if (!canvas || !obj) return;
    obj.set('visible', obj.visible === false);
    canvas.renderAll();
    setLayerUpdate((prev) => prev + 1);
  };

  const toggleLayerLock = (obj) => {
    if (!canvas || !obj) return;
    const locked = !obj.lockMovementX;
    obj.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockScalingX: locked,
      lockScalingY: locked,
      lockRotation: locked,
      selectable: !locked,
      evented: !locked,
    });
    canvas.renderAll();
    setLayerUpdate((prev) => prev + 1);
  };

  const moveLayer = (obj, direction) => {
    if (!canvas || !obj) return;
    if (direction === 'up') canvas.bringForward(obj);
    else canvas.sendBackwards(obj);
    canvas.renderAll();
    setLayerUpdate((prev) => prev + 1);
  };

  const fitToScreen = () => {
    fitCanvasStable();
  };

  const toggleTextStyle = (style) => {
    if (!isTextObject(selectedObject) || !canvas) return;
    if (style === 'bold') {
      selectedObject.set('fontWeight', selectedObject.fontWeight === 'bold' ? 'normal' : 'bold');
    } else if (style === 'italic') {
      selectedObject.set('fontStyle', selectedObject.fontStyle === 'italic' ? 'normal' : 'italic');
    } else if (style === 'underline') {
      selectedObject.set('underline', !selectedObject.underline);
    }
    canvas.renderAll();
  };

  const setTextAlignValue = (align) => {
    if (!isTextObject(selectedObject) || !canvas) return;
    selectedObject.set('textAlign', align);
    canvas.renderAll();
  };

  const canvasHasDesign = () => {
    if (canvas?.getObjects().length) return true;
    return pages.some((page) => page.json?.objects?.length);
  };

  const cloneTemplatePage = (page, index, nameOverride) => ({
    ...page,
    id: Date.now() + index + Math.random(),
    name: nameOverride || page.name || `Page ${index + 1}`,
    thumbnail: null,
    backgroundStyle: page.backgroundStyle
      ? { ...page.backgroundStyle }
      : { ...DEFAULT_BACKGROUND_STYLE },
    json: page.json ? JSON.parse(JSON.stringify(page.json)) : null,
  });

  const requestApplyTemplate = (template) => {
    if (!template?.pages?.length || applyingTemplateId) return;

    const isSameTemplate = activeTemplateIdRef.current === template.id;
    const hasExistingWork = canvasHasDesign() || pagesRef.current.length > 1;

    if (!isSameTemplate && hasExistingWork) {
      pendingTemplateRef.current = template;
      setTemplateSwitchModal({
        open: true,
        templateName: template.name,
        templatePageCount: template.pages.length,
        projectPageCount: pagesRef.current.length,
      });
      return;
    }

    applyTemplate(template, 'replace-project');
  };

  const cancelTemplateSwitch = () => {
    pendingTemplateRef.current = null;
    setTemplateSwitchModal({
      open: false,
      templateName: '',
      templatePageCount: 1,
      projectPageCount: 1,
    });
  };

  const confirmTemplateAction = (mode) => {
    const template = pendingTemplateRef.current;
    cancelTemplateSwitch();
    if (template) applyTemplate(template, mode);
  };

  const applyTemplate = async (template, mode = 'replace-project') => {
    if (!template?.pages?.length || applyingTemplateId) return;

    setApplyingTemplateId(template.id);
    isApplyingTemplateRef.current = true;
    suppressPageLoadRef.current = true;
    canvasHydratingRef.current = true;

    const templatePages = template.pages.map((page, index) => cloneTemplatePage(page, index));

    try {
      activeToolRef.current = 'select';
      setActiveTool('select');

      const activeIndex = currentPageIndexRef.current;
      const basePages = buildProjectPagesSnapshot(activeIndex);

      let nextPages;
      let nextIndex = activeIndex;

      if (mode === 'replace-current-page') {
        const templatePage = cloneTemplatePage(template.pages[0], activeIndex);
        nextPages = basePages.map((page, idx) =>
          idx === activeIndex
            ? {
                ...templatePage,
                id: page.id,
                name: page.name || templatePage.name,
              }
            : page,
        );
      } else if (mode === 'add-pages') {
        const appendedPages = template.pages.map((page, index) =>
          cloneTemplatePage(page, index, `Page ${basePages.length + index + 1}`),
        );
        nextPages = [...basePages, ...appendedPages];
        nextIndex = basePages.length;
      } else {
        nextPages = templatePages;
        nextIndex = 0;
      }

      pagesRef.current = nextPages;

      const targetPage = nextPages[nextIndex];
      const pageBackgroundStyle = targetPage.backgroundStyle || { ...DEFAULT_BACKGROUND_STYLE };

      commitPagesState(nextPages);
      setActivePageIndex(nextIndex);
      setBackgroundStyle(pageBackgroundStyle);
      setBackgroundColor(pageBackgroundStyle.color || '#ffffff');

      if (canvas) {
        // Invalidate any in-flight page load so it can't overwrite the template.
        loadTokenRef.current += 1;
        await loadPageOntoCanvas(canvas, clonePageRecord(targetPage));

        const fittedZoom = fitCanvasToWorkspace(canvas, canvasStageRef.current || canvasWorkspaceRef.current);
        resetPan();
        setZoom(fittedZoom);
        await waitForCanvasLayout();
        prepareCanvasForInteraction(canvas);
        refreshCanvas();
        canvasHydratingRef.current = false;
        scheduleCanvasOffsetSync(canvas);

        const updatedAfterTemplate = syncPageSnapshotAt(nextIndex);
        if (updatedAfterTemplate) {
          commitPagesState(updatedAfterTemplate);
        }

        const captureAppliedPageThumbnail = () => {
          const thumbnail = getCanvasThumbnail();
          if (!thumbnail) return;
          updatePagesFromRef((prev) =>
            prev.map((page, idx) => (idx === nextIndex ? { ...page, thumbnail } : page)),
          );
        };
        captureAppliedPageThumbnail();
        setTimeout(captureAppliedPageThumbnail, 200);
        setTimeout(captureAppliedPageThumbnail, 500);

        setLayerUpdate((prev) => prev + 1);
      }

      if (mode === 'replace-project') {
        activeTemplateIdRef.current = template.id;
      }

      setIsLeftDrawerOpen(true);

      if (mode === 'replace-current-page') {
        toast.success(`"${template.name}" applied to page ${nextIndex + 1}. Your other pages were kept.`);
      } else if (mode === 'add-pages') {
        const addedLabel = templatePages.length === 1 ? '1 new page' : `${templatePages.length} new pages`;
        toast.success(`"${template.name}" added as ${addedLabel}.`);
      } else {
        toast.success(`"${template.name}" ready — click any text, then type in the editor above the canvas`);
      }
    } catch (error) {
      console.error('[apply-template]', template.id, error);
      toast.error('Could not load that template. Please try again.');
    } finally {
      isApplyingTemplateRef.current = false;
      suppressPageLoadRef.current = false;
      setApplyingTemplateId(null);
      canvasHydratingRef.current = false;
      if (canvas) {
        activeToolRef.current = 'select';
        syncCanvasPointer(canvas);
      }
    }
  };

  const filteredTemplates = ONLINE_DESIGN_TEMPLATES.filter((template) => {
    const matchesCategory = templateCategory === 'All' || template.category === templateCategory;
    const query = templateQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const restoreAutosave = () => {
    const saved = loadOnlineDesignerAutosave();
    if (!saved?.pages?.length) return;
    const restoredPages = saved.pages.map((page) => ({
      ...clonePageRecord(page),
      name: page.name,
      id: page.id,
      width: page.width,
      height: page.height,
    }));
    const restoreIndex = saved.currentPageIndex || 0;
    commitPagesState(restoredPages);
    setActivePageIndex(restoreIndex);
    loadPage(restoreIndex);
    setShowAutosaveRestore(false);
    toast.success('Previous session restored');
  };

  const dismissAutosave = () => {
    setShowAutosaveRestore(false);
  };

  const handleTourStart = () => {
    setIsLeftDrawerOpen(true);
    startOnlineDesignerTour({
      markComplete: false,
      onStepPrepare: (step) => {
        if (step === 'open-drawer') setIsLeftDrawerOpen(true);
      },
    });
  };

  useEffect(() => {
    const isEditableTarget = (domTarget) =>
      domTarget?.tagName === 'INPUT' ||
      domTarget?.tagName === 'TEXTAREA' ||
      domTarget?.isContentEditable ||
      domTarget?.getAttribute?.('data-designer-text-editor') != null;

    const handleKeyDown = (e) => {
      if (!canvas) return;

      const target = e.target;
      if (e.key === 'Escape') {
        setTextEditorActive(false);
        canvasTextEditorRef.current?.blur();
        return;
      }

      if (isEditableTarget(target) && !e.metaKey && !e.ctrlKey) return;

      const activeObject = canvas.getActiveObject();
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((mod && e.key === 'z' && e.shiftKey) || (mod && e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key === 'c') {
        if (activeObject?.isEditing) return;
        e.preventDefault();
        copySelected();
        return;
      }
      if (mod && e.key === 'v') {
        if (activeObject?.isEditing) return;
        e.preventDefault();
        pasteClipboard();
        return;
      }
      if (mod && e.key === 'd') {
        if (activeObject?.isEditing) return;
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isEditableTarget(target)) return;
        if (activeObject?.isEditing) return;
        e.preventDefault();
        removeSelected();
        return;
      }
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoom(zoom + 10);
        return;
      }
      if (mod && e.key === '-') {
        e.preventDefault();
        handleZoom(zoom - 10);
        return;
      }
      if (e.key === ' ' && !isEditableTarget(target)) {
        e.preventDefault();
        setActiveTool('pan');
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === ' ' && activeTool === 'pan') {
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [canvas, zoom, activeTool, historyIndex, history]);

  // Load the brand logo once for use as a watermark (cached across exports).
  const loadWatermarkLogo = () =>
    new Promise((resolve) => {
      const cached = watermarkLogoRef.current;
      if (cached?.complete && cached.naturalWidth) {
        resolve(cached);
        return;
      }
      const logo = new Image();
      logo.onload = () => {
        watermarkLogoRef.current = logo;
        resolve(logo);
      };
      logo.onerror = () => resolve(null);
      logo.src = WATERMARK_LOGO_SRC;
    });

  // Overlay a light brand logo watermark in the bottom-right corner.
  const applyWatermarkToDataUrl = async (dataUrl, imageType = 'PNG') => {
    if (!dataUrl) return dataUrl;
    const logo = await loadWatermarkLogo().catch(() => null);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          if (!w || !h) {
            resolve(dataUrl);
            return;
          }
          const off = document.createElement('canvas');
          off.width = w;
          off.height = h;
          const ctx = off.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          if (imageType === 'JPEG') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
          }
          ctx.drawImage(img, 0, 0, w, h);

          const margin = Math.round(Math.min(w, h) * 0.03);

          if (logo && (logo.naturalWidth || logo.width)) {
            const logoW = logo.naturalWidth || logo.width;
            const logoH = logo.naturalHeight || logo.height;
            const targetW = Math.max(60, Math.round(Math.min(w, h) * 0.18));
            const targetH = Math.round((logoH / logoW) * targetW);
            ctx.save();
            ctx.globalAlpha = 0.12;
            ctx.drawImage(
              logo,
              w - targetW - margin,
              h - targetH - margin,
              targetW,
              targetH,
            );
            ctx.restore();
          }

          const mime = imageType === 'JPEG' ? 'image/jpeg' : 'image/png';
          const quality = imageType === 'JPEG' ? 0.92 : undefined;
          resolve(off.toDataURL(mime, quality));
        } catch (watermarkError) {
          console.warn('[watermark]', watermarkError);
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const captureCanvasImage = (targetCanvas, pageWidth, pageHeight, options = {}) => {
    const {
      preferJpeg = false,
      forceFormat = null,
      quality = 0.95,
      multiplier: customMultiplier,
      transparentBackground = false,
    } = options;

    const previousVpt = Array.isArray(targetCanvas.viewportTransform)
      ? targetCanvas.viewportTransform.slice()
      : [1, 0, 0, 1, 0, 0];
    const previousBackground = targetCanvas.backgroundColor;

    resetCanvasViewport(targetCanvas);
    targetCanvas.calcOffset();

    if (transparentBackground) {
      targetCanvas.setBackgroundColor('transparent', () => {});
    }
    targetCanvas.renderAll();

    const maxDim = Math.max(pageWidth || 1, pageHeight || 1);
    const defaultMultiplier = maxDim > 1600 ? 1 : maxDim > 1100 ? 1.25 : 2;
    const multiplier = customMultiplier ?? defaultMultiplier;

    let attempts;
    if (forceFormat === 'png') {
      attempts = [
        { format: 'png', quality: 1, multiplier },
        { format: 'png', quality: 1, multiplier: 1 },
      ];
    } else if (forceFormat === 'jpeg') {
      attempts = [
        { format: 'jpeg', quality, multiplier },
        { format: 'jpeg', quality: Math.max(0.7, quality - 0.1), multiplier: 1 },
        { format: 'png', quality: 1, multiplier: 1 },
      ];
    } else if (preferJpeg) {
      attempts = [
        { format: 'jpeg', quality, multiplier },
        { format: 'jpeg', quality: Math.max(0.7, quality - 0.1), multiplier: 1 },
        { format: 'png', quality: 1, multiplier: 1 },
      ];
    } else {
      attempts = [
        { format: 'png', quality: 1, multiplier },
        { format: 'png', quality: 1, multiplier: 1 },
        { format: 'jpeg', quality, multiplier: 1 },
      ];
    }

    try {
      for (const opts of attempts) {
        try {
          const dataUrl = targetCanvas.toDataURL(opts);
          if (dataUrl && dataUrl.length > 100) {
            return {
              dataUrl,
              imageType: opts.format === 'jpeg' ? 'JPEG' : 'PNG',
              fileExt: opts.format === 'jpeg' ? 'jpg' : 'png',
            };
          }
        } catch (captureError) {
          console.warn('[export-capture]', captureError);
        }
      }
      throw new Error('Failed to capture canvas image');
    } finally {
      if (transparentBackground) {
        targetCanvas.setBackgroundColor(previousBackground, () => {});
      }
      if (Array.isArray(previousVpt) && previousVpt.length === 6) {
        targetCanvas.setViewportTransform(previousVpt);
      }
      applyCanvasDisplayZoom(targetCanvas, zoom);
    }
  };

  const renderPageToCanvas = async (pageData) => {
    if (!canvas || !pageData) return;
    await loadPageOntoCanvas(canvas, pageData);
  };

  const triggerFileDownload = (href, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = href;
    link.click();
  };

  const getExportPageIndices = (pageScope, pageCount, activeIndex) => {
    if (pageScope === 'current') return [activeIndex];
    return Array.from({ length: pageCount }, (_, index) => index);
  };

  const buildDownloadSummary = (form, pageCount, activeIndex) => {
    const indices = getExportPageIndices(form.pageScope, pageCount, activeIndex);
    const pageLabel =
      indices.length === 1
        ? `page ${indices[0] + 1}`
        : `${indices.length} pages`;
    const qualityLabel = EXPORT_QUALITY_PRESETS[form.quality]?.label || 'High';
    const formatLabel = form.format === 'png' ? 'PNG image' : 'PDF document';
    const transparencyNote =
      form.format === 'png' && form.transparentBackground ? ' with transparent background' : '';
    return `Download ${pageLabel} as ${formatLabel} (${qualityLabel})${transparencyNote}.`;
  };

  const openDownloadModal = (context = null) => {
    const pageCount = pagesRef.current.length;
    setDownloadForm({
      format: 'pdf',
      quality: 'high',
      pageScope: pageCount > 1 ? 'all' : 'current',
      transparentBackground: false,
    });
    setDownloadModalContext(context);
    setShowDownloadModal(true);
  };

  const closeDownloadModal = () => {
    if (isExportingDesign) return;
    setShowDownloadModal(false);
    setDownloadModalContext(null);
  };

  const handleDownloadModalSuccess = (context) => {
    if (context === 'clearAutosave') {
      clearOnlineDesignerAutosave();
    } else if (context === 'exit') {
      setShowExitModal(false);
      exitToHome();
    } else if (context === 'exitOnly') {
      setShowExitModal(false);
    }
  };

  const exportDesign = async (options = {}) => {
    if (!canvas || pages.length === 0 || isExportingDesign) return false;

    const {
      format = 'pdf',
      quality = 'high',
      pageScope = 'all',
      transparentBackground = false,
    } = options;
    const qualitySettings = EXPORT_QUALITY_PRESETS[quality] || EXPORT_QUALITY_PRESETS.high;

    setIsExportingDesign(true);
    suppressPageLoadRef.current = true;

    const activePageIndex = currentPageIndexRef.current;
    const pageList = buildProjectPagesSnapshot(activePageIndex) ?? pagesRef.current;
    pagesRef.current = pageList;
    const pageIndices = getExportPageIndices(pageScope, pageList.length, activePageIndex);
    const savedVpt = canvas.viewportTransform?.slice() || [1, 0, 0, 1, 0, 0];
    let activePageJsonClone = null;
    const formattedDate = new Date().toISOString().slice(0, 10);

    try {
      commitPendingCanvasEdits();

      const activeJson = safeCanvasToJson(canvas);
      if (activeJson) {
        try {
          activePageJsonClone = JSON.parse(JSON.stringify(activeJson));
        } catch (cloneError) {
          console.warn('[export-active-json-clone]', cloneError);
        }
      }

      const captureOptions = {
        quality: qualitySettings.jpegQuality,
        multiplier: qualitySettings.multiplier,
        transparentBackground: format === 'png' && transparentBackground,
        forceFormat: format === 'png' ? 'png' : 'jpeg',
      };

      const capturePage = (page) => {
        const pageWidth = page.width || canvas.getWidth();
        const pageHeight = page.height || canvas.getHeight();
        const capture = captureCanvasImage(canvas, pageWidth, pageHeight, captureOptions);
        return { ...capture, width: pageWidth, height: pageHeight };
      };

      const captures = [];
      for (const pageIndex of pageIndices) {
        if (pageIndex !== activePageIndex) {
          await renderPageToCanvas(clonePageRecord(pageList[pageIndex]));
        }
        const capture = {
          pageIndex,
          pageName: pageList[pageIndex]?.name || `Page ${pageIndex + 1}`,
          ...capturePage(pageList[pageIndex]),
        };
        capture.dataUrl = await applyWatermarkToDataUrl(capture.dataUrl, capture.imageType);
        captures.push(capture);
      }

      if (!captures.length || !captures[0]?.width || !captures[0]?.height) {
        throw new Error('Nothing to export — check your page selection and try again.');
      }

      if (format === 'png') {
        captures.forEach((capture) => {
          const suffix = captures.length > 1 ? `_Page${capture.pageIndex + 1}` : '';
          triggerFileDownload(
            capture.dataUrl,
            `Design${suffix}_${formattedDate}.${capture.fileExt || 'png'}`,
          );
        });
      } else {
        const firstPage = captures[0];
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({
          orientation: firstPage.width >= firstPage.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [Math.round(firstPage.width), Math.round(firstPage.height)],
          compress: true,
        });

        captures.forEach((capture, index) => {
          if (index > 0) {
            pdf.addPage(
              [Math.round(capture.width), Math.round(capture.height)],
              capture.width >= capture.height ? 'landscape' : 'portrait',
            );
          }
          pdf.addImage(
            capture.dataUrl,
            capture.imageType,
            0,
            0,
            Math.round(capture.width),
            Math.round(capture.height),
            undefined,
            'FAST',
          );
        });

        pdf.save(`Design_${formattedDate}.pdf`);
      }

      if (pageList.length > 1 && activePageJsonClone) {
        await loadPageOntoCanvas(canvas, {
          ...pageList[activePageIndex],
          json: activePageJsonClone,
          backgroundStyle: backgroundStyleRef.current,
        });
        prepareCanvasForInteraction(canvas);
      }

      const updatedPages = buildPagesSnapshotFromCanvas();
      if (updatedPages) {
        commitPagesState(updatedPages);
      } else if (activePageJsonClone) {
        const syncedPages = pageList.map((page, idx) =>
          idx === activePageIndex
            ? {
                ...page,
                json: activePageJsonClone,
                backgroundStyle: backgroundStyleRef.current,
              }
            : page,
        );
        commitPagesState(syncedPages);
      }

      if (Array.isArray(savedVpt) && savedVpt.length === 6) {
        canvas.setViewportTransform(savedVpt);
      }
      applyCanvasDisplayZoom(canvas, zoom);
      syncCanvasPointer(canvas);

      const fileLabel =
        format === 'png'
          ? captures.length > 1
            ? `${captures.length} PNG files`
            : 'PNG file'
          : 'PDF file';
      toast.success(`${fileLabel} saved to your device.`);
      return true;
    } catch (error) {
      console.error('[generic-designer-export]', error);
      toast.error(error?.message || 'Could not export your design. Please try again.');
      if (pageList.length > 1 && activePageJsonClone) {
        try {
          await loadPageOntoCanvas(canvas, {
            ...pageList[activePageIndex],
            json: activePageJsonClone,
            backgroundStyle: backgroundStyleRef.current,
          });
          prepareCanvasForInteraction(canvas);
        } catch (restoreError) {
          console.error('[generic-designer-export-restore]', restoreError);
        }
      }
      if (Array.isArray(savedVpt) && savedVpt.length === 6) {
        canvas.setViewportTransform(savedVpt);
      }
      applyCanvasDisplayZoom(canvas, zoom);
      syncCanvasPointer(canvas);
      return false;
    } finally {
      suppressPageLoadRef.current = false;
      setIsExportingDesign(false);
    }
  };

  const confirmDownloadExport = async () => {
    const context = downloadModalContext;
    const ok = await exportDesign(downloadForm);
    if (!ok) return;
    setShowDownloadModal(false);
    setDownloadModalContext(null);
    handleDownloadModalSuccess(context);
  };

  const handleDownloadClick = () => {
    openDownloadModal('clearAutosave');
  };

  const handleExitDownload = () => {
    openDownloadModal('exitOnly');
  };

  const exitToHome = () => {
    if (!isProductMode) {
      clearOnlineDesignerAutosave();
    }
    setShowExitModal(false);
    if (isProductMode) {
      navigate(savedDraft?.returnPath || location.state?.fromPath || '/');
      return;
    }
    navigate(getRoutePath('home'));
  };

  const handleDownloadAndExit = () => {
    openDownloadModal('exit');
  };

  const handleConfirmExit = () => {
    exitToHome();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const exportCurrentPageAsPng = async () => {
    if (!canvas || isExportingPng) return;
    setIsExportingPng(true);
    suppressPageLoadRef.current = true;
    try {
      buildPagesSnapshotFromCanvas();
      const { dataUrl: rawDataUrl, imageType } = captureCanvasImage(
        canvas,
        canvas.getWidth(),
        canvas.getHeight(),
      );
      const dataUrl = await applyWatermarkToDataUrl(rawDataUrl, imageType);
      const link = document.createElement('a');
      link.download = `Design_Page${currentPageIndexRef.current + 1}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('PNG saved to your device.');
    } catch (error) {
      console.error('[generic-designer-png-export]', error);
      toast.error('Could not export PNG. Please try again.');
    } finally {
      suppressPageLoadRef.current = false;
      setIsExportingPng(false);
    }
  };

  // ----- Product mode: preview + order flow -----------------------------------

  const buildReviewSummaryRows = () => {
    const rows = [];
    const draft = savedDraft || {};
    const push = (label, value) => {
      if (!label || value == null || String(value).trim() === '') return;
      rows.push({ label: String(label), value: String(value) });
    };

    push('Product', draft.productName || productType);
    push('Design method', 'Online Designer');
    push('Quantity', productQuantity);
    push('Size', selectedSizeParam || draft.selectedSize);
    push('Material', productSearchParams.get('material') || draft.material);
    push('Sides printed', sidePrintedParam || draft.sidesPrinted);
    push('Lamination', productSearchParams.get('lamination') || draft.lamination);
    push('Corners', productSearchParams.get('roundCorners') || draft.roundCorners);
    push('Delivery', productSearchParams.get('deliveryOption') || draft.deliveryOption);

    Object.entries(productOptionParams).forEach(([key, value]) => {
      if (['size', 'material', 'lamination', 'round_corners', 'delivery_option'].includes(key)) return;
      push(humanizeProductOptionKey(key), value);
    });

    Object.entries(draft.selectedAttributeValues || {}).forEach(([label, value]) => {
      push(label, value);
    });

    return rows;
  };

  const buildCartLineItem = () => {
    const draft = savedDraft || {};
    const productOptions = buildReviewSummaryRows()
      .filter((row) => !['Product', 'Design method', 'Quantity'].includes(row.label))
      .map((row) => ({ label: row.label, value: row.value }));

    const linePrice =
      draft.isVatInclusive === false
        ? Number(draft.linePriceExVat || 0)
        : Number(draft.linePriceIncVat || draft.linePriceExVat || 0);

    return {
      id: draft.productId || `${productType}-${Date.now()}`,
      name: draft.productName || productType,
      title: draft.productName || productType,
      category: draft.productCategory || productCategory,
      price: linePrice,
      image: draft.productImage || '',
      quantity: productQuantity,
      designOption: 'custom',
      withoutArtwork: false,
      artworkAttached: true,
      artworkPreviewUrl: designArtworkUrl,
      fileUrls: designArtworkUrl ? [designArtworkUrl] : [],
      source: draft.source || 'in-house',
      thirdPartyProductKey: draft.thirdPartyProductKey || null,
      deliveryOption: productSearchParams.get('deliveryOption') || draft.deliveryOption,
      selectedAttributes: draft.selectedAttributeValues || {},
      productOptions,
      summary: buildReviewSummaryRows().map((row) => ({ label: row.label, value: row.value })),
      description: 'Custom design via online designer',
    };
  };

  const getReviewPriceLabel = () => {
    const draft = savedDraft || {};
    const amount =
      draft.isVatInclusive === false
        ? Number(draft.linePriceExVat || 0)
        : Number(draft.linePriceIncVat || draft.linePriceExVat || 0);
    if (!amount) return '';
    const suffix = draft.isVatInclusive === false ? ' (Ex VAT)' : ' (Inc VAT)';
    return `£${amount.toFixed(2)}${suffix}`;
  };

  // Capture every product side (page) to a NON-watermarked PNG data URL, then
  // restore the page the user was editing. Shared by download, order & preview.
  const captureProductPages = async () => {
    const activePageIndex = currentPageIndexRef.current;
    const pageList = buildProjectPagesSnapshot(activePageIndex) ?? pagesRef.current;
    pagesRef.current = pageList;
    const savedVpt = canvas.viewportTransform?.slice() || [1, 0, 0, 1, 0, 0];
    let activePageJsonClone = null;

    commitPendingCanvasEdits();
    const activeJson = safeCanvasToJson(canvas);
    if (activeJson) {
      try {
        activePageJsonClone = JSON.parse(JSON.stringify(activeJson));
      } catch (cloneError) {
        console.warn('[product-active-json-clone]', cloneError);
      }
    }

    const captures = [];
    try {
      for (let pageIndex = 0; pageIndex < pageList.length; pageIndex += 1) {
        if (pageIndex !== activePageIndex) {
          await renderPageToCanvas(clonePageRecord(pageList[pageIndex]));
        }
        const page = pageList[pageIndex];
        const pageWidth = page.width || canvas.getWidth();
        const pageHeight = page.height || canvas.getHeight();
        const capture = captureCanvasImage(canvas, pageWidth, pageHeight, {
          forceFormat: 'png',
          quality: 1,
          multiplier: 2,
        });
        captures.push({
          ...capture,
          width: pageWidth,
          height: pageHeight,
          name: page.name || `Side ${pageIndex + 1}`,
        });
      }
    } finally {
      if (pageList.length > 1 && activePageJsonClone) {
        await loadPageOntoCanvas(canvas, {
          ...pageList[activePageIndex],
          json: activePageJsonClone,
          backgroundStyle: backgroundStyleRef.current,
        });
        prepareCanvasForInteraction(canvas);
      }
      if (Array.isArray(savedVpt) && savedVpt.length === 6) {
        canvas.setViewportTransform(savedVpt);
      }
      applyCanvasDisplayZoom(canvas, zoom);
      syncCanvasPointer(canvas);
    }

    return captures;
  };

  const buildPdfFromCaptures = async (captures) => {
    const { jsPDF } = await import('jspdf');
    const first = captures[0];
    const pdf = new jsPDF({
      orientation: first.width >= first.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [Math.round(first.width), Math.round(first.height)],
      compress: true,
    });
    captures.forEach((capture, index) => {
      if (index > 0) {
        pdf.addPage(
          [Math.round(capture.width), Math.round(capture.height)],
          capture.width >= capture.height ? 'landscape' : 'portrait',
        );
      }
      pdf.addImage(
        capture.dataUrl,
        capture.imageType || 'PNG',
        0,
        0,
        Math.round(capture.width),
        Math.round(capture.height),
        undefined,
        'FAST',
      );
    });
    return pdf;
  };

  // Build a production-ready, NON-watermarked PDF of every side and upload it.
  const exportProductArtwork = async () => {
    if (!canvas || isPreparingOrder) return false;

    setIsPreparingOrder(true);
    suppressPageLoadRef.current = true;

    try {
      const captures = await captureProductPages();
      if (!captures.length || !captures[0]?.width) {
        throw new Error('Nothing to export.');
      }

      const pdf = await buildPdfFromCaptures(captures);
      const formattedDate = new Date().toISOString().slice(0, 10);
      const fileName = `Artwork_${formattedDate}.pdf`;
      const blob = pdf.output('blob');

      let hostedUrl = '';
      try {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        const uploaded = await uploadService.uploadArtwork(file);
        hostedUrl = uploaded?.url || '';
      } catch (uploadError) {
        console.error('[product-artwork-upload]', uploadError);
        toast.error(uploadError?.message || 'Could not save your design. Please sign in and try again.');
        return false;
      }

      if (!hostedUrl) {
        toast.error('Could not save your design for production. Please try again.');
        return false;
      }

      setDesignPdfFileName(fileName);
      setDesignArtworkUrl(hostedUrl);
      return true;
    } catch (error) {
      console.error('[product-artwork-export]', error);
      toast.error('Could not prepare your design. Please try again.');
      return false;
    } finally {
      suppressPageLoadRef.current = false;
      setIsPreparingOrder(false);
    }
  };

  // Download the print-ready PDF to the user's device (and upload it so the
  // order review is ready). This mirrors the old "Save & Download" button.
  const downloadProductArtwork = async () => {
    if (!canvas || isDownloadingArtwork) return;
    setIsDownloadingArtwork(true);
    suppressPageLoadRef.current = true;
    try {
      const captures = await captureProductPages();
      if (!captures.length || !captures[0]?.width) {
        throw new Error('Nothing to export.');
      }
      const pdf = await buildPdfFromCaptures(captures);
      const formattedDate = new Date().toISOString().slice(0, 10);
      const fileName = `Artwork_${formattedDate}.pdf`;
      pdf.save(fileName);

      // Also upload so "Preview & Order" can attach the file immediately.
      try {
        const blob = pdf.output('blob');
        const file = new File([blob], fileName, { type: 'application/pdf' });
        const uploaded = await uploadService.uploadArtwork(file);
        if (uploaded?.url) {
          setDesignArtworkUrl(uploaded.url);
          setDesignPdfFileName(fileName);
        }
      } catch (uploadError) {
        console.warn('[product-artwork-download-upload]', uploadError);
      }

      toast.success('Design downloaded to your device.');
    } catch (error) {
      console.error('[product-artwork-download]', error);
      toast.error('Could not download your design. Please try again.');
    } finally {
      suppressPageLoadRef.current = false;
      setIsDownloadingArtwork(false);
    }
  };

  const handleDownloadProductArtwork = () => {
    if (isDownloadingArtwork) return;
    if (isAuthenticated() && localStorage.getItem('token')) {
      void downloadProductArtwork();
      return;
    }
    setDesignerAuthOpen(true);
  };

  // Generate front/back previews and open the rotating 3D artwork view.
  const handleOpen3DPreview = async () => {
    if (!canvas || isGeneratingPreview) return;
    setIsGeneratingPreview(true);
    suppressPageLoadRef.current = true;
    try {
      const captures = await captureProductPages();
      setSidePreviewUrls({
        front: captures[0]?.dataUrl || '',
        back: captures[1]?.dataUrl || '',
      });
      const initialRotation = isProductDoubleSided ? -22 : -10;
      previewRotationTargetRef.current = initialRotation;
      setPreviewRotationY(initialRotation);
      setShow3DPreviewModal(true);
    } catch (error) {
      console.error('[product-3d-preview]', error);
      toast.error('Could not generate the preview. Please try again.');
    } finally {
      suppressPageLoadRef.current = false;
      setIsGeneratingPreview(false);
    }
  };

  const runPreviewAndOrder = async () => {
    const ok = await exportProductArtwork();
    if (ok) setShowReviewScreen(true);
  };

  const handlePreviewAndOrder = () => {
    if (isPreparingOrder) return;
    if (isAuthenticated() && localStorage.getItem('token')) {
      void runPreviewAndOrder();
      return;
    }
    setDesignerAuthOpen(true);
  };

  const performReviewAddToCart = async () => {
    if (!designArtworkUrl) {
      toast.error('Design file is missing. Please prepare your design again.');
      return;
    }
    setIsAddingToCart(true);
    try {
      await addToCart(buildCartLineItem());
      toast.success('Added to basket');
      navigate(savedDraft?.returnPath || location.state?.fromPath || '/');
    } catch (error) {
      toast.error(error?.message || 'Could not add to basket.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const performReviewCheckout = async () => {
    if (!designArtworkUrl) {
      toast.error('Design file is missing. Please prepare your design again.');
      return;
    }
    setIsProcessingCheckout(true);
    try {
      navigate('/checkout', { state: { checkoutItems: [buildCartLineItem()] } });
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const requireAuthForReviewAction = (action) => {
    if (isAuthenticated() && localStorage.getItem('token')) return true;
    pendingReviewActionRef.current = action;
    setReviewAuthOpen(true);
    return false;
  };

  const handleReviewAddToCart = () => {
    if (!requireAuthForReviewAction('cart')) return;
    void performReviewAddToCart();
  };

  const handleReviewCheckout = () => {
    if (!requireAuthForReviewAction('checkout')) return;
    void performReviewCheckout();
  };

  const saveProject = () => {
    const snapshotPages = buildPagesSnapshotFromCanvas() ?? pagesRef.current;
    commitPagesState(snapshotPages);
    const payload = JSON.stringify(
      { pages: snapshotPages, currentPageIndex: currentPageIndexRef.current },
      null,
      2,
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'generic-designer-project.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data?.pages?.length) return;
        const restoredPages = data.pages.map((page) => ({
          ...clonePageRecord(page),
          name: page.name,
          id: page.id,
          width: page.width,
          height: page.height,
        }));
        const nextIndex = data.currentPageIndex || 0;
        commitPagesState(restoredPages);
        setActivePageIndex(nextIndex);
        loadPage(nextIndex);
      } catch (error) {
        console.error('Invalid project file', error);
      }
    };
    reader.readAsText(file);
  };

  const updateSelectedObject = (property, value) => {
    if (!canvas || !selectedObject) return;
    selectedObject.set(property, value);
    selectedObject.setCoords();
    canvas.requestRenderAll();
    setLayerUpdate((prev) => prev + 1);
  };

  const getObjectTransformDisplay = (obj) => {
    if (!obj) {
      return { x: 0, y: 0, w: 0, h: 0, rotation: 0 };
    }
    const bounds = obj.getBoundingRect(true, true);
    return {
      x: Math.round(obj.left ?? bounds.left ?? 0),
      y: Math.round(obj.top ?? bounds.top ?? 0),
      w: Math.round(bounds.width || (obj.width || 0) * (obj.scaleX || 1)),
      h: Math.round(bounds.height || (obj.height || 0) * (obj.scaleY || 1)),
      rotation: Math.round(obj.angle || 0),
    };
  };

  const transformDraftFromObject = (obj) => {
    const values = getObjectTransformDisplay(obj);
    return {
      x: String(values.x),
      y: String(values.y),
      w: String(values.w),
      h: String(values.h),
      rotation: String(values.rotation),
    };
  };

  useEffect(() => {
    if (!selectedObject) return;
    if (activeTransformFieldRef.current) return;
    setTransformDraft(transformDraftFromObject(selectedObject));
  }, [selectedObject, layerUpdate]);

  const parseTransformInput = (value) => {
    const trimmed = String(value ?? '').trim();
    if (trimmed === '' || trimmed === '-' || trimmed === '.') return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
  };

  const applyTransformField = (field, rawValue) => {
    if (!canvas || !selectedObject) return false;
    const num = parseTransformInput(rawValue);
    if (num === null) return false;

    if (field === 'x') {
      selectedObject.set('left', num);
    } else if (field === 'y') {
      selectedObject.set('top', num);
    } else if (field === 'rotation') {
      selectedObject.set('angle', num);
    } else if (field === 'w') {
      const targetW = Math.max(1, num);
      if (isTextObject(selectedObject)) {
        selectedObject.set({ width: targetW, scaleX: 1 });
        if (typeof selectedObject.initDimensions === 'function') {
          selectedObject.initDimensions();
        }
      } else if (selectedObject.type === 'circle') {
        selectedObject.set({ radius: targetW / 2, scaleX: 1, scaleY: 1 });
      } else {
        const baseW = selectedObject.width || 1;
        selectedObject.set('scaleX', targetW / Math.max(baseW, 0.001));
      }
    } else if (field === 'h') {
      const targetH = Math.max(1, num);
      if (isTextObject(selectedObject)) {
        const baseH = selectedObject.height || 1;
        selectedObject.set('scaleY', targetH / Math.max(baseH, 0.001));
      } else if (selectedObject.type === 'circle') {
        selectedObject.set({ radius: targetH / 2, scaleX: 1, scaleY: 1 });
      } else {
        const baseH = selectedObject.height || 1;
        selectedObject.set('scaleY', targetH / Math.max(baseH, 0.001));
      }
    }

    selectedObject.setCoords();
    canvas.requestRenderAll();
    setLayerUpdate((prev) => prev + 1);
    return true;
  };

  const handleTransformDraftChange = (field, value) => {
    activeTransformFieldRef.current = field;
    setTransformDraft((prev) => ({ ...prev, [field]: value }));
  };

  const commitTransformField = (field) => {
    const ok = applyTransformField(field, transformDraft[field]);
    if (ok && (field === 'w' || field === 'h') && selectedObject?.imageFillSrc) {
      rebuildShapeImageFill(selectedObject);
    }
    activeTransformFieldRef.current = null;
    if (selectedObject) {
      setTransformDraft(transformDraftFromObject(selectedObject));
    }
    if (!ok) {
      toast.error('Enter a valid number.');
    }
  };

  const flipSelectedObject = (axis) => {
    if (!canvas || !selectedObject) return;
    const prop = axis === 'horizontal' ? 'flipX' : 'flipY';
    selectedObject.set(prop, !selectedObject[prop]);
    selectedObject.setCoords();
    canvas.requestRenderAll();
    setLayerUpdate((prev) => prev + 1);
  };

  const handleTransformFocus = (field, event) => {
    activeTransformFieldRef.current = field;
    event.target.select();
  };

  const handleTransformKeyDown = (field, event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitTransformField(field);
      event.currentTarget.blur();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      activeTransformFieldRef.current = null;
      if (selectedObject) {
        setTransformDraft(transformDraftFromObject(selectedObject));
      }
      event.currentTarget.blur();
    }
  };

  const alignSelection = (mode) => {
    if (!canvas) return;
    const objects = canvas.getActiveObjects();
    if (!objects.length) return;
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();

    objects.forEach((obj) => {
      const bounds = obj.getBoundingRect(true, true);
      if (mode === 'left') obj.set('left', obj.left - bounds.left);
      if (mode === 'center') obj.set('left', obj.left + (cw / 2 - (bounds.left + bounds.width / 2)));
      if (mode === 'right') obj.set('left', obj.left + (cw - (bounds.left + bounds.width)));
      if (mode === 'top') obj.set('top', obj.top - bounds.top);
      if (mode === 'middle') obj.set('top', obj.top + (ch / 2 - (bounds.top + bounds.height / 2)));
      if (mode === 'bottom') obj.set('top', obj.top + (ch - (bounds.top + bounds.height)));
      obj.setCoords();
    });
    canvas.renderAll();
  };

  const isBackgroundSelected = Boolean(
    selectedObject && canvas && isTemplateBackgroundObject(selectedObject, canvas),
  );

  const isTextSelected = Boolean(
    selectedObject && canvas && isTextObject(selectedObject),
  );

  const isShapeSelected = Boolean(
    selectedObject && canvas && isShapeObject(selectedObject),
  );

  const shapeHasImageFill = Boolean(isShapeSelected && selectedObject?.imageFillSrc);

  return (
    <>
    {isProductMode && showReviewScreen ? (
      <>
        <DesignReviewScreen
          productTitle={savedDraft?.productName || productType}
          pdfUrl={designArtworkUrl}
          pdfFileName={designPdfFileName}
          summaryRows={buildReviewSummaryRows()}
          priceLabel={getReviewPriceLabel()}
          onBackToEditor={() => setShowReviewScreen(false)}
          onAddToCart={handleReviewAddToCart}
          onProceedToCheckout={handleReviewCheckout}
          isAddingToCart={isAddingToCart}
          isProcessingCheckout={isProcessingCheckout}
        />
        <DesignerAuthModal
          open={reviewAuthOpen}
          onClose={() => {
            setReviewAuthOpen(false);
            pendingReviewActionRef.current = null;
          }}
          onAuthenticated={async () => {
            const action = pendingReviewActionRef.current;
            pendingReviewActionRef.current = null;
            if (action === 'cart') await performReviewAddToCart();
            if (action === 'checkout') await performReviewCheckout();
          }}
          title="Sign in to continue"
          subtitle="Sign in or create an account to add your design to basket or checkout."
          benefits={[
            'Save your design to your order history',
            'Track production and delivery from your account',
            'Checkout securely with your saved details',
          ]}
          verifyOtpButtonLabel="Verify & continue"
          signInButtonLabel="Sign in & continue"
        />
      </>
    ) : null}

    {isProductMode ? (
      <DesignerAuthModal
        open={designerAuthOpen}
        onClose={() => setDesignerAuthOpen(false)}
        onAuthenticated={async () => {
          setDesignerAuthOpen(false);
          await runPreviewAndOrder();
        }}
        title="Sign in to save your design"
        subtitle="Sign in or create an account so we can attach your print-ready design to your order."
        benefits={[
          'Save your design to your order history',
          'Track production and delivery from your account',
          'Checkout securely with your saved details',
        ]}
        verifyOtpButtonLabel="Verify & continue"
        signInButtonLabel="Sign in & continue"
      />
    ) : null}

    <div
      className={`flex h-screen flex-col bg-slate-100 overflow-hidden ${
        isProductMode && showReviewScreen ? 'invisible pointer-events-none' : ''
      }`}
      style={font}
    >
      <header className="relative z-20 flex h-[58px] shrink-0 items-center gap-3 border-b border-slate-200/90 bg-white/95 px-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md sm:gap-4 sm:px-5">
        <button
          type="button"
          onClick={() => setShowExitModal(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <div className="hidden h-9 w-px bg-slate-200 sm:block" />

        <div className="min-w-0 flex-1 sm:flex-none">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">RSPUK Studio</p>
          <h1 className="truncate text-[15px] font-bold leading-tight text-slate-900 sm:text-base">
            {isProductMode
              ? savedDraft?.productName || productType || 'Product Designer'
              : 'Online Design Tool'}
          </h1>
        </div>

        <div className="hidden flex-1 sm:block" />

        {!isLeftDrawerOpen ? (
          <button
            type="button"
            onClick={() => setIsLeftDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="hidden md:inline">Open tools</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleTourStart}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          title="Show guided tour"
          aria-label="Show guided tour"
        >
          ?
        </button>

        {lastSavedAt ? (
          <span className="hidden text-[11px] font-medium text-slate-400 lg:inline" title="Auto-saved locally">
            Saved {new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : null}
      </header>

      {showAutosaveRestore ? (
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-950">
          <p className="font-medium">Restore your previous design? Your work was auto-saved locally.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={restoreAutosave}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={dismissAutosave}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              Start fresh
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden">
      <div
        className={`flex h-full flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
          isLeftDrawerOpen ? 'w-[368px]' : 'w-[72px]'
        }`}
      >
        <div className="flex w-[72px] shrink-0 flex-col items-center gap-3 border-r border-slate-200 bg-slate-50/90 py-4 overflow-y-auto" data-tour="online-tools-rail">
          {Object.entries(SIDEBAR_TAB_META).map(([tabKey, meta]) => {
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => {
                  setActiveTab(tabKey);
                  setIsLeftDrawerOpen(true);
                }}
                className="group flex w-full flex-col items-center gap-1.5 px-2"
                title={meta.label}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                    isActive
                      ? 'border-emerald-300 bg-white text-emerald-700 shadow-md shadow-emerald-100/80 ring-2 ring-emerald-100'
                      : 'border-slate-200 bg-white text-slate-500 group-hover:border-slate-300 group-hover:text-slate-700'
                  }`}
                >
                  {renderSidebarTabIcon(tabKey)}
                </div>
                <span
                  className={`max-w-[64px] truncate text-center text-[10px] font-medium leading-tight ${
                    isActive ? 'text-emerald-800' : 'text-slate-500'
                  }`}
                >
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>

        {isLeftDrawerOpen ? (
        <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-[4px_0_24px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Tools</p>
              <h2 className="truncate text-lg font-bold text-slate-900">
                {SIDEBAR_TAB_META[activeTab]?.panelTitle || 'Design'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsLeftDrawerOpen(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
              title="Collapse panel"
              aria-label="Collapse panel"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {isTextSelected && (
            <div className="shrink-0 border-b border-emerald-200 bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-3 shadow-[0_4px_12px_-8px_rgba(16,185,129,0.35)]">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[11px] font-bold text-white shadow-sm">
                    Aa
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-900">Edit selected text</p>
                    <p className="truncate text-[10px] text-emerald-700/80">Pinned here — no scrolling needed</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openCanvasTextEditor(selectedObject, { selectAll: false, focusEditor: true })}
                  className="shrink-0 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-50"
                  title="Open floating editor on canvas"
                >
                  Pop out
                </button>
              </div>
              <textarea
                ref={stickySidebarTextRef}
                data-designer-text-editor="true"
                rows={3}
                value={selectedTextDraft}
                onChange={(e) => handleSelectedTextDraftChange(e.target.value)}
                className="w-full rounded-xl border-2 border-emerald-300 bg-white p-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Type your text here..."
              />
              <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
                Changes apply live on the canvas. Double-click text for a larger editor.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {TEXT_COLOR_SWATCHES.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applySelectedTextColor(color, selectedObject)}
                    className={`h-6 w-6 rounded-md border ${
                      textColor === color ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <label className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => applySelectedTextColor(e.target.value, selectedObject)}
                    className="sr-only"
                  />
                  <span className="text-[10px] font-bold text-emerald-700">+</span>
                </label>
                <div className="ml-auto flex gap-1">
                  <button
                    type="button"
                    onClick={() => toggleTextStyle('bold')}
                    className={`rounded-md border px-2 py-1 text-xs font-bold ${
                      selectedObject.fontWeight === 'bold'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleTextStyle('italic')}
                    className={`rounded-md border px-2 py-1 text-xs italic ${
                      selectedObject.fontStyle === 'italic'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleTextStyle('underline')}
                    className={`rounded-md border px-2 py-1 text-xs underline ${
                      selectedObject.underline
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    U
                  </button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => setTextAlignValue(align)}
                    className={`rounded-md border px-2 py-1 text-[10px] capitalize ${
                      (selectedObject.textAlign || 'left') === align
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Tap a template to load a fully designed layout. Everything — text, colours, shapes — stays editable.
            </p>

            <input
              type="text"
              value={templateQuery}
              onChange={(e) => setTemplateQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />

            <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
              {TEMPLATE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setTemplateCategory(category)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    templateCategory === category
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {filteredTemplates.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No templates match your search.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map((template) => {
                  const thumb = templateThumbnails[template.id];
                  const ratio = template.pages[0].width / template.pages[0].height;
                  const isApplying = applyingTemplateId === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => requestApplyTemplate(template)}
                      disabled={Boolean(applyingTemplateId)}
                      className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all hover:border-emerald-300 hover:shadow-md disabled:opacity-60"
                      title={`${template.name} — ${template.description}`}
                    >
                      <div
                        className="relative flex items-center justify-center overflow-hidden bg-slate-100"
                        style={{ aspectRatio: String(ratio || 1) }}
                      >
                        {thumb ? (
                          <img src={thumb} alt={template.name} className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
                          </div>
                        )}
                        {template.pages.length > 1 ? (
                          <span className="absolute right-1.5 top-1.5 rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                            {template.pages.length} pages
                          </span>
                        ) : null}
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-600/0 transition-colors group-hover:bg-emerald-600/10">
                          {isApplying ? (
                            <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">Applying…</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="px-2 py-1.5">
                        <div className="truncate text-xs font-semibold text-slate-900">{template.name}</div>
                        <div className="truncate text-[10px] text-slate-500">
                          {template.pages[0].width}×{template.pages[0].height}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insert' && (
          <div className="space-y-4">
            <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Drag shapes, icons, or emojis onto the canvas, or click to add them in the centre. You can also drop image files onto the design.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={addText}
                className="rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                Add Text
              </button>
              <button
                onClick={() => uploadRef.current?.click()}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Upload Image
              </button>
              <input ref={uploadRef} onChange={uploadImage} type="file" accept="image/*" className="hidden" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setOpenInsertSection((prev) => (prev === 'icons' ? null : 'icons'))}
                  className="text-sm font-semibold text-gray-900 hover:text-emerald-700"
                >
                  Quick Icons
                </button>
                {openInsertSection === 'icons' && (
                  <button
                    onClick={() => setShowAllIcons(!showAllIcons)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllIcons ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>
              {openInsertSection === 'icons' && (
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_ICONS.slice(0, showAllIcons ? undefined : 4).map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      draggable
                      onDragStart={(e) => startDesignerDrag(e, { kind: 'icon-svg', name: icon.name, svg: icon.svg })}
                      onClick={() => addIconToCanvas(icon.svg, icon.name)}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center cursor-grab active:cursor-grabbing"
                      title={`Drag or click to add ${icon.name}`}
                    >
                      <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setOpenInsertSection((prev) => (prev === 'emojis' ? null : 'emojis'))}
                  className="text-sm font-semibold text-gray-900 hover:text-emerald-700"
                >
                  Emojis
                </button>
                {openInsertSection === 'emojis' && (
                  <button
                    onClick={() => setShowAllEmojis(!showAllEmojis)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllEmojis ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>
              {openInsertSection === 'emojis' && (
                <div className="grid grid-cols-6 gap-2">
                  {QUICK_EMOJIS.slice(0, showAllEmojis ? undefined : 6).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      draggable
                      onDragStart={(e) => startDesignerDrag(e, { kind: 'emoji', value: emoji })}
                      onClick={() => addEmojiToCanvas(emoji)}
                      className="p-1.5 rounded-lg border border-gray-300 text-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing"
                      title="Drag or click to add emoji"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setOpenInsertSection((prev) => (prev === 'shapes' ? null : 'shapes'))}
                  className="text-sm font-semibold text-gray-900 hover:text-emerald-700"
                >
                  Shapes
                </button>
                {openInsertSection === 'shapes' && (
                  <button
                    onClick={() => setShowAllShapes(!showAllShapes)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showAllShapes ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>
              {openInsertSection === 'shapes' && (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'rect', label: 'Rect' },
                    { id: 'circle', label: 'Circle' },
                    { id: 'triangle', label: 'Triangle' },
                    { id: 'line', label: 'Line' },
                    { id: 'ellipse', label: 'Ellipse' },
                    { id: 'polygon', label: 'Polygon' },
                    { id: 'star', label: 'Star' },
                    { id: 'arrow', label: 'Arrow' }
                  ].slice(0, showAllShapes ? undefined : 4).map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      draggable
                      onDragStart={(e) => startDesignerDrag(e, { kind: 'shape', type: shape.id })}
                      onClick={() => addShape(shape.id)}
                      className="p-2 rounded-lg border border-gray-300 text-xs hover:bg-gray-50 cursor-grab active:cursor-grabbing"
                      title={`Drag or click to add ${shape.label}`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-700 block mb-1">Text</label>
              <textarea
                rows={3}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-gray-700 block mb-1">Font Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 block mb-1">Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => applySelectedTextColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 block mb-1">Font Family</label>
              <div className="relative" ref={fontPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowFontPicker((prev) => !prev)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-left flex items-center justify-between"
                  style={{ fontFamily }}
                >
                  <span>{fontFamily}</span>
                  <span className="text-gray-500 text-xs">▼</span>
                </button>
                {showFontPicker && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <input
                      type="text"
                      value={fontSearch}
                      onChange={(e) => setFontSearch(e.target.value)}
                      placeholder="Search fonts..."
                      className="w-full p-2 text-sm border-b border-gray-200 rounded-t-lg"
                    />
                    <div className="max-h-52 overflow-y-auto">
                      {filteredFonts.length > 0 ? (
                        filteredFonts.map((font) => (
                          <button
                            key={font}
                            type="button"
                            onClick={() => {
                              setFontFamily(font);
                              setShowFontPicker(false);
                            }}
                            className="w-full px-2 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            style={{ fontFamily: font }}
                          >
                            {font}
                          </button>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-sm text-gray-500">No fonts found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'background' && (
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

                <p className="text-xs text-gray-500">
                  Click the canvas background to edit colours, or pick a swatch below. Gradient backgrounds become solid when you pick a new colour.
                </p>
              </div>
            )}

            {backgroundPanelTab === 'patterns' && (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => applyPatternBackground(customPatternOptions)}
                  className="w-full p-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors font-semibold text-sm"
                >
                  Create Your Pattern
                </button>

                <input
                  type="text"
                  value={backgroundPatternQuery}
                  onChange={(e) => setBackgroundPatternQuery(e.target.value)}
                  placeholder="Browse our free resources"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">{category}</h4>
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
                              <p className="mt-1 text-xs text-gray-600">{pattern.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">Free Background Library</h4>
                    <span className="text-xs font-semibold text-emerald-700">50 Included</span>
                  </div>

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
                        <h5 className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{category}</h5>
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
                              <p className="mt-1 text-xs text-gray-600">{pattern.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-900">Custom Pattern</h4>
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-3 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Upload image</p>
                      <p className="text-xs text-gray-500">
                        Use one image as a canvas background or repeat it as a pattern.
                      </p>
                    </div>
                    <label className="px-3 h-11 rounded-xl bg-emerald-700 text-white cursor-pointer hover:bg-emerald-800 transition-colors inline-flex items-center justify-center gap-2 shadow-sm text-sm font-semibold">
                      Upload
                      <input
                        ref={backgroundImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCustomPatternImageUpload}
                        className="sr-only"
                      />
                    </label>

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
                          className="w-full p-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors font-semibold text-sm"
                        >
                          Apply Uploaded Image
                        </button>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pattern type</label>
                    <select
                      value={customPatternOptions.type}
                      onChange={(e) => setCustomPatternOptions((prev) => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm"
                    >
                      <option value="dots">Dots</option>
                      <option value="stripes">Stripes</option>
                      <option value="grid">Grid</option>
                      <option value="diagonal">Diagonal</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-gray-700">
                      Pattern colour
                      <input
                        type="color"
                        value={customPatternOptions.foreground}
                        onChange={(e) => setCustomPatternOptions((prev) => ({ ...prev, foreground: e.target.value }))}
                        className="mt-1 w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </label>
                    <label className="text-xs text-gray-700">
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
                        customPatternOptions.background,
                      )})`,
                      backgroundRepeat: 'repeat',
                      backgroundSize: '56px 56px',
                      backgroundColor: customPatternOptions.background,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => applyPatternBackground(customPatternOptions)}
                    className="w-full p-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-semibold text-sm"
                  >
                    Apply Pattern
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'elements' && (
          <div className="space-y-5">
            <p className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-xs leading-relaxed text-emerald-900">
              Browse colourful brand and UI icons from Iconify (Logos, Fluent Color, Noto, and more). Search by category and click to add to your canvas.
            </p>

            {ICONIFY_CATEGORIES.map((category) => {
              const icons = iconResultsByCategory[category.id] || [];
              const isLoading = iconLoadingByCategory[category.id];
              const error = iconErrorByCategory[category.id];
              const visibleIcons = showAllByCategory[category.id] ? icons : icons.slice(0, 12);

              return (
                <div key={category.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{category.label}</h4>
                    {icons.length > 12 ? (
                      <button
                        type="button"
                        onClick={() => toggleShowAllForCategory(category.id)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        {showAllByCategory[category.id] ? 'Show less' : 'View all'}
                      </button>
                    ) : null}
                  </div>

                  <input
                    type="text"
                    value={categoryQueries[category.id] ?? ''}
                    onChange={(e) => handleCategoryQueryChange(category.id, e.target.value)}
                    placeholder={`Search ${category.label.toLowerCase()} icons`}
                    className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />

                  {isLoading ? (
                    <p className="text-xs text-slate-500">Loading icons…</p>
                  ) : error ? (
                    <p className="text-xs text-red-600">{error}</p>
                  ) : visibleIcons.length === 0 ? (
                    <p className="text-xs text-slate-500">No icons found. Try a different search.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {visibleIcons.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          draggable
                          onDragStart={(e) => startDesignerDrag(e, { kind: 'icon', name: iconName })}
                          onClick={() => addIconifyIconToCanvas(iconName)}
                          className="flex aspect-square items-center justify-center rounded-xl border border-slate-200 bg-white p-2 transition-all hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm cursor-grab active:cursor-grabbing"
                          title={`Drag or click to add ${iconName}`}
                        >
                          <img
                            src={getIconifyPreviewUrl(iconName, 32)}
                            alt={iconName}
                            className="h-8 w-8 object-contain"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="space-y-2">
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Reorder, hide, or lock layers. Top of the list = front of canvas.
            </p>
            {getCanvasLayers().length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No layers yet — add text, shapes, or images.</p>
            ) : (
              getCanvasLayers().map((obj, index) => {
                const isActive = selectedObject === obj;
                const isLocked = obj.lockMovementX === true;
                const isHidden = obj.visible === false;
                return (
                  <div
                    key={`${obj.type}-${index}-${obj.left}-${obj.top}`}
                    className={`flex items-center gap-2 rounded-xl border p-2 transition-colors ${
                      isActive ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectLayerObject(obj)}
                      className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-800"
                      title={getLayerLabel(obj, index)}
                    >
                      {getLayerLabel(obj, index)}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayerVisibility(obj)}
                      className={`rounded-lg p-1.5 ${isHidden ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-100'}`}
                      title={isHidden ? 'Show layer' : 'Hide layer'}
                    >
                      {isHidden ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858 5.858a3 3 0 104.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayerLock(obj)}
                      className={`rounded-lg p-1.5 ${isLocked ? 'text-amber-600' : 'text-slate-600 hover:bg-slate-100'}`}
                      title={isLocked ? 'Unlock layer' : 'Lock layer'}
                    >
                      {isLocked ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                      )}
                    </button>
                    <button type="button" onClick={() => moveLayer(obj, 'up')} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100" title="Bring forward">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button type="button" onClick={() => moveLayer(obj, 'down')} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100" title="Send backward">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700 block mb-1">QR Content</label>
              <textarea
                rows={3}
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="URL / text / contact info"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">QR Size: {qrSize}px</label>
              <input
                type="range"
                min="80"
                max="320"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">QR Color</label>
              <input
                type="color"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
            <button onClick={addQrCode} className="w-full p-2 rounded-lg bg-gray-900 text-white text-sm">
              Add QR Code
            </button>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="space-y-4">
            {!isProductMode && (
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={addPage} className="p-2 rounded-lg bg-blue-600 text-white text-sm">Add Page</button>
              <button type="button" onClick={duplicatePage} className="p-2 rounded-lg border border-gray-300 text-sm">Duplicate</button>
              <button type="button" onClick={deletePage} className="p-2 rounded-lg border border-red-300 text-red-600 text-sm">Delete</button>
            </div>
            )}
            {isProductMode && (
              <p className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-blue-800">
                {isProductDoubleSided
                  ? 'This product has Front and Back sides. Switch sides using the page panel on the right.'
                  : 'This product has a single print side.'}
              </p>
            )}
            <div className="space-y-2">
              {pages.map((page, idx) => (
                <button
                  key={page.id}
                  onClick={() => switchToPage(idx)}
                  className={`w-full p-2 rounded-lg border text-left ${
                    idx === currentPageIndex ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{page.name}</div>
                  <div className="text-xs text-gray-500">{page.width} x {page.height}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'web' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
              <p className="text-xs font-medium text-slate-600">
                Search millions of free, commercial-use photos. Click or drag onto your canvas.
              </p>
            </div>

            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setWebActiveCategory('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchWebAssets({
                      page: 1,
                      append: false,
                      queryOverride: searchQuery,
                      orientationOverride: webOrientation,
                    });
                  }
                }}
                placeholder="Search photos… e.g. coffee shop, neon sign"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PHOTO_ORIENTATIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setWebOrientation(option.id)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    webOrientation === option.id
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Popular</p>
              <div className="flex flex-wrap gap-1.5">
                {PHOTO_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setWebActiveCategory(category);
                      setSearchQuery(category);
                    }}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                      webActiveCategory === category
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {webError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {webError}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2 max-h-[min(52vh,520px)] overflow-auto pr-1">
              {searching && !webAssets.length
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={`photo-skeleton-${index}`}
                      className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                    >
                      <div className="h-28 bg-slate-200" />
                      <div className="space-y-2 p-2">
                        <div className="h-2 rounded bg-slate-200" />
                        <div className="h-2 w-2/3 rounded bg-slate-200" />
                      </div>
                    </div>
                  ))
                : null}

              {webAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  draggable
                  onDragStart={(e) => startDesignerDrag(e, { kind: 'image', url: asset.url })}
                  onClick={() => addWebAssetToCanvas(asset.url)}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md cursor-grab active:cursor-grabbing"
                  title={asset.title}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={asset.thumb || asset.url}
                      alt={asset.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 p-2 text-[10px] text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="truncate font-semibold">{asset.creator || asset.source}</p>
                      <p className="truncate text-white/80">{asset.license || 'Free to use'}</p>
                    </div>
                    <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                      Add
                    </div>
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="line-clamp-1 text-[11px] font-medium text-slate-700">{asset.title}</p>
                    {asset.width && asset.height ? (
                      <p className="text-[10px] text-slate-400">
                        {asset.width} × {asset.height}
                      </p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>

            {!searching && !webAssets.length && !webError ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-700">Search for photos</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try a keyword like <span className="font-medium">restaurant</span>,{' '}
                  <span className="font-medium">logo background</span>, or pick a category above.
                </p>
              </div>
            ) : null}

            {webHasMore ? (
              <button
                type="button"
                onClick={loadMoreWebAssets}
                disabled={webLoadingMore}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {webLoadingMore ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                    Loading more…
                  </>
                ) : (
                  'Load more photos'
                )}
              </button>
            ) : null}

            {searching && webAssets.length > 0 ? (
              <p className="text-center text-[11px] text-slate-500">Updating results…</p>
            ) : null}
          </div>
        )}

        {selectedObject && (
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">
              {isBackgroundSelected ? 'Background' : isTextSelected ? 'Position & size' : 'Transform'}
            </h4>

            {isBackgroundSelected && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-500">
                  Click the canvas background to edit colours. Pick a swatch or use the custom colour picker.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {backgroundColorSwatches.map((color) => {
                    const isTransparent = color === 'transparent';
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => applySolidBackground(color)}
                        className={`relative h-9 rounded-lg border overflow-hidden hover:scale-[1.02] transition-transform ${
                          backgroundColor === color ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'
                        }`}
                        title={isTransparent ? 'Transparent' : color}
                      >
                        {isTransparent ? (
                          <div className="w-full h-full bg-[linear-gradient(45deg,#f8fafc_25%,#e5e7eb_25%,#e5e7eb_50%,#f8fafc_50%,#f8fafc_75%,#e5e7eb_75%,#e5e7eb_100%)] bg-[length:16px_16px]">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-7 h-0.5 bg-red-500 rotate-[-45deg]" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full" style={{ backgroundColor: color }} />
                        )}
                      </button>
                    );
                  })}
                  <label className="h-9 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <input
                      type="color"
                      value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                      onChange={(e) => applySolidBackground(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-lg text-emerald-700">+</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('background');
                    setBackgroundPanelTab('patterns');
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-gray-50"
                >
                  Browse patterns & images
                </button>
              </div>
            )}

            {isTextSelected && (
              <p className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-2 text-[11px] text-emerald-800">
                Text and colour controls are pinned at the top of this panel.
              </p>
            )}

            {shapeHasImageFill && (
              <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-semibold text-emerald-900">Image in shape</h5>
                  <button
                    type="button"
                    onClick={toggleShapeImageAdjustMode}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                      isShapeImageAdjustMode
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {isShapeImageAdjustMode ? 'Done' : 'Adjust position'}
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {isShapeImageAdjustMode
                    ? 'Drag the image to reposition. Scroll on the canvas to zoom in or out.'
                    : 'Double-click the shape or tap Adjust position to reposition the image inside the frame.'}
                </p>
                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    Zoom: {Math.round(shapeImageZoom * 100)}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.01"
                    value={shapeImageZoom}
                    onChange={(e) => handleShapeImageZoomChange(e.target.value)}
                    onMouseUp={() => canvas && saveHistoryState(canvas)}
                    onTouchEnd={() => canvas && saveHistoryState(canvas)}
                    className="w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={resetShapeImageTransform}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-gray-50"
                >
                  Reset position
                </button>
              </div>
            )}

            {!isBackgroundSelected && (
            <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 block mb-1">X</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={transformDraft.x}
                  onChange={(e) => handleTransformDraftChange('x', e.target.value)}
                  onFocus={(e) => handleTransformFocus('x', e)}
                  onBlur={() => commitTransformField('x')}
                  onKeyDown={(e) => handleTransformKeyDown('x', e)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Y</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={transformDraft.y}
                  onChange={(e) => handleTransformDraftChange('y', e.target.value)}
                  onFocus={(e) => handleTransformFocus('y', e)}
                  onBlur={() => commitTransformField('y')}
                  onKeyDown={(e) => handleTransformKeyDown('y', e)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">W</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={transformDraft.w}
                  onChange={(e) => handleTransformDraftChange('w', e.target.value)}
                  onFocus={(e) => handleTransformFocus('w', e)}
                  onBlur={() => commitTransformField('w')}
                  onKeyDown={(e) => handleTransformKeyDown('w', e)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">H</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={transformDraft.h}
                  onChange={(e) => handleTransformDraftChange('h', e.target.value)}
                  onFocus={(e) => handleTransformFocus('h', e)}
                  onBlur={() => commitTransformField('h')}
                  onKeyDown={(e) => handleTransformKeyDown('h', e)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Rotation</label>
              <input
                type="text"
                inputMode="decimal"
                value={transformDraft.rotation}
                onChange={(e) => handleTransformDraftChange('rotation', e.target.value)}
                onFocus={(e) => handleTransformFocus('rotation', e)}
                onBlur={() => commitTransformField('rotation')}
                onKeyDown={(e) => handleTransformKeyDown('rotation', e)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            </>
            )}
          </div>
        )}
          </div>
      </aside>
        ) : null}
      </div>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-100">
        <div className="flex shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-slate-200/80 bg-white px-3 py-2.5 shadow-sm sm:px-4" data-tour="online-toolbar">
          <div className="flex items-center gap-2 flex-wrap">
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
              onClick={removeSelected}
              disabled={isBackgroundSelected}
              className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Delete Selected"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12h8l1-12" />
              </svg>
            </button>
            <button
              type="button"
              onClick={duplicateSelected}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Duplicate (Ctrl+D)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            {isBackgroundSelected && (
              <>
                <div className="w-px h-7 bg-gray-200 mx-1" />
                <span className="text-xs font-semibold text-emerald-800">Background</span>
                <label className="inline-flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-white hover:bg-gray-50" title="Pick colour">
                  <input
                    type="color"
                    value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                    onChange={(e) => applySolidBackground(e.target.value)}
                    className="sr-only"
                  />
                  <span
                    className="h-5 w-5 rounded-md border border-gray-200"
                    style={{ backgroundColor: backgroundColor === 'transparent' ? '#ffffff' : backgroundColor }}
                  />
                </label>
                <div className="hidden sm:flex items-center gap-1">
                  {backgroundColorSwatches.filter((c) => c !== 'transparent').slice(0, 6).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applySolidBackground(color)}
                      className={`h-6 w-6 rounded-md border ${backgroundColor === color ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLeftDrawerOpen(true);
                    setActiveTab('background');
                    setBackgroundPanelTab('patterns');
                  }}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  Patterns
                </button>
              </>
            )}
            {isTextSelected && (
              <>
                <div className="w-px h-7 bg-gray-200 mx-1" />
                <button
                  type="button"
                  onClick={focusSidebarTextEditor}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                  title="Focus text editor in left panel"
                >
                  Edit text
                </button>
                <span className="text-xs font-semibold text-emerald-800">Colour</span>
                <label className="inline-flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-white hover:bg-gray-50" title="Pick text colour">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => applySelectedTextColor(e.target.value, selectedObject)}
                    className="sr-only"
                  />
                  <span
                    className="h-5 w-5 rounded-md border border-gray-200"
                    style={{ backgroundColor: textColor }}
                  />
                </label>
                <div className="hidden sm:flex items-center gap-1">
                  {TEXT_COLOR_SWATCHES.slice(0, 6).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applySelectedTextColor(color, selectedObject)}
                      className={`h-6 w-6 rounded-md border ${textColor === color ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </>
            )}
            {isShapeSelected && (
              <>
                <div className="w-px h-7 bg-gray-200 mx-1" />
                <span className="text-xs font-semibold text-emerald-800">Fill</span>
                <label
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                  title="Pick fill colour"
                >
                  <input
                    type="color"
                    value={/^#/.test(shapeFillColor) ? shapeFillColor : '#3b82f6'}
                    onChange={(e) => applyShapeFillColor(e.target.value, selectedObject)}
                    className="sr-only"
                  />
                  <span
                    className="h-5 w-5 rounded-md border border-gray-200"
                    style={{ backgroundColor: shapeHasImageFill ? 'transparent' : shapeFillColor }}
                  />
                </label>
                <div className="hidden sm:flex items-center gap-1">
                  {TEXT_COLOR_SWATCHES.slice(0, 6).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyShapeFillColor(color, selectedObject)}
                      className={`h-6 w-6 rounded-md border ${
                        !shapeHasImageFill && shapeFillColor === color
                          ? 'border-emerald-500 ring-2 ring-emerald-200'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="w-px h-7 bg-gray-200 mx-1" />
                <button
                  type="button"
                  onClick={triggerShapeImageUpload}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                  title="Fill this shape with an image"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15l4-4 4 4 3-3 5 5" />
                    <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                  {shapeHasImageFill ? 'Replace image' : 'Fill image'}
                </button>
                {shapeHasImageFill && (
                  <button
                    type="button"
                    onClick={removeShapeImageFill}
                    className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-50"
                    title="Remove image and keep the shape"
                  >
                    Remove image
                  </button>
                )}
                {shapeHasImageFill && (
                  <>
                    <div className="w-px h-7 bg-gray-200 mx-1" />
                    <button
                      type="button"
                      onClick={toggleShapeImageAdjustMode}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                        isShapeImageAdjustMode
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                      title="Drag to reposition the image inside the shape"
                    >
                      {isShapeImageAdjustMode ? 'Done adjusting' : 'Adjust position'}
                    </button>
                    <label className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                      <span>Zoom</span>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="0.01"
                        value={shapeImageZoom}
                        onChange={(e) => handleShapeImageZoomChange(e.target.value)}
                        onMouseUp={() => canvas && saveHistoryState(canvas)}
                        onTouchEnd={() => canvas && saveHistoryState(canvas)}
                        className="w-20"
                      />
                      <span className="w-9 text-right tabular-nums">{Math.round(shapeImageZoom * 100)}%</span>
                    </label>
                    <button
                      type="button"
                      onClick={resetShapeImageTransform}
                      className="hidden md:inline-flex rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-50"
                      title="Reset image zoom and position"
                    >
                      Reset
                    </button>
                  </>
                )}
              </>
            )}
            {!isBackgroundSelected && (
              <>
                <div className="w-px h-7 bg-gray-200 mx-1" />
                <div className="flex items-center gap-1">
                  <button onClick={() => flipSelectedObject('horizontal')} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50" title="Flip horizontal">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18M7 8l-4 4 4 4M17 8l4 4-4 4" /></svg>
                  </button>
                  <button onClick={() => flipSelectedObject('vertical')} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50" title="Flip vertical">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4" /></svg>
                  </button>
                </div>
                <div className="w-px h-7 bg-gray-200 mx-1" />
                <div className="flex items-center gap-1">
                  <button onClick={() => alignSelection('left')} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50" title="Align Left">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5v14M8 7h12M8 12h8M8 17h12" /></svg>
                  </button>
                  <button onClick={() => alignSelection('center')} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50" title="Align Center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M6 7h12M8 12h8M6 17h12" /></svg>
                  </button>
                  <button onClick={() => alignSelection('right')} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50" title="Align Right">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 5v14M4 7h12M8 12h8M4 17h12" /></svg>
                  </button>
                  <button onClick={() => alignSelection('top')} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50" title="Align Top">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 4h14M7 8v12M12 8v8M17 8v12" /></svg>
                  </button>
                  <button onClick={() => alignSelection('middle')} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50" title="Align Middle">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M7 5v14M12 7v10M17 5v14" /></svg>
                  </button>
                  <button onClick={() => alignSelection('bottom')} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50" title="Align Bottom">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20h14M7 4v12M12 8v8M17 4v12" /></svg>
                  </button>
                </div>
                <div className="w-px h-7 bg-gray-200 mx-1" />
                <div className="flex items-center gap-1">
                  <button type="button" onClick={bringSelectionToFront} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-xs font-medium" title="Bring to front">
                    Front
                  </button>
                  <button type="button" onClick={sendSelectionToBack} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-xs font-medium" title="Send to back">
                    Back
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTool(activeTool === 'pan' ? 'select' : 'pan')}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors ${
                activeTool === 'pan'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 text-slate-700 hover:bg-gray-50'
              }`}
              title="Hand tool — drag to scroll (hold Space)"
              aria-label="Hand tool"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V6a1.5 1.5 0 013 0m0 0v-.5a1.5 1.5 0 013 0V6m0 0a1.5 1.5 0 013 0v5m0 0V9.5a1.5 1.5 0 013 0V14a6 6 0 01-6 6h-2.5a6 6 0 01-4.9-2.55l-2.06-2.94a1.6 1.6 0 012.5-2l1.46 1.49" />
              </svg>
            </button>
            <button
              type="button"
              onClick={fitToScreen}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-50"
              title="Fit canvas to screen"
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => handleZoom(zoom - 10)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-lg font-semibold leading-none text-slate-700 hover:bg-gray-50"
              title="Zoom out"
              aria-label="Zoom out"
            >
              −
            </button>
            <input
              type="range"
              min="10"
              max="300"
              value={zoom}
              onChange={(e) => handleZoom(Number(e.target.value))}
              className="accent-emerald-600"
              title="Zoom"
            />
            <button
              type="button"
              onClick={() => handleZoom(zoom + 10)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-lg font-semibold leading-none text-slate-700 hover:bg-gray-50"
              title="Zoom in"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => handleZoom(100)}
              className="w-14 rounded-lg border border-gray-300 px-1 py-1.5 text-center text-sm font-semibold text-slate-700 hover:bg-gray-50"
              title="Reset to 100%"
            >
              {zoom}%
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Size</span>
            <select
              value={canvasSizeUnit}
              onChange={(e) => handleCanvasSizeUnitChange(e.target.value)}
              className="rounded-lg border border-gray-300 p-2 text-sm"
              title="Measurement unit"
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
            <input
              type="number"
              min={canvasSizeUnit === 'in' ? '0.1' : '1'}
              step={canvasSizeUnit === 'in' ? '0.01' : '0.1'}
              value={canvasWidthInput}
              onChange={(e) => setCanvasWidthInput(e.target.value)}
              className="w-20 rounded-lg border border-gray-300 p-2 text-sm"
              title="Width"
              aria-label="Canvas width"
            />
            <span className="text-sm text-gray-400">×</span>
            <input
              type="number"
              min={canvasSizeUnit === 'in' ? '0.1' : '1'}
              step={canvasSizeUnit === 'in' ? '0.01' : '0.1'}
              value={canvasHeightInput}
              onChange={(e) => setCanvasHeightInput(e.target.value)}
              className="w-20 rounded-lg border border-gray-300 p-2 text-sm"
              title="Height"
              aria-label="Canvas height"
            />
            <button
              type="button"
              onClick={applyCanvasSize}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>

        <div
          ref={canvasWorkspaceRef}
          className={`relative min-h-0 flex-1 overflow-hidden bg-[linear-gradient(180deg,#e2e8f0_0%,#cbd5e1_100%)] p-4 md:p-6 ${isCanvasDragOver ? 'ring-2 ring-inset ring-emerald-400' : ''}`}
          data-tour="online-canvas"
        >
          {selectedObject && isTextObject(selectedObject) && textEditorActive && (
            <div className="pointer-events-none fixed left-1/2 top-[72px] z-30 w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg shadow-emerald-100/60 ring-1 ring-emerald-100">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Edit text</p>
                  <p className="text-xs text-slate-500">Type below · Press Esc or click canvas to finish</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTextEditorActive(false);
                    canvasTextEditorRef.current?.blur();
                  }}
                  className="pointer-events-auto rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-200"
                >
                  Done
                </button>
              </div>
              <textarea
                ref={canvasTextEditorRef}
                data-designer-text-editor="true"
                rows={3}
                value={selectedTextDraft}
                onChange={(e) => handleSelectedTextDraftChange(e.target.value)}
                className="pointer-events-auto w-full resize-y rounded-xl border-2 border-emerald-300 bg-white p-3 text-sm text-slate-900 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Replace this text..."
              />
            </div>
          )}
          {isCanvasDragOver && (
            <div className="pointer-events-none absolute inset-4 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/40">
              <div className="rounded-2xl bg-white px-4 py-2.5 text-center shadow-sm">
                <p className="text-sm font-semibold text-emerald-800">Drop here to add to your design</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Drop an image onto a shape to fill it</p>
              </div>
            </div>
          )}
          {selectedObject && isTextObject(selectedObject) && !textEditorActive && (
            <div className="pointer-events-none fixed bottom-24 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-slate-900/92 px-4 py-2 text-xs font-medium text-white shadow-lg">
                <span>Text selected</span>
                <span className="text-slate-400">·</span>
                <span className="flex items-center gap-1 text-emerald-300">
                  Edit in left panel
                  <svg className="h-3.5 w-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </span>
              </div>
              <button
                type="button"
                onClick={focusSidebarTextEditor}
                className="pointer-events-auto rounded-full border border-emerald-400/60 bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500"
              >
                Start typing
              </button>
            </div>
          )}
          {isShapeImageAdjustMode && shapeHasImageFill && (
            <div className="pointer-events-none fixed bottom-24 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-slate-900/92 px-4 py-2 text-xs font-medium text-white shadow-lg">
                <span className="text-emerald-300">Adjusting image</span>
                <span className="text-slate-400">·</span>
                <span>Drag to move</span>
                <span className="text-slate-400">·</span>
                <span>Scroll to zoom</span>
              </div>
              <button
                type="button"
                onClick={exitShapeImageAdjustMode}
                className="pointer-events-auto rounded-full border border-emerald-400/60 bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500"
              >
                Done adjusting
              </button>
            </div>
          )}
          {activeTool === 'pan' && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-slate-900/92 px-4 py-2 text-xs font-medium text-white shadow-lg">
                <span className="text-emerald-300">Hand tool</span>
                <span className="text-slate-400">·</span>
                <span>Drag or scroll to pan</span>
                <span className="text-slate-400">·</span>
                <span>Ctrl/⌘ + scroll to zoom</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTool('select')}
                className="pointer-events-auto rounded-full border border-emerald-400/60 bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500"
              >
                Back to select
              </button>
            </div>
          )}
          <div
            ref={canvasStageRef}
            className={`absolute inset-0 overflow-hidden ${
              activeTool === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
            }`}
          >
            <div
              ref={canvasCardWrapperRef}
              className="absolute left-1/2 top-1/2"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <CanvasSizeGuides
                widthLabel={`${canvasWidthInput} ${canvasSizeUnit}`}
                heightLabel={`${canvasHeightInput} ${canvasSizeUnit}`}
                displayWidth={getCanvasDisplaySize(canvas, zoom).width}
                displayHeight={getCanvasDisplaySize(canvas, zoom).height}
              >
                <div
                  className={`relative inline-block overflow-hidden rounded-2xl bg-white p-2 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 ${isPanning ? 'cursor-grabbing' : activeTool === 'pan' ? 'cursor-grab' : ''}`}
                >
                  <div
                    className="rounded-xl"
                    style={{
                      backgroundColor: '#f8fafc',
                      backgroundImage:
                        'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  >
                    <canvas ref={canvasElRef} style={{ display: 'block' }} />
                  </div>
                  <div className="pointer-events-none absolute inset-2 rounded-xl ring-1 ring-emerald-400/35" aria-hidden="true" />
                </div>
              </CanvasSizeGuides>
            </div>
          </div>
        </div>

        <div className="relative z-20 flex shrink-0 items-center justify-between gap-3 overflow-visible border-t border-slate-200/80 bg-white px-4 py-3 shadow-[0_-4px_20px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
              Page {currentPageIndex + 1}/{pages.length}
            </span>
            <button
              onClick={deletePage}
              disabled={pages.length <= 1 || isProductMode}
              className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isProductMode ? 'Sides are fixed for this product' : 'Remove Current Page'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12h8l1-12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {selectedObject && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(selectedObject.opacity ?? 1) * 100}
                  onChange={(e) => updateSelectedObject('opacity', Number(e.target.value) / 100)}
                />
              </div>
            )}

            {!isProductMode && (
              <>
            <ToolbarTooltip
              title="Save Project"
              description="Download a project file (.json) so you can reopen and continue editing later."
            >
              <button
                type="button"
                onClick={saveProject}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Save Project
              </button>
            </ToolbarTooltip>
            <ToolbarTooltip
              title="Load Project"
              description="Open a project file you previously saved from this design tool."
            >
              <button
                type="button"
                onClick={() => projectLoadRef.current?.click()}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Load Project
              </button>
            </ToolbarTooltip>
            <ToolbarTooltip
              title="Export PNG"
              description="Quickly download the current page as a PNG image — ideal for social posts and web use."
            >
              <button
                type="button"
                onClick={exportCurrentPageAsPng}
                disabled={isExportingPng}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
              >
                {isExportingPng ? 'Exporting…' : 'Export PNG'}
              </button>
            </ToolbarTooltip>
              </>
            )}
            <input ref={projectLoadRef} type="file" accept="application/json" className="hidden" onChange={loadProject} />
            <input ref={shapeImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleShapeImageFile} />
            {!isProductMode && (
              <ToolbarTooltip
                title="Save & Download"
                description="Export your design as PDF or PNG — choose format, quality, pages, and transparency before downloading."
              >
                <button
                  type="button"
                  onClick={handleDownloadClick}
                  disabled={isExportingDesign}
                  data-tour="online-download"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
                >
                  {isExportingDesign ? 'Preparing…' : 'Save & Download'}
                </button>
              </ToolbarTooltip>
            )}
            {isProductMode && (
              <>
                <ToolbarTooltip
                  title="3D Preview"
                  description="See a realistic 3D preview of your design. Move your cursor to rotate it."
                >
                  <button
                    type="button"
                    onClick={handleOpen3DPreview}
                    disabled={isGeneratingPreview}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {isGeneratingPreview ? 'Rendering…' : 'Preview'}
                  </button>
                </ToolbarTooltip>
                <ToolbarTooltip
                  title="Download PDF"
                  description="Download a print-ready PDF of your design to your device."
                >
                  <button
                    type="button"
                    onClick={handleDownloadProductArtwork}
                    disabled={isDownloadingArtwork}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {isDownloadingArtwork ? 'Preparing…' : 'Download'}
                  </button>
                </ToolbarTooltip>
                <ToolbarTooltip
                  title="Preview & Order"
                  description="Generate your print-ready design, review it, then add to basket or checkout."
                >
                  <button
                    type="button"
                    onClick={handlePreviewAndOrder}
                    disabled={isPreparingOrder}
                    data-tour="online-download"
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
                  >
                    {isPreparingOrder ? 'Preparing…' : 'Preview & Order'}
                  </button>
                </ToolbarTooltip>
              </>
            )}
          </div>
        </div>
      </main>

      <aside className="w-[240px] min-w-[240px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900">Pages</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{pages.length}</span>
        </div>

        <div className="space-y-2.5">
          {pages.map((page, idx) => (
            <button
              key={page.id}
              onClick={() => switchToPage(idx)}
              className={`w-full rounded-xl border p-2.5 text-left transition-all ${
                idx === currentPageIndex
                  ? 'border-emerald-400 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
              title={`Go to ${page.name}`}
            >
              <div className="flex h-16 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                {page.thumbnail ? (
                  <img
                    src={page.thumbnail}
                    alt={page.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No preview</span>
                )}
              </div>
              <div className="mt-1.5 text-[11px] font-medium text-gray-700 break-words">{page.name}</div>
              <div className="text-[11px] text-gray-500">{page.width} x {page.height}</div>
            </button>
          ))}
        </div>

      </aside>
      </div>

      <RefreshGuardModal
        open={refreshGuard.open}
        onCancel={refreshGuard.cancel}
        onConfirm={refreshGuard.confirmReload}
        message="Reloading may lose your current design. Your work is auto-saved locally, but we recommend downloading it first to be safe."
        font={font}
      />

      {showExitModal ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
          onClick={handleCancelExit}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)]"
            style={font}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-designer-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h3 id="exit-designer-title" className="text-base font-semibold text-slate-900">
                    Leave the designer?
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {isProductMode
                      ? 'Return to the product page? Unsaved design changes will be lost unless you have already prepared your order.'
                      : canvasHasDesign()
                        ? 'Are you sure you want to exit? Download your design as a PDF before leaving so you don\'t lose your work.'
                        : 'Are you sure you want to exit the design tool?'}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 px-5 py-4">
              <button
                type="button"
                onClick={handleDownloadAndExit}
                disabled={isExportingDesign || !canvas}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {isExportingDesign ? 'Preparing…' : 'Download & exit'}
              </button>
              <button
                type="button"
                onClick={handleExitDownload}
                disabled={isExportingDesign || !canvas}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                {isExportingDesign ? 'Preparing…' : 'Download only'}
              </button>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCancelExit}
                  disabled={isExportingDesign}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Stay editing
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  disabled={isExportingDesign}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  Exit without saving
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showDownloadModal ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
          onClick={closeDownloadModal}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)]"
            style={font}
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-design-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <h3 id="download-design-title" className="text-base font-semibold text-slate-900">
                    Save &amp; Download
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Choose your export settings, then confirm to download.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Format</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'pdf', label: 'PDF', hint: 'Best for print & sharing' },
                    { id: 'png', label: 'PNG', hint: 'Best for web & social' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setDownloadForm((prev) => ({
                          ...prev,
                          format: option.id,
                          transparentBackground: option.id === 'pdf' ? false : prev.transparentBackground,
                        }))
                      }
                      className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        downloadForm.format === option.id
                          ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{option.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="download-quality" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quality
                </label>
                <select
                  id="download-quality"
                  value={downloadForm.quality}
                  onChange={(e) => setDownloadForm((prev) => ({ ...prev, quality: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {Object.entries(EXPORT_QUALITY_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              {pages.length > 1 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Pages</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'all', label: 'All pages', hint: `${pages.length} pages` },
                      { id: 'current', label: 'Current page only', hint: `Page ${currentPageIndex + 1}` },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setDownloadForm((prev) => ({ ...prev, pageScope: option.id }))}
                        className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          downloadForm.pageScope === option.id
                            ? 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-100'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {downloadForm.format === 'png' ? (
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={downloadForm.transparentBackground}
                    onChange={(e) =>
                      setDownloadForm((prev) => ({
                        ...prev,
                        transparentBackground: e.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    <span className="block font-semibold text-slate-900">Transparent background</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Export with no canvas background colour (useful for overlays and logos).
                    </span>
                  </span>
                </label>
              ) : null}

              <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-3 text-sm text-blue-900">
                {buildDownloadSummary(downloadForm, pages.length, currentPageIndex)}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={closeDownloadModal}
                disabled={isExportingDesign}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDownloadExport}
                disabled={isExportingDesign || !canvas}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExportingDesign ? 'Preparing download…' : 'Confirm download'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {templateSwitchModal.open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)]"
            style={font}
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-switch-title"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <h3 id="template-switch-title" className="text-base font-semibold text-slate-900">
                    Use this template
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    You have{' '}
                    <span className="font-semibold text-slate-800">
                      {templateSwitchModal.projectPageCount} page
                      {templateSwitchModal.projectPageCount === 1 ? '' : 's'}
                    </span>{' '}
                    in your project. Choose how to load{' '}
                    <span className="font-semibold text-slate-800">{templateSwitchModal.templateName}</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 px-5 py-4">
              <button
                type="button"
                onClick={() => confirmTemplateAction('replace-current-page')}
                className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition-colors hover:bg-emerald-100"
              >
                <p className="text-sm font-semibold text-emerald-900">Apply to this page only</p>
                <p className="mt-0.5 text-xs leading-relaxed text-emerald-800/80">
                  Replace page {currentPageIndex + 1} with this template. All other pages stay exactly as they are.
                  {templateSwitchModal.templatePageCount > 1
                    ? ' (Uses the first page of the template.)'
                    : ''}
                </p>
              </button>

              <button
                type="button"
                onClick={() => confirmTemplateAction('add-pages')}
                className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left transition-colors hover:bg-blue-100"
              >
                <p className="text-sm font-semibold text-blue-900">Add as new page(s)</p>
                <p className="mt-0.5 text-xs leading-relaxed text-blue-800/80">
                  Keep all existing pages and append{' '}
                  {templateSwitchModal.templatePageCount === 1
                    ? 'this template'
                    : `all ${templateSwitchModal.templatePageCount} template pages`}{' '}
                  to the end of your project.
                </p>
              </button>

              <button
                type="button"
                onClick={() => confirmTemplateAction('replace-project')}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left transition-colors hover:bg-red-100"
              >
                <p className="text-sm font-semibold text-red-900">Replace entire project</p>
                <p className="mt-0.5 text-xs leading-relaxed text-red-800/80">
                  Delete all {templateSwitchModal.projectPageCount} existing page
                  {templateSwitchModal.projectPageCount === 1 ? '' : 's'} and start fresh with this template only.
                  This cannot be undone.
                </p>
              </button>
            </div>

            <div className="flex justify-end border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={cancelTemplateSwitch}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>

    {isProductMode && show3DPreviewModal && (() => {
      const cardW = pages[0]?.width || 210;
      const cardH = pages[0]?.height || 148;
      const cardDepth = Math.max(10, Math.round(Math.min(cardW, cardH) * 0.028));
      const normalizedRot = ((previewRotationY % 360) + 360) % 360;
      const showingBackFace = normalizedRot > 90 && normalizedRot < 270;
      const productLabel = savedDraft?.productName || productType || 'Your design';

      return (
      <div
        className="fixed inset-0 z-[75] flex items-center justify-center p-4 sm:p-6"
        style={font}
        role="presentation"
        onClick={() => setShow3DPreviewModal(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" aria-hidden />

        <div
          className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.55)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-3d-title"
          onClick={(e) => e.stopPropagation()}
          onMouseMove={handlePreviewPointerMove}
          onTouchMove={handlePreviewPointerMove}
        >
          {/* Header */}
          <div className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-5 py-4 sm:px-6">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live preview
                </div>
                <h3 id="preview-3d-title" className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {productLabel}
                </h3>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Drag or move your cursor to rotate · {isProductDoubleSided ? 'Double-sided product' : 'Single-sided product'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShow3DPreviewModal(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                aria-label="Close preview"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Studio viewer */}
          <div
            className="relative overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 20%, #1e3a5f 0%, #0f172a 45%, #020617 100%)',
            }}
          >
            {/* Spotlight */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 55% 45% at 50% 15%, rgba(255,255,255,0.12) 0%, transparent 70%)',
              }}
            />
            {/* Subtle grid floor */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-[0.07]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: 'perspective(400px) rotateX(60deg)',
                transformOrigin: 'center bottom',
              }}
            />

            <div className="relative flex min-h-[320px] flex-col items-center justify-center px-4 py-10 sm:min-h-[380px] sm:py-12">
              {/* Side indicator badge */}
              <div className="mb-5 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    !showingBackFace
                      ? 'bg-white/15 text-white ring-1 ring-white/25'
                      : 'bg-white/5 text-white/40'
                  }`}
                >
                  Front
                </span>
                {isProductDoubleSided && (
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                      showingBackFace
                        ? 'bg-white/15 text-white ring-1 ring-white/25'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    Back
                  </span>
                )}
              </div>

              {/* 3D stage */}
              <div
                className="relative flex items-center justify-center"
                style={{ perspective: '1400px', perspectiveOrigin: '50% 40%' }}
              >
                {/* Floor shadow */}
                <div
                  className="pointer-events-none absolute -bottom-6 left-1/2 h-8 w-[72%] -translate-x-1/2 rounded-[100%] bg-black/50 blur-xl"
                  style={{
                    transform: `translateX(-50%) scaleX(${0.85 + Math.abs(Math.sin((previewRotationY * Math.PI) / 180)) * 0.15})`,
                  }}
                />

                <div
                  data-3d-preview-container="true"
                  className="relative"
                  style={{
                    width: 'min(440px, 82vw)',
                    aspectRatio: `${cardW} / ${cardH}`,
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(18deg) rotateY(${previewRotationY}deg)`,
                  }}
                >
                  {/* Front face */}
                  <div
                    className="absolute inset-0 overflow-hidden rounded-2xl bg-white"
                    style={{
                      transform: `translateZ(${cardDepth}px)`,
                      backfaceVisibility: 'hidden',
                      boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8)',
                    }}
                  >
                    {sidePreviewUrls.front ? (
                      <img
                        src={sidePreviewUrls.front}
                        alt="Front artwork"
                        className="h-full w-full object-contain"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
                        Front unavailable
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
                  </div>

                  {/* Back face */}
                  {isProductDoubleSided && (
                    <div
                      className="absolute inset-0 overflow-hidden rounded-2xl bg-white"
                      style={{
                        transform: `rotateY(180deg) translateZ(${cardDepth}px)`,
                        backfaceVisibility: 'hidden',
                        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.8)',
                      }}
                    >
                      {sidePreviewUrls.back ? (
                        <img
                          src={sidePreviewUrls.back}
                          alt="Back artwork"
                          className="h-full w-full object-contain"
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
                          Back unavailable
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
                    </div>
                  )}

                  {/* Card edge — right (paper thickness) */}
                  <div
                    className="absolute bottom-2 right-0 top-2 rounded-r-md"
                    style={{
                      width: `${cardDepth}px`,
                      transform: `rotateY(90deg) translateZ(${cardDepth}px)`,
                      transformOrigin: 'right center',
                      background: 'linear-gradient(to bottom, #e8edf2, #c8d0da 40%, #a8b4c0 100%)',
                      boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.08)',
                    }}
                  />
                  {/* Card edge — left */}
                  <div
                    className="absolute bottom-2 left-0 top-2 rounded-l-md"
                    style={{
                      width: `${cardDepth}px`,
                      transform: `rotateY(-90deg) translateZ(0px)`,
                      transformOrigin: 'left center',
                      background: 'linear-gradient(to bottom, #d0d8e0, #b0bac6 50%, #909aa8 100%)',
                    }}
                  />
                  {/* Card edge — top */}
                  <div
                    className="absolute left-2 right-2 top-0 rounded-t-md"
                    style={{
                      height: `${cardDepth}px`,
                      transform: `rotateX(90deg) translateZ(0px)`,
                      transformOrigin: 'top center',
                      background: 'linear-gradient(to right, #eef1f5, #d8dfe8, #eef1f5)',
                    }}
                  />
                  {/* Card edge — bottom */}
                  <div
                    className="absolute bottom-0 left-2 right-2 rounded-b-md"
                    style={{
                      height: `${cardDepth}px`,
                      transform: `rotateX(-90deg) translateZ(0px)`,
                      transformOrigin: 'bottom center',
                      background: 'linear-gradient(to right, #a0aab6, #8892a0, #a0aab6)',
                    }}
                  />
                </div>
              </div>

              {/* Hint */}
              <div className="mt-8 flex items-center gap-2 text-xs text-white/50">
                <svg className="h-4 w-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
                <span>Move left or right to inspect every angle</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6">
            <p className="text-xs text-slate-500">
              This is a visual preview — colours may vary slightly in print.
            </p>
            <button
              type="button"
              onClick={() => setShow3DPreviewModal(false)}
              className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Back to editor
            </button>
          </div>
        </div>
      </div>
      );
    })()}
    </>
  );
};

export default GenericProductDesigner;
