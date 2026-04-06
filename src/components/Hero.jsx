import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutePath } from '../config/routes.config';
import WavyUnderline from './WavyUnderline';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 py-16">
      {/* Decorative Yellow Lines */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-yellow-400 animate-line-draw-left"></div>
      <div className="absolute top-6 right-6 w-10 h-0.5 bg-yellow-400 animate-line-draw-right"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-7 lg:gap-10 items-center">
            
            {/* Left Column - Text Content */}
            <div className="space-y-5 lg:space-y-6 animate-fade-in-up">
              {/* Main Heading */}
              <h1
                className="text-[30px] md:text-[38px] lg:text-[46px] font-bold leading-[1.12] tracking-tight"
              >
                <span className="text-gray-900 animate-slide-in-left lg:whitespace-nowrap">Custom Signs & Shopfront</span>
                <br />
                <span className="text-blue-600 relative inline-block animate-slide-in-left-delay">
                Branding in 
                  <span className="absolute -inset-0.5 bg-blue-600/10 blur-md animate-pulse-slow"></span>
                </span>
                <br />
                <span className="text-gray-900 relative inline-block animate-slide-in-left-delay-2">
                Middlesbrough,{' '}
                  <WavyUnderline thick={true}>
                    UK
                  </WavyUnderline>
                </span>
              </h1>
              
              {/* Subheading */}
              <p
                className="text-sm md:text-base text-gray-600 leading-relaxed max-w-lg animate-fade-in-up-delay-2"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
              We specialise in 3D signs, lightboxes, custom neon signs, window graphics and complete business branding solutions.
              </p>

              <div
                className="inline-flex max-w-full items-center gap-2 md:gap-2.5 px-3 md:px-4 py-2 rounded-xl border border-blue-100 bg-blue-50/70 text-[11px] md:text-xs text-blue-800 font-semibold leading-snug animate-fade-in-up-delay-2 flex-wrap"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                <span>3D Signs</span>
                <span className="text-blue-400">•</span>
                <span>Lightbox Signs</span>
                <span className="text-blue-400">•</span>
                <span>Custom Neon</span>
                <span className="text-blue-400">•</span>
                <span>Flex Face</span>
                <span className="text-blue-400">•</span>
                <span>Window Graphics</span>
                <span className="text-blue-400">•</span>
                <span>Printing</span>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 pt-1 animate-fade-in-up-delay-3">
                <button
                  onClick={() => navigate(getRoutePath('productDesigner'))}
                  className="group bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2.5 rounded-lg transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Design Your Sign
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      const element = document.getElementById('services');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="group bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 hover:text-blue-700 px-4 md:px-5 py-2.5 rounded-lg transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Explore Signs
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate(getRoutePath('getQuote'))}
                  className="group bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 md:px-5 py-2.5 rounded-lg transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Get a Free Quote
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
               
              </div>
            </div>
            
            {/* Right Column - Hero Image */}
            <div className="hidden lg:block relative animate-fade-in-up-delay-2">
              <div className="relative animate-float-gentle">
                {/* Card */}
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200">
                  <div className="aspect-[4/3] overflow-hidden bg-white relative">
                    <img 
                      src="/hero.jpg" 
                      alt="Neon Products" 
                      className="w-full h-full object-cover animate-image-zoom"
                      onError={(e) => {
                        // Fallback to alternative paths
                        const fallbacks = [
                          '/hero.png',
                          '/hero.jpeg',
                          'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
                        ];
                        let currentIndex = 0;
                        e.target.onerror = () => {
                          if (currentIndex < fallbacks.length - 1) {
                            currentIndex++;
                            e.target.src = fallbacks[currentIndex];
                          }
                        };
                        e.target.src = fallbacks[0];
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoomBg {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes gradientText {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, 40px) scale(1.2);
          }
          66% {
            transform: translate(30px, -20px) scale(0.8);
          }
        }

        @keyframes float3 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.15);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-up-delay-1 {
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-up-delay-2 {
          animation: fadeInUp 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-fade-in-up-delay-3 {
          animation: fadeInUp 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }

        .animate-fade-in-up-delay-4 {
          animation: fadeInUp 0.8s ease-out 0.8s forwards;
          opacity: 0;
        }

        .animate-zoom-bg {
          animation: zoomBg 20s ease-in-out infinite;
        }

        .animate-gradient-shift {
          animation: gradientShift 8s ease-in-out infinite;
        }

        .animate-gradient-text {
          background-size: 200% auto;
          animation: gradientText 3s linear infinite;
        }

        .animate-float-1 {
          animation: float1 15s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: float2 18s ease-in-out infinite;
        }

        .animate-float-3 {
          animation: float3 12s ease-in-out infinite;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulseSlow {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }

        @keyframes underlineExpand {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes floatGentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes imageZoom {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-left-delay {
          animation: slideInLeft 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-slide-in-left-delay-2 {
          animation: slideInLeft 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }

        .animate-underline-expand {
          animation: underlineExpand 0.6s ease-out 0.6s forwards;
          width: 0;
        }

        .animate-float-gentle {
          animation: floatGentle 4s ease-in-out infinite;
        }

        .animate-image-zoom {
          animation: imageZoom 8s ease-in-out infinite;
        }

        @keyframes lineDrawLeft {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 3rem;
            opacity: 1;
          }
        }

        @keyframes lineDrawRight {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 2.5rem;
            opacity: 1;
          }
        }

        @keyframes linePulse {
          0%, 100% {
            opacity: 1;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.6;
            transform: scaleX(1.1);
          }
        }

        .animate-line-draw-left {
          animation: lineDrawLeft 0.8s ease-out 0.3s forwards, linePulse 2s ease-in-out 1.1s infinite;
          width: 0;
          opacity: 0;
        }

        .animate-line-draw-right {
          animation: lineDrawRight 0.8s ease-out 0.5s forwards, linePulse 2s ease-in-out 1.3s infinite;
          width: 0;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default Hero;
