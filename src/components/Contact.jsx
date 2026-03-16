import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Get in Touch
            </h2>
            <p 
              className="text-lg text-gray-600"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Have a question or ready to start your project? Contact us today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 
                  className="text-xl font-bold text-gray-900 mb-4"
                >
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <div 
                      className="font-semibold text-gray-900 mb-1"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      Email
                    </div>
                    <a 
                      href="mailto:enquiries@tradeonlysigns.co.uk" 
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      enquiries@tradeonlysigns.co.uk
                    </a>
                  </div>
                  <div>
                    <div 
                      className="font-semibold text-gray-900 mb-1"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      Phone
                    </div>
                    <a 
                      href="tel:01914882011" 
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      0191 488 2011
                    </a>
                  </div>
                  <div>
                    <div 
                      className="font-semibold text-gray-900 mb-1"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      Office Hours
                    </div>
                    <div 
                      className="text-gray-600"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      Monday - Friday: 9:00 AM - 6:00 PM
                    </div>
                    <div 
                      className="text-gray-600"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      Saturday: 10:00 AM - 4:00 PM
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 
                  className="text-xl font-bold text-gray-900 mb-4"
                >
                  London Office
                </h3>
                <div 
                  className="text-gray-600"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  <div>20-22 Wenlock Road</div>
                  <div>Islington</div>
                  <div>London, N1 7GU</div>
                  <div className="mt-2">United Kingdom</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
