import React, { useLayoutEffect, useRef, useState } from 'react';

export const ImageHolderSkeleton = ({ className = 'aspect-[4/3] w-full', rounded = true }) => (
  <div
    className={`relative overflow-hidden bg-slate-100 ${rounded ? 'rounded-xl' : ''} ${className}`}
    aria-hidden
  >
    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
);

export const ProductCardSkeleton = ({ imageClassName = 'h-56 w-full' }) => (
  <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
    <ImageHolderSkeleton className={imageClassName} rounded={false} />
    <div className="space-y-2 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
    </div>
  </div>
);

const SmartImage = ({
  src,
  alt = '',
  className = '',
  imgClassName = 'h-full w-full object-cover',
  loading = 'eager',
  draggable = false,
  onClick,
  onError,
  fallbackLabel = 'No image',
  imgStyle,
  eager = false,
}) => {
  const url = String(src || '').trim();
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    setFailed(false);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [url]);

  const wrapperClass = [
    'relative overflow-hidden',
    /\bbg-/.test(className) ? '' : 'bg-slate-100',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass} onClick={onClick}>
      {url && !failed ? (
        <img
          src={url}
          alt={alt}
          loading={eager ? 'eager' : loading}
          draggable={draggable}
          style={imgStyle}
          className={`relative z-[1] ${imgClassName}`}
          ref={imgRef}
          onLoad={() => setLoaded(true)}
          onError={(event) => {
            setFailed(true);
            onError?.(event);
          }}
        />
      ) : fallbackLabel || failed ? (
        <div className="absolute inset-0 z-[1] flex items-center justify-center px-2 text-center text-[11px] font-medium text-slate-400">
          {failed ? 'Could not load' : fallbackLabel}
        </div>
      ) : null}
      {url && !loaded && !failed ? (
        <div className="absolute inset-0 z-[2] overflow-hidden" aria-hidden>
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
      ) : null}
    </div>
  );
};

export default SmartImage;
