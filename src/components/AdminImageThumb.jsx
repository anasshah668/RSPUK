import React, { useState } from 'react';

const AdminImageThumb = ({ src, alt = '', className = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = String(src || '').trim();

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {!loaded && !failed ? (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100"
          aria-hidden
        />
      ) : null}
      {url && !failed ? (
        <img
          src={url}
          alt={alt}
          className={`relative z-[1] h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-slate-400">
          {failed ? 'Could not load' : 'No image'}
        </div>
      )}
    </div>
  );
};

export default AdminImageThumb;
