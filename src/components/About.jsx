import React, { useState, useEffect, useRef } from 'react';

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
  const stats = [
    { number: 30, suffix: '+', label: 'Years experience' },
    { number: 5000, suffix: '+', label: 'Projects completed' },
    { number: 2000, suffix: '+', label: 'Happy customers' },
    { number: 50000, suffix: '', label: 'ft² Fabrication facilities' },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Signage. Simplified.
            </h2>
            <p 
              className="text-lg text-gray-600"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              At Trade Only Signs, we turn complex signage needs into simple, seamless solutions.
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p 
              className="text-gray-700 mb-4"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              With the widest range of signage and illumination options — all manufactured at our state-of-the-art facilities — our offerings are tailored for businesses who demand excellence.
            </p>
            <p 
              className="text-gray-700 mb-4"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              We're committed to making your experience as straightforward as possible. To this end, we've developed our user-friendly Online Quotations portal, specifically designed to streamline the design process and help you visualize your projects quickly, clearly, and accurately.
            </p>
            <p 
              className="text-gray-700"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              What's more, our dedicated team of signage experts are always on hand to ensure a smooth journey from design to installation. Contact us today to learn more.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div 
                  className="text-3xl md:text-4xl font-bold text-amber-600 mb-2"
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
    </section>
  );
};

export default About;
