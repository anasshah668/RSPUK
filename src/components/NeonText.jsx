import React from 'react';

const NeonText = ({ 
  text, 
  font, 
  color, 
  size, 
  glowIntensity, 
  letterSpacing, 
  flicker 
}) => {
  // Generate layered text-shadow for realistic neon glow
  // No blur filters - only sharp shadows that simulate neon tube lighting
  const generateNeonGlow = (baseColor, intensity) => {
    const shadows = [];
    const baseSpread = intensity * 0.3;
    
    // Core tube - brightest inner glow (like the actual neon tube)
    shadows.push(`0 0 ${baseSpread * 0.5}px ${baseColor}`);
    shadows.push(`0 0 ${baseSpread}px ${baseColor}`);
    shadows.push(`0 0 ${baseSpread * 1.5}px ${baseColor}`);
    
    // Immediate glow around tube - very bright
    for (let i = 1; i <= 3; i++) {
      const spread = baseSpread * (1 + i * 0.3);
      const opacity = 0.9 - (i * 0.15);
      const colorWithOpacity = hexToRgba(baseColor, opacity);
      shadows.push(`0 0 ${spread}px ${colorWithOpacity}`);
    }
    
    // Middle glow layers - gradually fading
    const middleLayers = Math.max(4, Math.floor(intensity / 8));
    for (let i = 4; i <= middleLayers; i++) {
      const spread = baseSpread * (1 + i * 0.4);
      const opacity = Math.max(0.4, 0.85 - (i * 0.12));
      const colorWithOpacity = hexToRgba(baseColor, opacity);
      shadows.push(`0 0 ${spread}px ${colorWithOpacity}`);
    }
    
    // Outer glow - wider, softer fade
    const outerLayers = Math.max(3, Math.floor(intensity / 12));
    for (let i = middleLayers + 1; i <= middleLayers + outerLayers; i++) {
      const spread = baseSpread * (1 + i * 0.6);
      const opacity = Math.max(0.15, 0.5 - ((i - middleLayers) * 0.1));
      const colorWithOpacity = hexToRgba(baseColor, opacity);
      shadows.push(`0 0 ${spread}px ${colorWithOpacity}`);
    }
    
    // Additional sharp inner highlight for tube realism
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    const whiteHighlight = `rgba(255, 255, 255, 0.8)`;
    shadows.push(`0 0 ${baseSpread * 0.2}px ${whiteHighlight}`);
    
    return shadows.join(', ');
  };

  // Convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const neonStyle = {
    fontFamily: font,
    fontSize: `${size}px`,
    color: '#ffffff', // White core for realistic neon tube
    letterSpacing: `${letterSpacing}px`,
    textShadow: generateNeonGlow(color, glowIntensity),
    fontWeight: 300,
    textAlign: 'center',
    animation: flicker ? 'flicker 3s infinite' : 'none',
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  };

  return (
    <div 
      id="neon-preview"
      className="flex items-center justify-center min-h-[400px] md:min-h-[500px] p-8"
      style={{ backgroundColor: '#2f3140' }}
    >
      <div 
        style={neonStyle}
        className="select-none"
      >
        {text || 'NEON TEXT'}
      </div>
    </div>
  );
};

export default NeonText;
