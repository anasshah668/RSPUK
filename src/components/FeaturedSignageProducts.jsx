import React from 'react';
import { useNavigate } from 'react-router-dom';
import WavyUnderline from './WavyUnderline';

const FeaturedSignageProducts = () => {
  const navigate = useNavigate();

  const items = [
    {
      title: '3D Built-up Letters',
      route: '/featured/3d-built-up-letters',
      image: '/threeD.png',
      description: 'Premium dimensional lettering with standout visual impact.',
    },
    {
      title: '2D Box Signage',
      route: '/featured/2d-box-signage',
      image: '/sign.jpg',
      description: 'Clean and modern box signage for retail and commercial fronts.',
    },
    {
      title: 'Flex Face Sign',
      route: '/featured/flex-face',
      image: '/hero.jpg',
      description: 'Large format illuminated sign systems built for visibility.',
    },
    {
      title: 'Lightbox Sign',
      route: '/featured/lightbox',
      image: '/neon-sign.jpg',
      description: 'Bright, even illumination for day-and-night brand presence.',
    },
    {
      title: 'Printed Board Sign',
      route: '/featured/printed-board',
      image: '/hero.jpg',
      description: 'Durable, high-quality printed signage for indoor and outdoor use.',
    },
  ];

  return (
    <section className="py-12 md:py-14 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Featured <WavyUnderline>Signage Products</WavyUnderline>
          </h2>
          <p
            className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Explore our most requested signage solutions and jump directly to each dedicated product page.
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

