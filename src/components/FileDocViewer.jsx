import React, { useMemo, useState } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { FiDownload, FiZoomIn, FiZoomOut, FiRotateCcw } from 'react-icons/fi';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

export const isHttpUrl = (value) => /^https?:\/\//i.test(String(value || '').trim());

export const linkLabelForUrl = (url) => {
  try {
    const name = new URL(url).pathname.split('/').filter(Boolean).pop();
    if (name) return decodeURIComponent(name);
  } catch {
    /* ignore */
  }
  return 'Open file';
};

export const getFileViewerPath = (fileUrl, fileName = '') => {
  const params = new URLSearchParams({ url: String(fileUrl || '').trim() });
  const name = String(fileName || '').trim();
  if (name) params.set('name', name);
  return `/view-file?${params.toString()}`;
};

export const openFileViewer = (fileUrl, fileName = '', options = {}) => {
  const { newTab = true } = options;
  const path = getFileViewerPath(fileUrl, fileName);
  if (newTab) {
    window.open(path, '_blank', 'noopener,noreferrer');
    return;
  }
  window.location.assign(path);
};

export const FileViewerLink = ({
  url,
  label,
  className = '',
  newTab = true,
  ...props
}) => {
  const text = label || linkLabelForUrl(url);
  return (
    <button
      type="button"
      onClick={() => openFileViewer(url, text, { newTab })}
      className={`text-blue-600 hover:underline break-all text-left font-medium ${className}`}
      title={url}
      {...props}
    >
      {text}
    </button>
  );
};

const toolbarBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:pointer-events-none';

const toCloudinaryAttachmentUrl = (url, filename) => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('cloudinary.com')) return url;

    const parts = parsed.pathname.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return url;

    const next = parts[uploadIdx + 1] || '';
    if (!next.startsWith('fl_attachment')) {
      const flag = filename ? `fl_attachment:${filename}` : 'fl_attachment';
      parts.splice(uploadIdx + 1, 0, flag);
      parsed.pathname = parts.join('/');
    }
    return parsed.toString();
  } catch {
    return url;
  }
};

export const downloadFileToDevice = async (fileUrl, fileName = 'download') => {
  const safeName = fileName || linkLabelForUrl(fileUrl) || 'download';

  try {
    const response = await fetch(fileUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = safeName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);
    return;
  } catch {
    /* fall through to attachment URL */
  }

  const anchor = document.createElement('a');
  anchor.href = toCloudinaryAttachmentUrl(fileUrl, safeName);
  anchor.download = safeName;
  anchor.rel = 'noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

export const FileDocViewer = ({ fileUrl, fileName = '' }) => {
  const [zoom, setZoom] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const displayName = fileName || linkLabelForUrl(fileUrl);

  const documents = useMemo(
    () => [
      {
        uri: fileUrl,
        fileName: displayName,
      },
    ],
    [fileUrl, displayName],
  );

  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, Number((z - ZOOM_STEP).toFixed(2))));
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, Number((z + ZOOM_STEP).toFixed(2))));
  const resetZoom = () => setZoom(1);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadFileToDevice(fileUrl, displayName);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-100" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">In-app file preview</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button type="button" onClick={zoomOut} disabled={zoom <= MIN_ZOOM} className={toolbarBtn} aria-label="Zoom out">
            <FiZoomOut className="w-4 h-4" />
            <span className="hidden sm:inline">Zoom out</span>
          </button>
          <span className="text-xs font-semibold text-gray-600 tabular-nums min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" onClick={zoomIn} disabled={zoom >= MAX_ZOOM} className={toolbarBtn} aria-label="Zoom in">
            <FiZoomIn className="w-4 h-4" />
            <span className="hidden sm:inline">Zoom in</span>
          </button>
          <button type="button" onClick={resetZoom} className={toolbarBtn} aria-label="Reset zoom">
            <FiRotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <FiDownload className="w-4 h-4" />
            {downloading ? 'Downloading…' : 'Download'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 min-h-0">
        <div
          className="mx-auto origin-top"
          style={{
            transform: `scale(${zoom})`,
            width: zoom !== 1 ? `${100 / zoom}%` : '100%',
          }}
        >
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden min-h-[70vh]">
            <DocViewer
              documents={documents}
              pluginRenderers={DocViewerRenderers}
              config={{
                header: { disableHeader: true },
                pdfZoom: { defaultZoom: 1, zoomJump: ZOOM_STEP },
                pdfVerticalScrollByDefault: true,
              }}
              style={{ minHeight: '70vh' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDocViewer;
