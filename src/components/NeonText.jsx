import React from 'react';

const NeonText = ({
  text,
  font,
  color,
  size,
  glowIntensity,
  letterSpacing,
  flicker,
  containerClassName = '',
  minHeightClass = 'min-h-[260px] md:min-h-[320px]',
  backgroundColor = 'transparent',
  /** When false, muted “tube off” look — no glow (does not change config elsewhere). */
  tubeLit = true,
  /** Lighter font weight when lit (thinner tube). */
  thinTube = true,
  /** Shrink wrap to text (for small dimension callouts next to the neon). */
  compactForDimensions = false,
}) => {
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const generateNeonGlow = (baseColor, intensity) => {
    const shadows = [];
    const baseSpread = intensity * 0.3;

    shadows.push(`0 0 ${baseSpread * 0.5}px ${baseColor}`);
    shadows.push(`0 0 ${baseSpread}px ${baseColor}`);
    shadows.push(`0 0 ${baseSpread * 1.5}px ${baseColor}`);

    for (let i = 1; i <= 3; i++) {
      const spread = baseSpread * (1 + i * 0.3);
      const opacity = 0.9 - i * 0.15;
      shadows.push(`0 0 ${spread}px ${hexToRgba(baseColor, opacity)}`);
    }

    const middleLayers = Math.max(4, Math.floor(intensity / 8));
    for (let i = 4; i <= middleLayers; i++) {
      const spread = baseSpread * (1 + i * 0.4);
      const opacity = Math.max(0.4, 0.85 - i * 0.12);
      shadows.push(`0 0 ${spread}px ${hexToRgba(baseColor, opacity)}`);
    }

    const outerLayers = Math.max(3, Math.floor(intensity / 12));
    for (let i = middleLayers + 1; i <= middleLayers + outerLayers; i++) {
      const spread = baseSpread * (1 + i * 0.6);
      const opacity = Math.max(0.15, 0.5 - (i - middleLayers) * 0.1);
      shadows.push(`0 0 ${spread}px ${hexToRgba(baseColor, opacity)}`);
    }

    shadows.push(`0 0 ${baseSpread * 0.2}px rgba(255, 255, 255, 0.8)`);

    return shadows.join(', ');
  };

  const fontWeight = thinTube ? 100 : 300;

  let neonStyle;

  const textBoxWidth = compactForDimensions ? 'auto' : '100%';
  const textBoxMaxWidth = compactForDimensions ? 'min(85vw, 26rem)' : '100%';

  if (tubeLit) {
    neonStyle = {
      fontFamily: font,
      fontSize: `${size}px`,
      color: '#ffffff',
      letterSpacing: `${letterSpacing}px`,
      textShadow: generateNeonGlow(color, glowIntensity),
      fontWeight,
      textAlign: 'center',
      animation: flicker ? 'flicker 3s infinite' : 'none',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      width: textBoxWidth,
      maxWidth: textBoxMaxWidth,
      lineHeight: 1.2,
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
      wordBreak: 'break-word',
    };
  } else {
    neonStyle = {
      fontFamily: font,
      fontSize: `${size}px`,
      color: '#94a3b8',
      letterSpacing: `${letterSpacing}px`,
      textShadow: 'none',
      fontWeight,
      textAlign: 'center',
      animation: 'none',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      width: textBoxWidth,
      maxWidth: textBoxMaxWidth,
      lineHeight: 1.2,
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
      wordBreak: 'break-word',
      WebkitTextStroke: '0.4px rgba(255,255,255,0.2)',
      paintOrder: 'stroke fill',
    };
  }

  const outerMinH = compactForDimensions ? 'min-h-0' : minHeightClass;
  const outerPad = compactForDimensions ? 'p-1.5 md:p-2' : 'p-6 md:p-8';
  const outerW = compactForDimensions ? 'w-fit max-w-full' : 'w-full';

  return (
    <div
      id="neon-preview"
      className={`flex items-center justify-center ${outerW} ${outerMinH} ${outerPad} ${containerClassName}`}
      style={{ backgroundColor }}
    >
      <div style={neonStyle} className={`select-none ${compactForDimensions ? 'px-1' : 'px-2 md:px-4'}`}>
        {text || 'NEON TEXT'}
      </div>
    </div>
  );
};

export default NeonText;
