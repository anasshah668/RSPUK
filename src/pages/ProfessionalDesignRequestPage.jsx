import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { designService } from '../services/designService';
import { getRoutePath } from '../config/routes.config';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const PRODUCT_SUGGESTIONS = [
  'Business cards',
  'Flyers',
  'Leaflets & brochures',
  'Posters',
  'Banners',
  'Window graphics',
  'Neon sign artwork',
  'Other print / signage',
];

const ProfessionalDesignRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [productType, setProductType] = useState('');
  const [brief, setBrief] = useState('');
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerPostalCode, setCustomerPostalCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Professional Design Request | River Signs & Print';
  }, []);

  useEffect(() => {
    if (!user) return;
    setCustomerName((prev) => prev || user.name || '');
    setCustomerEmail((prev) => prev || user.email || '');
    setCustomerPhone((prev) => prev || user.phone || '');
    setCustomerAddress((prev) => prev || user.address?.street || '');
    setCustomerCity((prev) => prev || user.address?.city || '');
    setCustomerPostalCode((prev) => prev || user.address?.zipCode || '');
  }, [user]);

  const handleFileChange = (e) => {
    setReferenceFiles(Array.from(e.target.files || []).slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !brief.trim()) {
      toast.error('Please enter a project title and design brief.');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      toast.error('Please enter your name, email, and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      await designService.createInquiry({
        title: title.trim(),
        brief: brief.trim(),
        productType: productType.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerCity: customerCity.trim(),
        customerPostalCode: customerPostalCode.trim(),
        referenceFiles,
      });
      setSubmitted(true);
      toast.success('Request submitted. Our team will be in touch.');
    } catch (err) {
      const validationMsg = err?.data?.errors?.[0]?.msg || err?.message;
      toast.error(validationMsg || 'Could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16" style={font}>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Submitted</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Thanks — we have your brief</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
            Our design team will review your request and contact you by email or phone. No payment was taken.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(getRoutePath('genericProductDesigner'))}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Back to design tool
            </button>
            <Link
              to="/"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Go to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10" style={font}>
      <div className="mb-8">
        <span className="mb-3 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          Free design request
        </span>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Want to design professionally?</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Tell us what you need. Submit this form free of charge — our team will review your brief and get back to you.
          No payment is required to send your request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Project details</h2>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">Project title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. A5 leaflet for spring promotion"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">Product / format</label>
            <input
              list="professional-design-products"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              placeholder="e.g. Business card, flyer, poster"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
            />
            <datalist id="professional-design-products">
              {PRODUCT_SUGGESTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">Design brief *</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={6}
              placeholder="Describe colours, text, size, style, brand guidelines, and anything else we should know..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">
              Reference files (optional, up to 5)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600"
            />
            {referenceFiles.length > 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                {referenceFiles.length} file{referenceFiles.length === 1 ? '' : 's'} selected
              </p>
            ) : null}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your contact details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-800">Full name *</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-800">Email *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-800">Phone *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-800">Address</label>
              <input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-800">City</label>
              <input
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-800">Postcode</label>
              <input
                value={customerPostalCode}
                onChange={(e) => setCustomerPostalCode(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Free to submit · No payment required</p>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit design request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalDesignRequestPage;
