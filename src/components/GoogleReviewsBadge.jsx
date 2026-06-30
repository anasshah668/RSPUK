import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const PREVIEW_CHAR_LIMIT = 155;
const FALLBACK_REVIEWS_URL = 'https://share.google/vANleAmxbXBYeeSkp';

const AVATAR_COLORS = ['#89CFF0', '#F08080', '#98D8AA', '#D4A5FF', '#FFB347', '#7EC8E3'];

const avatarColorForName = (name) => {
  let hash = 0;
  const text = String(name || '');
  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const GoogleLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const OrangeStarIcon = () => (
  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const BlackStarIcon = () => (
  <svg className="h-3 w-3 shrink-0 text-gray-900" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const getInitials = (name) =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

const RatingSummary = ({ rating, reviewCount, isLoading }) => (
  <div className="flex flex-col justify-center px-3 py-2">
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-bold leading-none text-[#e7711b]">
        {isLoading ? '…' : rating.toFixed(1)}
      </span>
      <div className="flex items-center text-[#e7711b]">
        {Array.from({ length: 5 }).map((_, index) => (
          <OrangeStarIcon key={`summary-star-${index}`} />
        ))}
      </div>
    </div>
    <span
      className="mt-1 text-[10px] font-bold uppercase tracking-wide text-gray-900 sm:text-[11px]"
      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
    >
      {isLoading ? 'Loading…' : `${reviewCount} Reviews`}
    </span>
  </div>
);

const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const text = review.text || '';
  const isLong = text.length > PREVIEW_CHAR_LIMIT;
  const displayText =
    !isLong || expanded ? text : `${text.slice(0, PREVIEW_CHAR_LIMIT).trim()}...`;

  return (
    <article className="border-b border-gray-200 px-4 py-4 last:border-b-0">
      <div className="flex gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: avatarColorForName(review.name) }}
          aria-hidden="true"
        >
          {getInitials(review.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-snug text-gray-900">{review.name}</h3>
            <GoogleLogo size={16} />
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: review.rating || 5 }).map((_, index) => (
                <BlackStarIcon key={`${review.id}-star-${index}`} />
              ))}
            </div>
            {review.relativeTime ? (
              <span className="text-xs text-gray-500">{review.relativeTime}</span>
            ) : null}
          </div>

          {text ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{displayText}</p>
              {isLong ? (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
};

const GoogleReviewsBadge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState({
    rating: 5,
    reviewCount: 0,
    reviews: [],
    reviewsUrl: FALLBACK_REVIEWS_URL,
  });
  const rootRef = useRef(null);

  const closePanel = useCallback(() => setIsOpen(false), []);
  const togglePanel = useCallback(() => setIsOpen((value) => !value), []);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        const response = await fetch('/google-reviews.json');
        if (!response.ok) throw new Error('Failed to load reviews');
        const data = await response.json();
        if (cancelled) return;

        const reviews = Array.isArray(data.reviews) ? data.reviews : [];
        setReviewsData({
          rating: Number(data.rating) || 5,
          reviewCount: Number(data.reviewCount) || reviews.length,
          reviews,
          reviewsUrl: data.reviewsUrl || FALLBACK_REVIEWS_URL,
        });
      } catch {
        if (!cancelled) {
          setReviewsData((current) => ({
            ...current,
            reviewCount: 0,
            reviews: [],
          }));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        closePanel();
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closePanel();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [closePanel, isOpen]);

  const { rating, reviewCount, reviews, reviewsUrl } = reviewsData;

  return (
    <div ref={rootRef} className="fixed bottom-6 left-4 z-50 sm:left-6">
      {isOpen ? (
        <div
          className="mb-2 w-[min(100vw-2rem,380px)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xl"
          role="dialog"
          aria-label="Google reviews"
        >
          <div className="flex items-stretch border-b border-gray-200">
            <div className="flex items-center border-r border-gray-200 px-3 py-2.5">
              <GoogleLogo />
            </div>

            <div className="flex min-w-0 flex-1 border-r border-gray-200">
              <RatingSummary
                rating={rating}
                reviewCount={reviewCount}
                isLoading={isLoading}
              />
            </div>

            <button
              type="button"
              onClick={closePanel}
              className="flex items-center justify-center px-2.5 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Close reviews"
            >
              <FiChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">Loading reviews…</div>
            ) : reviews.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-600">
                No reviews available.
              </div>
            ) : (
              reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-center">
            <a
              href={reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View all reviews on Google
            </a>
          </div>
        </div>
      ) : null}

      <div className="flex items-stretch overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <a
          href={reviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 items-stretch"
          aria-label={`Google reviews: ${rating.toFixed(1)} out of 5 from ${reviewCount} reviews`}
        >
          <div className="flex items-center border-r border-gray-200 px-3 py-2.5">
            <GoogleLogo />
          </div>
          <div className="border-r border-gray-200">
            <RatingSummary
              rating={rating}
              reviewCount={reviewCount}
              isLoading={isLoading}
            />
          </div>
        </a>

        <button
          type="button"
          onClick={togglePanel}
          disabled={isLoading || reviews.length === 0}
          className="flex items-center justify-center px-2.5 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={isOpen ? 'Close reviews' : 'Show reviews'}
          aria-expanded={isOpen}
        >
          {isOpen ? <FiChevronDown className="h-4 w-4" /> : <FiChevronUp className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default GoogleReviewsBadge;
