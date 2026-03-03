import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import CartDropdown from './CartDropdown';

const Header = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const shopRef = useRef(null);
  const cartRef = useRef(null);
  const { getCartItemCount } = useCart();

  const handleNavClick = (section) => {
    if (onNavigate) {
      onNavigate(section);
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
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <div className="bg-slate-800 px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-slate-900">
              <img 
                src="/logo.png" 
                alt="Trade Only Signs Logo" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-white text-xl font-bold" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                LOGO
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={() => handleNavClick('home')}
              className="text-gray-800 hover:text-amber-600 font-semibold text-sm transition-colors duration-200 uppercase tracking-wide"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Home
            </button>
            
            <div className="relative" ref={shopRef}>
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className="text-gray-800 hover:text-amber-600 font-semibold text-sm transition-colors duration-200 flex items-center gap-1.5 uppercase tracking-wide"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Shop
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {shopOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-2xl py-2 border border-gray-100 z-50"
                >
                  <button
                    onClick={() => handleNavClick('shop-mug')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-amber-50 hover:text-amber-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Mug
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-pen')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-amber-50 hover:text-amber-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Pen
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-shirt')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-amber-50 hover:text-amber-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Shirt
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-flyer')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-amber-50 hover:text-amber-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Flyer
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-banner')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-amber-50 hover:text-amber-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Banner
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-sticker')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-amber-50 hover:text-amber-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Sticker
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-business-card')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-amber-50 hover:text-amber-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Business Card
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-brochure')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-amber-50 hover:text-amber-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Brochure
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('neon-builder')}
              className="text-gray-800 hover:text-amber-600 font-semibold text-sm transition-colors duration-200 uppercase tracking-wide"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Custom Neon
            </button>

            <button
              onClick={() => handleNavClick('product-designer')}
              className="text-gray-800 hover:text-amber-600 font-semibold text-sm transition-colors duration-200 uppercase tracking-wide"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Tool
            </button>

            <button
              onClick={() => handleNavClick('quote')}
              className="text-gray-800 hover:text-amber-600 font-semibold text-sm transition-colors duration-200 uppercase tracking-wide"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Get Free Quote
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className="text-gray-800 hover:text-amber-600 font-semibold text-sm transition-colors duration-200 uppercase tracking-wide"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              About us
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className="text-gray-800 hover:text-amber-600 font-semibold text-sm transition-colors duration-200 uppercase tracking-wide"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Contact
            </button>
          </div>

          {/* Right side: Search, Cart, Login, Register */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 w-48"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Cart Icon */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="relative p-2 text-gray-800 hover:text-amber-600 transition-colors duration-200"
                title="Shopping Cart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
                  </span>
                )}
              </button>
              <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} />
            </div>

            <button
              onClick={() => handleNavClick('login')}
              className="text-gray-800 hover:text-amber-600 font-semibold text-sm flex items-center gap-2 transition-colors duration-200 uppercase tracking-wide"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              LOGIN
            </button>
            <button
              onClick={() => handleNavClick('register')}
              className="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-900 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              REGISTER
            </button>
          </div>

          {/* Mobile: Cart and Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="relative p-2 text-gray-800 hover:text-amber-600 transition-colors duration-200"
                title="Shopping Cart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
                  </span>
                )}
              </button>
              <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} />
            </div>
            <button
              className="text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div className="lg:hidden py-4 space-y-1 border-t border-gray-100 animate-in slide-in-from-top duration-200">
            <button
              onClick={() => handleNavClick('home')}
              className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Home
            </button>
            
            <div className="px-4">
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className="w-full text-left py-3 text-gray-800 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm font-medium flex items-center justify-between"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Shop
                <svg className={`w-4 h-4 transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {shopOpen && (
                <div className="pl-4 space-y-1 mt-2">
                  <button
                    onClick={() => handleNavClick('shop-mug')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Mug
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-pen')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Pen
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-shirt')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Shirt
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-flyer')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Flyer
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-banner')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Banner
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-sticker')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Sticker
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-business-card')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Business Card
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-brochure')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Brochure
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('neon-builder')}
              className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Custom Neon
            </button>

            <button
              onClick={() => handleNavClick('product-designer')}
              className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Tool
            </button>

            <button
              onClick={() => handleNavClick('quote')}
              className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Get Free Quote
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              About us
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Contact
            </button>

            <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
              <button
                onClick={() => handleNavClick('login')}
                className="block w-full text-center px-4 py-3 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm uppercase tracking-wide"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                LOGIN
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="block w-full text-center px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-bold text-sm uppercase tracking-wide"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                REGISTER
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
