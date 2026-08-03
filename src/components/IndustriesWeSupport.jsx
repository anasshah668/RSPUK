import React from 'react';
import WavyUnderline from './WavyUnderline';

const industries = [
  {
    title: 'Retail',
    description:
      'Professional shopfront signs, promotional displays and window graphics that attract customers and increase footfall.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l1.5-5h15L21 9M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18M9 13a3 3 0 106 0" />
      </svg>
    ),
  },
  {
    title: 'Hospitality',
    description:
      'Eye-catching illuminated signs, menus, interior branding and promotional materials for restaurants, cafés, hotels and venues.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 11V7a4 4 0 118 0v4m-9 0h10a1 1 0 011 1v2a5 5 0 01-5 5H8a5 5 0 01-5-5v-2a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    title: 'Healthcare',
    description:
      'Professional reception signage, wayfinding systems, privacy window films and branded displays for healthcare environments.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3h6v4h4v14H5V7h4V3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 11v6M9 14h6" />
      </svg>
    ),
  },
  {
    title: 'Education',
    description:
      'School signs, campus wayfinding, notice boards, promotional displays and branded educational materials.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m-9-7v4.5c0 .5 4 2.5 9 2.5s9-2 9-2.5V14" />
      </svg>
    ),
  },
  {
    title: 'Construction & Property',
    description:
      'Site boards, health and safety signage, directional signs, hoarding graphics and property marketing materials.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    title: 'Offices & Commercial',
    description:
      'Reception branding, wall graphics, meeting room signs, corporate signage and professional printed marketing materials.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 21V7a1 1 0 011-1h6a1 1 0 011 1v14M4 21h16M12 21v-6a1 1 0 011-1h6a1 1 0 011 1v6M8 8h.01M8 12h.01M8 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Automotive',
    description:
      'Vehicle graphics, showroom branding, promotional displays and workshop signage designed to strengthen brand visibility.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0M3 17V9l2-5h10l3 5h3v8m-6-8H5" />
      </svg>
    ),
  },
];

const IndustriesWeSupport = () => (
  <section className="py-14 md:py-16 bg-white">
    <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
          Industries We <WavyUnderline>Support</WavyUnderline>
        </h2>
        <p
          className="mt-3 text-gray-600 max-w-2xl mx-auto text-sm md:text-base"
          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
        >
          Every industry has unique branding requirements, and our solutions are designed to meet those specific needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {industries.map((industry) => (
          <article
            key={industry.title}
            className="bg-gray-50 rounded-xl border border-gray-100 p-5 hover:shadow-md hover:bg-white transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center mb-3 text-blue-600">
              {industry.icon}
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">{industry.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              {industry.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default IndustriesWeSupport;
