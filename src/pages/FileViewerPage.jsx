import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FileDocViewer, isHttpUrl } from '../components/FileDocViewer';

const FileViewerPage = () => {
  const [searchParams] = useSearchParams();
  const fileUrl = String(searchParams.get('url') || '').trim();
  const fileName = String(searchParams.get('name') || '').trim();

  if (!isHttpUrl(fileUrl)) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-100 text-center"
        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
      >
        <h1 className="text-xl font-bold text-gray-900">File not available</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-md">
          The preview link is missing or invalid. Open a file from your order or design details.
        </p>
        <Link to="/" className="mt-6 text-sm font-semibold text-blue-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <FileDocViewer fileUrl={fileUrl} fileName={fileName} />
    </div>
  );
};

export default FileViewerPage;
