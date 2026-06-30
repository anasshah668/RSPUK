import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import WavyUnderline from './WavyUnderline';

const publicLogo = (filename) => `/${encodeURI(filename)}`;

const businesses = [
  {
    name: 'Apex Properties',
    logo: publicLogo('apex properties.jpeg'),
    logoClassName: 'h-10 w-auto max-w-[88px]',
  },
  {
    name: 'BrewCo Coffee',
    logo: '/BrewCo.jpg',
    logoClassName: 'h-10 w-auto max-w-[88px] rounded',
  },
  {
    name: 'Urban Eats',
    logo: '/urbanEats.svg',
    logoClassName: 'h-9 w-auto max-w-[88px]',
  },
  {
    name: 'Metro Retail',
    logo: '/metro-logo.png',
    logoClassName: 'h-10 w-auto max-w-[88px]',
  },
  {
    name: 'Luxe Boutique',
    logo: '/luxe.jpg',
    logoClassName: 'h-10 w-auto max-w-[88px] rounded',
  },
  {
    name: 'City Council',
    logo: '/city_council.png',
    logoClassName: 'h-10 w-auto max-w-[88px]',
  },
  {
    name: 'Grand Hotel',
    logo: '/grandhotel.png',
    logoClassName: 'h-10 w-auto max-w-[88px]',
  },
  {
    name: 'Creative Studio',
    logo: '/creativelogo.png',
    logoClassName: 'h-10 w-auto max-w-[88px]',
  },
  {
    name: 'Hashtag Indian Restaurant',
    logo: '/hashtag.png',
    logoClassName: 'h-10 w-auto max-w-[88px]',
  },
  {
    name: 'M&M Tyres',
    logo: publicLogo('m&m tyre.png'),
    logoClassName: 'h-10 w-auto max-w-[88px]',
  },
  {
    name: 'Slice Burg',
    logo: '/sliceburg.png',
    logoClassName: 'h-10 w-auto max-w-[88px]',
  },
];

const getItemsPerView = (width) => {
  if (width >= 1024) return 6;
  if (width >= 768) return 4;
  if (width >= 640) return 3;
  return 2;
};

const chunkBusinesses = (items, size) => {
  const pages = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
};

const BrandCard = ({ business }) => (
  <div className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 group min-h-[108px] h-full">
    <div className="flex h-12 w-full items-center justify-center rounded-md bg-white/95 px-2 py-1.5 shadow-sm">
      <img
        src={business.logo}
        alt={`${business.name} logo`}
        className={`${business.logoClassName} object-contain`}
        loading="lazy"
        decoding="async"
      />
    </div>
    <span
      className="text-white text-xs text-center font-medium group-hover:text-blue-400 transition-colors leading-tight"
      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
    >
      {business.name}
    </span>
  </div>
);

const TrustedBy = () => {
  const [itemsPerView, setItemsPerView] = useState(() =>
    typeof window !== 'undefined' ? getItemsPerView(window.innerWidth) : 6
  );
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const pages = useMemo(
    () => chunkBusinesses(businesses, itemsPerView),
    [itemsPerView]
  );

  const totalSlides = pages.length;

  useEffect(() => {
    const onResize = () => {
      setItemsPerView(getItemsPerView(window.innerWidth));
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setSlide((current) => (totalSlides === 0 ? 0 : current % totalSlides));
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return undefined;

    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % totalSlides);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [isPaused, totalSlides]);

  const goToSlide = useCallback(
    (index) => {
      if (totalSlides === 0) return;
      setSlide(((index % totalSlides) + totalSlides) % totalSlides);
    },
    [totalSlides]
  );

  const gridColsClass =
    itemsPerView === 6
      ? 'grid-cols-6'
      : itemsPerView === 4
        ? 'grid-cols-4'
        : itemsPerView === 3
          ? 'grid-cols-3'
          : 'grid-cols-2';

  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Trusted by{' '}
            <WavyUnderline>
              Brands
            </WavyUnderline>
            , Retailers & Creators
          </h2>
          <p
            className="text-white text-base md:text-lg max-w-3xl mx-auto mt-6"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            We work with independent shops, national retailers, restaurants, event companies and creative agencies across the UK.
          </p>
        </div>

        <div
          className="relative mb-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {totalSlides > 1 && (
            <>
              <button
                type="button"
                onClick={() => goToSlide(slide - 1)}
                className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white shadow-lg hover:bg-gray-600 transition-colors"
                aria-label="Previous brands"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goToSlide(slide + 1)}
                className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white shadow-lg hover:bg-gray-600 transition-colors"
                aria-label="Next brands"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {pages.map((page, pageIndex) => (
                <div
                  key={`page-${pageIndex}`}
                  className={`min-w-full grid ${gridColsClass} gap-4`}
                >
                  {page.map((business) => (
                    <BrandCard key={business.name} business={business} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {totalSlides > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {pages.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === slide ? 'w-6 bg-yellow-400' : 'w-2 bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to brand slide ${index + 1}`}
                  aria-current={index === slide ? 'true' : undefined}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-2.5 rounded-full font-bold text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Trade Pricing Available
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
