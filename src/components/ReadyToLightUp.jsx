import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutePath } from '../config/routes.config';

const ReadyToLightUp = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Request a Free Quote', onClick: () => navigate(getRoutePath('getQuote')) },
    {
      label: 'Speak With Our Team',
      onClick: () => {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById('contact');
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
    },
    {
      label: 'Explore Our Services',
      onClick: () => {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById('services');
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
    },
    { label: 'View Our Recent Projects', onClick: () => navigate('/gallery') },
  ];

  return (
    <section className="py-14 md:py-16 bg-gray-800 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50"></div>
      
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
        <div className="text-center">
          {/* Main Heading */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
            Ready To Transform Your{' '}
            <span className="text-blue-500">Business Branding?</span>
          </h2>

          {/* Subheading */}
          <p 
            className="text-gray-300 text-sm md:text-base mb-2 max-w-2xl mx-auto"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Whether you need a single shopfront sign, complete business branding, large-format printing, window
            graphics, or precision fabrication, RSP UK is here to help.
          </p>
          <p
            className="text-gray-400 text-xs md:text-sm mb-7 max-w-2xl mx-auto"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Let&apos;s create signage and branding that helps your business stand out with confidence.
          </p>

          {/* CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {actions.map((action, index) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition-all duration-300 shadow-lg hover:shadow-xl ${
                  index === 0
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                    : 'border border-white/25 text-white hover:bg-white/10'
                }`}
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadyToLightUp;
