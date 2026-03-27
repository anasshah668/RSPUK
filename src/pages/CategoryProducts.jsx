import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { encryptId, createSlug } from '../utils/encryption';
import { getRoutePath } from '../config/routes.config';
import WavyUnderline from '../components/WavyUnderline';
import { getFeaturedSignageBySlug } from '../data/featuredSignageData';

const CategoryProducts = ({ categorySlugOverride } = {}) => {
  const params = useParams();
  const categorySlug = categorySlugOverride ?? params.categorySlug;
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [isNeon, setIsNeon] = useState(false);

  // Static category data with descriptions and features
  const categoryData = {
    'printed-board': {
      label: 'Printed Board',
      heroTitle: 'Printed Board.',
      description: 'High-quality printed board signage solutions for businesses of all sizes. Durable, weather-resistant, and professionally finished to make your brand stand out.',
      discoverTitle: 'Discover printed board signage.',
      discoverText: 'Our printed board signage offers exceptional durability and visual impact. Available in various materials including ACM (Aluminium Composite Material), Dibond, and Foamex, each option provides different benefits for indoor and outdoor applications. Choose from flush mounting, raised installation, or custom shapes to perfectly match your brand identity.',
      features: [
        {
          icon: '📐',
          title: 'Precision-engineered',
          description: 'Meticulously crafted for standout quality and professional finish.'
        },
        {
          icon: '🛠️',
          title: 'Weather-resistant',
          description: 'Built to withstand harsh outdoor conditions with lasting durability.'
        },
        {
          icon: '🎨',
          title: 'Custom finishes',
          description: 'Available in a huge range of styles and colour finishes.'
        }
      ],
      hasLightToggle: false
    },
    '2d-box-signage': {
      label: '2D Box Signage',
      heroTitle: '2D Box Signage.',
      description: 'Professional 2D box signage that combines sleek design with exceptional visibility. Perfect for retail stores, offices, and commercial spaces.',
      discoverTitle: 'Discover 2D box signage.',
      discoverText: 'Our 2D box signage solutions provide a modern, clean aesthetic while maximizing brand visibility. Available in various depths and materials, including aluminium, stainless steel, and acrylic. Choose from face-lit, backlit, or non-illuminated options to create the perfect look for your business.',
      features: [
        {
          icon: '📐',
          title: 'Sleek design',
          description: 'Modern aesthetics with clean lines and professional appearance.'
        },
        {
          icon: '🛠️',
          title: 'Durable construction',
          description: 'Hand-fabricated from premium materials ensuring lasting quality.'
        },
        {
          icon: '🎨',
          title: 'Versatile options',
          description: 'Available in multiple depths, materials, and illumination styles.'
        }
      ],
      hasLightToggle: true
    },
    '3d-built-up-letters': {
      label: '3D Built Up Letters',
      heroTitle: 'Built-up lettering.',
      description: 'Premium 3D built-up letters that create stunning visual impact. Precision-engineered and hand-fabricated for exceptional quality and durability.',
      discoverTitle: 'Discover built-up lettering.',
      discoverText: 'Our built-up lettering is crafted from premium materials including acrylics and metals, available in rimless, solid face, and rim & return styles. Installation options include flush mounting, raised installation, shadow effects, and full illumination. Each letter is precision-engineered for meticulous detail and standout quality.',
      features: [
        {
          icon: '📐',
          title: 'Precision-engineered',
          description: 'Meticulously crafted for meticulous detail and standout quality.'
        },
        {
          icon: '🛠️',
          title: 'Hand-fabricated',
          description: 'Built from aluminium and stainless steel, ensuring lasting durability.'
        },
        {
          icon: '🎨',
          title: 'Huge range',
          description: 'Available in a huge range of style and colour finishes.'
        }
      ],
      hasLightToggle: true
    },
    'flex-face': {
      label: 'Flex Face',
      heroTitle: 'Flex Face Signage.',
      description: 'Versatile flex face signage solutions offering excellent value and durability. Perfect for large format displays and illuminated signage systems.',
      discoverTitle: 'Discover flex face signage.',
      discoverText: 'Flex face signage provides a cost-effective solution for large-scale illuminated signs. Made from durable PVC material, it offers excellent print quality and weather resistance. Available in various thicknesses and finishes, flex face is perfect for retail fascias, billboards, and large format displays.',
      features: [
        {
          icon: '📐',
          title: 'Large format',
          description: 'Perfect for expansive signage with seamless printing capabilities.'
        },
        {
          icon: '🛠️',
          title: 'Weather-resistant',
          description: 'Durable PVC material built to withstand outdoor conditions.'
        },
        {
          icon: '🎨',
          title: 'Cost-effective',
          description: 'Excellent value with high-quality print finishes and longevity.'
        }
      ],
      hasLightToggle: true
    },
    'lightbox': {
      label: 'Lightbox',
      heroTitle: 'Lightbox Signage.',
      description: 'Illuminated lightbox signage that ensures your message is seen day and night. Professional, energy-efficient, and highly visible.',
      discoverTitle: 'Discover lightbox signage.',
      discoverText: 'Our lightbox signage solutions combine premium illumination with professional design. Available in single-sided and double-sided configurations, with LED lighting for energy efficiency and long-lasting performance. Perfect for retail displays, directional signage, and promotional displays.',
      features: [
        {
          icon: '📐',
          title: 'LED illuminated',
          description: 'Energy-efficient LED lighting for maximum visibility and longevity.'
        },
        {
          icon: '🛠️',
          title: 'Professional finish',
          description: 'Premium construction with seamless edges and durable materials.'
        },
        {
          icon: '🎨',
          title: 'Versatile designs',
          description: 'Available in various sizes, shapes, and mounting options.'
        }
      ],
      hasLightToggle: true
    }
  };

  const categoryInfo = categoryData[categorySlug] || {
    label: categorySlug?.charAt(0).toUpperCase() + categorySlug?.slice(1).replace(/-/g, ' ') || 'Products',
    heroTitle: categorySlug?.charAt(0).toUpperCase() + categorySlug?.slice(1).replace(/-/g, ' ') + '.',
    description: `Browse our complete collection of ${categorySlug?.replace(/-/g, ' ')} products.`,
    discoverTitle: `Discover ${categorySlug?.replace(/-/g, ' ')}.`,
    discoverText: `Explore our range of ${categorySlug?.replace(/-/g, ' ')} solutions.`,
    features: [],
    hasLightToggle: false
  };

  const isBuiltUpLetters = [
    '3d-built-up-letters',
    '2d-box-signage',
    'flex-face',
    'lightbox',
    'printed-board',
  ].includes(String(categorySlug || '').toLowerCase());
  const featuredSignageItem = getFeaturedSignageBySlug(categorySlug);
  const featuredCategoryHeroImage =
    featuredSignageItem?.images?.[0] || `${import.meta.env.BASE_URL}threeD.png`;

  useEffect(() => {
    fetchProducts();
    fetchRecommendedProducts();
  }, [categorySlug]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.list();
      
      if (data.products && data.products.length > 0) {
        const filtered = data.products
          .filter(product => product.category?.toLowerCase() === categorySlug?.toLowerCase())
          .map(product => ({
            id: product._id,
            name: product.name,
            category: product.category,
            price: product.basePrice || product.variants?.[0]?.price || 0,
            image: product.images?.[0]?.url || '',
            _id: product._id,
            productData: product,
          }));
        setProducts(filtered);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      setRecommendedLoading(true);
      
      // Fetch recommended products from API
      const apiData = await productService.getRecommended({ 
        limit: 6,
        category: categorySlug 
      });
      
      const apiProducts = (apiData?.products || []).map(product => ({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.basePrice || product.variants?.[0]?.price || 0,
        image: product.images?.[0]?.url || '',
        _id: product._id,
        productData: product,
        source: 'api',
      }));
      
      // Static recommended products (curated picks)
      const staticRecommended = [
        {
          id: `static-${categorySlug}-bespoke`,
          name: `${categoryInfo.label} - Bespoke Quote`,
          category: categorySlug,
          price: 0,
          image: featuredSignageItem?.images?.[1] || featuredSignageItem?.images?.[0] || '',
          _id: null,
          source: 'static',
          badge: 'Curated',
          isStatic: true,
        },
        {
          id: `static-${categorySlug}-premium`,
          name: `${categoryInfo.label} - Premium Finish`,
          category: categorySlug,
          price: 0,
          image: featuredSignageItem?.images?.[0] || '',
          _id: null,
          source: 'static',
          badge: 'Curated',
          isStatic: true,
        },
      ];
      
      // Combine API and static products, limit to 8 total
      const combined = [...apiProducts, ...staticRecommended].slice(0, 8);
      setRecommendedProducts(combined);
    } catch (error) {
      console.error('Error fetching recommended products:', error);
      // Fallback to static products only
      const staticRecommended = [
        {
          id: `static-${categorySlug}-bespoke`,
          name: `${categoryInfo.label} - Bespoke Quote`,
          category: categorySlug,
          price: 0,
          image: featuredSignageItem?.images?.[1] || featuredSignageItem?.images?.[0] || '',
          _id: null,
          source: 'static',
          badge: 'Curated',
          isStatic: true,
        },
        {
          id: `static-${categorySlug}-premium`,
          name: `${categoryInfo.label} - Premium Finish`,
          category: categorySlug,
          price: 0,
          image: featuredSignageItem?.images?.[0] || '',
          _id: null,
          source: 'static',
          badge: 'Curated',
          isStatic: true,
        },
      ];
      setRecommendedProducts(staticRecommended);
    } finally {
      setRecommendedLoading(false);
    }
  };

  const handleProductClick = (product) => {
    // If static product, navigate to quote page
    if (product.isStatic || product.source === 'static') {
      navigate('/get-free-quote');
      return;
    }
    
    const productId = product._id || product.id;
    const encryptedId = encryptId(productId);
    const slug = createSlug(product.name);
    const category = product.category?.toLowerCase() || categorySlug;
    
    navigate(getRoutePath('productDetail', { category, productName: slug, encryptedId }));
  };
  
  const getImagePlaceholder = (name) => {
    const text = encodeURIComponent(name || 'Product');
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect fill='%23f3f4f6' width='500' height='500'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%236b7280'%3E${text}%3C/text%3E%3C/svg%3E`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className={
          isBuiltUpLetters ? 'bg-gradient-to-r from-slate-800 to-slate-700 py-12 md:py-16' : 'bg-slate-900 py-12 md:py-16'
        }
      >
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {isBuiltUpLetters ? (
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Discover built-up<br />lettering.
                </h1>

                <div className="w-44 h-1 bg-yellow-400 mt-5 mb-6" />

                <div className="space-y-5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  <p className="text-base text-white/80 leading-relaxed">
                    Our built-up letters are crafted and finished using the most versatile array of materials. From classic metals to modern acrylics, our huge selection enhances the visual impact and durability of a brand’s signage.
                  </p>

                  <p className="text-base text-white/80 leading-relaxed">
                    Choose from a number of stylistic options — including rimless, solid face, and rim &amp; return — before deciding on a polished, brushed, painted, or anodised finish.
                  </p>

                  <p className="text-base text-white/80 leading-relaxed">
                    Our built-up signs are developed with installation in mind. We tailor every piece to your specific needs, whether mounted flush, raised with locators for a shadow effect, or illuminated for a striking night-time presence.
                  </p>

                  {/* <div className="flex items-center gap-3 pt-2">
                    <div className="h-8 w-8 rounded-full bg-white/10 border border-white/40 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">i</span>
                    </div>
                    <p className="text-sm italic text-white/50">Click the icons to learn more.</p>
                  </div> */}
                </div>

                <button
                  onClick={() => navigate('/get-free-quote')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Get a Free Quote
                </button>
              </div>

              <div className="relative">
                <div className="bg-white/90 rounded-3xl shadow-2xl p-6 ring-1 ring-black/5">
                  <div className="relative overflow-hidden rounded-2xl bg-white">
                    <img
                      src={featuredCategoryHeroImage}
                      alt={categoryInfo.label}
                      className="w-full h-[420px] object-contain bg-white"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wide mb-4 block" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  SERVICES
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">
                  {categoryInfo.heroTitle}
                </h1>
                <p className="text-base text-gray-300 mb-6 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {categoryInfo.description}
                </p>

                {/* Feature Icons */}
                {categoryInfo.features.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                    {categoryInfo.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-2xl">{feature.icon}</span>
                        <div>
                          <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                          <p className="text-gray-400 text-xs" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => navigate('/get-free-quote')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  Get a Free Quote
                </button>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  {products.length > 0 && products[0].image ? (
                    <img
                      src={products[0].image}
                      alt={categoryInfo.label}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Light Toggle Section (if applicable) */}
      <section className="py-12 md:py-14 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left Side - Image with Toggle */}
          <div className="space-y-4">
            {/* Image Frame */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900">
              {/* ON/OFF toggle INSIDE the image */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                <span
                  className={`text-xs font-semibold ${!isNeon ? 'text-gray-900' : 'text-gray-400'}`}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  OFF
                </span>

                <button
                  type="button"
                  onClick={() => setIsNeon(!isNeon)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isNeon ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle neon on/off"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${
                      isNeon ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>

                <span
                  className={`text-xs font-semibold ${isNeon ? 'text-gray-900' : 'text-gray-400'}`}
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  ON
                </span>
              </div>

              {/* 
                To match your screenshot exactly, use rendered images.
                Put these files in:
                  - UI/public/transformation/standard.png
                  - UI/public/transformation/neon.png
                They should be the same dimensions.
              */}
              <div className="relative aspect-square">
                <img
                  src="/sign.jpg"
                  alt="Standard signage"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                    isNeon ? 'opacity-0' : 'opacity-100'
                  }`}
                  draggable={false}
                />
                <img
                  src="/neon-sign.jpg"
                  alt="Neon signage"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                    isNeon ? 'opacity-100' : 'opacity-0'
                  }`}
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-5">
            <h2 
              className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight"
            >
              Putting the light in your {' '}
              <span className="relative inline-block">
              {categoryInfo.label.toLowerCase()}
                {/* Wavy underline to match the reference design */}
                <span className="absolute left-0 right-0 -bottom-2">
                  <svg
                    viewBox="0 0 220 18"
                    preserveAspectRatio="none"
                    className="h-[8px] w-full"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 10 C 35 4, 70 16, 105 10 S 175 4, 218 10"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </h2>

            {/* <div className="space-y-4 text-gray-600 leading-7 text-base" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              <p>
                From standard signage to glowing neon — see the difference our craftsmanship makes. Toggle the ON/OFF switch to experience how your brand can stand out with our premium neon solutions.
              </p>
              <p>
                Every sign is manufactured in-house at our UK facility using premium materials, ensuring exceptional quality and durability for your business.
              </p>
            </div> */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5">
                  Putting the light in your {categoryInfo.label.toLowerCase()}.
                </h2>
                <p className="text-base text-gray-600 leading-relaxed mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Our illumination options bring your signage to life. Choose from ambient backlighting for a subtle halo effect, face-lit options for maximum visibility, or custom LED modules for unique lighting solutions.
                </p>
                <p className="text-base text-gray-600 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  All our illuminated signage uses energy-efficient LED technology, ensuring long-lasting performance and reduced energy costs while maintaining brilliant visibility day and night.
                </p>
              </div>

            <button
              onClick={() => navigate(getRoutePath('getQuote'))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Get a Free Quote
            </button>
          </div>
        </div>
      </div>

    </section>
      {/* {categoryInfo.hasLightToggle && (
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative">
                  {products.length > 0 && products[0].image ? (
                    <>
                      <img
                        src={products[0].image}
                        alt={categoryInfo.label}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${
                          lightToggle ? 'opacity-100' : 'opacity-30'
                        }`}
                      />
                      {lightToggle && (
                        <div className="absolute inset-0 bg-yellow-400/20 mix-blend-screen"></div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-8xl font-bold text-gray-700 mb-4">O</div>
                        <div className={`w-16 h-16 mx-auto rounded-full border-4 transition-colors ${
                          lightToggle ? 'bg-yellow-400 border-yellow-400' : 'bg-gray-700 border-gray-600'
                        }`}></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className={`text-xs font-semibold ${!lightToggle ? 'text-gray-900' : 'text-gray-500'}`}>OFF</span>
                  <button
                    onClick={() => setLightToggle(!lightToggle)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      lightToggle ? 'bg-yellow-400' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        lightToggle ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-semibold ${lightToggle ? 'text-gray-900' : 'text-gray-500'}`}>ON</span>
                </div>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Putting the light in your {categoryInfo.label.toLowerCase()}.
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Our illumination options bring your signage to life. Choose from ambient backlighting for a subtle halo effect, face-lit options for maximum visibility, or custom LED modules for unique lighting solutions.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  All our illuminated signage uses energy-efficient LED technology, ensuring long-lasting performance and reduced energy costs while maintaining brilliant visibility day and night.
                </p>
              </div>
            </div>
          </div>
        </section>
      )} */}

      {/* CTA Section */}
      <section className="bg-slate-900 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
          }}></div>
        </div>
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Need a price for your project?
            </h2>
            <p className="text-base text-gray-300 mb-6" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Hit the link below to access our Quotations Portal. Provide us with the details of your sign project and we'll get back to you with a price.
            </p>
            <button
              onClick={() => navigate('/get-free-quote')}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-200 text-base"
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              Let's go
            </button>
          </div>
        </div>
      </section>

      {/* Our Work Gallery Section */}
      {products.length > 0 && (
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Our <WavyUnderline>work.</WavyUnderline>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
              {products.slice(0, 12).map((product, idx) => (
                <div
                  key={product.id || idx}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleProductClick(product)}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Products Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Recommended <WavyUnderline>solutions</WavyUnderline>
            </h2>
            <p className="text-base text-gray-600 max-w-2xl" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Handpicked products from our collection, plus curated options tailored to your needs.
            </p>
          </div>
          
          {recommendedLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                Loading recommended products...
              </p>
            </div>
          ) : recommendedProducts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No recommended products available
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recommendedProducts.map((product) => {
                const isStatic = product.isStatic || product.source === 'static';
                const imgSrc = isStatic 
                  ? getImagePlaceholder(product.name)
                  : imageErrors[product.id] 
                    ? getImagePlaceholder(product.name)
                    : product.image || getImagePlaceholder(product.name);
                
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1 relative"
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Badge for static/curated products */}
                    {product.badge && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full shadow-sm">
                          {product.badge}
                        </span>
                      </div>
                    )}
                    
                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          hoveredProduct === product.id ? 'scale-110' : 'scale-100'
                        }`}
                        onError={(e) => {
                          if (!imageErrors[product.id]) {
                            setImageErrors(prev => ({ ...prev, [product.id]: true }));
                            e.target.src = getImagePlaceholder(product.name);
                          }
                        }}
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                      />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                        hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product);
                          }}
                          className={`px-5 py-2.5 rounded-lg font-semibold transition-colors ${
                            isStatic
                              ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                              : 'bg-white text-gray-900 hover:bg-blue-600 hover:text-white'
                          }`}
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          {isStatic ? 'Get Quote' : 'Quick View'}
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                        {product.name}
                      </h3>
                      {!isStatic && product.price > 0 && (
                        <p className="text-sm text-gray-500 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          From £{product.price.toFixed(2)}
                        </p>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        className={`text-sm font-semibold flex items-center gap-1 transition-colors ${
                          isStatic
                            ? 'text-yellow-600 hover:text-yellow-700'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      >
                        {isStatic ? 'Request Quote' : 'Learn more'}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryProducts;
