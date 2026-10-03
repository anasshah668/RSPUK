import React, { useEffect, useRef, useState } from 'react';

const SHOW_AFTER = 280;
const RING = 2 * Math.PI * 20;

const getScrollTop = () =>
  window.pageYOffset ||
  document.documentElement.scrollTop ||
  document.body.scrollTop ||
  0;

const getScrollLimit = () => {
  const doc = document.documentElement;
  return Math.max(doc.scrollHeight - window.innerHeight, 1);
};

const setScrollTop = (top) => {
  const el = document.scrollingElement || document.documentElement;
  el.scrollTop = top;
  document.body.scrollTop = top;
};

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const frameRef = useRef(0);
  const cancelRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const top = getScrollTop();
      setIsVisible(top > SHOW_AFTER);
      setProgress(Math.min(1, top / getScrollLimit()));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      cancelRef.current?.();
    },
    []
  );

  const scrollToTop = () => {
    const start = getScrollTop();
    if (start <= 0) return;

    cancelRef.current?.();
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);

    const html = document.documentElement;
    const previousBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    const duration = Math.min(920, Math.max(520, start * 0.42));
    const startedAt = performance.now();
    let cancelled = false;

    const stop = () => {
      cancelled = true;
      html.style.scrollBehavior = previousBehavior;
      setIsScrolling(false);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
    };

    cancelRef.current = stop;
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);
    setIsScrolling(true);

    const step = (now) => {
      if (cancelled) return;
      const t = Math.min(1, (now - startedAt) / duration);
      setScrollTop(start * (1 - easeInOutCubic(t)));
      if (t < 1) {
        frameRef.current = window.requestAnimationFrame(step);
        return;
      }
      setScrollTop(0);
      stop();
    };

    frameRef.current = window.requestAnimationFrame(step);
  };

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={scrollToTop}
      className={`fixed bottom-[6.25rem] right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-[#0f172a] text-white shadow-[0_12px_28px_-10px_rgba(15,23,42,0.55)] ring-1 ring-white/10 transition-[opacity,transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_-12px_rgba(37,99,235,0.45)] hover:ring-blue-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 sm:right-6 ${
        isVisible
          ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none translate-y-3 scale-90 opacity-0'
      } ${isScrolling ? 'ring-blue-400/50' : ''}`}
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={RING}
          strokeDashoffset={RING * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>
      <svg className="relative h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
