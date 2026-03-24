import React from 'react';
import WavyUnderline from './WavyUnderline';

const WhyChooseUs = () => {
  const points = [
    {
      title: 'In-House UK Production',
      description:
        'From print to fabrication, your work is produced in-house for consistent quality and faster turnaround.',
      iconWrap: 'from-blue-50 to-indigo-50 ring-blue-100',
      iconColor: 'text-blue-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8h18M7 3v5m10-5v5M5 11h14v9H5v-9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 15h2m4 0h-2" />
        </svg>
      ),
    },
    {
      title: 'Transparent Pricing',
      description:
        'Clear, competitive rates with no hidden surprises. We focus on value, quality, and long-term reliability.',
      iconWrap: 'from-emerald-50 to-teal-50 ring-emerald-100',
      iconColor: 'text-emerald-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7.5v9m-3.5-6.5c0-1 1.5-2 3.5-2s3.5 1 3.5 2-1.5 2-3.5 2-3.5 1-3.5 2 1.5 2 3.5 2 3.5-1 3.5-2" />
          <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
        </svg>
      ),
    },
    {
      title: 'Fast UK-Wide Delivery',
      description:
        'Reliable dispatch and delivery options to keep your project timelines on track across the UK.',
      iconWrap: 'from-amber-50 to-yellow-50 ring-amber-100',
      iconColor: 'text-amber-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h11v8H3V7zm11 2h4l3 3v3h-7V9z" />
          <circle cx="8" cy="17" r="2" strokeWidth={1.8} />
          <circle cx="18" cy="17" r="2" strokeWidth={1.8} />
        </svg>
      ),
    },
    {
      title: 'Expert Support',
      description:
        'Our team helps with material selection, artwork prep, and production guidance from quote to install.',
      iconWrap: 'from-violet-50 to-fuchsia-50 ring-violet-100',
      iconColor: 'text-violet-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 10h6M9 13.5h4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 17v0" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-12 md:py-14 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Why <WavyUnderline>Choose Us</WavyUnderline>
          </h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto text-sm md:text-base" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Professional signage and print solutions delivered with quality, speed, and dependable service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {points.map((point) => (
            <article key={point.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${point.iconWrap} ring-1 flex items-center justify-center mb-3 ${point.iconColor}`}>
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

