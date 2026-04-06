import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutePath } from '../config/routes.config';
import WavyUnderline from './WavyUnderline';

const StartDesigningPrint = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-14 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-7 md:p-10 shadow-xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Design Your Product  <WavyUnderline>Online</WavyUnderline>
              </h2>
              <p
                className="mt-3 text-sm md:text-base text-slate-200 max-w-xl leading-relaxed"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Create your own custom designs using our advanced tools or upload your artwork for quick production.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <button
                onClick={() => navigate(getRoutePath('productDesigner'))}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Start Designing
              </button>
              <button
                onClick={() => navigate(getRoutePath('getQuote'))}
                className="px-6 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm transition-colors"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Get a Free Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StartDesigningPrint;

