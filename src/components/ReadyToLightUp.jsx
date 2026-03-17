import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutePath } from '../config/routes.config';

const ReadyToLightUp = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 bg-gray-800 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50"></div>
      
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
        <div className="text-center">
          {/* Main Heading */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
            Ready To{' '}
            <span className="text-blue-500">Light Up</span>
            {' '}Your Business?
          </h2>

          {/* Subheading */}
          <p 
            className="text-gray-300 text-sm md:text-base mb-6 max-w-2xl mx-auto"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Get started with a free quote or jump into our design tool.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate(getRoutePath('getQuote'))}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-2.5 rounded-lg font-bold text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Get a Free Quote
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReadyToLightUp;
