import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNeonPreviewExit } from '../context/NeonPreviewExitContext';
import { featuredSignageItems } from '../data/featuredSignageData';
import { COMPANY_CONTACT } from '../config/companyContact';

const footerProductGroups = [
  {
    title: 'Signs',
    slugs: ['printed-board', '2d-box-signage', '3d-built-up-letters', 'flex-face', 'lightbox'],
  },
  {
    title: 'Printing',
    slugs: [
      'posters',
      'pvc-banners',
      'correx-foamex-aluminium-prints',
      'backlit-prints',
      'canvas-prints',
    ],
  },
  {
    title: 'Window Graphics',
    slugs: ['printed-vinyl', 'frosted-vinyl', 'one-way-vision', 'cut-vinyl', 'privacy-films'],
  },
  {
    title: 'Fabrication',
    slugs: ['cnc-router-cutting', 'fibre-laser-cutting', 'fibre-laser-welding'],
  },
];

const featuredBySlug = Object.fromEntries(
  featuredSignageItems.map((item) => [item.categorySlug, item]),
);

const Footer = () => {
  const navigate = useNavigate();
  const { confirmLeavePreview } = useNeonPreviewExit();
  const paymentLogos = [
    { name: 'Visa', src: '/payment-logos/visa.png', logoClass: 'h-9 md:h-10' },
    { name: 'American Express', src: '/payment-logos/american-express.png', logoClass: 'h-8 md:h-9' },
    { name: 'Maestro', src: '/payment-logos/maestro.png', logoClass: 'h-8 md:h-9' },
    { name: 'Mastercard', src: '/payment-logos/mastercard.png', logoClass: 'h-8 md:h-9' },
    { name: 'PayPal', src: '/payment-logos/paypal.png', logoClass: 'h-9 md:h-10' },
  ];

  const handleNavClick = async (section) => {
    if (!(await confirmLeavePreview())) return;
    const routeMap = {
      services: '/#services',
      about: '/about-us',
      gallery: '/gallery',
      quote: '/get-free-quote',
      'product-designer': '/generic-product-designer',
      faqs: '/faqs',
    };

    const route = routeMap[section] || '/';
    if (route.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(route.substring(2));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      navigate(route);
    }
  };

  const handleFeaturedProductClick = async (route) => {
    if (!(await confirmLeavePreview())) return;
    navigate(route);
  };

  const linkClass =
    'text-gray-300 hover:text-blue-400 transition-colors text-sm text-left';

  return (
    <footer className="bg-gray-800 text-white relative">
      <div className="h-0.5 bg-blue-400" />

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="RER Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center">
                <span className="text-3xl font-bold" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  <span className="text-blue-400">R</span>
                  <span className="text-white">ER</span>
                </span>
              </div>
            </div>

            <p className="text-gray-300 text-sm" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              UK-based signage &amp; printing company.
            </p>

            <p className="text-gray-300 text-sm" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Custom neon signs, large-format printing &amp; bespoke fabrication.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2 text-gray-300 text-sm">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <address className="not-italic" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {COMPANY_CONTACT.addressLines.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </address>
              </div>

              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href={`mailto:${COMPANY_CONTACT.email}`}
                  className="hover:text-blue-400 transition-colors"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  {COMPANY_CONTACT.email}
                </a>
              </div>

              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href={COMPANY_CONTACT.phoneTel}
                  className="hover:text-blue-400 transition-colors"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  {COMPANY_CONTACT.phoneDisplay}
                </a>
              </div>
            </div>
          </div>

          {/* Featured product groups */}
          {footerProductGroups.map((group) => (
            <div key={group.title} className="lg:col-span-2">
              <h4 className="text-white font-bold mb-4 text-base">{group.title}</h4>
              <ul className="space-y-2">
                {group.slugs.map((slug) => {
                  const item = featuredBySlug[slug];
                  if (!item) return null;
                  return (
                    <li key={slug}>
                      <button
                        type="button"
                        onClick={() => handleFeaturedProductClick(item.route)}
                        className={linkClass}
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      >
                        {item.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-700/60 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-md sm:max-w-none">
          <div>
            <h4 className="text-white font-bold mb-4 text-base">Company</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', action: 'about' },
                { label: 'Gallery', action: 'gallery' },
              ].map(({ label, action }) => (
                <li key={action}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(action)}
                    className={linkClass}
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-base">Support</h4>
            <ul className="space-y-2">
              {[
                { label: 'Get a Free Quote', action: 'quote' },
                { label: 'Design Tool', action: 'product-designer' },
                { label: 'FAQs', action: 'faqs' },
              ].map(({ label, action }) => (
                <li key={action}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(action)}
                    className={linkClass}
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#4f6872] border-t border-[#66818c]">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:flex-nowrap md:justify-start">
            <div className="inline-flex items-center gap-2 text-white/95 pr-2 md:pr-4 md:border-r md:border-white/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M5 8V6a5 5 0 1110 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2h1zm2 0h6V6a3 3 0 10-6 0v2z"
                  clipRule="evenodd"
                />
              </svg>
              <span
                className="text-sm md:text-base font-semibold tracking-wide uppercase"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                <span className="text-white">Secure </span>
                <span className="text-blue-200">Payments</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
              {paymentLogos.map((logo) => (
                <div
                  key={logo.name}
                  className={`flex items-center justify-center ${logo.pill ? 'bg-white rounded-md px-2.5 py-1.5 shadow-sm' : ''}`}
                  title={logo.name}
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={`${logo.logoClass} w-auto object-contain`}
                    style={{ imageRendering: 'auto' }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
