import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PAGES = {
  '/terms': {
    title: 'Terms & Conditions',
    updated: '2 October 2026',
    sections: [
      {
        heading: 'Orders and payment',
        body: 'By placing an order on riversigns.co.uk you agree to pay the displayed total, including any selected VAT treatment and delivery service. Artwork you upload or create in the online designer is used to produce that order only.',
      },
      {
        heading: 'Artwork and approvals',
        body: 'Print-ready files should match the product size, page count and colour requirements shown on the product page. We may pause production if a file cannot be printed safely and will contact you using the details on the order.',
      },
      {
        heading: 'Delivery',
        body: 'Delivery dates are estimates based on the service you choose and a valid UK postcode. Production starts after payment and artwork approval.',
      },
      {
        heading: 'Contact',
        body: 'Questions about an order can be sent from your account or through the quote form. Custom neon and print products are made to order and may not be returnable once production has started.',
      },
    ],
  },
  '/privacy': {
    title: 'Privacy Policy',
    updated: '2 October 2026',
    sections: [
      {
        heading: 'What we collect',
        body: 'We collect the name, email, phone and delivery address you provide at checkout or on your account, plus order history and uploaded artwork needed to fulfil your job.',
      },
      {
        heading: 'How we use it',
        body: 'We use this information to process payments, produce and deliver orders, send order emails, and respond to quotes. Payment card details are collected by Worldpay and are not stored on our servers.',
      },
      {
        heading: 'Your rights',
        body: 'You can update your profile in My Account. To ask for a copy of your data or request deletion, contact us using the details on the About page.',
      },
    ],
  },
  '/delivery-returns': {
    title: 'Delivery & Returns',
    updated: '2 October 2026',
    sections: [
      {
        heading: 'Delivery',
        body: 'Saver, Standard and Express services are shown on the product page after you enter a UK postcode. The estimated arrival date follows the selected service.',
      },
      {
        heading: 'Made to order',
        body: 'Most print and neon products are manufactured to your artwork or design. We cannot accept a change of mind return after production has started.',
      },
      {
        heading: 'Faults',
        body: 'If an item arrives damaged or does not match the approved artwork, contact us with photos and your order reference and we will put it right.',
      },
    ],
  },
};

const LegalPage = () => {
  const { pathname } = useLocation();
  const page = PAGES[pathname] || PAGES['/terms'];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">River Signs & Print</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{page.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {page.updated}</p>
        <div className="mt-8 space-y-6">
          {page.sections.map((section) => (
            <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-blue-700">
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/delivery-returns" className="hover:underline">Delivery & Returns</Link>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
