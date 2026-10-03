import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSeo } from '../hooks/usePageSeo';

const NotFound = () => {
  usePageSeo({
    title: 'Page not found | River Signs & Print',
    description: 'That page does not exist. Browse our print, signage and neon products or request a quote.',
    path: '/404',
  });

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-slate-50 via-white to-blue-50/30 px-4 py-20">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">404</p>
        <h1
          className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl"
          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
        >
          This page does not exist
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
          The link may be out of date, or the product has been removed. Head home or ask us for a quote.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Back to home
          </Link>
          <Link
            to="/get-free-quote"
            className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Get a free quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
