import React from 'react';
import WavyUnderline from './WavyUnderline';

const WhyChooseUs = () => {
  const points = [
    {
      title: 'Custom Designed for Your Business',
      description:
        'Every sign is tailored to your brand, dimensions, and installation requirements.',
      iconWrap: 'bg-slate-50 ring-slate-200',
      iconColor: 'text-slate-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4 20h8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M14.5 4.5l5 5L9 20H4v-5l10.5-10.5z" />
        </svg>
      ),
    },
    {
      title: 'High Quality Materials & Finishing',
      description:
        'Premium-grade materials and finishing standards ensure a clean, professional result.',
      iconWrap: 'bg-slate-50 ring-slate-200',
      iconColor: 'text-slate-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'Indoor & Outdoor Solutions',
      description:
        'We provide fit-for-purpose signage options for both internal and external environments.',
      iconWrap: 'bg-slate-50 ring-slate-200',
      iconColor: 'text-slate-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="7" cy="8" r="2.5" strokeWidth={1.9} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M5.5 13h3M12 14h7M15.5 10.5L17 9l1.5 1.5M17 9v8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M3 18h18" />
        </svg>
      ),
    },
    {
      title: 'Built for Durability',
      description:
        'Designed and manufactured to handle daily wear, weather exposure, and long-term use.',
      iconWrap: 'bg-slate-50 ring-slate-200',
      iconColor: 'text-slate-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M7 4h10v4H7zM9 8v5M15 8v5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 13l6 2.5-2 4.5H8l-2-4.5 6-2.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M10 17h4" />
        </svg>
      ),
    },
    {
      title: 'Manufactured in Middlesbrough, UK',
      description:
        'Produced locally in Middlesbrough for better quality control and dependable turnaround.',
      iconWrap: 'bg-slate-50 ring-slate-200',
      iconColor: 'text-slate-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" />
          <circle cx="12" cy="11" r="2.2" strokeWidth={1.9} />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-12 md:py-14 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Why <WavyUnderline>Choose Our Signs</WavyUnderline>
          </h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto text-sm md:text-base" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Professional signage and print solutions delivered with quality, speed, and dependable service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {points.map((point) => (
            <article key={point.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-full ${point.iconWrap} ring-1 flex items-center justify-center mb-3 ${point.iconColor}`}>
                {point.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{point.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {point.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

