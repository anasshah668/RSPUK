import React, { useEffect, useState } from 'react';
import { galleryService } from '../services/galleryService';

const GalleryPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewState, setPreviewState] = useState({
    open: false,
    projectTitle: '',
    images: [],
    index: 0,
  });
  const [showTeamModal, setShowTeamModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await galleryService.list();
        setProjects(Array.isArray(response?.projects) ? response.projects : []);
      } catch (e) {
        setError(e?.message || 'Failed to load gallery projects.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openPreview = (project, imageIndex) => {
    const images = Array.isArray(project?.images) ? project.images.filter((img) => img?.url) : [];
    if (!images.length) return;
    setPreviewState({
      open: true,
      projectTitle: project?.title || 'Project image',
      images,
      index: Math.max(0, Math.min(imageIndex, images.length - 1)),
    });
  };

  const closePreview = () => {
    setPreviewState((prev) => ({ ...prev, open: false }));
  };

  const goPreview = (direction) => {
    setPreviewState((prev) => {
      if (!prev.images.length) return prev;
      const nextIndex = (prev.index + direction + prev.images.length) % prev.images.length;
      return { ...prev, index: nextIndex };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <header className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-blue-700 font-semibold" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Our Work
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Project Gallery
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-3 max-w-3xl" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Explore real projects delivered by our team across signage, print and custom production.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && !error && projects.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-gray-600">
            No gallery projects available right now.
          </div>
        ) : null}

        {!loading && !error && projects.length > 0 ? (
          <section className="mt-8 space-y-8">
            {projects.map((project) => (
              <article key={project._id} className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {project.title}
                    </h2>
                    {project.description ? (
                      <p className="text-sm text-gray-600 mt-2 max-w-4xl whitespace-pre-line" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        {project.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                  {(project.images || []).map((img, idx) => (
                    <button
                      key={`${project._id}-${idx}`}
                      type="button"
                      onClick={() => openPreview(project, idx)}
                      className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group relative text-left"
                    >
                      <img
                        src={img?.url}
                        alt={`${project.title} ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </section>
        ) : null}

        <section className="mt-10 grid lg:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              How We Deliver Consistent Quality
            </h2>
            <div className="mt-4 space-y-3">
              {[
                'Project discovery and requirement validation',
                'Material and finish recommendations by use-case',
                'Pre-production checks before print/fabrication',
                'Final quality assurance before dispatch',
              ].map((line) => (
                <div key={line} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  <p className="text-sm text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>{line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Start Your Next Project
            </h2>
            <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Need similar results for your brand? Share your requirements and our team will guide you with the right materials, finishes and delivery options.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="/get-free-quote"
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Request a Quote
              </a>
              <button
                type="button"
                onClick={() => setShowTeamModal(true)}
                className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Talk to Our Team
              </button>
            </div>
          </div>
        </section>
      </div>

      {previewState.open ? (
        <div
          className="fixed inset-0 z-[90] bg-black/55 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewState.images[previewState.index]?.url}
              alt={`${previewState.projectTitle} ${previewState.index + 1}`}
              className="w-full max-h-[78vh] object-contain"
            />

            <button
              type="button"
              onClick={closePreview}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/55 hover:bg-black/70 text-white text-xl leading-none flex items-center justify-center"
              aria-label="Close preview"
            >
              ×
            </button>

            {previewState.images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => goPreview(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/70 text-white text-2xl leading-none flex items-center justify-center"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => goPreview(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/70 text-white text-2xl leading-none flex items-center justify-center"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {showTeamModal ? (
        <div
          className="fixed inset-0 z-[95] bg-gradient-to-b from-black/55 to-black/45 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setShowTeamModal(false)}
        >
          <div
            className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-[0_20px_70px_rgba(15,23,42,0.35)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Contact
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Talk to Our Team
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 text-xl leading-none flex items-center justify-center"
                aria-label="Close team details"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Reach out to discuss your requirements, timelines, and project specifications.
              </p>

              <div className="grid gap-3">
                <a href="mailto:hello@rspuk.co.uk" className="rounded-xl border border-gray-200 px-4 py-3 bg-white hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                  <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
                    <span>✉</span><span>Email</span>
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">hello@rspuk.co.uk</p>
                </a>

                <a href="tel:+441234567890" className="rounded-xl border border-gray-200 px-4 py-3 bg-white hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                  <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
                    <span>☎</span><span>Phone</span>
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">+44 1234 567 890</p>
                </a>

                <div className="rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/60">
                  <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <span>Address</span>
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">RSPUK, United Kingdom</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GalleryPage;
