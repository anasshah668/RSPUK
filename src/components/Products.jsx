import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const Products = ({ onNavigate }) => {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const { addToCart } = useCart();

  const products = [
    {
      id: 1,
      name: 'Custom Printed Mug',
      category: 'Mug',
      price: 12.99,
      originalPrice: 18.99,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop',
      badge: 'Best Seller',
      rating: 4.8,
      reviews: 124,
    },
    {
      id: 2,
      name: 'Premium Pen Set',
      category: 'Pen',
      price: 24.99,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1583484963886-cce2f44558ac?w=500&h=500&fit=crop',
      badge: 'New',
      rating: 4.9,
      reviews: 89,
    },
    {
      id: 3,
      name: 'Custom T-Shirt',
      category: 'Shirt',
      price: 19.99,
      originalPrice: 29.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      badge: 'Sale',
      rating: 4.7,
      reviews: 256,
    },
    {
      id: 4,
      name: 'Business Flyer',
      category: 'Flyer',
      price: 0.15,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&h=500&fit=crop',
      badge: null,
      rating: 4.6,
      reviews: 45,
      unit: 'per piece',
    },
    {
      id: 5,
      name: 'Vinyl Banner',
      category: 'Banner',
      price: 45.99,
      originalPrice: 59.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
      badge: 'Popular',
      rating: 4.8,
      reviews: 178,
    },
    {
      id: 6,
      name: 'Custom Stickers',
      category: 'Sticker',
      price: 8.99,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
      badge: null,
      rating: 4.9,
      reviews: 312,
      unit: 'per pack',
    },
    {
      id: 7,
      name: 'Business Cards',
      category: 'Business Card',
      price: 14.99,
      originalPrice: 19.99,
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop',
      badge: 'Sale',
      rating: 4.7,
      reviews: 421,
      unit: 'per 100',
    },
    {
      id: 8,
      name: 'Marketing Brochure',
      category: 'Brochure',
      price: 0.25,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&h=500&fit=crop',
      badge: null,
      rating: 4.5,
      reviews: 67,
      unit: 'per piece',
    },
  ];

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    // Show a subtle notification (you could use a toast library here)
    console.log('Added to cart:', product);
  };

  const handleProductClick = (product) => {
    // Navigate to product designer or product page
    if (onNavigate) {
      onNavigate('product-designer');
    }
  };

  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Our Products
          </h2>
          <p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Discover our wide range of custom printing and signage products. Quality materials, professional finish, and competitive prices.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              onClick={() => handleProductClick(product)}
            >
              {/* Product Image Container */}
              <div className="relative h-64 bg-gray-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    hoveredProduct === product.id ? 'scale-110' : 'scale-100'
                  }`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x500?text=' + encodeURIComponent(product.name);
                  }}
                />
                
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      product.badge === 'Sale' ? 'bg-red-500' :
                      product.badge === 'New' ? 'bg-green-500' :
                      product.badge === 'Best Seller' ? 'bg-amber-600' :
                      'bg-blue-500'
                    }`} style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Quick View Overlay */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                  hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-amber-600 hover:text-white transition-colors"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Quick View
                  </button>
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                  <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {product.rating}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="mb-2">
                  <span className="text-xs text-amber-600 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {product.category}
                  </span>
                </div>
                
                <h3 
                  className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  {product.name}
                </h3>

                {/* Reviews */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-amber-500 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span 
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    £{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span 
                      className="text-sm text-gray-400 line-through"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      £{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {product.unit && (
                    <span 
                      className="text-xs text-gray-500"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      {product.unit}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors duration-200 flex items-center justify-center gap-2 group/btn"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate && onNavigate('shop')}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 inline-flex items-center gap-2"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            View All Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Products;
