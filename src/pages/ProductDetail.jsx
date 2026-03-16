import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';

const ProductDetail = ({ productType, productId, product: productProp, onNavigate, onClose }) => {
  const { addToCart } = useCart();
  const [designOption, setDesignOption] = useState('custom'); // 'custom' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('design');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize with productProp if available, then fetch if productId is provided and we don't have productProp
  useEffect(() => {
    if (productProp) {
      setProduct(productProp);
      setLoading(false); // We already have the product, no need to show loading
    } else if (productId) {
      fetchProduct();
    }
  }, [productId, productProp]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Use centralized service
      const data = await productService.getById(productId);
      // Backend returns product directly, not wrapped
      if (data._id || data.name) {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const productData = {
    mug: {
      name: 'Custom Printed Mug',
      category: 'Mug',
      price: 12.99,
      originalPrice: 18.99,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop',
      description: 'High-quality ceramic mugs perfect for custom printing. Available in various sizes and colors. Perfect for personal use, gifts, or promotional items.',
      features: [
        'Premium ceramic material',
        'Dishwasher and microwave safe',
        'Full-color printing',
        'Multiple size options',
        'Fast turnaround time'
      ],
      specifications: {
        'Material': 'Ceramic',
        'Capacity': '11oz / 15oz / 20oz',
        'Print Area': 'Full wrap or front only',
        'Production Time': '3-5 business days',
        'Minimum Order': '1 piece'
      }
    },
    pen: {
      name: 'Premium Pen Set',
      category: 'Pen',
      price: 24.99,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1583484963886-cce2f44558ac?w=800&h=800&fit=crop',
      description: 'Professional quality pens with custom printing options. Perfect for corporate gifts, events, or personal branding.',
      features: [
        'Premium quality construction',
        'Smooth writing experience',
        'Custom logo printing',
        'Multiple color options',
        'Bulk order discounts'
      ],
      specifications: {
        'Type': 'Ballpoint / Gel',
        'Print Area': 'Barrel printing',
        'Colors Available': 'Black, Blue, Red, Green',
        'Production Time': '5-7 business days',
        'Minimum Order': '50 pieces'
      }
    },
    shirt: {
      name: 'Custom T-Shirt',
      category: 'Shirt',
      price: 19.99,
      originalPrice: 29.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
      description: 'Comfortable, high-quality t-shirts with custom printing. Perfect for events, teams, or personal expression.',
      features: [
        '100% cotton or blend options',
        'Multiple sizes (S-3XL)',
        'Full-color printing',
        'Durable print quality',
        'Washable and long-lasting'
      ],
      specifications: {
        'Material': '100% Cotton / 50/50 Blend',
        'Sizes': 'S, M, L, XL, 2XL, 3XL',
        'Print Area': 'Front, Back, or Both',
        'Production Time': '5-7 business days',
        'Minimum Order': '1 piece'
      }
    },
    flyer: {
      name: 'Business Flyer',
      category: 'Flyer',
      price: 0.15,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&h=800&fit=crop',
      description: 'Professional flyers for marketing and promotional campaigns. High-quality printing with various paper options.',
      features: [
        'Multiple paper weights',
        'Full-color printing',
        'Glossy or matte finish',
        'Various sizes available',
        'Bulk pricing available'
      ],
      specifications: {
        'Paper Weight': '130gsm / 170gsm / 300gsm',
        'Finish': 'Glossy / Matte',
        'Sizes': 'A4, A5, DL, Custom',
        'Production Time': '2-3 business days',
        'Minimum Order': '100 pieces'
      }
    },
    banner: {
      name: 'Vinyl Banner',
      category: 'Banner',
      price: 45.99,
      originalPrice: 59.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
      description: 'Durable vinyl banners perfect for outdoor advertising, events, and promotions. Weather-resistant and long-lasting.',
      features: [
        'Weather-resistant material',
        'UV protected printing',
        'Multiple size options',
        'Eyelet holes included',
        'Suitable for indoor/outdoor use'
      ],
      specifications: {
        'Material': 'Heavy-duty Vinyl',
        'Thickness': '510gsm',
        'Finish': 'Matte / Glossy',
        'Production Time': '3-5 business days',
        'Minimum Order': '1 piece'
      }
    },
    sticker: {
      name: 'Custom Stickers',
      category: 'Sticker',
      price: 8.99,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=800&fit=crop',
      description: 'High-quality custom stickers in various shapes and finishes. Perfect for branding, packaging, or personal use.',
      features: [
        'Multiple shapes available',
        'Waterproof and weatherproof',
        'Various finishes (glossy, matte, clear)',
        'Die-cut or kiss-cut options',
        'Bulk order discounts'
      ],
      specifications: {
        'Material': 'Vinyl / Paper',
        'Finish': 'Glossy / Matte / Clear',
        'Cut Type': 'Die-cut / Kiss-cut',
        'Production Time': '3-5 business days',
        'Minimum Order': '50 pieces'
      }
    },
    'business-card': {
      name: 'Business Cards',
      category: 'Business Card',
      price: 14.99,
      originalPrice: 19.99,
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=800&fit=crop',
      description: 'Professional business cards with premium finishes. Make a lasting impression with high-quality printing and finishes.',
      features: [
        'Premium cardstock',
        'Multiple finish options',
        'Full-color printing',
        'Standard or custom sizes',
        'Fast turnaround'
      ],
      specifications: {
        'Cardstock': '300gsm / 350gsm',
        'Finish': 'Matte / Glossy / Silk',
        'Size': 'Standard (85x55mm) / Custom',
        'Production Time': '2-3 business days',
        'Minimum Order': '100 pieces'
      }
    },
    brochure: {
      name: 'Marketing Brochure',
      category: 'Brochure',
      price: 0.25,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=800&fit=crop',
      description: 'Professional brochures for marketing campaigns. High-quality printing with various folding options.',
      features: [
        'Multiple fold options',
        'Premium paper quality',
        'Full-color printing',
        'Glossy or matte finish',
        'Bulk pricing available'
      ],
      specifications: {
        'Paper Weight': '170gsm / 300gsm',
        'Finish': 'Glossy / Matte',
        'Folds': 'Bi-fold / Tri-fold / Z-fold',
        'Production Time': '3-5 business days',
        'Minimum Order': '100 pieces'
      }
    }
  };

  // Determine which product to use
  const getProduct = () => {
    // If we have product from backend, use it
    if (product) {
      return {
        name: product.name,
        category: product.category?.charAt(0).toUpperCase() + product.category?.slice(1).replace('-', ' ') || 'Product',
        price: product.basePrice || product.variants?.[0]?.price || 0,
        originalPrice: null,
        image: product.images?.[0]?.url || '',
        description: product.description || '',
        features: product.features || [],
        specifications: product.specifications || {},
      };
    }
    // If we have productProp passed from parent, use it (this prevents image flash)
    if (productProp) {
      return {
        name: productProp.name,
        category: productProp.category?.charAt(0).toUpperCase() + productProp.category?.slice(1).replace('-', ' ') || 'Product',
        price: productProp.basePrice || productProp.variants?.[0]?.price || 0,
        originalPrice: null,
        image: productProp.images?.[0]?.url || '',
        description: productProp.description || '',
        features: productProp.features || [],
        specifications: productProp.specifications || {},
      };
    }
    // Otherwise use hardcoded data based on productType (only if not loading from backend)
    if (!productId && !loading) {
      return productData[productType] || productData.mug;
    }
    // Return null during loading to prevent showing placeholder
    return null;
  };

  const displayProduct = getProduct();

  // Don't render if we don't have product data yet (prevents showing placeholder image)
  if (!displayProduct && (loading || productId)) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDesignProduct = () => {
    if (onNavigate) {
      // Navigate to product designer with the product type and image
      const type = product?.category || productType || 'pen';
      const category = product?.category || null;
      // Use uploaded image if user uploaded one, otherwise use the product image
      const imageToUse = designOption === 'upload' && uploadedImage 
        ? uploadedImage 
        : (displayProduct?.image || null);
      
      onNavigate('product-designer', { 
        productType: type === 'business-card' ? 'business-card' : type,
        productCategory: category,
        uploadedImage: imageToUse 
      });
    }
  };

  const handleAddToCart = () => {
    const cartProduct = {
      id: product?._id || `${productType}-${Date.now()}`,
      name: displayProduct.name,
      category: displayProduct.category,
      price: displayProduct.price,
      image: displayProduct.image,
      quantity: quantity,
      designOption: designOption,
      uploadedImage: uploadedImage
    };
    addToCart(cartProduct, quantity);
    // Show success message (you could use a toast library here)
    alert(`${displayProduct.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => (onClose && onClose()) || (onNavigate && onNavigate('home'))}
          className="mb-4 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors text-sm"
          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6 self-start">
            <div className="aspect-square w-full relative p-4 bg-gray-100">
              {displayProduct.image ? (
                <img
                  key={`${product?._id || productProp?._id || 'product'}-${displayProduct.image}`}
                  src={displayProduct.image}
                  alt={displayProduct.name}
                  className="w-full h-full object-contain"
                  loading="eager"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x800?text=' + encodeURIComponent(displayProduct.name);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span>No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Category & Name */}
            <div>
              <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {displayProduct.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {displayProduct.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                £{displayProduct.price.toFixed(2)}
              </span>
              {displayProduct.originalPrice && (
                <span className="text-lg text-gray-400 line-through" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  £{displayProduct.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description - Compact */}
            <div>
              <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {displayProduct.description}
              </p>
            </div>

            {/* Tabs for Features/Specs */}
            <div className="border-b border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('design')}
                  className={`pb-2 px-1 text-sm font-semibold transition-colors ${
                    activeTab === 'design' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                  }`}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Design Options
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`pb-2 px-1 text-sm font-semibold transition-colors ${
                    activeTab === 'features' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                  }`}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Features & Specs
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'design' && (
              <div className="space-y-4">
                {/* Design Options */}
                <div className="space-y-3">
                  {/* Custom Design Option */}
                  <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-500"
                    style={{ borderColor: designOption === 'custom' ? '#3b82f6' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="designOption"
                      value="custom"
                      checked={designOption === 'custom'}
                      onChange={(e) => setDesignOption(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm mb-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Custom Design
                      </div>
                      <div className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Create your design using our design tool
                      </div>
                    </div>
                  </label>

                  {/* Upload Design Option */}
                  <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-500"
                    style={{ borderColor: designOption === 'upload' ? '#3b82f6' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="designOption"
                      value="upload"
                      checked={designOption === 'upload'}
                      onChange={(e) => setDesignOption(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Upload Your Design
                      </div>
                      {designOption === 'upload' && (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleImageUpload}
                            className="text-xs text-gray-600 w-full"
                          />
                          {uploadedImage && (
                            <img src={uploadedImage} alt="Uploaded design" className="w-24 h-24 object-cover rounded border" />
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Quantity & Actions */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded text-center font-semibold text-sm"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleDesignProduct}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Design Your Product
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-4">
                {/* Features */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Features
                  </h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {displayProduct.features && displayProduct.features.length > 0 ? (
                      displayProduct.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="col-span-2 text-xs text-gray-500">No features listed</li>
                    )}
                  </ul>
                </div>

                {/* Specifications */}
                <div className="pt-3 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Specifications
                  </h3>
                  <dl className="grid grid-cols-2 gap-3">
                    {displayProduct.specifications && Object.keys(displayProduct.specifications).length > 0 ? (
                      Object.entries(displayProduct.specifications).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-xs font-medium text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>{key}</dt>
                          <dd className="text-xs font-semibold text-gray-900 mt-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>{value}</dd>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 col-span-2">No specifications listed</p>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
