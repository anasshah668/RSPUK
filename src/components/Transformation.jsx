import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutePath } from '../config/routes.config';

const Transformation = () => {
  const [isNeon, setIsNeon] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="py-14 md:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left Side - Image with Toggle */}
          <div className="space-y-6">
            <h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight"
            >
              See the{' '}
              <span className="relative inline-block">
                Transformation
                {/* Wavy underline to match the reference design */}
                <span className="absolute left-0 right-0 -bottom-2">
                  <svg
                    viewBox="0 0 220 18"
                    preserveAspectRatio="none"
                    className="h-[8px] w-full"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 10 C 35 4, 70 16, 105 10 S 175 4, 218 10"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </h2>

            <div className="space-y-4 text-gray-600 leading-7 text-base" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              <p>
                From standard signage to glowing neon — see the difference our craftsmanship makes. Toggle the ON/OFF switch to experience how your brand can stand out with our premium neon solutions.
              </p>
              <p>
                Every sign is manufactured in-house at our UK facility using premium materials, ensuring exceptional quality and durability for your business.
              </p>
            </div>

            <button
              onClick={() => navigate(getRoutePath('getQuote'))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Get a Free Quote
            </button>
          </div>
        

          {/* Right Side - Content */}
          <div className="space-y-4">
            {/* Image Frame */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900">
              {/* ON/OFF toggle INSIDE the image */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                <span
                  className={`text-xs font-semibold ${!isNeon ? 'text-gray-900' : 'text-gray-400'}`}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  OFF
                </span>

                <button
                  type="button"
                  onClick={() => setIsNeon(!isNeon)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isNeon ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle neon on/off"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${
                      isNeon ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>

                <span
                  className={`text-xs font-semibold ${isNeon ? 'text-gray-900' : 'text-gray-400'}`}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  ON
                </span>
              </div>

              {/* 
                To match your screenshot exactly, use rendered images.
                Put these files in:
                  - UI/public/transformation/standard.png
                  - UI/public/transformation/neon.png
                They should be the same dimensions.
              */}
              <div className="relative aspect-square">
                <img
                  src="/sign.jpg"
                  alt="Standard signage"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                    isNeon ? 'opacity-0' : 'opacity-100'
                  }`}
                  draggable={false}
                />
                <img
                  src="/neon-sign.jpg"
                  alt="Neon signage"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                    isNeon ? 'opacity-100' : 'opacity-0'
                  }`}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Transformation;
