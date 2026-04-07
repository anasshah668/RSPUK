import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoutePath } from '../config/routes.config';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, getUserInitial } = useAuth();
  const [isVatInclusive, setIsVatInclusive] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const shopRef = useRef(null);
  const userMenuRef = useRef(null);

  const shopMenu = [
    {
      title: 'Signs',
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
      items: [
        { label: 'Posters', category: 'posters' },
        { label: 'PVC Banners', category: 'pvc-banners' },
        { label: 'Correx / Foamex / Aluminium Prints', category: 'correx-foamex-aluminium-prints' },
        { label: 'Backlit Prints', category: 'backlit-prints' },
        { label: 'Canvas Prints', category: 'canvas-prints' },
      ],
    },
    {
      title: 'Small Print',
      items: [
        { label: 'Business Cards', category: 'business-cards' },
        { label: 'Flyers', category: 'flyers' },
        { label: 'Leaflets', category: 'leaflets' },
        { label: 'Brochures', category: 'brochures' },
        { label: 'Menus', category: 'menus' },
        { label: 'Calendars', category: 'calendars' },
        { label: 'Stickers', category: 'stickers' },
      ],
    },
    {
      title: 'Window Graphics',
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
      items: [
        { label: 'CNC Router Cutting', category: 'cnc-router-cutting' },
        { label: 'Fibre Laser Cutting', category: 'fibre-laser-cutting' },
        { label: 'Fibre Laser Welding', category: 'fibre-laser-welding' },
      ],
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
    'gallery': '/#gallery',
    'shop-mug': '/#products',
    'shop-pen': '/#products',
    'shop-shirt': '/#products',
    'shop-flyer': '/#products',
    'shop-banner': '/#products',
    'shop-sticker': '/#products',
    'shop-business-card': '/#products',
    'shop-brochure': '/#products',
  };

  const goToShopCategory = (categorySlug) => {
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
    };

    // Navigate featured categories to their dedicated pages, fallback to generic category route.
    navigate(featuredRouteMap[categorySlug] || `/category/${categorySlug}`);
    setMobileMenuOpen(false);
    setShopOpen(false);
  };

  const handleNavClick = (section) => {
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
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shopRef.current && !shopRef.current.contains(event.target)) {
        setShopOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-gray-800 sticky top-0 z-50">
      <nav className="mx-auto max-w-[1440px] px-3 md:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Left Navigation */}
          <div className="hidden lg:flex items-center space-x-6 lg:pr-24">
            <button
              onClick={() => handleNavClick('home')}
              className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Home
            </button>
            
            <div className="relative" ref={shopRef}>
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200 flex items-center gap-1.5"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Shop
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {shopOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-2xl py-4 border border-gray-100 z-50"
                >
                  <div className="grid grid-cols-3 gap-6 px-6">
                    {shopMenu.map((group) => (
                      <div key={group.title} className="space-y-2">
                        <h3 className="text-blue-600 font-semibold text-sm">
                          {group.title}
                        </h3>
                        <ul className="space-y-1">
                          {group.items.map((item) => (
                            <li key={`${group.title}-${item.category}`}>
                              <button
                                onClick={() => goToShopCategory(item.category)}
                                className="group w-full flex items-center justify-between gap-3 text-left text-gray-600 hover:text-blue-600 transition-colors text-sm"
                                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                              >
                                <span className="flex items-center gap-2 min-w-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-600 transition-colors flex-shrink-0" />
                                  <span className="truncate">{item.label}</span>
                                </span>
                                <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => handleNavClick('product-designer')}
              className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Tool
            </button>
            
            <button
              onClick={() => handleNavClick('custom-neon-builder')}
              className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Custom Neon
            </button>
            <button
              onClick={() => handleNavClick('gallery')}
              className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Gallery
            </button>
          </div>

          {/* Center Logo */}
          <div 
            className="flex items-center cursor-pointer group absolute left-1/2 transform -translate-x-1/2"
            onClick={() => handleNavClick('home')}
          >
            <img 
              src="/logo.png" 
              alt="RER Logo" 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden text-3xl font-bold items-center" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              <span className="text-blue-500">R</span>
              <span className="text-white">ER</span>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="hidden lg:flex items-center space-x-6 lg:pl-24">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-xs font-semibold text-white" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                VAT
              </span>
              <button
                type="button"
                onClick={() => setIsVatInclusive((prev) => !prev)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  isVatInclusive ? 'bg-blue-600' : 'bg-gray-500'
                }`}
                aria-label="Toggle VAT mode"
                title={`Showing ${isVatInclusive ? 'Inc VAT' : 'Ex VAT'} prices`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isVatInclusive ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => handleNavClick('quote')}
              className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Get a Free Quote
            </button>


            <button
              onClick={() => handleNavClick('about-us')}
              className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              About Us
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Contact
            </button>

            {/* Auth Buttons / My Account */}
            {!isAuthenticated() ? (
              <>
                <button
                  onClick={() => handleNavClick('login')}
                  className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('account')}
                  className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  My Account
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile: Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              className="text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-1 border-t border-gray-700 animate-in slide-in-from-top duration-200">
            <button
              onClick={() => handleNavClick('home')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-gray-100 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Home
            </button>
            
            <div className="px-4">
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className="w-full text-left py-3 text-gray-300 hover:text-blue-300 rounded-lg transition-all duration-150 text-sm font-medium flex items-center justify-between"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Shop
                <svg className={`w-4 h-4 transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {shopOpen && (
                <div className="pl-4 space-y-4 mt-2">
                  {shopMenu.map((group) => (
                    <div key={group.title}>
                      <h3 className="text-blue-400 font-semibold text-sm mb-2 px-4">
                        {group.title}
                      </h3>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <button
                            key={`${group.title}-${item.category}`}
                            onClick={() => goToShopCategory(item.category)}
                            className="group w-full flex items-center justify-between gap-3 text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-150 text-sm"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-blue-400 transition-colors flex-shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </span>
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('custom-neon-builder')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-gray-100 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Custom Neon
            </button>

            <button
              onClick={() => handleNavClick('product-designer')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-gray-100 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Tool
            </button>

            <button
              onClick={() => handleNavClick('quote')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-gray-100 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Get a Free Quote
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-gray-100 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Gallery
            </button>

            <button
              onClick={() => handleNavClick('about-us')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-gray-100 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              About Us
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-gray-100 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Contact
            </button>

            {/* Auth Buttons / User Icon - Mobile */}
            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                VAT
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVatInclusive((prev) => !prev)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                    isVatInclusive ? 'bg-blue-600' : 'bg-gray-500'
                  }`}
                  aria-label="Toggle VAT mode"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isVatInclusive ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {!isAuthenticated() ? (
              <>
                <button
                  onClick={() => handleNavClick('login')}
                  className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-gray-100 rounded-lg transition-all duration-150 text-sm font-medium"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="block w-full text-left px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-150 text-sm font-medium"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <div className="px-4 py-3 border-t border-gray-700">
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {user?.name || user?.email || 'User'}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {user.email}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => { handleNavClick('account'); }}
                  className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-gray-100 rounded-lg transition-all duration-150 text-sm font-medium"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  My Account
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm font-medium"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
