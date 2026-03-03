import React from 'react';

const Hero = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-[650px] md:min-h-[750px] flex items-center overflow-hidden">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          filter: 'blur(4px)',
          transform: 'scale(1.1)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Dark Overlay - stronger at bottom and right */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/50 to-black/70"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Left Side - Text Content */}
          <div className="text-white">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight animate-fade-in-up"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Your partner in sign.
            </h1>
            <p 
              className="text-lg md:text-xl mb-5 leading-relaxed font-light max-w-3xl mx-auto animate-fade-in-up-delay-1"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              We provide a comprehensive range of white-label signage solutions, meticulously tailored to meet the diverse and evolving needs of trade clients across all industries.
            </p>
            <p 
              className="text-lg md:text-xl mb-8 leading-relaxed font-light max-w-3xl mx-auto animate-fade-in-up-delay-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              From initial design consultation through to final installation, our end-to-end fulfilment services are built on the pillars of simplicity, efficiency, precision, and exceptional value.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-3">
              <button
                onClick={() => onGetStarted && onGetStarted('how-it-works')}
                className="bg-slate-800 text-white px-8 py-3 rounded-lg hover:bg-slate-900 transition-all duration-200 font-semibold text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Learn more
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => onGetStarted && onGetStarted('neon-builder')}
                className="bg-amber-500 text-black px-8 py-3 rounded-lg hover:bg-amber-600 transition-all duration-200 font-semibold text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Get a quote
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
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
      `}</style>
    </section>
  );
};

export default Hero;
