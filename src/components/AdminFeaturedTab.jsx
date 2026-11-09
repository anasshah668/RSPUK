import React, { useState } from 'react';
import AdminFeaturedSignagePricingTab from './AdminFeaturedSignagePricingTab';
import AdminFeaturedProductsTab from './AdminFeaturedProductsTab';

const SECTIONS = [
  { id: 'pricing', label: 'Pricing' },
  { id: 'pictures', label: 'Pictures' },
];

const AdminFeaturedTab = ({ initialSection = 'pricing' }) => {
  const [section, setSection] = useState(initialSection === 'pictures' ? 'pictures' : 'pricing');

  return (
    <div className="space-y-6" data-tour="admin-featured">
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        {SECTIONS.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div data-tour={section === 'pricing' ? 'admin-featured-pricing' : 'admin-featured-products-tab'}>
        {section === 'pricing' ? <AdminFeaturedSignagePricingTab /> : <AdminFeaturedProductsTab />}
      </div>
    </div>
  );
};

export default AdminFeaturedTab;
