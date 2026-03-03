import React from 'react';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              RIVER SIGNS &amp; PRINT
            </h3>
            <p className="text-gray-400 mb-4">
              Your partner in professional signage solutions. From design to installation, we deliver excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('neon-builder')}
                  className="text-gray-400 hover:text-pink-600 transition-colors"
                >
                  Neon Text Builder
                </button>
              </li>
             
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('about')}
                  className="text-gray-400 hover:text-pink-600 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('contact')}
                  className="text-gray-400 hover:text-pink-600 transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@neonsigns.com</li>
              <li>Phone: +44 (0) 123 456 7890</li>
              <li className="mt-4">
                <div className="text-sm">
                  <div className="font-semibold text-white mb-1">London Office</div>
                  <div>20–22 Example Road</div>
                  <div>London, N1 7GU</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} RIVER SIGNS &amp; PRINT. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <button className="hover:text-pink-600 transition-colors">Privacy Policy</button>
            <span>|</span>
            <button className="hover:text-pink-600 transition-colors">Terms & Conditions</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
