import React from 'react';
import WavyUnderline from './WavyUnderline';

const Services = () => {
  const services = [
    {
      title: 'Sign',
      description: 'Custom signage including 3D letters, lightboxes, flex face and neon signs.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2m0 18l6-3m-6 3V2m6 15l5.447-2.724A1 1 0 0021 13.382V2.618a1 1 0 00-.553-.894L15 0m0 17V0m0 0L9 2" />
        </svg>
      ),
    },
    {
      title: 'Printing',
      description: 'Large format printing for banners, posters and promotional displays.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
        </svg>
      ),
    },
    {
      title: 'Window Graphics',
      description: 'Custom vinyl graphics, frosted films and branding for shopfront windows.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18v16H3V4zm9 0v16M3 10h18" />
        </svg>
      ),
    },
    {
      title: 'Fabrication',
      description: 'CNC routing, laser cutting and welding for bespoke signage and components.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1-2v4m7 5h-4m-6 0H5m4.586 7.414a2 2 0 01-2.828 0l-1.172-1.172a2 2 0 010-2.828l1.172-1.172a2 2 0 012.828 0l1.172 1.172a2 2 0 010 2.828l-1.172 1.172zm8.828 0a2 2 0 01-2.828 0l-1.172-1.172a2 2 0 010-2.828l1.172-1.172a2 2 0 012.828 0l1.172 1.172a2 2 0 010 2.828l-1.172 1.172z" />
        </svg>
      ),
    },
    {
      title: 'Small Print',
      description: 'Business cards, flyers, brochures and marketing materials.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h10M7 10h10M7 14h6m-8 6h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="services" className="py-20" style={{ backgroundColor: '#333333' }}>
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            What We <WavyUnderline>Do</WavyUnderline>
          </h2>
          <p 
            className="text-lg md:text-xl text-white max-w-3xl mx-auto"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
           We provide complete signage and branding solutions, combining design, manufacturing and installation services for businesses of all sizes.

          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-xl p-6 hover:bg-gray-600 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="text-blue-500">
                  {service.icon}
                </div>
              </div>
              <h3 
                className="text-xl font-bold text-white mb-3 text-center"
              >
                {service.title}
              </h3>
              <p 
                className="text-white text-center leading-relaxed"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
