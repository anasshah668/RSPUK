import React, { useState } from 'react';
import { toast } from 'react-toastify';
import NeonText from '../components/NeonText';
import { toPng } from 'html-to-image';

import { useNavigate } from 'react-router-dom';

const NeonTextBuilder = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('NEON TEXT');
  const [font, setFont] = useState('Pacifico');
  const [color, setColor] = useState('#ff4df0');
  const [size, setSize] = useState(80);
  const [glowIntensity, setGlowIntensity] = useState(15);
  const [letterSpacing, setLetterSpacing] = useState(2);
  const [flicker, setFlicker] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('text');

  const fonts = [
    { name: 'Pacifico', label: 'Pacifico' },
    { name: 'Dancing Script', label: 'Dancing Script' },
    { name: 'Great Vibes', label: 'Great Vibes' },
    { name: 'Kalam', label: 'Kalam' },
  ];

  const handleExport = async () => {
    const element = document.getElementById('neon-preview');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#2f3140',
        pixelRatio: 3,
        quality: 1.0,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      const link = document.createElement('a');
      link.download = `neon-text-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export image. Please try again.');
    }
  };

  // Convert font size to approximate cm
  const sizeInCm = Math.round(size * 0.026 * 10) / 10;
  const sizeInInches = Math.round((sizeInCm / 2.54) * 10) / 10;

  return (
    <div className="flex h-screen bg-gray-100 overflow-x-auto overflow-y-hidden">
      {/* Left Sidebar (Icon Rail + Panel) */}
      <div className="flex h-full">
        {/* Icon Rail */}
        <div className="w-24 bg-white border-r border-gray-200 py-6 flex flex-col items-center gap-6">
          <button
            onClick={() => setSidebarTab('text')}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Text"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sidebarTab === 'text' ? 'bg-blue-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 6v14m8-14v14" />
              </svg>
            </div>
            <span className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Text</span>
          </button>

          <button
            onClick={() => setSidebarTab('color')}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Color"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sidebarTab === 'color' ? 'bg-blue-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <span className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Color</span>
          </button>

          <button
            onClick={() => setSidebarTab('effects')}
            className="w-full flex flex-col items-center gap-2 px-2"
            title="Effects"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sidebarTab === 'effects' ? 'bg-blue-50' : 'bg-gray-50'} border border-gray-200`}>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-xs text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Effects</span>
          </button>
        </div>

        {/* Panel */}
        <div className="w-80 bg-white shadow-lg p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">
              {sidebarTab === 'text' ? 'Text' : sidebarTab === 'color' ? 'Color' : 'Effects'}
            </h3>
            <button
              onClick={() => {
                setText('NEON TEXT');
                setFont('Pacifico');
                setColor('#ff4df0');
                setSize(80);
                setGlowIntensity(15);
                setLetterSpacing(2);
                setFlicker(false);
              }}
              className="text-xs px-2 py-1 rounded hover:bg-gray-100 text-gray-600"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              title="Reset"
            >
              Reset
            </button>
          </div>

          {/* Text Tab */}
          {sidebarTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your text..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Font
                </label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ fontFamily: font }}
                >
                  {fonts.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Size: {size}px ({sizeInCm}cm / {sizeInInches}in)
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>20px</span>
                  <span>200px</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Letter Spacing: {letterSpacing}px
                </label>
                <input
                  type="range"
                  min="-2"
                  max="20"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Tight</span>
                  <span>Wide</span>
                </div>
              </div>
            </div>
          )}

          {/* Color Tab */}
          {sidebarTab === 'color' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Neon Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-12 border border-gray-300 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="#ff4df0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Glow Intensity: {glowIntensity}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Subtle</span>
                  <span>Intense</span>
                </div>
              </div>
            </div>
          )}

          {/* Effects Tab */}
          {sidebarTab === 'effects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Flicker Animation
                </label>
                <button
                  onClick={() => setFlicker(!flicker)}
                  className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                    flicker ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                      flicker ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white shadow-md p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 
              className="text-xl font-bold text-gray-900"
            >
              Neon Text Builder
            </h2>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 overflow-auto bg-gray-200 p-8 flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden" id="neon-preview">
            <NeonText
              text={text}
              font={font}
              color={color}
              size={size}
              glowIntensity={glowIntensity}
              letterSpacing={letterSpacing}
              flicker={flicker}
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="bg-white shadow-md p-4 flex items-center justify-between">
          <div className="text-gray-600 font-medium" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Preview
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={handleExport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save & Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeonTextBuilder;
