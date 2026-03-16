import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onNavigate }) => {
  const { isAuthenticated, user, logout, getUserInitial } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const shopRef = useRef(null);
  const userMenuRef = useRef(null);

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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <header className="bg-gray-800 sticky top-0 z-50">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={() => handleNavClick('home')}
              className="text-white hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Home
            </button>
            
            <div className="relative" ref={shopRef}>
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className="text-white hover:text-blue-400 font-semibold text-sm transition-colors duration-200 flex items-center gap-1.5"
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
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Mug
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-pen')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Pen
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-shirt')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Shirt
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-flyer')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Flyer
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-banner')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Banner
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-sticker')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Sticker
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-business-card')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Business Card
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-brochure')}
                    className="block w-full text-left px-5 py-2.5 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 text-sm font-medium"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Brochure
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('custom-neon-builder')}
              className="text-white hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Custom Neon
            </button>

            <button
              onClick={() => handleNavClick('product-designer')}
              className="text-white hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Tool
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
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={() => handleNavClick('quote')}
              className="text-white hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Get a Free Quote
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className="text-white hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Gallery
            </button>

            <button
              onClick={() => handleNavClick('about-us')}
              className="text-white hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              About Us
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className="text-white hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Contact
            </button>

            {/* Auth Buttons / User Icon */}
            {!isAuthenticated() ? (
              <>
                <button
                  onClick={() => handleNavClick('login')}
                  className="text-white hover:text-blue-400 font-semibold text-sm transition-colors duration-200"
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
              <div className="relative" ref={userMenuRef}>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center transition-colors duration-200"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    {getUserInitial()}
                  </button>
                  {/* Online status indicator */}
                  {isAuthenticated() && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full"></span>
                  )}
                </div>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl py-2 border border-gray-100 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        {user?.name || user?.email || 'User'}
                      </p>
                      {user?.email && (
                        <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          {user.email}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 text-sm font-medium"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
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
              className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Home
            </button>
            
            <div className="px-4">
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className="w-full text-left py-3 text-white hover:text-blue-300 rounded-lg transition-all duration-150 text-sm font-medium flex items-center justify-between"
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
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Mug
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-pen')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Pen
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-shirt')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Shirt
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-flyer')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Flyer
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-banner')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Banner
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-sticker')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Sticker
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-business-card')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Business Card
                  </button>
                  <button
                    onClick={() => handleNavClick('shop-brochure')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Brochure
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('custom-neon-builder')}
              className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Custom Neon
            </button>

            <button
              onClick={() => handleNavClick('product-designer')}
              className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Design Tool
            </button>

            <button
              onClick={() => handleNavClick('quote')}
              className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Get a Free Quote
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Gallery
            </button>

            <button
              onClick={() => handleNavClick('about-us')}
              className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              About Us
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Contact
            </button>

            {/* Auth Buttons / User Icon - Mobile */}
            {!isAuthenticated() ? (
              <>
                <button
                  onClick={() => handleNavClick('login')}
                  className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 hover:text-gray-300 rounded-lg transition-all duration-150 text-sm font-medium"
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
