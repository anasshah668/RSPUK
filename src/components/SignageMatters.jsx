import React from 'react';
import WavyUnderline from './WavyUnderline';

const benefits = [
  'Increased brand visibility',
  'Stronger customer trust',
  'Improved foot traffic',
  'Consistent business branding',
  'Better customer navigation',
  'Enhanced workplace appearance',
  'Long-term marketing value',
];

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const SignageMatters = () => (
  <section className="py-14 md:py-16 bg-white">
    <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Why Professional <WavyUnderline>Signage Matters</WavyUnderline>
          </h2>
          <div className="mt-4 space-y-4 text-sm md:text-base text-gray-600 leading-relaxed" style={font}>
            <p>
              Professional signage is more than a business necessity — it&apos;s one of your most effective
              marketing tools. High-quality signs, graphics and printed materials help customers recognise your
              brand, build trust and encourage engagement before they even walk through your door.
            </p>
            <p>
              Whether you&apos;re launching a new business, updating your branding, or promoting a new product or
              service, professionally designed signage creates a strong first impression that supports long-term
              business growth.
            </p>
          </div>

          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2.5 text-sm text-gray-700" style={font}>
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-9">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">
            Why <WavyUnderline>Quality Matters</WavyUnderline>
          </h3>
          <div className="mt-4 space-y-4 text-sm md:text-base text-gray-600 leading-relaxed" style={font}>
            <p>
              Quality signage and printed materials reflect the professionalism of your business. Poorly
              manufactured signs can damage your brand image, while professionally produced graphics create
              confidence and leave a positive impression.
            </p>
            <p>
              That&apos;s why every project at RSP UK is produced using premium materials, modern manufacturing
              equipment and strict quality control processes. From colour accuracy and material durability to
              precise finishing and installation, we focus on delivering products that exceed expectations.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default SignageMatters;
