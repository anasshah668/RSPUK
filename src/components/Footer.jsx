import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutePath } from '../config/routes.config';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavClick = (section) => {
    const routeMap = {
      'services': '/#services',
      'about': '/about-us',
      'gallery': '/#gallery',
      'blog': '/#blog',
      'careers': '/#careers',
      'trade-accounts': '/#trade-accounts',
      'quote': '/get-free-quote',
      'product-designer': '/product-designer',
      'faqs': '/#faqs',
      'shipping': '/#shipping',
      'returns': '/#returns',
    };

    const route = routeMap[section] || '/';
    if (route.startsWith('/#')) {
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
  };
  return (
    <footer className="bg-gray-800 text-white relative">
      {/* Light Blue Top Border */}
      <div className="h-0.5 bg-blue-400"></div>
      
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 - Company Information */}
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="RER Logo" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center">
                <span className="text-3xl font-bold" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  <span className="text-blue-400">R</span>
                  <span className="text-white">ER</span>
                </span>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              UK-based signage & printing company.
            </p>
            
            <p className="text-gray-300 text-sm" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Custom neon signs, large-format printing & bespoke fabrication.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span style={{ fontFamily: 'Lexend Deca, sans-serif' }}>United Kingdom</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span style={{ fontFamily: 'Lexend Deca, sans-serif' }}>hello@riversignsprint.co.uk</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span style={{ fontFamily: 'Lexend Deca, sans-serif' }}>01234 567 890</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Services */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base">
              Services
            </h4>
            <ul className="space-y-2">
              {['Neon Signs', 'Large Format Printing', 'Window Graphics', 'Fabrication', 'Business Cards'].map((service) => (
                <li key={service}>
                  <button
                    onClick={() => handleNavClick('services')}
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavClick('about')}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('gallery')}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('blog')}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('careers')}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('trade-accounts')}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Trade Accounts
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4 - Support */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavClick('quote')}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Get a Free Quote
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('product-designer')}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Design Tool
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('faqs')}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('shipping')}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Shipping Info
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('returns')}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Returns
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
