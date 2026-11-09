import React from 'react';
import SmartImage from './SmartImage';

const AdminImageThumb = ({ src, alt = '', className = '' }) => (
  <SmartImage src={src} alt={alt} className={`h-full w-full ${className}`.trim()} />
);

export default AdminImageThumb;
