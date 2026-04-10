import React, { useState, useEffect } from 'react';
import { neonPricingService } from '../services/neonPricingService';
import { toast } from 'react-toastify';

const numberFields = [
  { key: 'basePrice', label: 'Base price (£)', step: '0.01' },
  { key: 'widthCmRate', label: 'Per cm width (£)', step: '0.01' },
  { key: 'heightCmRate', label: 'Per cm height (£)', step: '0.01' },
  { key: 'outdoorAddon', label: 'Outdoor add-on (£)', step: '0.01' },
  { key: 'jacketColouredAddon', label: 'Coloured jacket add-on (£)', step: '0.01' },
  { key: 'jacketWhiteAddon', label: 'White jacket add-on (£)', step: '0.01' },
  { key: 'tubeClassicAddon', label: 'Classic tube add-on (£)', step: '0.01' },
  { key: 'tubeBoldAddon', label: 'Bold tube add-on (£)', step: '0.01' },
  { key: 'remoteDimmerYesAddon', label: 'Remote dimmer: Yes (£)', step: '0.01' },
  { key: 'remoteDimmerNoAddon', label: 'Remote dimmer: No (£)', step: '0.01' },
  { key: 'powerBatteryAddon', label: 'Battery power add-on (£)', step: '0.01' },
  { key: 'powerAdaptorAddon', label: 'Power adaptor add-on (£)', step: '0.01' },
  { key: 'addOnShapeNoneAddon', label: 'Shape: None (£)', step: '0.01' },
  { key: 'addOnShapeHeartAddon', label: 'Shape: Heart (£)', step: '0.01' },
  { key: 'addOnShapeStarAddon', label: 'Shape: Star (£)', step: '0.01' },
  { key: 'backgroundWhiteAddon', label: 'Background: White (£)', step: '0.01' },
  { key: 'backgroundBlackAddon', label: 'Background: Black (£)', step: '0.01' },
  { key: 'backgroundSilverAddon', label: 'Background: Silver (£)', step: '0.01' },
  { key: 'backgroundYellowAddon', label: 'Background: Yellow (£)', step: '0.01' },
];

const AdminNeonPricingTab = ({ settings: initialSettings, onSaved }) => {
  const [form, setForm] = useState(() => initialSettings || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setForm(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {};
      numberFields.forEach(({ key }) => {
        const v = form[key];
        if (v !== '' && v !== undefined && v !== null) {
          payload[key] = Number(v);
        }
      });
      if (form.currency) {
        payload.currency = form.currency;
      }
      const updated = await neonPricingService.updateAdmin(payload);
      setForm(updated);
      toast.success('Neon pricing saved');
      onSaved?.(updated);
    } catch (err) {
      toast.error(err.message || 'Failed to save neon pricing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
          Neon sign pricing
        </h2>
        <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
          Total = base + (width cm × rate) + (height cm × rate) + selected add-ons. Preset sizes with a fixed price
          from the builder still override the size part when a price is set on the size chip.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Currency code
          </label>
          <input
            type="text"
            value={form.currency || 'GBP'}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {numberFields.map(({ key, label, step }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {label}
              </label>
              <input
                type="number"
                step={step}
                value={form[key] ?? ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
        >
          {saving ? 'Saving…' : 'Save pricing'}
        </button>
      </form>
    </div>
  );
};

export default AdminNeonPricingTab;
