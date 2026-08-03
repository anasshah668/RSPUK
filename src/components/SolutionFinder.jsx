import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutePath } from '../config/routes.config';
import WavyUnderline from './WavyUnderline';

const rows = [
  { need: 'Shopfront Branding', solution: 'Shopfront Signs & 3D Built-Up Letters' },
  { need: 'Retail Promotions', solution: 'PVC Banners & Posters' },
  { need: 'Office Branding', solution: 'Window Graphics & Frosted Vinyl' },
  { need: 'Directional Signage', solution: 'Printed Boards & Wayfinding Signs' },
  { need: 'Vehicle Advertising', solution: 'Vehicle Graphics' },
  { need: 'Business Networking', solution: 'Business Cards & Flyers' },
  { need: 'Events & Exhibitions', solution: 'Roller Banners & Large Format Printing' },
  { need: 'Custom Manufacturing', solution: 'CNC Routing & Fibre Laser Cutting' },
];

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const SolutionFinder = () => {
  const navigate = useNavigate();

  return (
    <section className="py-14 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Choosing the Right <WavyUnderline>Solution</WavyUnderline> for Your Business
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-sm md:text-base" style={font}>
            No matter your project, our team will help you choose the most effective solution for your business
            goals, budget and branding requirements.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="hidden sm:grid grid-cols-2 bg-gray-900 px-6 py-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-white" style={font}>
              Business Need
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-white" style={font}>
              Recommended Solution
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {rows.map((row, index) => (
              <div
                key={row.need}
                className={`grid grid-cols-1 sm:grid-cols-2 gap-1 px-6 py-4 ${index % 2 === 1 ? 'bg-gray-50/60' : ''}`}
              >
                <span className="text-sm font-semibold text-gray-900" style={font}>
                  {row.need}
                </span>
                <span className="text-sm text-blue-700" style={font}>
                  {row.solution}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate(getRoutePath('getQuote'))}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
            style={font}
          >
            Talk to Our Team About Your Project
          </button>
        </div>
      </div>
    </section>
  );
};

export default SolutionFinder;
