import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { thirdPartyService } from '../services/thirdPartyService';
import { decryptId } from '../utils/encryption';
import EndBenefitsStrip from '../components/EndBenefitsStrip';

const ProductDetail = ({ productType, productId, product: productProp }) => {
  const { category, productName, encryptedId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [designOption, setDesignOption] = useState('custom'); // 'custom' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Business card configuration states
  const [material, setMaterial] = useState('450gsm-silk-finish');
  const [sidesPrinted, setSidesPrinted] = useState('double-sided');
  const [lamination, setLamination] = useState('both-sides-matt');
  const [roundCorners, setRoundCorners] = useState('no');
  const [deliveryOption, setDeliveryOption] = useState('saver');
  const deliveryOptionRef = useRef('saver');
  const [showPricingGrid, setShowPricingGrid] = useState(false);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({});
  const [isVatInclusive, setIsVatInclusive] = useState(() => localStorage.getItem('vatMode') !== 'ex');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState({ active: false, x: 50, y: 50 });
  const [deliveryPricesByOption, setDeliveryPricesByOption] = useState({});
  const [deliveryPricingLoading, setDeliveryPricingLoading] = useState(false);
  const [expectedDeliveryByOption, setExpectedDeliveryByOption] = useState({});
  const [deliveryPostcode, setDeliveryPostcode] = useState('');
  const [quantitiesOptions, setQuantitiesOptions] = useState([]);

  // Initialize with productProp if available, then fetch from URL params or productId
  useEffect(() => {
    if (productProp) {
      setProduct(productProp);
      setLoading(false);
    } else if (encryptedId) {
      // Decrypt ID from URL
      const decryptedId = decryptId(encryptedId);
      fetchProduct(decryptedId);
    } else if (productId) {
      fetchProduct(productId);
    }
  }, [encryptedId, productId, productProp]);

  const fetchProduct = async (id) => {
    try {
      setLoading(true);
      // Use centralized service
      const data = await productService.getById(id);
      // Backend returns product directly, not wrapped
      if (data._id || data.name) {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/'); // Redirect to home on error
    } finally {
      setLoading(false);
    }
  };



  // Determine which product to use
  const getProduct = () => {
    // If we have product from backend, use it
    if (product) {
      const allImages = [
        product.productImage?.url,
        ...(Array.isArray(product.images) ? product.images.map((img) => img?.url) : []),
      ].filter(Boolean);
      return {
        name: product.name,
        category: product.category?.charAt(0).toUpperCase() + product.category?.slice(1).replace('-', ' ') || 'Product',
        price: product.basePrice || product.variants?.[0]?.price || 0,
        originalPrice: null,
        image: allImages[0] || '',
        images: allImages,
        description: product.description || '',
        features: product.features || [],
        faqs: Array.isArray(product.faqs) ? product.faqs : [],
        specifications: product.specifications || {},
        uiOptions: product.uiOptions || {},
        sizeOptions: product.sizeOptions || {},
        pricingTable: product.pricingTable || {},
      };
    }
    // If we have productProp passed from parent, use it (this prevents image flash)
    if (productProp) {
      const allImages = [
        productProp.productImage?.url,
        ...(Array.isArray(productProp.images) ? productProp.images.map((img) => img?.url) : []),
      ].filter(Boolean);
      return {
        name: productProp.name,
        category: productProp.category?.charAt(0).toUpperCase() + productProp.category?.slice(1).replace('-', ' ') || 'Product',
        price: productProp.basePrice || productProp.variants?.[0]?.price || 0,
        originalPrice: null,
        image: allImages[0] || '',
        images: allImages,
        description: productProp.description || '',
        features: productProp.features || [],
        faqs: Array.isArray(productProp.faqs) ? productProp.faqs : [],
        specifications: productProp.specifications || {},
        uiOptions: productProp.uiOptions || {},
        sizeOptions: productProp.sizeOptions || {},
        pricingTable: productProp.pricingTable || {},
      };
    }
    // Otherwise use hardcoded data based on productType (only if not loading from backend)
 
    // Return null during loading to prevent showing placeholder
    return null;
  };

  const displayProduct = getProduct();
  const productImages = Array.isArray(displayProduct?.images) && displayProduct.images.length > 0
    ? displayProduct.images
    : (displayProduct?.image ? [displayProduct.image] : []);
  const selectedImage = productImages[selectedImageIndex] || productImages[0] || '';

  // Check if this is a business card product
  const isBusinessCard = () => {
    const productCategory = product?.category || category || productType || '';
    const categoryLower = productCategory.toLowerCase();
    return categoryLower.includes('business-card') || 
           categoryLower.includes('businesscard') ||
           categoryLower === 'business card';
  };
  const dynamicAttributes = product?.thirdPartyAttributes || productProp?.thirdPartyAttributes || {};
  const hasDynamicAttributes = Object.keys(dynamicAttributes).length > 0;
  const thirdPartyProductKey = product?.thirdPartyProductKey || productProp?.thirdPartyProductKey || null;
  const hasThirdPartyPricing = Boolean(thirdPartyProductKey);
  const STATIC_DELIVERY_OPTIONS = [
    { key: 'saver', label: 'Saver', etaDays: 6, serviceLevel: 'Saver' },
    { key: 'standard', label: 'Standard', etaDays: 4, serviceLevel: 'Standard' },
    { key: 'express', label: 'Express', etaDays: 2, serviceLevel: 'Express' },
  ];
  const dynamicAttributeEntries = Object.entries(dynamicAttributes).filter(([attributeName]) => {
    // For business cards, keep visual selectors and avoid duplicate dropdowns.
    const normalizedName = attributeName.toLowerCase();
    if (
      isBusinessCard() &&
      (normalizedName.includes('sides printed') || normalizedName.includes('round corners'))
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!hasDynamicAttributes) {
      setSelectedAttributeValues({});
      return;
    }

    const initialValues = {};
    Object.entries(dynamicAttributes).forEach(([attributeName, options]) => {
      if (Array.isArray(options) && options.length > 0) {
        initialValues[attributeName] = options[0];
      }
    });
    setSelectedAttributeValues(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id, productProp?._id, hasDynamicAttributes]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?._id, productProp?._id, encryptedId]);

  useEffect(() => {
    if (!hasThirdPartyPricing || !thirdPartyProductKey) {
      setDeliveryPricesByOption({});
      return;
    }

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;
    const productionData = { ...selectedAttributeValues };

    if (isBusinessCard()) {
      productionData['Sides Printed'] = sidesPrinted === 'double-sided' ? 'Double Sided' : 'Single Sided';
      productionData['Round Corners'] = roundCorners === 'yes' ? 'Yes' : 'None';
    }

    if (Object.keys(productionData).length === 0) {
      setDeliveryPricesByOption({});
      return;
    }

    let active = true;
    setDeliveryPricingLoading(true);

    Promise.all(
      STATIC_DELIVERY_OPTIONS.map(async (option) => {
        try {
          const response = await thirdPartyService.getProductPrices({
            productId: thirdPartyProductKey,
            serviceLevel: option.serviceLevel,
            quantity: [qty],
            productionData,
          });
          const rows = Array.isArray(response?.prices) ? response.prices : [];
          const exactRow = rows.find((row) => Number(row?.quantity) === qty) || rows[0];
          const servicePrice =
            exactRow?.prices?.find(
              (entry) => String(entry?.serviceLevel || '').toLowerCase() === option.serviceLevel.toLowerCase()
            ) || exactRow?.prices?.[0];
          return [option.key, servicePrice?.price ?? null];
        } catch (error) {
          return [option.key, null];
        }
      })
    )
      .then((entries) => {
        if (!active) return;
        setDeliveryPricesByOption(Object.fromEntries(entries));
      })
      .finally(() => {
        if (active) setDeliveryPricingLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thirdPartyProductKey, hasThirdPartyPricing, quantity, selectedAttributeValues, sidesPrinted, roundCorners]);

  useEffect(() => {
    if (!hasThirdPartyPricing || !thirdPartyProductKey) {
      setExpectedDeliveryByOption({});
      return;
    }
    if (!deliveryPostcode.trim()) {
      setExpectedDeliveryByOption({});
      return;
    }

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;
    const productionData = { ...selectedAttributeValues };

    if (isBusinessCard()) {
      productionData['Sides Printed'] = sidesPrinted === 'double-sided' ? 'Double Sided' : 'Single Sided';
      productionData['Round Corners'] = roundCorners === 'yes' ? 'Yes' : 'None';
    }

    if (Object.keys(productionData).length === 0) {
      setExpectedDeliveryByOption({});
      return;
    }

    let active = true;

    Promise.all(
      STATIC_DELIVERY_OPTIONS.map(async (option) => {
        try {
          const response = await thirdPartyService.getExpectedDeliveryDate({
            productId: thirdPartyProductKey,
            productionData,
            serviceLevel: option.serviceLevel,
            quantity: qty,
            artworkService: 'Just Print',
            deliveryAddress: {
              postcode: deliveryPostcode.trim(),
            },
          });

          // Normalize date from multiple possible fields
          const res = response || {};
          const resultObj = res.result || {};
          // Prefer explicit expectedDeliveryDate if present
          let normalizedDate = res.expectedDeliveryDate || resultObj.expectedDeliveryDate || null;
          // Fallback to timestamp (ms since epoch)
          if (!normalizedDate && typeof resultObj.timestamp === 'number') {
            const d = new Date(resultObj.timestamp);
            if (!Number.isNaN(d.getTime())) normalizedDate = d.toISOString();
          }
          // Fallback to formattedDate 'dd/MM/yyyy'
          if (!normalizedDate && typeof resultObj.formattedDate === 'string') {
            const parts = resultObj.formattedDate.split('/'); // dd/MM/yyyy
            if (parts.length === 3) {
              const [dd, mm, yyyy] = parts;
              const iso = `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}T12:00:00Z`;
              const d = new Date(iso);
              if (!Number.isNaN(d.getTime())) normalizedDate = d.toISOString();
            }
          }
          // Other common fallbacks
          if (!normalizedDate) {
            const other = resultObj.deliveryDate || resultObj.date || null;
            if (other) normalizedDate = other;
          }

          return [option.key, normalizedDate || null];
        } catch (error) {
          return [option.key, null];
        }
      })
    ).then((entries) => {
      if (!active) return;
      setExpectedDeliveryByOption(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thirdPartyProductKey, hasThirdPartyPricing, quantity, selectedAttributeValues, sidesPrinted, roundCorners, deliveryPostcode]);

  // Fetch available quantities for current product/options/service level
  useEffect(() => {
    if (!hasThirdPartyPricing || !thirdPartyProductKey) {
      setQuantitiesOptions([]);
      return;
    }
    const productionData = { ...selectedAttributeValues };
    if (isBusinessCard()) {
      productionData['Sides Printed'] = sidesPrinted === 'double-sided' ? 'Double Sided' : 'Single Sided';
      productionData['Round Corners'] = roundCorners === 'yes' ? 'Yes' : 'None';
    }
    if (Object.keys(productionData).length === 0) {
      setQuantitiesOptions([]);
      return;
    }
    let active = true;
    const service = (STATIC_DELIVERY_OPTIONS.find(o => o.key === (deliveryOptionRef.current || deliveryOption))?.serviceLevel) || 'Saver';
    thirdPartyService.getQuantities({
      productId: thirdPartyProductKey,
      serviceLevel: service,
      productionData,
    }).then((res) => {
      if (!active) return;
      const list = Array.isArray(res?.quantities) ? res.quantities : (Array.isArray(res?.result) ? res.result : []);
      const nums = (list || []).map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0);
      setQuantitiesOptions(nums);
      // If current quantity not in options, set to first
      if (nums.length > 0 && !nums.includes(Number(quantity))) {
        setQuantity(nums[0]);
      }
    }).catch(() => {
      if (active) setQuantitiesOptions([]);
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thirdPartyProductKey, hasThirdPartyPricing, selectedAttributeValues, sidesPrinted, roundCorners, deliveryOption]);

  // Material options
  const materialOptions = [
    { 
      value: '450gsm-silk-finish', 
      label: '450gsm Silk Finish',
      description: 'Extra-heavyweight luxury silk paper with a smooth satin-style surface & strong durability',
      recommended: true
    },
    { 
      value: '350gsm-recycled-uncoated', 
      label: '350gsm Recycled Uncoated',
      description: 'Extra-heavyweight recycled paper, perfect for writing on'
    },
    { 
      value: '350gsm-silk-finish', 
      label: '350gsm Silk Finish',
      description: 'Extra-heavyweight premium silk paper with a smooth, satin-style surface and polished feel (Same Day Printing Before 1pm)'
    },
    { 
      value: '300gsm-uncoated', 
      label: '300gsm Uncoated',
      description: 'Heavyweight with a premium natural matte finish, rigid and easy to write on'
    }
  ];

  const getEffectivePricingTable = () => {
    if (hasThirdPartyPricing) {
      const qty = Number(quantity) > 0 ? Number(quantity) : 1;
      return {
        enabled: true,
        quantities: [qty],
        deliveryOptions: STATIC_DELIVERY_OPTIONS.map((option) => ({
          key: option.key,
          label: option.label,
          etaDays: option.etaDays,
          prices: [deliveryPricesByOption[option.key] ?? null],
        })),
      };
    }
    return { enabled: false, quantities: [], deliveryOptions: [] };
  };

  const pricingTable = getEffectivePricingTable();
  const hasDeliveryPricing = !!pricingTable?.enabled;
  const deliveryOptions = Array.isArray(pricingTable?.deliveryOptions) ? pricingTable.deliveryOptions : [];
  const saverOpt = deliveryOptions.find(o => o.key === 'saver');
  const standardOpt = deliveryOptions.find(o => o.key === 'standard');
  const expressOpt = deliveryOptions.find(o => o.key === 'express');

  // Convert pricing table to legacy-like grid rows for existing UI
  const pricingGrid = (pricingTable?.quantities || []).map((qty, index) => {
    const row = { qty };
    (pricingTable?.deliveryOptions || []).forEach((opt) => {
      row[opt.key] = opt.prices?.[index];
    });
    return row;
  });

  // Get price for current quantity and delivery option
  const getPriceForQuantity = (qty, delivery) => {
    // Find exact match first
    let row = pricingGrid.find(r => r.qty === qty);
    if (row) return row[delivery] || null;
    
    // If no exact match, find closest quantity
    row = pricingGrid.reduce((prev, curr) => {
      return Math.abs(curr.qty - qty) < Math.abs(prev.qty - qty) ? curr : prev;
    });
    return row[delivery] || null;
  };

  // Get current price based on quantity and delivery
  const getCurrentPrice = () => {
    const price = getPriceForQuantity(quantity, deliveryOptionRef.current || deliveryOption);
    return price || 0;
  };

  const handleDeliveryOptionSelect = (optionKey) => {
    deliveryOptionRef.current = optionKey;
    setDeliveryOption(optionKey);
  };

  // Ensure current delivery option exists in pricingTable (when admin config differs)
  useEffect(() => {
    if (!hasDeliveryPricing) return;
    if (deliveryOptions.length === 0) return;
    const exists = deliveryOptions.some(o => o.key === deliveryOption);
    if (!exists) {
      handleDeliveryOptionSelect(deliveryOptions[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDeliveryPricing, pricingTable?.deliveryOptions]);

  const VAT_RATE = 0.2;

  useEffect(() => {
    const handleVatModeChanged = (event) => {
      const mode = event?.detail?.mode;
      if (mode === 'inc') setIsVatInclusive(true);
      if (mode === 'ex') setIsVatInclusive(false);
    };

    const handleStorageChange = (event) => {
      if (event.key !== 'vatMode') return;
      setIsVatInclusive(event.newValue !== 'ex');
    };

    window.addEventListener('vat-mode-changed', handleVatModeChanged);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('vat-mode-changed', handleVatModeChanged);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const applyVatMode = (baseExVatPrice) => {
    const exVat = Number(baseExVatPrice || 0);
    return isVatInclusive ? exVat * (1 + VAT_RATE) : exVat;
  };

  const getPriceIncVat = () => {
    const exVat = (isBusinessCard() || hasDeliveryPricing) ? getCurrentPrice() : (displayProduct?.price || 0);
    return exVat * (1 + VAT_RATE);
  };

  const getPriceExVat = () => {
    return (isBusinessCard() || hasDeliveryPricing) ? getCurrentPrice() : (displayProduct?.price || 0);
  };

  const getDeliveryDateLabel = () => {
    const apiDateRaw = expectedDeliveryByOption[deliveryOption];
    if (apiDateRaw) {
      const parsed = new Date(apiDateRaw);
      if (!Number.isNaN(parsed.getTime())) {
        const weekday = parsed.toLocaleDateString(undefined, { weekday: 'short' });
        const day = parsed.toLocaleDateString(undefined, { day: '2-digit' });
        const month = parsed.toLocaleDateString(undefined, { month: 'short' });
        return `${weekday}. ${day} ${month}`;
      }
    }
    const now = new Date();
    const option = (pricingTable?.deliveryOptions || []).find(o => o.key === deliveryOption);
    const addDays = option?.etaDays ?? (deliveryOption === 'express' ? 2 : deliveryOption === 'standard' ? 4 : 6);
    const eta = new Date(now);
    eta.setDate(now.getDate() + addDays);
    const weekday = eta.toLocaleDateString(undefined, { weekday: 'short' });
    const day = eta.toLocaleDateString(undefined, { day: '2-digit' });
    const month = eta.toLocaleDateString(undefined, { month: 'short' });
    return `${weekday}. ${day} ${month}`;
  };

  // Don't render until we have product data (since hardcoded fallback was removed)
  if (!displayProduct) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            {loading ? 'Loading product...' : 'Product not found'}
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
    // Navigate to product designer with the product type and image
    const type = product?.category || productType || 'pen';
    const category = product?.category || null;
    const businessCardMode = isBusinessCard();

    // For business cards, do not pass any product image (blank editor)
    // For others, use uploaded image if user uploaded one, otherwise use the product image
    const imageToUse = businessCardMode
      ? null
      : (designOption === 'upload' && uploadedImage ? uploadedImage : (displayProduct?.image || null));

    // Send all selected product options via query params for deep-linking/shareability.
    const queryParams = new URLSearchParams();
    queryParams.set('productType', type === 'business-card' ? 'business-card' : type);
    if (category) queryParams.set('productCategory', category);
    if (selectedSize) queryParams.set('size', selectedSize);
    queryParams.set('quantity', String(Number(quantity) > 0 ? Number(quantity) : 1));
    if (designOption) queryParams.set('designOption', designOption);

    if (material) queryParams.set('material', material);
    if (sidesPrinted) queryParams.set('sidePrinted', sidesPrinted);
    if (lamination) queryParams.set('lamination', lamination);
    if (roundCorners) queryParams.set('roundCorners', roundCorners);
    if (deliveryOptionRef.current || deliveryOption) {
      queryParams.set('deliveryOption', deliveryOptionRef.current || deliveryOption);
    }

    Object.entries(selectedAttributeValues || {}).forEach(([key, value]) => {
      if (!value) return;
      const safeKey = `option_${String(key).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
      queryParams.set(safeKey, String(value));
    });

    // Navigate to product designer with both URL params and state.
    navigate(`/product-designer?${queryParams.toString()}`, {
      state: { 
        productType: type === 'business-card' ? 'business-card' : type,
        productCategory: category,
        uploadedImage: imageToUse,
        // business card options
        sidesPrinted,
        cardVariant: 'classic'
      }
    });
  };

  const handleAddToCart = () => {
    const showEditor = displayProduct?.uiOptions?.showEditorButton ?? true;
    const showUpload = displayProduct?.uiOptions?.showUploadDesignButton ?? true;
    const sizeEnabled = displayProduct?.sizeOptions?.enabled ?? false;
    const sizeRequired = displayProduct?.sizeOptions?.required ?? false;

    // If both design options are disabled, ignore any existing state value
    const effectiveDesignOption = (showEditor || showUpload) ? designOption : null;

    if (sizeEnabled && sizeRequired && !selectedSize) {
      toast.error('Please select a size to continue.');
      return;
    }

    // Calculate price for business cards and products using a delivery pricing table
    const exVatPrice = (isBusinessCard() || hasDeliveryPricing) ? getCurrentPrice() : displayProduct.price;
    const finalPrice = applyVatMode(exVatPrice);
    
    const cartProduct = {
      id: product?._id || `${productType}-${Date.now()}`,
      name: displayProduct.name,
      category: displayProduct.category,
      price: finalPrice,
      image: selectedImage || displayProduct.image,
      quantity: quantity,
      designOption: effectiveDesignOption,
      uploadedImage: uploadedImage,
      ...(sizeEnabled && { size: selectedSize }),
      ...(hasDeliveryPricing && { deliveryOption: deliveryOptionRef.current || deliveryOption }),
      ...(hasDynamicAttributes && { selectedAttributes: selectedAttributeValues }),
      // Include business card options if applicable
      ...(isBusinessCard() && {
        material,
        sidesPrinted,
        lamination,
        roundCorners,
        deliveryOption: deliveryOptionRef.current || deliveryOption
      })
    };
    addToCart(cartProduct, quantity);
    toast.success(`${displayProduct.name} added to cart!`);
  };

  const handleImageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setImageZoom({ active: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleImageMouseLeave = () => {
    setImageZoom((prev) => ({ ...prev, active: false }));
  };

  const handleBackToProducts = () => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('products');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 pb-24">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={handleBackToProducts}
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
            <div
              className="aspect-square w-full relative p-4 bg-gray-100 overflow-hidden cursor-zoom-in"
              onMouseMove={handleImageMouseMove}
              onMouseEnter={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
            >
              {selectedImage ? (
                <img
                  key={`${product?._id || productProp?._id || 'product'}-${selectedImage}`}
                  src={selectedImage}
                  alt={displayProduct.name}
                  className="w-full h-full object-contain transition-transform duration-200 ease-out"
                  loading="eager"
                  style={{
                    transform: imageZoom.active ? 'scale(2)' : 'scale(1)',
                    transformOrigin: `${imageZoom.x}% ${imageZoom.y}%`,
                  }}
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
            {productImages.length > 1 && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-5 gap-2">
                  {productImages.map((imgUrl, index) => (
                    <button
                      key={`${imgUrl}-${index}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 ${
                        index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${displayProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/120x120?text=Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Category & Name */}
            <div>
              <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                {displayProduct.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                {displayProduct.name}
              </h1>
            </div>

            {/* Price (hide for business cards / delivery-table products because pricing is dynamic) */}
            {!(isBusinessCard() || hasDeliveryPricing) && (
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
            )}

            {/* Description - Compact */}
            <div>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                dangerouslySetInnerHTML={{ __html: displayProduct.description || '' }}
              />
            </div>

            <div className="space-y-4">
                {/* Optional Size Selection */}
                {(displayProduct?.sizeOptions?.enabled ?? false) && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Size {(displayProduct?.sizeOptions?.required ?? false) ? '*' : ''}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      >
                        <option value="">Select a size</option>
                        {(displayProduct?.sizeOptions?.options || []).map((opt) => (
                          <option key={opt.value || opt.label} value={opt.label || opt.value}>
                            {opt.label || opt.value}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {(displayProduct?.sizeOptions?.required ?? false) && !selectedSize && (
                      <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Please select a size before adding to basket.
                      </p>
                    )}
                  </div>
                )}

                {/* Dynamic attributes from API/DB */}
                {hasDynamicAttributes && dynamicAttributeEntries.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Product Options
                    </h3>
                    {dynamicAttributeEntries.map(([attributeName, options]) => (
                      <div key={attributeName} className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-800" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          {attributeName}
                        </label>
                        <div className="relative">
                          <select
                            value={selectedAttributeValues[attributeName] || ''}
                            onChange={(e) =>
                              setSelectedAttributeValues((prev) => ({
                                ...prev,
                                [attributeName]: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            {(Array.isArray(options) ? options : []).map((optionValue) => (
                              <option key={`${attributeName}-${optionValue}`} value={optionValue}>
                                {optionValue}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Business Card Configuration Options */}
                {isBusinessCard() && (
                  <div className="space-y-6 pt-4 border-t border-gray-200">
                    {/* Material Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Material
                      </label>
                      <div className="relative">
                        <select
                          value={material}
                          onChange={(e) => setMaterial(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          {materialOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {materialOptions.find(opt => opt.value === material)?.recommended && (
                          <span className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      {materialOptions.find(opt => opt.value === material)?.description && (
                        <p className="mt-1.5 text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          {materialOptions.find(opt => opt.value === material).description}
                        </p>
                      )}
                    </div>

                    {/* Sides Printed Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Sides Printed
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSidesPrinted('double-sided')}
                          className={`p-4 border-2 rounded-lg transition-all text-center ${
                            sidesPrinted === 'double-sided'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                              <rect x="3" y="3" width="8" height="10" rx="1" fill="currentColor" opacity="0.1" />
                              <rect x="13" y="3" width="8" height="10" rx="1" fill="currentColor" opacity="0.1" />
                              <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                              <circle cx="16" cy="6" r="1.5" fill="currentColor" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Double Sided
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSidesPrinted('single-sided')}
                          className={`p-4 border-2 rounded-lg transition-all text-center ${
                            sidesPrinted === 'single-sided'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="10" rx="1" fill="currentColor" opacity="0.1" />
                              <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Single Sided
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Lamination Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Lamination
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setLamination('none')}
                          className={`p-4 border-2 rounded-lg transition-all text-center ${
                            lamination === 'none'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M8 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            None
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLamination('both-sides-gloss')}
                          className={`p-4 border-2 rounded-lg transition-all text-center ${
                            lamination === 'both-sides-gloss'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            <div className="w-12 h-12 bg-gray-700 rounded relative overflow-hidden">
                              <div className="absolute inset-0 bg-white opacity-30" style={{ clipPath: 'polygon(0 0, 100% 0, 0 50%)' }}></div>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Both Sides (Gloss)
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLamination('both-sides-matt')}
                          className={`p-4 border-2 rounded-lg transition-all text-center ${
                            lamination === 'both-sides-matt'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            <div className="w-12 h-12 bg-gray-700 rounded"></div>
                          </div>
                          <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Both Sides (Matt)
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLamination('both-sides-soft-touch')}
                          className={`p-4 border-2 rounded-lg transition-all text-center ${
                            lamination === 'both-sides-soft-touch'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            <div className="w-12 h-12 bg-gray-700 rounded opacity-90"></div>
                          </div>
                          <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Both Sides (Soft Touch)
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Round Corners Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Round Corners
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRoundCorners('no')}
                          className={`p-4 border-2 rounded-lg transition-all text-center ${
                            roundCorners === 'no'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path d="M3 3h6v6H3z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            No
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoundCorners('yes')}
                          className={`p-4 border-2 rounded-lg transition-all text-center ${
                            roundCorners === 'yes'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="4" fill="none" />
                              <path d="M3 7 Q3 3 7 3" strokeLinecap="round" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Yes
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Delivery & Pricing Grid */}
                    {hasDeliveryPricing && false && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          Choose Delivery
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Pricing Grid View
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowPricingGrid(!showPricingGrid)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              showPricingGrid ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                showPricingGrid ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className="text-xs text-white px-2 py-0.5 rounded" style={{ 
                            fontFamily: 'Lexend Deca, sans-serif',
                            backgroundColor: showPricingGrid ? '#3b82f6' : '#9ca3af'
                          }}>
                            {showPricingGrid ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>

                      {!showPricingGrid ? (
                        /* Delivery Option Buttons (when grid is hidden) */
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => handleDeliveryOptionSelect('saver')}
                            className={`p-4 border-2 rounded-lg text-center transition-all relative ${
                              deliveryOption === 'saver'
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {saverOpt?.label || 'Saver'}
                            </p>
                            <p className="text-base font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              £{getCurrentPrice().toFixed(2)}
                            </p>
                            {deliveryOption === 'saver' && (
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M5 12l5 5 10-10" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12l5 5 10-10" fill="currentColor" />
                                </svg>
                              </div>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeliveryOptionSelect('standard')}
                            className={`p-4 border-2 rounded-lg text-center transition-all ${
                              deliveryOption === 'standard'
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {standardOpt?.label || 'Standard'}
                            </p>
                            <p className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {(() => {
                                const saverPrice = getPriceForQuantity(quantity, 'saver') || 0;
                                const standardPrice = getPriceForQuantity(quantity, 'standard') || 0;
                                const diff = standardPrice - saverPrice;
                                return diff > 0 ? `+£${diff.toFixed(2)}` : '£' + standardPrice.toFixed(2);
                              })()}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeliveryOptionSelect('express')}
                            className={`p-4 border-2 rounded-lg text-center transition-all ${
                              deliveryOption === 'express'
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {expressOpt?.label || 'Express'}
                            </p>
                            <p className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {(() => {
                                const saverPrice = getPriceForQuantity(quantity, 'saver') || 0;
                                const expressPrice = getPriceForQuantity(quantity, 'express') || 0;
                                const diff = expressPrice - saverPrice;
                                return diff > 0 ? `+£${diff.toFixed(2)}` : '£' + expressPrice.toFixed(2);
                              })()}
                            </p>
                          </button>
                        </div>
                      ) : (
                        /* Pricing Grid Table (when grid is shown) */
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                                    Qty
                                  </th>
                                  <th 
                                    className={`px-4 py-3 text-center text-xs font-semibold border-r border-gray-200 ${
                                      deliveryOption === 'saver' ? 'bg-green-100 text-gray-900' : 'text-gray-700'
                                    }`}
                                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                  >
                                    {saverOpt?.label || 'Saver'}
                                  </th>
                                  <th 
                                    className={`px-4 py-3 text-center text-xs font-semibold border-r border-gray-200 ${
                                      deliveryOption === 'standard' ? 'bg-green-100 text-gray-900' : 'text-gray-700'
                                    }`}
                                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                  >
                                    {standardOpt?.label || 'Standard'}
                                  </th>
                                  <th 
                                    className={`px-4 py-3 text-center text-xs font-semibold ${
                                      deliveryOption === 'express' ? 'bg-green-100 text-gray-900' : 'text-gray-700'
                                    }`}
                                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                  >
                                    {expressOpt?.label || 'Express'}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {pricingGrid.map((row) => {
                                  const isSelected = row.qty === quantity && deliveryOption === 'saver';
                                  return (
                                    <tr key={row.qty} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                                        {row.qty}
                                      </td>
                                      <td 
                                        className={`px-4 py-3 text-center text-sm border-r border-gray-200 relative cursor-pointer ${
                                          deliveryOption === 'saver' && row.qty === quantity
                                            ? 'bg-green-100 font-semibold'
                                            : 'text-gray-900'
                                        }`}
                                        onClick={() => {
                                          handleDeliveryOptionSelect('saver');
                                          setQuantity(row.qty);
                                        }}
                                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                      >
                                        £{row.saver.toFixed(2)}
                                        {deliveryOption === 'saver' && row.qty === quantity && (
                                          <svg className="w-4 h-4 text-yellow-500 absolute bottom-1 right-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        )}
                                      </td>
                                      <td 
                                        className={`px-4 py-3 text-center text-sm border-r border-gray-200 cursor-pointer ${
                                          deliveryOption === 'standard' && row.qty === quantity
                                            ? 'bg-green-100 font-semibold'
                                            : 'text-gray-900'
                                        }`}
                                        onClick={() => {
                                          handleDeliveryOptionSelect('standard');
                                          setQuantity(row.qty);
                                        }}
                                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                      >
                                        £{row.standard.toFixed(2)}
                                      </td>
                                      <td 
                                        className={`px-4 py-3 text-center text-sm cursor-pointer ${
                                          deliveryOption === 'express' && row.qty === quantity
                                            ? 'bg-green-100 font-semibold'
                                            : 'text-gray-900'
                                        }`}
                                        onClick={() => {
                                          handleDeliveryOptionSelect('express');
                                          setQuantity(row.qty);
                                        }}
                                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                      >
                                        £{row.express.toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-200">
                            <p className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              £0.08 per unit
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                )}

                {/* Delivery pricing table (user side) */}
                {hasDeliveryPricing && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          Choose Delivery
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          Prices update by quantity and delivery speed
                        </p>
                        <div className="mt-2 max-w-[240px]">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Delivery Postcode
                          </label>
                          <input
                            type="text"
                            value={deliveryPostcode}
                            onChange={(e) => setDeliveryPostcode(e.target.value.toUpperCase())}
                            placeholder="e.g. ZE1 0AA"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          />
                        </div>
                        {deliveryPricingLoading && (
                          <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            Fetching latest delivery prices...
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          Pricing Grid
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPricingGrid(!showPricingGrid)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            showPricingGrid ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                              showPricingGrid ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {!showPricingGrid ? (
                      <>
                      {!deliveryPostcode.trim() && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          Enter postcode to get expected delivery dates.
                        </p>
                      )}
                      <div className="grid grid-cols-3 gap-3">
                        {saverOpt && (
                          <button
                            type="button"
                            onClick={() => handleDeliveryOptionSelect('saver')}
                            className={`p-4 border-2 rounded-lg text-center transition-all relative ${
                              deliveryOption === 'saver'
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {saverOpt.label || 'Saver'}
                            </p>
                            <p className="text-base font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              £{applyVatMode(getPriceForQuantity(quantity, 'saver') || 0).toFixed(2)}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {expectedDeliveryByOption.saver ? `ETA: ${new Date(expectedDeliveryByOption.saver).toLocaleDateString()}` : 'ETA: Enter postcode'}
                            </p>
                          </button>
                        )}
                        {standardOpt && (
                          <button
                            type="button"
                            onClick={() => handleDeliveryOptionSelect('standard')}
                            className={`p-4 border-2 rounded-lg text-center transition-all ${
                              deliveryOption === 'standard'
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {standardOpt.label || 'Standard'}
                            </p>
                            <p className="text-base font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              £{applyVatMode(getPriceForQuantity(quantity, 'standard') || 0).toFixed(2)}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {expectedDeliveryByOption.standard ? `ETA: ${new Date(expectedDeliveryByOption.standard).toLocaleDateString()}` : 'ETA: Enter postcode'}
                            </p>
                          </button>
                        )}
                        {expressOpt && (
                          <button
                            type="button"
                            onClick={() => handleDeliveryOptionSelect('express')}
                            className={`p-4 border-2 rounded-lg text-center transition-all ${
                              deliveryOption === 'express'
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {expressOpt.label || 'Express'}
                            </p>
                            <p className="text-base font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              £{applyVatMode(getPriceForQuantity(quantity, 'express') || 0).toFixed(2)}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              {expectedDeliveryByOption.express ? `ETA: ${new Date(expectedDeliveryByOption.express).toLocaleDateString()}` : 'ETA: Enter postcode'}
                            </p>
                          </button>
                        )}
                      </div>
                      </>
                    ) : (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                                  Qty
                                </th>
                                <th className={`px-4 py-3 text-center text-xs font-semibold border-r border-gray-200 ${deliveryOption === 'saver' ? 'bg-green-100 text-gray-900' : 'text-gray-700'}`} style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                                  {saverOpt?.label || 'Saver'}
                                </th>
                                <th className={`px-4 py-3 text-center text-xs font-semibold border-r border-gray-200 ${deliveryOption === 'standard' ? 'bg-green-100 text-gray-900' : 'text-gray-700'}`} style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                                  {standardOpt?.label || 'Standard'}
                                </th>
                                <th className={`px-4 py-3 text-center text-xs font-semibold ${deliveryOption === 'express' ? 'bg-green-100 text-gray-900' : 'text-gray-700'}`} style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                                  {expressOpt?.label || 'Express'}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {pricingGrid.map((row) => (
                                <tr key={row.qty} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                                    {row.qty}
                                  </td>
                                  <td
                                    className={`px-4 py-3 text-center text-sm border-r border-gray-200 cursor-pointer ${
                                      deliveryOption === 'saver' && row.qty === quantity ? 'bg-green-100 font-semibold' : 'text-gray-900'
                                    }`}
                                    onClick={() => { handleDeliveryOptionSelect('saver'); setQuantity(row.qty); }}
                                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                  >
                                    £{applyVatMode(Number(row.saver || 0)).toFixed(2)}
                                  </td>
                                  <td
                                    className={`px-4 py-3 text-center text-sm border-r border-gray-200 cursor-pointer ${
                                      deliveryOption === 'standard' && row.qty === quantity ? 'bg-green-100 font-semibold' : 'text-gray-900'
                                    }`}
                                    onClick={() => { handleDeliveryOptionSelect('standard'); setQuantity(row.qty); }}
                                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                  >
                                    £{applyVatMode(Number(row.standard || 0)).toFixed(2)}
                                  </td>
                                  <td
                                    className={`px-4 py-3 text-center text-sm cursor-pointer ${
                                      deliveryOption === 'express' && row.qty === quantity ? 'bg-green-100 font-semibold' : 'text-gray-900'
                                    }`}
                                    onClick={() => { handleDeliveryOptionSelect('express'); setQuantity(row.qty); }}
                                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                                  >
                                    £{applyVatMode(Number(row.express || 0)).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity & Actions */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Quantity
                    </label>
                    {quantitiesOptions.length > 0 ? (
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      >
                        {quantitiesOptions.map((q) => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    ) : (
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
                    )}
                  </div>

                  {/* Design Options */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    {(() => {
                      const showEditor = displayProduct?.uiOptions?.showEditorButton ?? true;
                      const showUpload = displayProduct?.uiOptions?.showUploadDesignButton ?? true;

                      if (!showEditor && !showUpload) {
                        return (
                          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              No design required
                            </p>
                            <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                              This product doesn’t require a design upload or editor.
                            </p>
                          </div>
                        );
                      }

                      // Ensure current selection stays valid when one option is disabled
                      if (!showEditor && designOption === 'custom') {
                        setTimeout(() => setDesignOption('upload'), 0);
                      }
                      if (!showUpload && designOption === 'upload') {
                        setTimeout(() => setDesignOption('custom'), 0);
                      }

                      return null;
                    })()}

                    {/* Online Designer Option */}
                    {(displayProduct?.uiOptions?.showEditorButton ?? true) && (
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
                            Online Designer
                          </div>
                          <div className="text-xs text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            I'll design it by myself using the designer tool. It's free.
                          </div>
                        </div>
                      </label>
                    )}

                    {/* Upload Design Option */}
                    {(displayProduct?.uiOptions?.showUploadDesignButton ?? true) && (
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
                            Upload Artwork
                          </div>
                        <div className="text-xs text-gray-600 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          I'll upload my own artwork.
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
                    )}
                  </div>

                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                {/* Features */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
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
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
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
          </div>
        </div>
      </div>

      {/* SEO + UX content sections */}
      <section className="container mx-auto px-4 lg:px-8 max-w-7xl mt-12 space-y-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Designer Workflow
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold text-gray-900 mt-2"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            How Our Designer Tool Works
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-2 max-w-3xl" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            A clear, guided process to help you create accurate print-ready artwork and place your order with confidence.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              {
                id: '01',
                step: 'Choose Options',
                text: 'Select size, material, finish and quantity so your pricing and output are aligned.',
              },
              {
                id: '02',
                step: 'Create or Upload',
                text: 'Design online using our editor, or upload your own ready-to-print artwork.',
              },
              {
                id: '03',
                step: 'Preview & Review',
                text: 'Review alignment, content and quality before finalising your product setup.',
              },
              {
                id: '04',
                step: 'Secure Checkout',
                text: 'Complete payment safely and we move your order directly into production.',
              },
            ].map((item) => (
              <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-gray-900 text-white text-[11px] font-semibold">
                    {item.id}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {item.step}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Why Customers Choose RSPUK
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mt-5">
            {[
              {
                title: 'Professional Print Quality',
                text: 'Consistent finishes, accurate color output and premium production standards for every order.',
              },
              {
                title: 'Flexible Delivery Options',
                text: 'Choose saver, standard or express timelines to match campaign or launch deadlines.',
              },
              {
                title: 'Helpful UK-Based Support',
                text: 'Get practical help on artwork setup, materials and product selections before you buy.',
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-gray-200 p-4 bg-white"
              >
                <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Product FAQs
          </h2>
          <dl className="mt-5 space-y-3">
            {Array.isArray(displayProduct?.faqs) && displayProduct.faqs.length > 0 ? (
              displayProduct.faqs.map((faq, index) => (
                <div key={`${faq?.question || 'faq'}-${index}`} className="rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/40">
                  <dt className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {faq.question}
                  </dt>
                  <dd className="text-xs text-gray-600 mt-1.5 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {faq.answer}
                  </dd>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/40">
                <dt className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  FAQs coming soon
                </dt>
                <dd className="text-xs text-gray-600 mt-1.5 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Product-specific FAQs can be configured from the Admin Dashboard.
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Secure Payment & Checkout
          </h2>
          <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Shop with confidence. Your payment is processed through secure, encrypted checkout infrastructure.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-5">
            {[
              {
                title: 'Encrypted Card Processing',
                text: 'Sensitive payment data is captured via secure hosted fields to help protect your information.',
              },
              {
                title: 'Trusted Payment Gateway',
                text: 'Transactions are handled by established payment partners with industry-standard security controls.',
              },
              {
                title: 'Instant Order Confirmation',
                text: 'Once payment is successful, you receive confirmation and your order moves into production.',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-xl border border-gray-200 p-4 bg-gray-50/40">
                <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* End strip (product detail only) */}
      <EndBenefitsStrip />

      {/* Sticky Bill Bar (product detail) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-baseline gap-3">
                <div className="text-lg md:text-xl font-black text-gray-900 whitespace-nowrap">
                  {isBusinessCard() ? getDeliveryDateLabel() : 'Total'}
                </div>
                <div className="text-lg md:text-xl font-black text-gray-900 whitespace-nowrap" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  £{applyVatMode(getPriceExVat()).toFixed(2)}
                  <span className="ml-2 text-xs font-semibold text-gray-700">{isVatInclusive ? 'Inc Vat' : 'Ex Vat'}</span>
                </div>
              </div>
              <div className="text-sm text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                £{(isVatInclusive ? getPriceExVat() : getPriceIncVat()).toFixed(2)} <span className="text-xs">{isVatInclusive ? 'Ex Vat' : 'Inc Vat'}</span>
              </div>
            </div>

            <button
              onClick={designOption === 'upload' ? handleAddToCart : handleDesignProduct}
              className={`flex-shrink-0 px-6 md:px-10 py-3 rounded text-white font-bold text-sm md:text-base transition-colors w-[55%] md:w-[520px] text-center ${
                designOption === 'upload'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              style={{ fontFamily: 'Lexend Deca, sans-serif' }}
            >
              {designOption === 'upload' ? 'Add To Basket' : 'Design Your Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
