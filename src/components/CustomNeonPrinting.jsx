import React from 'react';

const CustomNeonPrinting = ({ onNavigate }) => {
  return (
    <section id="custom-neon" className="py-12 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <div className="text-center mb-8">
          <h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Custom Neon Printing
          </h2>
          <p 
            className="text-base text-gray-600 max-w-xl mx-auto"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Create stunning custom neon signs with our easy-to-use design tool
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-center">
          {/* Left Side - Design Tool Preview */}
          <div className="relative">
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {/* Browser Window Frame */}
              <div className="bg-gray-700 px-3 py-2 flex items-center gap-2 border-b border-gray-600">
                {/* Traffic Light Buttons */}
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                {/* URL Bar */}
                <div className="flex-1 text-center">
                  <span className="text-gray-400 text-xs">design-tool.riversigns.co.uk</span>
                </div>
              </div>
              
              {/* Design Tool Content */}
              <div className="bg-gray-800 p-8 min-h-[320px] flex flex-col items-center justify-center relative">
                {/* Main Text */}
                <div className="text-center mb-4">
                  <div className="mb-3" style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      fontFamily: 'Pacifico, cursive',
                      fontSize: '56px',
                      color: '#ffffff',
                      letterSpacing: '2px',
                      fontWeight: 'bold',
                      textShadow: '0 0 2.7px #ff4df0, 0 0 5.4px #ff4df0, 0 0 8.1px #ff4df0, 0 0 10.8px #ff4df0, 0 0 13.5px #ff4df0, 0 0 16.2px #ff4df0, 0 0 18.9px #ff4df0, 0 0 21.6px #ff4df0, 0 0 24.3px #ff4df0, 0 0 27px #ff4df0'
                    }}>
                      RER
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mb-4">
                    <span>Drag to reposition</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-500"></span>
                    <span>Choose colour</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-500"></span>
                    <span>Select font</span>
                  </div>
                </div>
                
                {/* Color Bar at Bottom */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-1 h-6">
                  <div className="flex-1 h-full bg-blue-900 rounded-l"></div>
                  <div className="w-12 h-full bg-blue-600"></div>
                  <div className="w-1.5"></div>
                  <div className="w-20 h-full bg-yellow-500"></div>
                  <div className="w-10 h-full bg-gray-500 rounded-r"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Compact Features & CTA */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Easy Design Tool
                  </h3>
                  <p className="text-gray-600 text-xs" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Intuitive design builder
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Multiple Sizes
                  </h3>
                  <p className="text-gray-600 text-xs" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Perfect fit for any space
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Instant Quote
                  </h3>
                  <p className="text-gray-600 text-xs" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Get pricing instantly
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('custom-neon-builder')}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-base transition-colors duration-200 flex items-center justify-center gap-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Design Your Neon Sign
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomNeonPrinting;
