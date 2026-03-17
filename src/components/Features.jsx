import React from 'react';
import WavyUnderline from './WavyUnderline';

const Features = () => {
  const steps = [
    {
      number: '01',
      title: 'Choose Your Service',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.025 4.718l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Design or Upload Artwork',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'We Manufacture in the UK',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      number: '04',
      title: 'Fast Delivery to Your Door',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-10">
          <h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            How It <WavyUnderline>Works</WavyUnderline>
          </h2>
        </div>

        <div className="relative py-4">
          {/* Single Connecting Line */}
          <div className="hidden md:block absolute top-12 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-blue-300 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-3 lg:gap-6 relative">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center relative z-10"
              >
                {/* Number Circle */}
                <div className="absolute top-0 z-20 w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                  <span className="text-white font-bold text-xs" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {step.number}
                  </span>
                </div>

                {/* Main Circle */}
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-blue-300 flex items-center justify-center mb-4 bg-white relative mt-5">
                  <div className="text-blue-500">
                    <div className="w-8 h-8 md:w-10 md:h-10">
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* Text */}
                <h3 
                  className="text-base md:text-lg font-bold text-gray-900"
                >
                  {step.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
