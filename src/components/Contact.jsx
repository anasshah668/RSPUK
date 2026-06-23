import React, { useState } from 'react';
import { toast } from 'react-toastify';
import WavyUnderline from './WavyUnderline';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const inputClass =
  'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200';

const ContactChannel = ({ icon, label, children }) => (
  <div className="flex gap-4">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300 ring-1 ring-white/10">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400" style={font}>
        {label}
      </p>
      <div className="mt-1 text-sm text-white" style={font}>
        {children}
      </div>
    </div>
  </div>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success('Thank you for your message. Our team will respond within one business day.');
    setFormData({ name: '', email: '', phone: '', subject: 'general', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const inquiryOptions = [
    { value: 'general', label: 'General enquiry' },
    { value: 'quote', label: 'Request a quote' },
    { value: 'design', label: 'Design & branding' },
    { value: 'installation', label: 'Installation & signage' },
    { value: 'trade', label: 'Trade account' },
  ];

  return (
    <section id="contact" className="scroll-mt-28 bg-gradient-to-b from-slate-100 via-white to-slate-50 py-20 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span
            className="mb-4 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700"
            style={font}
          >
            Contact our team
          </span>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
            Get in <WavyUnderline>Touch</WavyUnderline>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg" style={font}>
            Speak with our signage specialists about quotes, design support, production timelines, or trade
            partnerships. We respond to every enquiry with clear next steps.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-6 lg:col-span-5">
            <div className="overflow-hidden rounded-2xl bg-gray-800 shadow-xl ring-1 ring-slate-900/10">
              <div className="border-b border-white/10 bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6">
                <h3 className="text-xl font-bold text-white md:text-2xl">How we can help</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300" style={font}>
                  From concept to installation, our UK team supports businesses, retailers, and agencies
                  nationwide.
                </p>
              </div>

              <div className="space-y-6 px-8 py-8">
                <ContactChannel
                  label="Email"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  <a
                    href="mailto:enquiries@tradeonlysigns.co.uk"
                    className="break-all text-blue-300 transition-colors hover:text-white"
                  >
                    enquiries@tradeonlysigns.co.uk
                  </a>
                </ContactChannel>

                <ContactChannel
                  label="Phone"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                >
                  <a href="tel:01914882011" className="text-blue-300 transition-colors hover:text-white">
                    0191 488 2011
                  </a>
                </ContactChannel>

                <ContactChannel
                  label="Office hours"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                >
                  <div className="space-y-0.5">
                    <p>Monday – Friday: 9:00 AM – 6:00 PM</p>
                    <p>Saturday: 10:00 AM – 4:00 PM</p>
                  </div>
                </ContactChannel>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-white/10 bg-slate-900/50 px-8 py-6 sm:grid-cols-3">
                {[
                  { value: '< 24h', label: 'Typical response' },
                  { value: 'UK-wide', label: 'Delivery coverage' },
                  { value: 'Trade', label: 'Pricing available' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-white/5 px-3 py-3 text-center ring-1 ring-white/10">
                    <p className="text-lg font-bold text-yellow-400">{item.value}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400" style={font}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">London office</h3>
                  <address className="mt-2 not-italic text-sm leading-relaxed text-slate-600" style={font}>
                    20-22 Wenlock Road
                    <br />
                    Islington, London N1 7GU
                    <br />
                    United Kingdom
                  </address>
                  <a
                    href="https://maps.google.com/?q=20-22+Wenlock+Road+London+N1+7GU"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                    style={font}
                  >
                    View on map
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg md:p-10">
              <div className="mb-8 border-b border-slate-100 pb-6">
                <h3 className="text-2xl font-bold text-slate-900">Send us a message</h3>
                <p className="mt-2 text-sm text-slate-600" style={font}>
                  Complete the form below and a member of our team will be in touch shortly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-slate-700" style={font}>
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      className={inputClass}
                      style={font}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-slate-700" style={font}>
                      Work email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      className={inputClass}
                      style={font}
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="contact-phone" className="mb-2 block text-sm font-semibold text-slate-700" style={font}>
                      Phone number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      placeholder="Optional"
                      className={inputClass}
                      style={font}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="mb-2 block text-sm font-semibold text-slate-700" style={font}>
                      Enquiry type
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={inputClass}
                      style={font}
                    >
                      {inquiryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-slate-700" style={font}>
                    Project details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us about your signage requirements, dimensions, location, and timeline..."
                    className={`${inputClass} resize-y min-h-[9rem]`}
                    style={font}
                  />
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs leading-relaxed text-slate-500" style={font}>
                    By submitting this form, you agree that we may contact you regarding your enquiry. We handle
                    your information securely and never share it with third parties for marketing purposes.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 md:w-auto md:min-w-[220px]"
                  style={font}
                >
                  {isSubmitting ? 'Sending...' : 'Send message'}
                  {!isSubmitting ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  ) : null}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
