import React, { useState, useRef } from 'react';
import NeonText from '../components/NeonText';
import { useCart } from '../context/CartContext';
import { toPng } from 'html-to-image';

const CustomNeonBuilder = ({ onNavigate, onClose }) => {
  const { addToCart } = useCart();
  const previewRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Design, 2: Size, 3: Checkout
  const [neonConfig, setNeonConfig] = useState({
    text: 'NEON TEXT',
    font: 'Pacifico',
    color: '#ff4df0',
    size: 80,
    glowIntensity: 15,
    letterSpacing: 2,
    flicker: false
  });
  const [selectedSize, setSelectedSize] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const neonSizes = [
    { id: 'small', label: 'Small', width: '30cm', height: '20cm', price: 99.99, description: 'Perfect for indoor spaces' },
    { id: 'medium', label: 'Medium', width: '60cm', height: '40cm', price: 199.99, description: 'Ideal for retail stores' },
    { id: 'large', label: 'Large', width: '90cm', height: '60cm', price: 299.99, description: 'Great for large displays' },
    { id: 'xlarge', label: 'Extra Large', width: '120cm', height: '80cm', price: 449.99, description: 'For maximum impact' },
    { id: 'custom', label: 'Custom Size', width: 'Custom', height: 'Custom', price: 0, description: 'Contact us for pricing' }
  ];

  const fonts = [
    { name: 'Pacifico', label: 'Pacifico' },
    { name: 'Dancing Script', label: 'Dancing Script' },
    { name: 'Great Vibes', label: 'Great Vibes' },
    { name: 'Kalam', label: 'Kalam' },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCheckout = () => {
    const order = {
      id: `neon-${Date.now()}`,
      type: 'neon-sign',
      config: neonConfig,
      size: selectedSize,
      price: selectedSize?.price || 0,
      quantity: 1
    };
    addToCart(order, 1);
    alert('Order added to cart!');
    if (onClose) {
      onClose();
    } else if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('neon-preview-export');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#1f2937',
        pixelRatio: 3,
        quality: 1.0,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      const link = document.createElement('a');
      link.download = `neon-sign-${neonConfig.text.replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Design Step
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Customize Your Neon Sign
              </h3>
              
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Preview - Larger and More Prominent */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-900 rounded-xl p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
                    {/* Dark background with subtle pattern */}
                    <div className="absolute inset-0 opacity-10 z-0" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                    <div className="relative z-10 w-full" id="neon-preview-export">
                      <NeonText
                        text={neonConfig.text}
                        font={neonConfig.font}
                        color={neonConfig.color}
                        size={neonConfig.size}
                        glowIntensity={neonConfig.glowIntensity}
                        letterSpacing={neonConfig.letterSpacing}
                        flicker={neonConfig.flicker}
                      />
                    </div>
                    {/* Preview label */}
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded text-xs font-semibold z-20" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Live Preview
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4 lg:col-span-1">
                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Text
                    </label>
                    <input
                      type="text"
                      value={neonConfig.text}
                      onChange={(e) => setNeonConfig({ ...neonConfig, text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    />
                  </div>

                  {/* Font Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Font
                    </label>
                    <select
                      value={neonConfig.font}
                      onChange={(e) => setNeonConfig({ ...neonConfig, font: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      {fonts.map((font) => (
                        <option key={font.name} value={font.name}>{font.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Color
                    </label>
                    <input
                      type="color"
                      value={neonConfig.color}
                      onChange={(e) => setNeonConfig({ ...neonConfig, color: e.target.value })}
                      className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Size Slider */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Text Size: {neonConfig.size}px
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      value={neonConfig.size}
                      onChange={(e) => setNeonConfig({ ...neonConfig, size: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Glow Intensity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Glow Intensity: {neonConfig.glowIntensity}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={neonConfig.glowIntensity}
                      onChange={(e) => setNeonConfig({ ...neonConfig, glowIntensity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Letter Spacing */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Letter Spacing: {neonConfig.letterSpacing}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={neonConfig.letterSpacing}
                      onChange={(e) => setNeonConfig({ ...neonConfig, letterSpacing: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Flicker Toggle */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="flicker"
                      checked={neonConfig.flicker}
                      onChange={(e) => setNeonConfig({ ...neonConfig, flicker: e.target.checked })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="flicker" className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Enable Flicker Effect
                    </label>
                  </div>

                  {/* Quick Info */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      💡 <strong>Tip:</strong> Adjust the glow intensity to make your neon sign more or less bright. Higher values create a stronger glow effect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Size Selection Step
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Select Size
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {neonSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedSize?.id === size.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {size.label}
                    </div>
                    <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {size.width} × {size.height}
                    </div>
                    <div className="text-sm text-gray-500 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {size.description}
                    </div>
                    {size.price > 0 ? (
                      <div className="text-lg font-bold text-blue-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        £{size.price.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Contact for quote
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Checkout Step
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Review & Checkout
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Order Summary
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Text:</span>
                      <span className="font-semibold text-gray-900">{neonConfig.text}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedSize ? `${selectedSize.width} × ${selectedSize.height}` : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Color:</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: neonConfig.color }}
                        ></div>
                        <span className="font-semibold text-gray-900">{neonConfig.color}</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total:</span>
                        <span className="font-bold text-blue-600 text-lg">
                          {selectedSize?.price > 0 ? `£${selectedSize.price.toFixed(2)}` : 'Contact for quote'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    />
                    <textarea
                      placeholder="Delivery Address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => (onClose && onClose()) || (onNavigate && onNavigate('home'))}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors text-sm mb-4"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Custom Neon Sign Builder
          </h1>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Custom Design', icon: '✏️' },
              { step: 2, label: 'Select Size', icon: '📏' },
              { step: 3, label: 'Checkout', icon: '🛒' }
            ].map((item, index) => (
              <React.Fragment key={item.step}>
                <div className="flex items-center">
                  <div className={`flex flex-col items-center ${currentStep >= item.step ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                      currentStep >= item.step
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {currentStep > item.step ? '✓' : item.step}
                    </div>
                    <span className="mt-2 text-sm font-semibold" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {item.label}
                    </span>
                  </div>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > item.step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between items-center gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Back
          </button>
          
          {/* Preview and Download buttons - only show on step 1 */}
          {currentStep === 1 && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          )}
          
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={currentStep === 2 && !selectedSize}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                currentStep === 2 && !selectedSize
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={!customerInfo.name || !customerInfo.email}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                !customerInfo.name || !customerInfo.email
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Complete Order
            </button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Preview Content */}
            <div className="bg-gray-900 rounded-xl p-12 min-h-[500px] flex items-center justify-center relative overflow-hidden">
              {/* Dark background with subtle pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
              <div className="relative z-10 w-full">
                <NeonText
                  text={neonConfig.text}
                  font={neonConfig.font}
                  color={neonConfig.color}
                  size={neonConfig.size * 1.5}
                  glowIntensity={neonConfig.glowIntensity}
                  letterSpacing={neonConfig.letterSpacing}
                  flicker={neonConfig.flicker}
                />
              </div>
            </div>

            {/* Download Button in Modal */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomNeonBuilder;
