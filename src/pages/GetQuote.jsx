import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quoteService } from '../services/quoteService';

const GetQuote = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    quantity: '',
    message: '',
    preferredContact: 'email'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const projectTypes = [
    'Neon Signs',
    'Large Format Printing',
    'Window Graphics',
    'Banners',
    'Business Cards',
    'Flyers',
    'Brochures',
    'Stickers',
    'Custom Fabrication',
    'Other'
  ];

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use centralized service
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
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quote Request Submitted!
            </h2>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Thank you for your interest. We'll get back to you within 24 hours with a detailed quote.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => (onClose && onClose()) || (onNavigate && onNavigate('home'))}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors text-sm mb-6"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Get a Free Quote
            </h1>
            <p className="text-lg text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Fill out the form below and we'll provide you with a detailed quote within 24 hours
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+44 1234 567 890"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your Company Ltd"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Project Details
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Project Type */}
                <div>
                  <label htmlFor="projectType" className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.projectType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    <option value="">Select a project type</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.projectType && (
                    <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {errors.projectType}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Quantity (Optional)
                  </label>
                  <input
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., 100 pieces"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="mt-6">
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Project Description (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about your project, dimensions, colors, deadlines, or any specific requirements..."
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                ></textarea>
              </div>

              {/* Preferred Contact Method */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Preferred Contact Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="email"
                      checked={formData.preferredContact === 'email'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="phone"
                      checked={formData.preferredContact === 'phone'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Phone</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Submit Quote Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                What happens next?
              </h3>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Our team will review your request and get back to you within 24 hours with a detailed quote. For urgent projects, feel free to call us directly at <strong>01234 567 890</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetQuote;
