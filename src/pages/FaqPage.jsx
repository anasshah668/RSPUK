import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { faqService } from '../services/faqService';
import { COMPANY_CONTACT } from '../config/companyContact';
import WavyUnderline from '../components/WavyUnderline';

const FaqPage = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await faqService.list();
        setFaqs(Array.isArray(response?.faqs) ? response.faqs : []);
      } catch (e) {
        setError(e?.message || 'Failed to load FAQs.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleFaq = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <header className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
          <p
            className="text-xs uppercase tracking-[0.15em] text-blue-700 font-semibold"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Help &amp; Support
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold text-gray-900 mt-2"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Frequently Asked <WavyUnderline>Questions</WavyUnderline>
          </h1>
          <p
            className="text-sm md:text-base text-gray-600 mt-3"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Find answers to common questions about our signage, printing, and design services.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && !error && faqs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">No FAQs yet</h2>
            <p className="mt-2 text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Check back soon, or contact us if you need help right away.
            </p>
            <button
              type="button"
              onClick={() => navigate('/get-free-quote')}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Get a Free Quote
            </button>
          </div>
        ) : null}

        {!loading && !error && faqs.length > 0 ? (
          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = openId === faq._id;
              return (
                <div
                  key={faq._id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq._id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="text-base font-semibold text-gray-900"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen ? (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <p
                        className="pt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {!loading && faqs.length > 0 ? (
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Still have questions? We&apos;re happy to help.
            </p>
            <button
              type="button"
              onClick={() => navigate('/get-free-quote')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Contact Us
            </button>
            <div className="mt-5 flex flex-col items-center justify-center gap-2 text-sm text-gray-600 sm:flex-row sm:gap-6" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              <a href={`mailto:${COMPANY_CONTACT.email}`} className="font-medium text-blue-600 hover:text-blue-700">
                {COMPANY_CONTACT.email}
              </a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <a href={COMPANY_CONTACT.phoneTel} className="font-medium text-blue-600 hover:text-blue-700">
                {COMPANY_CONTACT.phoneDisplay}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FaqPage;
