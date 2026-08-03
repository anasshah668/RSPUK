import React from 'react';
import WavyUnderline from './WavyUnderline';

const reasons = [
  'Bespoke Design Solutions',
  'Premium Materials',
  'Advanced Manufacturing Technology',
  'Experienced Design & Production Team',
  'Precision Fabrication',
  'Fast Turnaround Times',
  'Reliable Installation Services',
  'Nationwide Delivery',
  'Personal Customer Support',
  'Complete End-to-End Project Management',
];

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const TrustChecklist = () => (
  <section className="py-14 md:py-16 bg-white">
    <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left — heading & context */}
        <div className="lg:col-span-5">
          <span
            className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-blue-50 text-blue-800 border border-blue-100"
            style={font}
          >
            Trusted UK-Wide
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Why Businesses <WavyUnderline>Trust RSP UK</WavyUnderline>
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed" style={font}>
            Choosing the right signage and printing partner is about more than buying products — it&apos;s about
            working with professionals who understand your business objectives and deliver consistent quality.
          </p>
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed" style={font}>
            Every project is completed with careful attention to detail, ensuring your signage and printed
            materials not only look outstanding but also perform reliably in real commercial environments.
          </p>
        </div>

        {/* Right — checklist card */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 md:p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-x-8">
              {[reasons.slice(0, 5), reasons.slice(5)].map((column, colIndex) => (
                <div key={colIndex} className="divide-y divide-gray-200">
                  {column.map((reason) => (
                    <div key={reason} className="group flex items-center gap-3.5 py-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-600/30 transition-transform duration-200 group-hover:scale-110">
                        <CheckIcon />
                      </span>
                      <span className="text-sm font-semibold text-gray-800 leading-snug" style={font}>
                        {reason}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TrustChecklist;
