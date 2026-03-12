import React, { useState, useRef, useEffect } from 'react';

const CountUp = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && count === 0) {
            let startTime = null;
            const animate = (currentTime) => {
              if (startTime === null) startTime = currentTime;
              const progress = Math.min((currentTime - startTime) / duration, 1);
              
              const easeOutQuart = 1 - Math.pow(1 - progress, 4);
              const currentCount = Math.floor(easeOutQuart * end);
              
              setCount(currentCount);
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setCount(end);
              }
            };
            requestAnimationFrame(animate);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [end, count, duration]);

  return (
    <span ref={countRef}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const AboutUs = ({ onNavigate, onClose }) => {
  const stats = [
    { 
      number: 30, 
      suffix: '+', 
      label: 'Years Experience', 
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#ef4444" strokeWidth="2" fill="white"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="#ef4444" strokeWidth="2"/>
          <rect x="9" y="13" width="2" height="2" fill="#ef4444" rx="0.5"/>
          <rect x="13" y="13" width="2" height="2" fill="#ef4444" rx="0.5"/>
          <rect x="17" y="13" width="2" height="2" fill="#ef4444" rx="0.5"/>
          <rect x="9" y="17" width="2" height="2" fill="#ef4444" rx="0.5"/>
          <rect x="13" y="17" width="2" height="2" fill="#ef4444" rx="0.5"/>
        </svg>
      )
    },
    { 
      number: 5000, 
      suffix: '+', 
      label: 'Projects Completed', 
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#22c55e"/>
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      number: 2000, 
      suffix: '+', 
      label: 'Happy Customers', 
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#fbbf24"/>
          <circle cx="9" cy="9" r="1.5" fill="#ef4444"/>
          <circle cx="15" cy="9" r="1.5" fill="#ef4444"/>
          <path d="M8 14c1.5 2 4.5 2 6 0" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      )
    },
    { 
      number: 50000, 
      suffix: '', 
      label: 'ft² Facilities', 
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21h18" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
          <path d="M5 21V7l8-4v18" fill="#fbbf24"/>
          <path d="M5 7l8-4 8 4v14H5z" stroke="#ef4444" strokeWidth="2" fill="none"/>
          <rect x="9" y="11" width="2" height="2" fill="#3b82f6"/>
          <rect x="13" y="11" width="2" height="2" fill="#3b82f6"/>
          <rect x="9" y="15" width="2" height="2" fill="#3b82f6"/>
          <rect x="13" y="15" width="2" height="2" fill="#3b82f6"/>
          <path d="M19 21v-4h2v4" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="20" cy="17" r="1" fill="#6b7280"/>
        </svg>
      )
    },
  ];

  const values = [
    {
      title: 'Quality First',
      description: 'We never compromise on quality. Every product is crafted with precision and attention to detail.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Innovation',
      description: 'We stay ahead of the curve with cutting-edge technology and creative solutions.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: 'Customer Focus',
      description: 'Your satisfaction is our priority. We work closely with you to bring your vision to life.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: 'Reliability',
      description: 'Count on us for timely delivery and consistent results, every single time.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const services = [
    {
      title: 'End-to-End Solutions',
      description: 'From design to manufacture and installation, we handle everything.'
    },
    {
      title: 'Bespoke Service',
      description: 'Limitless options for design and illumination tailored to your needs.'
    },
    {
      title: 'Trade-Focused',
      description: 'Discreet and secure service, ensuring your clients remain your clients.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={() => (onClose && onClose()) || (onNavigate && onNavigate('home'))}
            className="text-white/80 hover:text-white font-medium flex items-center gap-2 transition-colors text-sm mb-8"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              About Us
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Signage. Simplified.
            </p>
            <p className="text-lg text-blue-200 mt-4 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              We turn complex signage needs into simple, seamless solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                OUR STORY
              </h2>
              <div className="h-1 bg-blue-600 w-28 mb-6"></div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Decades of Excellence in Signage
              </h3>
              <div className="space-y-4 text-gray-700 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                <p>
                  For over 30 years, we've been at the forefront of the signage industry, delivering exceptional quality and service to trade clients across the UK. What started as a small family business has grown into one of the most trusted names in signage manufacturing.
                </p>
                <p>
                  Our journey began with a simple mission: to make professional signage accessible, affordable, and easy to order. Today, we've expanded our capabilities to include everything from custom neon signs to large format printing, all manufactured at our state-of-the-art facility in the North East.
                </p>
                <p>
                  We've built our reputation on three core principles: quality craftsmanship, innovative solutions, and unwavering commitment to our customers. Every project we undertake is a testament to these values.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-2xl p-8 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Manufacturing Excellence Since 1994
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              OUR MISSION
            </h2>
            <div className="h-1 bg-blue-600 w-28 mx-auto mb-8"></div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Making Signage Simple
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-8" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              At RER, we're committed to simplifying the signage process. With the widest range of signage and illumination options — all manufactured at our base in the North East — our offerings are tailored for trade clients who demand excellence.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              We've developed user-friendly online tools to streamline the pricing process and help you cost your projects quickly, clearly, and accurately. Our dedicated team of signage experts are always on hand to ensure a smooth journey from design to installation.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div 
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  <CountUp end={stat.number} suffix={stat.suffix} duration={2000} />
                </div>
                <div 
                  className="text-blue-100 text-sm md:text-base"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              OUR VALUES
            </h2>
            <div className="h-1 bg-blue-600 w-28 mx-auto mb-6"></div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              What Drives Us
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {value.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {value.title}
                </h4>
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              WHAT WE OFFER
            </h2>
            <div className="h-1 bg-blue-600 w-28 mx-auto mb-6"></div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Comprehensive Signage Solutions
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow duration-200">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {service.title}
                </h4>
                <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Let's bring your vision to life. Get in touch with us today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate && onNavigate('quote')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Get a Free Quote
            </button>
            <button
              onClick={() => onNavigate && onNavigate('contact')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors duration-200"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
