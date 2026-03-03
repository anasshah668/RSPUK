import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscribe.</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Sign up to our newsletter, and be the first to hear about our latest innovations, offers, and signage tips.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition-colors font-semibold whitespace-nowrap"
            >
              {submitted ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
