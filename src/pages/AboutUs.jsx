import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WavyUnderline from '../components/WavyUnderline';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

const CountUp = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && count === 0) {
            let startTime = null;
            const animate = (currentTime) => {
              if (startTime === null) startTime = currentTime;
              const progress = Math.min((currentTime - startTime) / duration, 1);
              const easeOutQuart = 1 - (1 - progress) ** 4;
              setCount(Math.floor(easeOutQuart * end));
              if (progress < 1) requestAnimationFrame(animate);
              else setCount(end);
            };
            requestAnimationFrame(animate);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );

    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, count, duration]);

  return (
    <span ref={countRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const values = [
  {
    title: 'Quality First',
    description:
      'Every sign and print job is produced with precision materials, careful finishing, and rigorous quality checks.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M9 12l2 2 4-4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
      </svg>
    ),
  },
  {
    title: 'Innovation',
    description:
      'From online design tools to modern fabrication methods, we invest in smarter ways to deliver better results.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Customer Focus',
    description:
      'We work closely with trade clients and businesses to understand the brief and deliver signage that performs.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Reliability',
    description:
      'Consistent lead times, clear communication, and dependable delivery — so your projects stay on track.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const milestones = [
  { year: '1994', label: 'Founded in the North East with a focus on trade signage.' },
  { year: '2005', label: 'Expanded in-house manufacturing and large-format print capabilities.' },
  { year: '2015', label: 'Launched illuminated signage, neon, and bespoke fabrication services.' },
  { year: 'Today', label: 'Serving clients UK-wide from our Middlesbrough production facility.' },
];

const processSteps = [
  {
    step: '01',
    title: 'Consult & Design',
    description: 'Share your brief, dimensions, and brand requirements. We advise on materials, finishes, and illumination.',
  },
  {
    step: '02',
    title: 'Manufacture',
    description: 'Your signage is produced in-house using premium materials, CNC, laser, and print technologies.',
  },
  {
    step: '03',
    title: 'Deliver & Install',
    description: 'We coordinate dispatch and installation support so your project lands on time and on spec.',
  },
];

const capabilities = [
  {
    title: 'End-to-End Solutions',
    description: 'Design, production, and installation support under one roof — fewer handoffs, faster delivery.',
  },
  {
    title: 'Bespoke Fabrication',
    description: '3D letters, lightboxes, flex face, window graphics, and custom neon built to your specification.',
  },
  {
    title: 'Trade-Focused Service',
    description: 'Discreet, dependable support for installers, agencies, and businesses across the UK.',
  },
];

const stats = [
  { number: 30, suffix: '+', label: 'Years of experience' },
  { number: 5000, suffix: '+', label: 'Projects completed' },
  { number: 2000, suffix: '+', label: 'Happy customers' },
  { number: 50000, suffix: '', label: 'ft² production facility' },
];

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.15) 12px, rgba(255,255,255,0.15) 24px)',
          }}
        />

        <div className="container relative z-10 mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300" style={font}>
                River Signs &amp; Print
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]">
                Signage.{' '}
                <span className="text-blue-400">
                  <WavyUnderline thick> Simplified.</WavyUnderline>
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg" style={font}>
                For over three decades we&apos;ve helped trade clients and businesses across the UK turn complex signage
                requirements into clear, high-quality solutions — manufactured in Middlesbrough and delivered with care.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {['3D Signage', 'Lightboxes', 'Large Format Print', 'Custom Neon', 'Window Graphics'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90"
                    style={font}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/get-free-quote')}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                  style={font}
                >
                  Get a Free Quote
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/gallery')}
                  className="rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  style={font}
                >
                  View Our Work
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-slate-800/60 p-5 text-center"
                    >
                      <p className="text-3xl font-bold text-white md:text-4xl" style={font}>
                        <CountUp end={stat.number} suffix={stat.suffix} />
                      </p>
                      <p className="mt-2 text-xs text-slate-400 md:text-sm" style={font}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-slate-900">
                    UK
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white" style={font}>
                      Manufactured in Middlesbrough
                    </p>
                    <p className="text-xs text-slate-400" style={font}>
                      Serving clients nationwide
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700" style={font}>
                Our Mission
              </p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                Making signage <WavyUnderline>simple</WavyUnderline> for every project
              </h2>
              <p className="mt-5 text-base leading-relaxed text-gray-600 md:text-lg" style={font}>
                We combine the widest range of signage and illumination options with user-friendly online tools, so you
                can price, design, and order with confidence. Our team supports you from first enquiry through to
                production and delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story + Timeline */}
      <section className="pb-14 md:pb-20">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700" style={font}>
                Our Story
              </p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                Decades of excellence in <WavyUnderline>signage</WavyUnderline>
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-gray-600" style={font}>
                <p>
                  What began as a small family business has grown into one of the UK&apos;s most trusted trade signage
                  manufacturers. We&apos;ve built our reputation on quality craftsmanship, innovative production, and
                  genuine partnership with our clients.
                </p>
                <p>
                  Today our facility brings together design support, CNC routing, fibre laser cutting, large-format
                  printing, and illuminated signage production — giving you a single source for projects of every
                  scale.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <h3 className="text-lg font-bold text-gray-900" style={font}>
                Our journey
              </h3>
              <ol className="mt-6 space-y-0">
                {milestones.map((item, index) => (
                  <li key={item.year} className="relative flex gap-5 pb-8 last:pb-0">
                    {index < milestones.length - 1 ? (
                      <span className="absolute left-[1.125rem] top-10 h-full w-px bg-gray-200" aria-hidden />
                    ) : null}
                    <span className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="pt-0.5">
                      <p className="text-sm font-bold text-blue-700" style={font}>
                        {item.year}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600" style={font}>
                        {item.label}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-14 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              What <WavyUnderline>drives us</WavyUnderline>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 md:text-base" style={font}>
              The principles behind every project we manufacture and every relationship we build.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-xl border border-gray-100 bg-gray-50 p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600" style={font}>
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700" style={font}>
              How We Work
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              A clear path from brief to <WavyUnderline>installation</WavyUnderline>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {processSteps.map((step) => (
              <article
                key={step.step}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
              >
                <span className="text-5xl font-bold text-blue-100">{step.step}</span>
                <h3 className="mt-2 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600" style={font}>
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-slate-900 py-14 text-white md:py-20">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-300" style={font}>
              What We Offer
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Comprehensive signage <WavyUnderline thick>solutions</WavyUnderline>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base" style={font}>
              Trade-focused production, fast turnaround, and consistent quality — built to make your ordering process
              simple.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {capabilities.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/30 text-blue-300">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300" style={font}>
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-12 text-center md:px-16 md:py-16">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.12) 10px, rgba(255,255,255,0.12) 20px)',
                }}
              />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                Ready to start your next project?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 md:text-base" style={font}>
                Get a free quote, explore our gallery, or speak with our team about your signage requirements.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('/get-free-quote')}
                  className="rounded-lg bg-yellow-400 px-8 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-300"
                  style={font}
                >
                  Get a Free Quote
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/gallery')}
                  className="rounded-lg border border-white/25 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  style={font}
                >
                  View Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
