import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quoteService } from '../services/quoteService';
import {
  AuthAlert,
  AuthFieldError,
  AuthSubmitButton,
  font,
  inputClass,
  labelClass,
} from '../components/AuthLayout';

const PROJECT_TYPES = [
  'Neon Signs',
  'Large Format Printing',
  'Window Graphics',
  'Banners',
  'Business Cards',
  'Flyers',
  'Brochures',
  'Stickers',
  'Custom Fabrication',
  'Other',
];

const TRUST_ITEMS = [
  { label: 'Free quote', detail: 'No obligation' },
  { label: '24-hour response', detail: 'Typical turnaround' },
  { label: 'UK-wide delivery', detail: 'Print & signage' },
];

const STEPS = [
  {
    title: 'We review your brief',
    text: 'Our team reads your project details and checks specifications.',
  },
  {
    title: 'You receive a tailored quote',
    text: 'Pricing, lead times, and options sent by email or phone.',
  },
  {
    title: 'Approve & we get started',
    text: 'Reply to accept, tweak requirements, or ask questions anytime.',
  },
];

const SectionHeader = ({ step, title, subtitle }) => (
  <div className="mb-5 flex items-start gap-4">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-600/30">
      {step}
    </span>
    <div>
      <h2 className="text-lg font-bold text-gray-900" style={font}>{title}</h2>
      {subtitle ? <p className="mt-0.5 text-sm text-gray-500" style={font}>{subtitle}</p> : null}
    </div>
  </div>
);

const GetQuote = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: '',
    projectType: '',
    quantity: '',
    message: '',
    preferredContact: 'email',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.projectType) {
      newErrors.projectType = 'Please select a project type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }));
    }
  };

  const selectProjectType = (type) => {
    setFormData((prev) => ({ ...prev, projectType: type }));
    if (errors.projectType) {
      setErrors((prev) => ({ ...prev, projectType: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await quoteService.create(formData);
      setIsSubmitted(true);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-8 shadow-xl shadow-gray-200/50 sm:p-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl" style={font}>
              Quote request received
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500" style={font}>
              Thank you, {formData.name.split(' ')[0] || 'there'}. Our team will review your project and
              get back to you within 24 hours with a detailed quote.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                style={font}
              >
                Return to home
              </button>
              {isAuthenticated() ? (
                <Link
                  to="/account"
                  className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  style={font}
                >
                  View my quotes
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-gray-200/80 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/');
            }}
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-blue-200/80 transition hover:text-white"
            style={font}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-300" style={font}>
              Free & no obligation
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style={font}>
              Get a free quote
            </h1>
            <p className="mt-4 text-base leading-relaxed text-blue-100/80 sm:text-lg" style={font}>
              Tell us about your print or signage project. We&apos;ll come back with clear pricing,
              lead times, and options — usually within 24 hours.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <p className="text-sm font-bold text-white" style={font}>{item.label}</p>
                <p className="text-xs text-blue-200/70" style={font}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          {/* Form */}
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xl shadow-gray-200/40">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
              {/* Contact */}
              <div className="p-6 sm:p-8">
                <SectionHeader
                  step="01"
                  title="Contact information"
                  subtitle="How should we reach you with your quote?"
                />

                {errors.submit ? (
                  <div className="mb-5">
                    <AuthAlert type="error">{errors.submit}</AuthAlert>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className={labelClass} style={font}>
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`${inputClass} ${errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                      placeholder="Your name"
                      style={font}
                    />
                    <AuthFieldError message={errors.name} />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass} style={font}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${inputClass} ${errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                      placeholder="you@company.com"
                      style={font}
                    />
                    <AuthFieldError message={errors.email} />
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass} style={font}>
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${inputClass} ${errors.phone ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                      placeholder="0191 488 2011"
                      style={font}
                    />
                    <AuthFieldError message={errors.phone} />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="company" className={labelClass} style={font}>
                      Company <span className="font-normal normal-case tracking-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Your company name"
                      style={font}
                    />
                  </div>
                </div>
              </div>

              {/* Project */}
              <div className="p-6 sm:p-8">
                <SectionHeader
                  step="02"
                  title="Project details"
                  subtitle="The more detail you share, the more accurate your quote."
                />

                <div className="mb-5">
                  <p className={labelClass} style={font}>
                    Project type <span className="text-red-500">*</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_TYPES.map((type) => {
                      const selected = formData.projectType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => selectProjectType(type)}
                          className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                            selected
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                          style={font}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                  <AuthFieldError message={errors.projectType} />
                </div>

                <div className="mb-5">
                  <label htmlFor="quantity" className={labelClass} style={font}>
                    Quantity <span className="font-normal normal-case tracking-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 100 flyers, 1 banner, 500 stickers"
                    style={font}
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="message" className={labelClass} style={font}>
                    Project description <span className="font-normal normal-case tracking-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`${inputClass} resize-y min-h-[7rem]`}
                    placeholder="Dimensions, materials, colours, deadline, installation needs, or anything else we should know…"
                    style={font}
                  />
                </div>

                <div>
                  <p className={labelClass} style={font}>Preferred contact method</p>
                  <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                    {[
                      { value: 'email', label: 'Email' },
                      { value: 'phone', label: 'Phone' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, preferredContact: option.value }))}
                        className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                          formData.preferredContact === option.value
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        style={font}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="bg-gray-50/80 p-6 sm:p-8">
                <AuthSubmitButton loading={isSubmitting} loadingLabel="Submitting…">
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Submit quote request
                  </span>
                </AuthSubmitButton>
                <p className="mt-3 text-center text-xs text-gray-400" style={font}>
                  By submitting, you agree we may contact you about this enquiry.
                </p>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900" style={font}>What happens next?</h3>
              <ol className="mt-5 space-y-5">
                {STEPS.map((step, idx) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900" style={font}>{step.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500" style={font}>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900" style={font}>Need it urgently?</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600" style={font}>
                    Call us directly and we&apos;ll prioritise your project.
                  </p>
                  <a
                    href="tel:01914882011"
                    className="mt-3 inline-flex text-sm font-bold text-blue-700 transition hover:text-blue-800"
                    style={font}
                  >
                    0191 488 2011
                  </a>
                </div>
              </div>
            </div>

            {isAuthenticated() ? (
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 text-center shadow-sm">
                <p className="text-sm text-gray-600" style={font}>
                  Track quotes and replies in{' '}
                  <Link to="/account" className="font-semibold text-blue-600 hover:text-blue-700">
                    My Account
                  </Link>
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 text-center shadow-sm">
                <p className="text-sm text-gray-600" style={font}>
                  <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                    Create a free account
                  </Link>
                  {' '}to track quotes and order history.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default GetQuote;
