import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { featuredSignagePricingService } from '../services/featuredSignagePricingService';
import { featuredSignageItems } from '../data/featuredSignageData';
import { RATE_UNIT_OPTIONS, fieldsForAdminCategory, normalizeRateUnit } from '../utils/featuredSignageDimensionUnits';

const PRICING_CATEGORIES = [
  { slug: '_default', label: 'Default (fallback for all categories)' },
  ...featuredSignageItems.map((item) => ({
    slug: item.categorySlug,
    label: item.title || item.heading,
  })),
];

const AdminFeaturedSignagePricingTab = () => {
  const [selectedSlug, setSelectedSlug] = useState('2d-box-signage');
  const [form, setForm] = useState({ rateUnit: 'cm' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const rateUnit = normalizeRateUnit(form.rateUnit);

  const fields = useMemo(() => fieldsForAdminCategory(selectedSlug, rateUnit), [selectedSlug, rateUnit]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await featuredSignagePricingService.getAdmin(selectedSlug);
        if (!cancelled) {
          setForm({
            ...data,
            rateUnit: normalizeRateUnit(data?.rateUnit),
          });
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err.message || 'Failed to load pricing');
          setForm({ rateUnit: 'cm' });
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
        rateUnit: normalizeRateUnit(form.rateUnit),
      };
      fields.forEach(({ key }) => {
        const v = form[key];
        if (v !== '' && v !== undefined && v !== null) payload[key] = Number(v);
      });
      const updated = await featuredSignagePricingService.updateAdmin(selectedSlug, payload);
      setForm({
        ...updated,
        rateUnit: normalizeRateUnit(updated?.rateUnit),
      });
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
          Set size rates in your chosen unit (cm, mm, ft, or inch). Customer width/height are converted
          automatically to match. Amounts are ex-VAT; the header VAT toggle controls display on the site.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <div>
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
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Rate unit for size pricing</label>
          <select
            value={rateUnit}
            onChange={(e) => handleChange('rateUnit', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-sm"
          >
            {RATE_UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">
            Width, height and area rates below apply per {rateUnit}
            {rateUnit === 'cm' || rateUnit === 'mm' ? ' / per square unit for area' : '² for area'}.
          </p>
        </div>
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
