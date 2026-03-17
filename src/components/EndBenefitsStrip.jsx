import React from 'react';

const items = [
  { label: 'Fast, Reliable\nDelivery', icon: 'truck' },
  { label: '40 Point Free Artwork\nCheck', icon: 'check' },
  { label: 'Over 300+ Products\nCatalogue', icon: 'catalogue' },
  { label: 'Free Online Design\nTools', icon: 'tools' },
  { label: 'White Label\nShipping', icon: 'shipping' },
  { label: 'Bespoke\nQuotes', icon: 'quotes' },
];

const Icon = ({ name }) => {
  const common = 'w-6 h-6 text-slate-700';

  switch (name) {
    case 'truck':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7h11v10H3z" strokeLinejoin="round" />
          <path d="M14 10h4l3 3v4h-7v-7z" strokeLinejoin="round" />
          <path d="M7 17a2 2 0 1 0 4 0" />
          <path d="M17 17a2 2 0 1 0 4 0" />
          <path d="M5 17h2" />
        </svg>
      );
    case 'check':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 6.5h5" strokeLinecap="round" />
        </svg>
      );
    case 'catalogue':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6a2 2 0 0 1 2-2h12v16H6a2 2 0 0 1-2-2V6z" strokeLinejoin="round" />
          <path d="M8 8h8M8 12h8M8 16h6" strokeLinecap="round" />
        </svg>
      );
    case 'tools':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l3 5-3 2-3-2 3-5z" strokeLinejoin="round" />
          <path d="M5 21a7 7 0 0 1 14 0" strokeLinecap="round" />
          <path d="M12 10v4" strokeLinecap="round" />
          <path d="M9.5 14.5l-1.5 1.5" strokeLinecap="round" />
          <path d="M14.5 14.5l1.5 1.5" strokeLinecap="round" />
        </svg>
      );
    case 'shipping':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7h12v10H3z" strokeLinejoin="round" />
          <path d="M15 10h4l2 2v5h-6v-7z" strokeLinejoin="round" />
          <path d="M7 17a2 2 0 1 0 4 0" />
          <path d="M17 17a2 2 0 1 0 4 0" />
          <path d="M6 11h6" strokeLinecap="round" />
          <path d="M18.3 8.2l-1.4-1.4" strokeLinecap="round" />
          <path d="M19.8 6.7l-3.2 3.2" strokeLinecap="round" />
        </svg>
      );
    case 'quotes':
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 5h16v11a3 3 0 0 1-3 3H9l-4 3v-3H7a3 3 0 0 1-3-3V5z" strokeLinejoin="round" />
          <path d="M7.5 9h9M7.5 12h6.5" strokeLinecap="round" />
        </svg>
      );
  }
};

const EndBenefitsStrip = () => {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="border-t border-gray-200 py-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            {items.map((item) => (
              <div key={item.icon} className="flex items-center gap-3 flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon name={item.icon} />
                </div>
                <div
                  className="text-sm font-semibold text-slate-800 leading-5 whitespace-pre-line"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EndBenefitsStrip;

