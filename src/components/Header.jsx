import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNeonPreviewExit } from '../context/NeonPreviewExitContext';
import { payableFromNet, SUMMARY_LINES_EXCLUDE_FROM_CHECKOUT_NAV } from '../utils/vatUtils';
import {
  TRADEPRINT_CATEGORY_SLUGS,
  TRADEPRINT_CATEGORY_LABELS,
  isTradeprintCategory,
} from '../utils/tradeprintCategories';
import { basketTypeLabel, getBasketItemDetailLines } from '../utils/cartItemDisplay';
import { canEditCartItem, getCartItemEditTarget } from '../utils/cartItemEdit';

const Header = () => {
  const navigate = useNavigate();
  const { confirmLeavePreview } = useNeonPreviewExit();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, getCartItemCount, removeFromCart, updateQuantity } = useCart();
  const [isVatInclusive, setIsVatInclusive] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const [basketFlyoutStyle, setBasketFlyoutStyle] = useState(null);
  const [basketHighlightId, setBasketHighlightId] = useState(null);
  const shopRef = useRef(null);
  const designRef = useRef(null);
  const accountRef = useRef(null);
  const basketDesktopRef = useRef(null);
  const basketMobileRef = useRef(null);
  const basketFlyoutRef = useRef(null);
  const basketScrollRef = useRef(null);

  const accountMenu = [
    { label: 'Overview', tab: 'profile' },
    { label: 'Quotes', tab: 'quotes' },
    { label: 'Design Orders', tab: 'design-orders' },
    { label: 'Track Order', tab: 'track-order' },
    { label: 'Cancel Order', tab: 'cancel-order' },
    { label: 'Security', tab: 'change-password' },
  ];

  const shopMenu = [
    {
      title: 'Signs',
      iconPath: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2m0 18l6-3m-6 3V2m6 15l5.447-2.724A1 1 0 0021 13.382V2.618a1 1 0 00-.553-.894L15 0m0 17V0m0 0L9 2',
      items: [
        { label: 'Printed Board', category: 'printed-board' },
        { label: '2D Box Signage', category: '2d-box-signage' },
        { label: '3D Built Up Letters', category: '3d-built-up-letters' },
        { label: 'Flex Face', category: 'flex-face' },
        { label: 'Lightbox', category: 'lightbox' },
      ],
    },
    {
      title: 'Printing',
      iconPath: 'M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z',
      items: [
        { label: 'Posters', category: 'posters' },
        { label: 'PVC Banners', category: 'pvc-banners' },
        { label: 'Correx / Foamex / Aluminium Prints', category: 'correx-foamex-aluminium-prints' },
        { label: 'Backlit Prints', category: 'backlit-prints' },
        { label: 'Canvas Prints', category: 'canvas-prints' },
      ],
    },
    {
      title: 'Window Graphics',
      iconPath: 'M3 4h18v16H3V4zm9 0v16M3 10h18',
      items: [
        { label: 'Printed Vinyl', category: 'printed-vinyl' },
        { label: 'Frosted Vinyl', category: 'frosted-vinyl' },
        { label: 'One Way Vision', category: 'one-way-vision' },
        { label: 'Cut Vinyl', category: 'cut-vinyl' },
        { label: 'Privacy Films', category: 'privacy-films' },
      ],
    },
    {
      title: 'Fabrication',
      iconPath:
        'M11 5h2m-1-2v4m7 5h-4m-6 0H5m4.586 7.414a2 2 0 01-2.828 0l-1.172-1.172a2 2 0 010-2.828l1.172-1.172a2 2 0 012.828 0l1.172 1.172a2 2 0 010 2.828l-1.172 1.172zm8.828 0a2 2 0 01-2.828 0l-1.172-1.172a2 2 0 010-2.828l1.172-1.172a2 2 0 012.828 0l1.172 1.172a2 2 0 010 2.828l-1.172 1.172z',
      items: [
        { label: 'CNC Router Cutting', category: 'cnc-router-cutting' },
        { label: 'Fibre Laser Cutting', category: 'fibre-laser-cutting' },
        { label: 'Fibre Laser Welding', category: 'fibre-laser-welding' },
      ],
    },
    {
      title: 'Print Products',
      iconPath: 'M7 6h10M7 10h10M7 14h6m-8 6h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      items: TRADEPRINT_CATEGORY_SLUGS.map((category) => ({
        label: TRADEPRINT_CATEGORY_LABELS[category],
        category,
      })),
    },
  ];

  // Map old section names to routes
  const routeMap = {
    'home': '/',
    'quote': '/get-free-quote',
    'about-us': '/about-us',
    'account': '/account',
    'login': '/login',
    'register': '/register',
    'product-designer': '/generic-product-designer',
    'custom-neon-builder': '/custom-neon-builder',
    'neon-builder': '/neon-builder',
    'contact': '/#contact',
    'gallery': '/gallery',
    'shop-mug': '/#products',
    'shop-pen': '/#products',
    'shop-shirt': '/#products',
    'shop-flyer': '/#products',
    'shop-banner': '/#products',
    'shop-sticker': '/#products',
    'shop-business-card': '/#products',
    'shop-brochure': '/#products',
  };

  const goToShopCategory = async (categorySlug) => {
    if (!(await confirmLeavePreview())) return;
    const featuredRouteMap = {
      '3d-built-up-letters': '/featured/3d-built-up-letters',
      '2d-box-signage': '/featured/2d-box-signage',
      'flex-face': '/featured/flex-face',
      'lightbox': '/featured/lightbox',
      'printed-board': '/featured/printed-board',
      'posters': '/featured/posters',
      'pvc-banners': '/featured/pvc-banners',
      'correx-foamex-aluminium-prints': '/featured/correx-foamex-aluminium-prints',
      'backlit-prints': '/featured/backlit-prints',
      'canvas-prints': '/featured/canvas-prints',
      'printed-vinyl': '/featured/printed-vinyl',
      'frosted-vinyl': '/featured/frosted-vinyl',
      'one-way-vision': '/featured/one-way-vision',
      'cut-vinyl': '/featured/cut-vinyl',
      'privacy-films': '/featured/privacy-films',
      'cnc-router-cutting': '/featured/cnc-router-cutting',
      'fibre-laser-cutting': '/featured/fibre-laser-cutting',
      'fibre-laser-welding': '/featured/fibre-laser-welding',
    };

    // Tradeprint categories open the homepage shop section filtered by category.
    if (isTradeprintCategory(categorySlug)) {
      navigate(`/?category=${encodeURIComponent(categorySlug)}`);
      setTimeout(() => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      setMobileMenuOpen(false);
      setShopOpen(false);
      setDesignOpen(false);
      setAccountOpen(false);
      return;
    }

    // Navigate featured categories to their dedicated pages, fallback to generic category route.
    navigate(featuredRouteMap[categorySlug] || `/category/${categorySlug}`);
    setMobileMenuOpen(false);
    setShopOpen(false);
    setDesignOpen(false);
    setAccountOpen(false);
  };

  const handleNavClick = async (section) => {
    if (!(await confirmLeavePreview())) return;
    const route = routeMap[section] || '/';
    if (route.startsWith('/#')) {
      // Handle hash navigation (scroll to section)
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(route.substring(2));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      navigate(route);
    }
    setMobileMenuOpen(false);
    setShopOpen(false);
    setDesignOpen(false);
    setAccountOpen(false);
  };

  const goToAccountTab = async (tab) => {
    if (!(await confirmLeavePreview())) return;
    navigate(tab ? `/account?tab=${encodeURIComponent(tab)}` : '/account');
    setMobileMenuOpen(false);
    setShopOpen(false);
    setDesignOpen(false);
    setAccountOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shopRef.current && !shopRef.current.contains(event.target)) {
        setShopOpen(false);
      }
      if (designRef.current && !designRef.current.contains(event.target)) {
        setDesignOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
      const inBasketUi =
        basketDesktopRef.current?.contains(event.target) ||
        basketMobileRef.current?.contains(event.target) ||
        basketFlyoutRef.current?.contains(event.target);
      if (!inBasketUi) {
        setBasketOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const openBasket = (event) => {
      const highlightId = event?.detail?.highlightId;
      if (highlightId) setBasketHighlightId(String(highlightId));
      setBasketOpen(true);
    };
    window.addEventListener('rspuk-basket-open', openBasket);
    return () => window.removeEventListener('rspuk-basket-open', openBasket);
  }, []);

  useEffect(() => {
    if (!basketOpen || !basketHighlightId) return undefined;
    const timer = window.setTimeout(() => {
      const root = basketScrollRef.current;
      if (!root) return;
      const el = Array.from(root.querySelectorAll('[data-basket-item-id]')).find(
        (node) => node.getAttribute('data-basket-item-id') === String(basketHighlightId),
      );
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [basketOpen, basketHighlightId, cartItems]);

  const getActiveBasketAnchor = useCallback(() => {
    const mobile = basketMobileRef.current;
    const desktop = basketDesktopRef.current;
    if (mobile && mobile.offsetWidth > 0 && mobile.offsetHeight > 0) return mobile;
    if (desktop && desktop.offsetWidth > 0 && desktop.offsetHeight > 0) return desktop;
    return desktop || mobile;
  }, []);

  const updateBasketFlyoutPosition = useCallback(() => {
    const anchor = getActiveBasketAnchor();
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 16, window.innerWidth < 1024 ? 320 : 380);
    const maxHeight = Math.max(
      280,
      Math.min(window.innerHeight - rect.bottom - 16, window.innerHeight * 0.78, 520),
    );
    const next = {
      position: 'fixed',
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
      width,
      maxHeight,
      // Explicit height so the inner list can scroll instead of growing forever.
      height: maxHeight,
      zIndex: 200,
    };
    setBasketFlyoutStyle((prev) => {
      if (
        prev &&
        prev.top === next.top &&
        prev.right === next.right &&
        prev.width === next.width &&
        prev.maxHeight === next.maxHeight &&
        prev.height === next.height
      ) {
        return prev;
      }
      return next;
    });
  }, [getActiveBasketAnchor]);

  useLayoutEffect(() => {
    if (!basketOpen) {
      setBasketFlyoutStyle(null);
      return undefined;
    }
    updateBasketFlyoutPosition();

    const onWindowChange = (event) => {
      // Ignore scrolls inside the basket — repositioning remounted/reset scroll before.
      if (event?.type === 'scroll') {
        const target = event.target;
        if (
          target instanceof Node &&
          (basketFlyoutRef.current?.contains(target) ||
            basketScrollRef.current === target ||
            basketFlyoutRef.current === target)
        ) {
          return;
        }
      }
      updateBasketFlyoutPosition();
    };

    window.addEventListener('resize', onWindowChange);
    window.addEventListener('scroll', onWindowChange, true);
    return () => {
      window.removeEventListener('resize', onWindowChange);
      window.removeEventListener('scroll', onWindowChange, true);
    };
  }, [basketOpen, updateBasketFlyoutPosition]);

  const basketCount = getCartItemCount();

  const lineBasketDisplayAmount = (item) => {
    const incomingPrice = Number(item?.price || 0);
    if (!Number.isFinite(incomingPrice)) return 0;
    if (item?.type === 'checkout-order') return incomingPrice;
    if (item?.type === 'custom-neon' || item?.amountBasis === 'net') {
      return payableFromNet(incomingPrice, isVatInclusive);
    }
    return incomingPrice;
  };

  const basketTotalDisplay = cartItems.reduce((sum, item) => sum + lineBasketDisplayAmount(item), 0);

  const goToCheckoutForItem = (item) => {
    const qty = Number(item.quantity || 1);
    const lineNet = Number(item.price || 0) * qty;
    let summary =
      Array.isArray(item.summary) && item.summary.length > 0
        ? item.summary
        : [
            { label: 'Item', value: item.title || 'Product' },
            { label: 'Details', value: item.description || '—' },
          ];
    if (item.type === 'custom-neon') {
      summary = summary.filter((row) => !SUMMARY_LINES_EXCLUDE_FROM_CHECKOUT_NAV.has(row.label));
    }
    navigate('/checkout', {
      state: {
        checkoutData: {
          title: item.title || 'Checkout',
          description: item.description || 'Complete your purchase securely.',
          amount: lineNet,
          amountBasis: item.type === 'custom-neon' ? 'net' : item.amountBasis || null,
          type: item.type,
          designServiceRequestId: item.designServiceRequestId,
          summary,
          selectedAttributes: item?.selectedAttributes,
          selectionSnapshot: item?.selectionSnapshot,
          productOptions: item?.productOptions,
          designOption: item?.designOption,
          source: item?.source,
          thirdPartyProductKey: item?.thirdPartyProductKey,
          artworkPreviewUrl: item?.artworkPreviewUrl,
          fileUrls: item?.fileUrls,
          deliveryOption: item?.deliveryOption,
        },
      },
    });
    setBasketOpen(false);
    setMobileMenuOpen(false);
  };

  const goToEditItem = (item) => {
    const target = getCartItemEditTarget(item);
    if (!target?.path) return;
    navigate(target.path, { state: target.state });
    setBasketOpen(false);
    setMobileMenuOpen(false);
  };

  const goToCheckoutAll = () => {
    if (!cartItems.length) return;
    navigate('/checkout', {
      state: {
        checkoutItems: cartItems.map((item) => ({
          lineId: item.lineId,
          id: item.id,
          type: item.type,
          title: item.title,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          amountBasis: item.amountBasis,
          paymentId: item.paymentId,
          designServiceRequestId: item.designServiceRequestId,
          selectedAttributes: item?.selectedAttributes,
          selectionSnapshot: item?.selectionSnapshot,
          productOptions: item?.productOptions,
          designOption: item?.designOption,
          category: item?.category,
          summary: item?.summary,
          source: item?.source,
          thirdPartyProductKey: item?.thirdPartyProductKey,
          artworkPreviewUrl: item?.artworkPreviewUrl,
          fileUrls: item?.fileUrls,
          deliveryOption: item?.deliveryOption,
        })),
      },
    });
    setBasketOpen(false);
    setMobileMenuOpen(false);
  };

  const showBasketCheckoutCta = (item) =>
    Array.isArray(item.summary) &&
    item.summary.length > 0 &&
    !item.paymentId &&
    item.type !== 'checkout-order';

  // Keep as JSX (not a nested component) so re-renders don't remount and reset scroll.
  const basketFlyout =
    basketOpen && basketFlyoutStyle ? (
      <div
        ref={basketFlyoutRef}
        className="rounded-xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden"
        style={{
          ...basketFlyoutStyle,
          fontFamily: 'Lexend Deca, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <p className="text-sm font-bold text-gray-900">Your basket</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Prices follow your selected VAT mode from the header, where applicable.
          </p>
        </div>
        <div
          ref={basketScrollRef}
          className="overflow-y-auto overscroll-contain p-3 space-y-3"
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            WebkitOverflowScrolling: 'touch',
          }}
          onWheel={(e) => {
            // Keep wheel scrolling on the list; don't let page/header handlers steal it.
            e.stopPropagation();
          }}
        >
          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-8 px-2">Your basket is empty.</p>
          ) : (
            cartItems.map((item) => {
              const itemKey = String(item.id || item.lineId || '');
              const typeLabel = basketTypeLabel(item.type);
              const detailLines = getBasketItemDetailLines(item, { maxSummary: 8 });
              const isHighlighted = basketHighlightId && itemKey === String(basketHighlightId);
              const projectOnly =
                item.type === 'design-service' && item.description
                  ? item.description
                  : null;

              return (
                <div
                  key={item.lineId || item.id}
                  data-basket-item-id={itemKey}
                  className={`rounded-lg border p-3 text-sm bg-white ${
                    isHighlighted ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between gap-2 items-start">
                    <div className="min-w-0">
                      {typeLabel ? (
                        <span className="inline-block mb-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {typeLabel}
                        </span>
                      ) : null}
                      <p className="font-semibold text-gray-900 leading-snug">
                        {item.title || item.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {canEditCartItem(item) ? (
                        <button
                          type="button"
                          onClick={() => goToEditItem(item)}
                          className="text-blue-600 text-xs font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.lineId || item.id)}
                        className="text-red-600 text-xs font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {projectOnly && detailLines.length === 0 ? (
                    <p className="text-xs text-gray-600 mt-1">{projectOnly}</p>
                  ) : null}

                  {detailLines.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 list-none pl-0">
                      {detailLines.map((row, idx) => (
                        <li key={`${row.label || 'd'}-${idx}`} className="leading-snug">
                          {row.label ? (
                            <>
                              <span className="font-medium text-gray-700">{row.label}: </span>
                              <span className="break-words">{row.value}</span>
                            </>
                          ) : (
                            <span className="break-words">{row.value}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : item.description && item.type !== 'design-service' ? (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  ) : null}

                  <div className="flex items-center justify-between mt-3 gap-2">
                    <span className="font-bold text-gray-900 tabular-nums">
                      £{lineBasketDisplayAmount(item).toFixed(2)}
                    </span>
                  </div>
                  {item.type === 'checkout-order' ? (
                    <p className="text-xs text-emerald-700 mt-2 font-medium">
                      Order placed — receipt in basket
                    </p>
                  ) : null}
                  {showBasketCheckoutCta(item) ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToCheckoutForItem(item);
                      }}
                      className="mt-2 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                    >
                      Checkout this item
                    </button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
        {cartItems.length > 0 ? (
          <div className="border-t border-gray-100 p-3 bg-gray-50 shrink-0 space-y-2">
            <div className="flex justify-between text-sm font-bold text-gray-900">
              <span>Basket total</span>
              <span className="tabular-nums">£{basketTotalDisplay.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-snug">
              Includes UK VAT on custom neon only when Inc VAT is selected in the header.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToCheckoutAll();
              }}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              Proceed to checkout
            </button>
          </div>
        ) : null}
      </div>
    ) : null;
  const BasketIconButton = () => (
    <button
      type="button"
      onClick={() => {
        setBasketOpen((o) => {
          const next = !o;
          if (next) setTimeout(updateBasketFlyoutPosition, 0);
          return next;
        });
      }}
      className={`relative flex-shrink-0 p-2 rounded-lg transition-colors ${
        basketCount > 0
          ? 'text-blue-200 bg-blue-500/15 ring-1 ring-blue-400/50 hover:bg-blue-500/25 hover:text-white basket-has-items'
          : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700/50'
      }`}
      aria-label={basketCount > 0 ? `Basket has ${basketCount} item${basketCount === 1 ? '' : 's'}` : 'Basket'}
      aria-expanded={basketOpen}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </button>
  );

  // Persist VAT mode globally for pricing views.
  useEffect(() => {
    const savedVatMode = localStorage.getItem('vatMode');
    if (savedVatMode === 'ex') {
      setIsVatInclusive(false);
    }
  }, []);

  useEffect(() => {
    const vatMode = isVatInclusive ? 'inc' : 'ex';
    localStorage.setItem('vatMode', vatMode);
    window.dispatchEvent(new CustomEvent('vat-mode-changed', { detail: { mode: vatMode } }));
  }, [isVatInclusive]);

  const navBtnClass = (active = false) =>
    `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
      active
        ? 'bg-white/10 text-white'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`;

  const VatToggle = ({ compact = false }) => (
    <div
      className={`flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-1.5 ring-1 ring-white/10 ${
        compact ? 'gap-1.5 px-2 py-1' : ''
      }`}
    >
      <span
        className={`font-semibold uppercase tracking-wide text-slate-400 ${
          compact ? 'text-[9px]' : 'text-[10px]'
        }`}
        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
      >
        VAT
      </span>
      <button
        type="button"
        onClick={() => setIsVatInclusive((prev) => !prev)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          isVatInclusive ? 'bg-blue-600' : 'bg-slate-600'
        }`}
        aria-label="Toggle VAT mode"
        title={`Showing ${isVatInclusive ? 'Inc VAT' : 'Ex VAT'} prices`}
      >
        <span
          className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
          style={{ transform: isVatInclusive ? 'translateX(18px)' : 'translateX(3px)' }}
        />
      </button>
      <span
        className={`min-w-[1.5rem] font-semibold tabular-nums text-slate-200 ${
          compact ? 'text-[10px]' : 'text-[11px]'
        }`}
        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
      >
        {isVatInclusive ? 'Inc' : 'Ex'}
      </span>
    </div>
  );

  const LogoMark = ({ className = 'h-11' }) => (
    <button
      type="button"
      className="flex items-center gap-2 shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      onClick={() => handleNavClick('home')}
      aria-label="River Signs home"
    >
      <img
        src="/logo.png"
        alt="River Signs"
        className={`${className} w-auto max-w-[150px] object-contain`}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div
        className="hidden items-center text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
      >
        <span className="text-blue-400">River</span>
        <span className="text-white">Signs</span>
      </div>
    </button>
  );

  return (
    <header
      className="overflow-visible isolate border-b border-slate-700/80 bg-slate-900 shadow-sm"
      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
    >
      <nav className="mx-auto max-w-[1440px] px-3 md:px-6 lg:px-8 overflow-visible">
        <div className="relative flex h-[4.5rem] items-center gap-3 overflow-visible lg:h-18 lg:min-h-[4.75rem]">
          {/* Desktop */}
          <div className="hidden lg:flex w-full items-center gap-4 xl:gap-6 overflow-visible">
            <LogoMark className="h-12" />

            <div className="flex flex-1 items-center justify-center gap-0.5 xl:gap-1 min-w-0">
              <button type="button" onClick={() => handleNavClick('home')} className={navBtnClass()}>
                Home
              </button>

              <div className="relative" ref={shopRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShopOpen(!shopOpen);
                    setDesignOpen(false);
                    setAccountOpen(false);
                  }}
                  className={navBtnClass(shopOpen)}
                  aria-expanded={shopOpen}
                >
                  Shop
                  <svg
                    className={`h-3.5 w-3.5 opacity-70 transition-transform ${shopOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {shopOpen && (
                  <div className="absolute top-full left-1/2 z-50 mt-3 w-[880px] max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-black/5">
                    <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-yellow-400" />

                    <div className="flex items-center justify-between px-7 pt-5 pb-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Browse Our Product Range
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">
                        {shopMenu.reduce((total, group) => total + group.items.length, 0)}+ products
                      </p>
                    </div>

                    <div className="grid grid-cols-5 gap-x-5 px-7 py-4">
                      {shopMenu.map((group, groupIndex) => (
                        <div
                          key={group.title}
                          className={`space-y-3 ${groupIndex > 0 ? 'border-l border-slate-100 pl-5' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={group.iconPath} />
                              </svg>
                            </span>
                          </div>
                          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                            {group.title}
                          </h3>
                          <ul className="space-y-0.5">
                            {group.items.map((item) => (
                              <li key={`${group.title}-${item.category}`}>
                                <button
                                  type="button"
                                  onClick={() => goToShopCategory(item.category)}
                                  className="group flex w-full items-start gap-1.5 rounded-lg py-1.5 text-left text-[13px] leading-snug text-slate-600 transition-colors hover:text-blue-700"
                                >
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300 transition-colors group-hover:bg-blue-600" />
                                  <span className="transition-colors group-hover:text-blue-700">{item.label}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/80 px-7 py-4">
                      <p className="text-xs text-slate-500">Not sure which product is right for you?</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShopOpen(false);
                          handleNavClick('quote');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                      >
                        Get a Free Quote
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={designRef}>
                <button
                  type="button"
                  onClick={() => {
                    setDesignOpen(!designOpen);
                    setShopOpen(false);
                    setAccountOpen(false);
                  }}
                  className={navBtnClass(designOpen)}
                  aria-expanded={designOpen}
                >
                  Design
                  <svg
                    className={`h-3.5 w-3.5 opacity-70 transition-transform ${designOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {designOpen && (
                  <div className="absolute top-full left-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/15">
                    <button
                      type="button"
                      onClick={() => handleNavClick('product-designer')}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">Design Tool</span>
                        <span className="block text-xs text-slate-500">Online product designer</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('custom-neon-builder')}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">Custom Neon</span>
                        <span className="block text-xs text-slate-500">Build your neon sign</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <button type="button" onClick={() => handleNavClick('gallery')} className={navBtnClass()}>
                Gallery
              </button>
            </div>

            <div className="relative z-[110] flex items-center gap-2 xl:gap-3 shrink-0 overflow-visible">
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(!accountOpen);
                    setShopOpen(false);
                    setDesignOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    accountOpen
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300 ring-1 ring-blue-400/30">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </span>
                  <span className="hidden xl:inline max-w-[7rem] truncate">
                    {isAuthenticated() ? user?.name?.split(' ')[0] || 'Account' : 'Account'}
                  </span>
                  <svg
                    className={`h-3.5 w-3.5 opacity-70 transition-transform ${accountOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {accountOpen && (
                  <div className="absolute top-full right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/15">
                    {isAuthenticated() ? (
                      <>
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {user?.name || 'My Account'}
                          </p>
                          {user?.email ? (
                            <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
                          ) : null}
                        </div>
                        {accountMenu.map((item) => (
                          <button
                            key={item.tab}
                            type="button"
                            onClick={() => goToAccountTab(item.tab)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
                          >
                            <span>{item.label}</span>
                            <svg className="h-3.5 w-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </>
                    ) : (
                      <>
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900">Welcome</p>
                          <p className="mt-0.5 text-xs text-slate-500">Sign in to manage orders &amp; quotes</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNavClick('login')}
                          className="flex w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Login
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNavClick('register')}
                          className="mx-3 mb-2 mt-1 w-[calc(100%-1.5rem)] rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Sign Up
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-white/10" aria-hidden />

              <div className="flex items-center gap-2" ref={basketDesktopRef}>
                <VatToggle />
                <BasketIconButton />
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex w-full items-center gap-2 lg:hidden">
            <LogoMark className="h-9" />
            <div className="flex-1" />
            <div className="relative z-[110] flex items-center gap-2" ref={basketMobileRef}>
              <VatToggle compact />
              <BasketIconButton />
            </div>
            <button
              type="button"
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                mobileMenuOpen
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {basketFlyout}

        {mobileMenuOpen && (
          <div className="space-y-1 border-t border-slate-700/80 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Home
            </button>

            <div className="px-2">
              <button
                type="button"
                onClick={() => {
                  setShopOpen(!shopOpen);
                  setDesignOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Shop
                <svg
                  className={`h-4 w-4 transition-transform ${shopOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {shopOpen && (
                <div className="mt-1 space-y-3 rounded-xl bg-white/5 px-2 py-3">
                  {shopMenu.map((group) => (
                    <div key={group.title}>
                      <h3 className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wide text-blue-300">
                        {group.title}
                      </h3>
                      <div className="space-y-0.5">
                        {group.items.map((item) => (
                          <button
                            key={`${group.title}-${item.category}`}
                            type="button"
                            onClick={() => goToShopCategory(item.category)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-2">
              <button
                type="button"
                onClick={() => {
                  setDesignOpen(!designOpen);
                  setShopOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Design
                <svg
                  className={`h-4 w-4 transition-transform ${designOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {designOpen && (
                <div className="mt-1 space-y-0.5 rounded-xl bg-white/5 px-2 py-2">
                  <button
                    type="button"
                    onClick={() => handleNavClick('product-designer')}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Design Tool
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('custom-neon-builder')}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Custom Neon
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleNavClick('gallery')}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Gallery
            </button>

            <div className="mt-2 border-t border-slate-700/80 pt-3">
              <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Account
              </p>
              {isAuthenticated() ? (
                <>
                  <div className="px-4 pb-2">
                    <p className="text-sm font-semibold text-white">{user?.name || user?.email || 'User'}</p>
                    {user?.email ? <p className="mt-0.5 text-xs text-slate-400">{user.email}</p> : null}
                  </div>
                  {accountMenu.map((item) => (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => goToAccountTab(item.tab)}
                      className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      {item.label}
                    </button>
                  ))}
                </>
              ) : (
                <div className="space-y-2 px-3 pb-1">
                  <button
                    type="button"
                    onClick={() => handleNavClick('login')}
                    className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('register')}
                    className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <style>{`
        @keyframes basketGlow {
          0%, 100% {
            box-shadow: 0 0 6px rgba(59, 130, 246, 0.25), 0 0 14px rgba(59, 130, 246, 0.12);
          }
          50% {
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.45), 0 0 22px rgba(59, 130, 246, 0.2);
          }
        }
        .basket-has-items {
          animation: basketGlow 2.4s ease-in-out infinite;
        }
      `}</style>
    </header>
  );
};

export default Header;
