import React from 'react';

const ControlsPanel = ({
  text,
  setText,
  font,
  setFont,
  color,
  setColor,
  size,
  setSize,
  glowIntensity,
  setGlowIntensity,
  letterSpacing,
  setLetterSpacing,
  flicker,
  setFlicker,
  onExport,
}) => {
  const fonts = [
    { name: 'Pacifico', label: 'Pacifico' },
    { name: 'Dancing Script', label: 'Dancing Script' },
    { name: 'Great Vibes', label: 'Great Vibes' },
    { name: 'Kalam', label: 'Kalam' },
  ];

  // Convert font size to approximate cm (rough conversion: 1px ≈ 0.026cm)
  const sizeInCm = Math.round(size * 0.026 * 10) / 10;
  const sizeInInches = Math.round((sizeInCm / 2.54) * 10) / 10;

  return (
    <div className="bg-white text-gray-900 p-6 md:p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Controls</h2>
      
      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Text
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text..."
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
        />
      </div>

      {/* Font Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Font
        </label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
          style={{ fontFamily: font }}
        >
          {fonts.map((f) => (
            <option key={f.name} value={f.name}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Neon Color
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-12 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 font-mono"
            placeholder="#ff4df0"
          />
        </div>
      </div>

      {/* Size Slider */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Size: {size}px ({sizeInCm}cm / {sizeInInches}in)
        </label>
        <input
          type="range"
          min="20"
          max="200"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>20px</span>
          <span>200px</span>
        </div>
      </div>

      {/* Glow Intensity Slider */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Glow Intensity: {glowIntensity}
        </label>
        <input
          type="range"
          min="5"
          max="50"
          value={glowIntensity}
          onChange={(e) => setGlowIntensity(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Subtle</span>
          <span>Intense</span>
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Letter Spacing: {letterSpacing}px
        </label>
        <input
          type="range"
          min="-2"
          max="20"
          value={letterSpacing}
          onChange={(e) => setLetterSpacing(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Tight</span>
          <span>Wide</span>
        </div>
      </div>

      {/* Flicker Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="text-sm font-medium">
          Flicker Animation
        </label>
        <button
          onClick={() => setFlicker(!flicker)}
          className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
            flicker ? 'bg-pink-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
              flicker ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        Export as PNG
      </button>
    </div>
  );
};

export default ControlsPanel;
