import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { thirdPartyService } from '../services/thirdPartyService';
import { categoryService } from '../services/categoryService';
import { encryptId, createSlug } from '../utils/encryption';
import { getRoutePath } from '../config/routes.config';
import WavyUnderline from './WavyUnderline';

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedThirdPartyProduct, setSelectedThirdPartyProduct] = useState(null);
  const [thirdPartyAttributes, setThirdPartyAttributes] = useState(null);
  const [thirdPartyLoading, setThirdPartyLoading] = useState(false);
  const { addToCart } = useCart();

  // Static categories that should always appear
  const staticCategories = [
    { name: 'printed-board', displayName: 'Printed Board' },
    { name: '2d-box-signage', displayName: '2D Box Signage' },
    { name: '3d-built-up-letters', displayName: '3D Built Up Letters' },
    { name: 'flex-face', displayName: 'Flex Face' },
    { name: 'lightbox', displayName: 'Lightbox' },
  ];

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
    };
    loadData();
  }, []);

  // Allow deep-linking to a pre-selected category via `/?category=<slug>`
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    // If param is removed, fall back to All
    if (!categoryParam && selectedCategory !== 'All') {
      setSelectedCategory('All');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    // Fetch products after categories are loaded (only once)
    if (categories.length > 0 && allProducts.length === 0) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    // Filter products based on selected category
    setVisibleCount(10);
    if (selectedCategory === 'All') {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product => {
        // Match by category slug (name from backend)
        return product.categorySlug === selectedCategory;
      });
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, allProducts]);

  const fetchCategories = async () => {
    try {
      // Use centralized service
      const data = await categoryService.list();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Load local products and third-party products in parallel.
      const [localResult, thirdPartyResult] = await Promise.allSettled([
        productService.list({ page: 1, limit: 100 }),
        thirdPartyService.getProductAttributes(),
      ]);

      const data = localResult.status === 'fulfilled' ? localResult.value : { products: [] };
      const thirdPartyData = thirdPartyResult.status === 'fulfilled' ? thirdPartyResult.value : { products: [] };

      if (localResult.status === 'rejected') {
        console.error('Error fetching local products:', localResult.reason);
      }
      if (thirdPartyResult.status === 'rejected') {
        console.error('Error fetching third-party products:', thirdPartyResult.reason);
      }

      const localProducts = Array.isArray(data.products) ? data.products : [];
      const partnerProducts = Array.isArray(thirdPartyData.products) ? thirdPartyData.products : [];

      if (localProducts.length > 0 || partnerProducts.length > 0) {
        // Get category mapping from current categories state
        const categoryMap = {};
        if (categories.length > 0) {
          categories.forEach(cat => {
            categoryMap[cat.name] = cat.displayName;
          });
        }

        // Transform backend products to match frontend format
        const transformedLocalProducts = localProducts.map(product => {
          const categorySlug = product.category;
          const categoryDisplayName = categoryMap[categorySlug] || 
            categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace('-', ' ');
          
          return {
            id: product._id,
            name: product.name,
            category: categoryDisplayName,
            categorySlug: categorySlug,
            categoryDisplayName: categoryDisplayName,
            price: product.basePrice || product.variants?.[0]?.price || 0,
            originalPrice: null,
            image: product.images?.[0]?.url || '',
            badge: null,
            rating: 4.5,
            reviews: 0,
            _id: product._id,
            productData: product, // Store full product data for navigation
          };
        });

        const transformedThirdPartyProducts = partnerProducts.map((product, index) => ({
          id: `tp-${product.productKey || index}`,
          name: product.name || 'Third-party Product',
          category: 'Partner Products',
          categorySlug: 'partner-products',
          categoryDisplayName: 'Partner Products',
          price: 0,
          originalPrice: null,
          image: '',
          badge: 'Partner',
          rating: 4.5,
          reviews: 0,
          _id: `thirdparty:${product.productKey || index}`,
          productData: product,
          source: 'third-party',
        }));

        const transformedProducts = [...transformedLocalProducts, ...transformedThirdPartyProducts];

        setAllProducts(transformedProducts);
        // Apply current filter
        if (selectedCategory === 'All') {
          setFilteredProducts(transformedProducts);
        } else {
          const filtered = transformedProducts.filter(product => 
            product.categorySlug === selectedCategory
          );
          setFilteredProducts(filtered);
        }
      } else {
        // No products found, show empty state
        setAllProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryValue) => {
    setSelectedCategory(categoryValue);
  };

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = filteredProducts.length > visibleCount;

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    // Show a subtle notification (you could use a toast library here)
    console.log('Added to cart:', product);
  };

  const handleProductClick = (product) => {
    if (product?.source === 'third-party') {
      setSelectedThirdPartyProduct(product);
      setThirdPartyAttributes(null);
      setThirdPartyLoading(true);
      thirdPartyService
        .getProductAttributesByName(product.name)
        .then((data) => {
          setThirdPartyAttributes(data?.product || null);
        })
        .catch((error) => {
          console.error('Error loading third-party product attributes:', error);
          setThirdPartyAttributes(null);
        })
        .finally(() => {
          setThirdPartyLoading(false);
        });
      return;
    }

    // Navigate to product detail page with encrypted ID
    const productId = product._id || product.id;
    const encryptedId = encryptId(productId);
    const slug = createSlug(product.name);
    const category = product.categorySlug || product.category?.toLowerCase() || 'product';
    
    navigate(getRoutePath('productDetail', { category, productName: slug, encryptedId }));
  };

  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Our <WavyUnderline>Products</WavyUnderline>
          </h2>
          <p 
            className="text-lg text-gray-600 max-w-2xl mx-auto mb-8"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Discover our wide range of custom printing and signage products. Quality materials, professional finish, and competitive prices.
          </p>

          {/* Categories Filter - Right after the description */}
          {(categories.length > 0 || staticCategories.length > 0) && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button
                onClick={() => handleCategoryClick('All')}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                  selectedCategory === 'All'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
                }`}
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                All Products
              </button>
              {/* Static categories */}
              {staticCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    // Navigate to category page instead of filtering
                    navigate(`/category/${cat.name}`);
                  }}
                  className="px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  {cat.displayName}
                </button>
              ))}
              {/* Backend categories */}
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                    selectedCategory === category.name
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
                  }`}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  {category.displayName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Loading products...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No products available
            </h3>
            <p className="mt-1 text-sm text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Products will appear here once they are added by the admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {visibleProducts.map((product) => (
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
                  src={imageErrors[product.id] ? `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect fill='%23e5e7eb' width='500' height='500'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='%239ca3af'%3E${encodeURIComponent(product.name)}%3C/text%3E%3C/svg%3E` : product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    hoveredProduct === product.id ? 'scale-110' : 'scale-100'
                  }`}
                  onError={(e) => {
                    if (!imageErrors[product.id]) {
                      setImageErrors(prev => ({ ...prev, [product.id]: true }));
                      // Use a data URI as fallback instead of external URL
                      e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect fill='%23e5e7eb' width='500' height='500'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='%239ca3af'%3E${encodeURIComponent(product.name)}%3C/text%3E%3C/svg%3E`;
                    }
                  }}
                />
                
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      product.badge === 'Sale' ? 'bg-red-500' :
                      product.badge === 'New' ? 'bg-green-500' :
                      product.badge === 'Best Seller' ? 'bg-blue-600' :
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
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Quick View
                  </button>
                </div>

              </div>

              {/* Product Info */}
              <div className="p-5">
                <h3 
                  className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors"
                >
                  {product.name}
                </h3>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Show More Button */}
        {hasMoreProducts && (
          <div className="text-center mt-12">
            <button
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 inline-flex items-center gap-2"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Show More
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {selectedThirdPartyProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedThirdPartyProduct.name}</h3>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Third-party product attributes
                </p>
              </div>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSelectedThirdPartyProduct(null);
                  setThirdPartyAttributes(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {thirdPartyLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-3 text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Loading attributes...
                  </p>
                </div>
              ) : !thirdPartyAttributes?.attributes ? (
                <div className="text-center py-10 text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Attributes not found for this product.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">Product Key</p>
                    <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      {thirdPartyAttributes.productKey || 'N/A'}
                    </p>
                  </div>

                  {Object.entries(thirdPartyAttributes.attributes).map(([label, values]) => (
                    <div key={label} className="rounded-xl border border-gray-200 p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        {label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(values) ? values : []).map((value) => (
                          <span
                            key={`${label}-${value}`}
                            className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Products;
