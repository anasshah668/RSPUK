import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutePath } from '../config/routes.config';

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
              
              // Easing function for smooth animation
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

const About = () => {
  const navigate = useNavigate();
  const stats = [
    { number: 30, suffix: '+', label: 'Years experience' },
    { number: 5000, suffix: '+', label: 'Projects completed' },
    { number: 2000, suffix: '+', label: 'Happy customers' },
    { number: 50000, suffix: '', label: 'ft² Fabrication facilities' },
  ];

  return (
    <section id="about" className="py-16 bg-white relative overflow-hidden">
      {/* Subtle wave background element */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-50/80 to-transparent"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Top Informational Bar */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="flex items-start gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 text-slate-700 group-hover:text-blue-600 transition-colors duration-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full">
                  <circle cx="8" cy="8" r="3.5" />
                  <circle cx="16" cy="16" r="3.5" />
                  <path d="M11.5 8l4.5 4.5" strokeLinecap="round" />
                  <path d="M8 11.5l4.5 4.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 leading-relaxed text-sm font-medium" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  End-to-end fulfilment solutions, from design to manufacture and installation.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 text-slate-700 group-hover:text-blue-600 transition-colors duration-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full">
                  <rect x="3" y="3" width="18" height="18" rx="2.5" />
                  <path d="M12 5l-7 7v4h4l7-7M12 5l5 5M9 12l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 leading-relaxed text-sm font-medium" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  A truly bespoke service with limitless options for design and illumination.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 text-slate-700 group-hover:text-blue-600 transition-colors duration-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="18" y="9" width="4" height="6" rx="1" />
                  <path d="M20 12v2" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 leading-relaxed text-sm font-medium" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Discreet and secure, meaning your clients will always remain <strong className="font-bold">your</strong> clients.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Our Mission */}
        <div className="max-w-4xl mx-auto">
          <div className="text-left lg:pl-8 lg:pr-4 mb-16">
            <div className="mb-8">
              <h2 
                className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-3 inline-block"
              >
                OUR MISSION
              </h2>
              <div className="h-1 bg-blue-600 w-28"></div>
            </div>
            
            <h3 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight"
            >
              Signage. Simplified.
            </h3>
            
            <div className="space-y-6 text-gray-700 leading-relaxed text-lg" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              <p className="font-light">
                At River Signs & Print, we turn complex signage needs into simple, seamless solutions.
              </p>
              <p className="font-light">
                With the widest range of signage and illumination options — all manufactured at our base in the North East — our offerings are tailored for trade clients who demand excellence.
              </p>
              <p className="font-light">
                We're committed to making your experience as straightforward as possible. To this end, we've developed a user-friendly{' '}
                <button
                  onClick={() => navigate(getRoutePath('neonBuilder'))}
                  className="font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 underline decoration-2 underline-offset-4"
                >
                  Online Quotations portal
                </button>
                , specifically designed to streamline the pricing process and help you cost your projects quickly, clearly, and accurately.
              </p>
              <p className="font-light">
                What's more, our dedicated team of signage experts are always on hand to ensure a smooth journey from design to installation.{' '}
                <button
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      const element = document.getElementById('contact');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 underline decoration-2 underline-offset-4"
                >
                  Contact us
                </button>
                {' '}today to learn more.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div 
                  className="text-3xl md:text-4xl font-bold text-blue-600 mb-2"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  <CountUp end={stat.number} suffix={stat.suffix} duration={2000} />
                </div>
                <div 
                  className="text-gray-600"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Chat Icon */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center transform hover:scale-110 hover:shadow-3xl">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default About;
