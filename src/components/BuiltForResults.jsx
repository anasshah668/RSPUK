import React from 'react';
import WavyUnderline from './WavyUnderline';

const BuiltForResults = () => {
  const metrics = [
    {
      value: '500+',
      label: 'Projects Delivered',
    },
    {
      value: '48hr',
      label: 'Fast UK Delivery',
    },
    {
      value: '100%',
      label: 'Premium Materials',
    },
    {
      value: 'Trade',
      label: 'Pricing Available',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Built for{' '}
            <WavyUnderline>
              Results
            </WavyUnderline>
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                {metric.value}
              </div>
              <p
                className="text-gray-600 text-sm md:text-base"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuiltForResults;
