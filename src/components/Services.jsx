import React from 'react';

const Services = ({ onNavigate }) => {
  const services = [
    {
      title: 'Product Designer',
      description: 'Design custom prints on pens, t-shirts, mugs and more. Professional design tools with print area guides.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      link: 'product-designer',
    },
    {
      title: 'Neon Text Builder',
      description: 'Create custom neon text designs with our interactive builder. Real-time preview, multiple fonts, and export options.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      link: 'neon-builder',
    },
    {
      title: 'Custom Neon Signs',
      description: 'Handcrafted traditional neon signs with custom designs. Perfect for businesses, restaurants, and retail spaces.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      link: 'custom-signs',
    },
    {
      title: 'LED Neon Alternatives',
      description: 'Modern LED neon solutions that offer energy efficiency and durability without compromising on the classic neon look.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      link: 'led-neon',
    },
    {
      title: 'Installation Services',
      description: 'Professional installation by our expert team. We handle everything from mounting to electrical connections.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      link: 'installation',
    },
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Premium Commercial Signage Solutions
          </h2>
          <p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            From neon text design to full installation, we offer comprehensive signage services tailored to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-2xl hover:border-amber-500 transition-all duration-300 cursor-pointer group"
              onClick={() => onNavigate && onNavigate(service.link)}
            >
              <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300">
                {service.icon}
              </div>
              <h3 
                className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {service.title}
              </h3>
              <p 
                className="text-gray-600 mb-6 leading-relaxed"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {service.description}
              </p>
              <button 
                className="text-amber-600 font-semibold hover:text-amber-700 transition-colors flex items-center gap-2 group-hover:gap-3"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Learn more
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
