import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { featuredSignagePricingService } from '../services/featuredSignagePricingService';
import { featuredSignageItems } from '../data/featuredSignageData';
import { fieldsForAdminCategory } from '../utils/featuredSignageDimensionUnits';

const PRICING_CATEGORIES = [
  { slug: '_default', label: 'Default (fallback for all categories)' },
  ...featuredSignageItems.map((item) => ({
    slug: item.categorySlug,
    label: item.title || item.heading,
  })),
];

const AdminFeaturedSignagePricingTab = () => {
  const [selectedSlug, setSelectedSlug] = useState('2d-box-signage');
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fields = useMemo(() => fieldsForAdminCategory(selectedSlug), [selectedSlug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await featuredSignagePricingService.getAdmin(selectedSlug);
        if (!cancelled) {
          setForm({ ...data });
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err.message || 'Failed to load pricing');
          setForm({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedSlug]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        currency: form.currency || 'GBP',
      };
      fields.forEach(({ key }) => {
        const v = form[key];
        if (v !== '' && v !== undefined && v !== null) payload[key] = Number(v);
      });
      const updated = await featuredSignagePricingService.updateAdmin(selectedSlug, payload);
      setForm({ ...updated });
      toast.success('Featured signage pricing saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
          Featured signage pricing
        </h2>
        <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
          Enter size rates in feet only. On the site, a customer choosing cm, mm, or inches has their size
          converted to feet before the price is calculated. Amounts are ex-VAT; the header VAT toggle
          controls display on the site.
        </p>
      </div>

      <div className="max-w-2xl">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-sm"
        >
          {PRICING_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-gray-500 mt-1">
          Width, height and area rates below apply per ft / per ft². Example: £10 per ft is £10 for 12
          inches, 30.48 cm, or 304.8 mm.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading pricing…</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, step }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  min="0"
                  step={step || '0.01'}
                  value={form[key] ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save pricing'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminFeaturedSignagePricingTab;
