import React from 'react';
import { useNavigate } from 'react-router-dom';
import WavyUnderline from './WavyUnderline';
import { featuredSignageItems } from '../data/featuredSignageData';

const FeaturedSignageProducts = () => {
  const navigate = useNavigate();

  const items = featuredSignageItems.map((item) => ({
    ...item,
    image: item.images?.[0] || '',
  }));

  return (
    <section className="py-12 md:py-14 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
         
          Our Signage <WavyUnderline>Solutions</WavyUnderline>
          </h2>
          <p
            className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
           We design, manufacture and supply high-quality signage solutions in Middlesbrough and across the UK. Our signs are built to attract attention, increase visibility and strengthen your brand presence.

          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {items.map((item) => (
            <article
              key={item.title}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => navigate(item.route)}
            >
              <div className="h-40 bg-gray-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  draggable={false}
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {item.description}
                </p>
                <span className="text-blue-600 text-sm font-semibold inline-flex items-center gap-1">
                  View details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSignageProducts;

