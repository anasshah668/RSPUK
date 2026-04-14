import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { quoteService } from '../services/quoteService';
import { categoryService } from '../services/categoryService';
import { thirdPartyService } from '../services/thirdPartyService';
import { neonPricingService } from '../services/neonPricingService';
import AdminNeonPricingTab from '../components/AdminNeonPricingTab';

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, authReady, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [neonPricingSettings, setNeonPricingSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return;
    if (user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [activeTab, user, authReady]);

  useEffect(() => {
    if (activeTab !== 'quotes' || user?.role !== 'admin') return undefined;

    const intervalId = setInterval(() => {
      fetchData();
    }, 20000);

    return () => clearInterval(intervalId);
  }, [activeTab, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const data = await adminService.analytics();
        setAnalytics(data);
      } else if (activeTab === 'products') {
        const data = await productService.list();
        setProducts(data.products || []);
      } else if (activeTab === 'orders') {
        const data = await orderService.list();
        setOrders(data.orders || []);
      } else if (activeTab === 'quotes') {
        const data = await quoteService.list();
        setQuotes(data.quotes || []);
      } else if (activeTab === 'categories') {
        const data = await categoryService.listAll();
        setCategories(data.categories || []);
      } else if (activeTab === 'neon-pricing') {
        const data = await neonPricingService.getAdmin();
        setNeonPricingSettings(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(String(orderId), newStatus);
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.message || 'Failed to update order');
    }
  };

  const handleQuoteResponse = async (quoteId, response) => {
    try {
      await quoteService.update(quoteId, response);
      toast.success('Quote updated');
      fetchData();
    } catch (error) {
      console.error('Error responding to quote:', error);
      toast.error(error.message || 'Failed to update quote');
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Dark theme like main header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <img 
                  src="/logo.png" 
                  alt="RER Logo" 
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div 
                  className="hidden text-3xl font-bold items-center"
                  style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                >
                  <span className="text-blue-500">R</span>
                  <span className="text-white">ER</span>
                </div>
              </div>
              <h1
                className="text-2xl font-bold text-white"
              >
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="text-gray-200 hover:text-white font-medium flex items-center gap-2 transition-colors text-sm"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to site
              </button>
              <button
                onClick={async () => {
                  await logout();
                  toast.info('Logged out');
                  navigate('/admin/login');
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {['overview', 'products', 'categories', 'orders', 'quotes', 'neon-pricing', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold text-sm transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                {tab === 'neon-pricing' ? 'Neon pricing' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
            {activeTab === 'products' && <ProductsTab products={products} onRefresh={fetchData} />}
            {activeTab === 'categories' && (
              <CategoriesTab categories={categories} onRefresh={fetchData} />
            )}
            {activeTab === 'orders' && (
              <OrdersTab orders={orders} onStatusUpdate={handleOrderStatusUpdate} />
            )}
            {activeTab === 'quotes' && (
              <QuotesTab quotes={quotes} onResponse={handleQuoteResponse} />
            )}
            {activeTab === 'neon-pricing' && (
              neonPricingSettings ? (
                <AdminNeonPricingTab
                  settings={neonPricingSettings}
                  onSaved={(data) => setNeonPricingSettings(data)}
                />
              ) : (
                <p className="text-red-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  Could not load neon pricing settings. Ensure the API is running and you are signed in as admin.
                </p>
              )
            )}
            {activeTab === 'settings' && <SettingsTab />}
          </>
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ analytics }) => {
  if (!analytics) return null;

  const stats = [
    { label: 'Total Orders', value: analytics.overview?.totalOrders || 0, color: 'blue' },
    { label: 'Total Revenue', value: `£${(analytics.overview?.totalRevenue || 0).toLocaleString()}`, color: 'green' },
    { label: 'Total Users', value: analytics.overview?.totalUsers || 0, color: 'purple' },
    { label: 'Total Products', value: analytics.overview?.totalProducts || 0, color: 'orange' },
    { label: 'Pending Quotes', value: analytics.overview?.pendingQuotes || 0, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Dashboard Overview
      </h2>

      {Number(analytics?.overview?.pendingQuotes || 0) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            Pending Quotes Alert
          </p>
          <p className="text-sm text-amber-800 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            You have {Number(analytics?.overview?.pendingQuotes || 0)} pending quote(s) to review.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              {stat.label}
            </p>
            <p className={`text-3xl font-bold text-${stat.color}-600`} style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {analytics.revenueByMonth && analytics.revenueByMonth.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Revenue by Month
          </h3>
          <div className="space-y-2">
            {analytics.revenueByMonth.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                  {month._id}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-900 font-semibold" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    £{month.revenue.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {month.orders} orders
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Products Tab Component
const ProductsTab = ({ products, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDelete = async (productId) => {
    try {
      await productService.delete(productId);
      toast.success('Product deleted');
      setDeleteConfirm(null);
      onRefresh && onRefresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Products Management
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
        >
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 capitalize">{product.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">£{product.basePrice}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showAddModal || editingProduct) && (
        <AddProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSaved={() => {
            setShowAddModal(false);
            setEditingProduct(null);
            onRefresh && onRefresh();
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Delete Product
            </h3>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Add Product modal
const AddProductModal = ({ product, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: '',
    featuresText: '',
    faqsText: '',
    specificationsText: '',
    isActive: true,
    uiOptions: {
      showEditorButton: true,
      showUploadDesignButton: true,
    },
    sizeOptions: {
      enabled: false,
      required: false,
      options: [], // [{ label, value }]
    },
    pricingTable: {
      enabled: false,
      quantities: '250,500,1000',
      saverPrices: '',
      standardPrices: '',
      expressPrices: '',
      saverEtaDays: 6,
      standardEtaDays: 4,
      expressEtaDays: 2,
    },
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Populate form when editing product
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        basePrice: product.basePrice || '',
        featuresText: Array.isArray(product.features) ? product.features.join('\n') : '',
        faqsText: Array.isArray(product.faqs)
          ? product.faqs
              .map((item) => `${item?.question || ''} || ${item?.answer || ''}`)
              .join('\n')
          : '',
        specificationsText: product.specifications && typeof product.specifications === 'object'
          ? Object.entries(product.specifications)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')
          : '',
        isActive: product.isActive !== undefined ? product.isActive : true,
        uiOptions: {
          showEditorButton: product.uiOptions?.showEditorButton ?? true,
          showUploadDesignButton: product.uiOptions?.showUploadDesignButton ?? true,
        },
        sizeOptions: {
          enabled: product.sizeOptions?.enabled ?? false,
          required: product.sizeOptions?.required ?? false,
          options: product.sizeOptions?.options ?? [],
        },
        pricingTable: {
          enabled: product.pricingTable?.enabled ?? false,
          quantities: (product.pricingTable?.quantities || []).join(','),
          saverPrices: (() => {
            const opt = (product.pricingTable?.deliveryOptions || []).find(o => o.key === 'saver');
            return (opt?.prices || []).join(',');
          })(),
          standardPrices: (() => {
            const opt = (product.pricingTable?.deliveryOptions || []).find(o => o.key === 'standard');
            return (opt?.prices || []).join(',');
          })(),
          expressPrices: (() => {
            const opt = (product.pricingTable?.deliveryOptions || []).find(o => o.key === 'express');
            return (opt?.prices || []).join(',');
          })(),
          saverEtaDays: (() => {
            const opt = (product.pricingTable?.deliveryOptions || []).find(o => o.key === 'saver');
            return opt?.etaDays ?? 6;
          })(),
          standardEtaDays: (() => {
            const opt = (product.pricingTable?.deliveryOptions || []).find(o => o.key === 'standard');
            return opt?.etaDays ?? 4;
          })(),
          expressEtaDays: (() => {
            const opt = (product.pricingTable?.deliveryOptions || []).find(o => o.key === 'express');
            return opt?.etaDays ?? 2;
          })(),
        },
      });
      setFiles([]); // Reset files when editing
    } else {
      // Reset form when adding new product
      setFormData({
        name: '',
        description: '',
        category: '',
        basePrice: '',
        featuresText: '',
        faqsText: '',
        specificationsText: '',
        isActive: true,
        uiOptions: {
          showEditorButton: true,
          showUploadDesignButton: true,
        },
        sizeOptions: {
          enabled: false,
          required: false,
          options: [],
        },
        pricingTable: {
          enabled: false,
          quantities: '250,500,1000',
          saverPrices: '',
          standardPrices: '',
          expressPrices: '',
          saverEtaDays: 6,
          standardEtaDays: 4,
          expressEtaDays: 2,
        },
      });
      setFiles([]);
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      // Use centralized service
      const data = await categoryService.listAll();
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
        // Set default category only if not editing and category is not set
        if (!product && !formData.category) {
          const activeCategory = data.categories.find(cat => cat.isActive) || data.categories[0];
          if (activeCategory) {
            setFormData(prev => ({ ...prev, category: activeCategory.name }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback: try public endpoint if admin endpoint fails
      try {
        const data = await categoryService.list();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          const activeCategory = data.categories.find(cat => cat.isActive) || data.categories[0];
          if (activeCategory) {
            setFormData(prev => ({ ...prev, category: activeCategory.name }));
          }
        }
      } catch (fallbackError) {
        console.error('Error fetching categories from public endpoint:', fallbackError);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';

    const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!stripHtml(formData.description)) newErrors.description = 'Description is required';

    if (String(formData.basePrice || '').trim() !== '' && Number.isNaN(Number(formData.basePrice))) {
      newErrors.basePrice = 'Valid price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const features = String(formData.featuresText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const specifications = String(formData.specificationsText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .reduce((acc, line) => {
          const separatorIndex = line.indexOf(':');
          if (separatorIndex === -1) return acc;
          const key = line.slice(0, separatorIndex).trim();
          const value = line.slice(separatorIndex + 1).trim();
          if (key && value) acc[key] = value;
          return acc;
        }, {});

      const faqs = String(formData.faqsText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split('||');
          if (parts.length < 2) return null;
          const question = String(parts[0] || '').trim();
          const answer = String(parts.slice(1).join('||') || '').trim();
          if (!question || !answer) return null;
          return { question, answer };
        })
        .filter(Boolean);

      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        ...(String(formData.basePrice || '').trim() !== '' ? { basePrice: String(formData.basePrice) } : {}),
        features,
        faqs,
        specifications,
        isActive: String(formData.isActive),
        uiOptions: formData.uiOptions,
        sizeOptions: formData.sizeOptions,
      };

      console.log('[Admin] Product payload:', payload);

      // Use centralized service
      if (product) {
        await productService.update(product._id, payload, files);
      } else {
        await productService.create(payload, files);
      }

      onSaved && onSaved();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] sm:w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xl font-bold text-gray-900"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            {product ? 'Edit Product' : 'Add Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {submitError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className={`rounded-lg overflow-hidden border ${errors.description ? 'border-red-500' : 'border-gray-300'}`}>
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link'],
                    ['clean'],
                  ],
                }}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full text-sm text-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              You can upload up to 5 images. First image will be used as the main product image.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {categories.length === 0 ? (
                  <option value="">Loading categories...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.displayName} {!category.isActive && '(Inactive)'}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (£)
              </label>
              <input
                type="number"
                step="0.01"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.basePrice ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.basePrice && (
                <p className="mt-1 text-xs text-red-600">{errors.basePrice}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features (one per line)
              </label>
              <textarea
                name="featuresText"
                value={formData.featuresText}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder={`Premium print quality\nFast turnaround\nEco-friendly stock`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                FAQs (one per line, format: Question || Answer)
              </label>
              <textarea
                name="faqsText"
                value={formData.faqsText}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder={`Can I upload my own artwork? || Yes, you can upload your print-ready file.\nHow long does delivery take? || Delivery depends on the selected service level.`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specifications (Key: Value, one per line)
              </label>
              <textarea
                name="specificationsText"
                value={formData.specificationsText}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder={`Paper Type: 450gsm Silk\nSize: 85 x 55mm\nFinish: Matt`}
              />
            </div>
          </div>

          {/* Product page toggles + optional size options */}
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Product page options
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                <input
                  type="checkbox"
                  checked={!!formData.uiOptions?.showEditorButton}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      uiOptions: { ...(prev.uiOptions || {}), showEditorButton: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                Show editor button
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                <input
                  type="checkbox"
                  checked={!!formData.uiOptions?.showUploadDesignButton}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      uiOptions: { ...(prev.uiOptions || {}), showUploadDesignButton: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                Show upload design button
              </label>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                <input
                  type="checkbox"
                  checked={!!formData.sizeOptions?.enabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sizeOptions: { ...(prev.sizeOptions || {}), enabled: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                Enable size selection
              </label>

              {formData.sizeOptions?.enabled && (
                <div className="mt-3 space-y-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    <input
                      type="checkbox"
                      checked={!!formData.sizeOptions?.required}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sizeOptions: { ...(prev.sizeOptions || {}), required: e.target.checked },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    Size required before add to basket
                  </label>

                  <div className="space-y-2">
                    {(formData.sizeOptions?.options || []).map((opt, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={opt?.widthMM ?? ''}
                          placeholder="Width (mm)"
                          className="col-span-6 sm:col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm w-full"
                          onChange={(e) => {
                            const widthMM = e.target.value === '' ? '' : Number(e.target.value);
                            const next = [...(formData.sizeOptions?.options || [])];
                            const current = next[idx] || {};
                            next[idx] = { ...current, widthMM };
                            // Auto label/value for mm sizes
                            const h = (next[idx]?.heightMM ?? '');
                            if (widthMM && h) {
                              next[idx].label = `${widthMM}mm x ${h}mm`;
                              next[idx].value = `${widthMM}x${h}`;
                            }
                            setFormData((prev) => ({
                              ...prev,
                              sizeOptions: { ...(prev.sizeOptions || {}), options: next },
                            }));
                          }}
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          value={opt?.heightMM ?? ''}
                          placeholder="Height (mm)"
                          className="col-span-6 sm:col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm w-full"
                          onChange={(e) => {
                            const heightMM = e.target.value === '' ? '' : Number(e.target.value);
                            const next = [...(formData.sizeOptions?.options || [])];
                            const current = next[idx] || {};
                            next[idx] = { ...current, heightMM };
                            // Auto label/value for mm sizes
                            const w = (next[idx]?.widthMM ?? '');
                            if (w && heightMM) {
                              next[idx].label = `${w}mm x ${heightMM}mm`;
                              next[idx].value = `${w}x${heightMM}`;
                            }
                            setFormData((prev) => ({
                              ...prev,
                              sizeOptions: { ...(prev.sizeOptions || {}), options: next },
                            }));
                          }}
                        />
                        <input
                          type="text"
                          value={opt?.label || ''}
                          readOnly
                          placeholder="200mm x 300mm"
                          className="col-span-9 sm:col-span-5 px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-700 w-full"
                        />
                        <button
                          type="button"
                          className="col-span-3 sm:col-span-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 w-full flex items-center justify-center"
                          onClick={() => {
                            const next = (formData.sizeOptions?.options || []).filter((_, i) => i !== idx);
                            setFormData((prev) => ({
                              ...prev,
                              sizeOptions: { ...(prev.sizeOptions || {}), options: next },
                            }));
                          }}
                          aria-label="Remove size"
                          title="Remove size"
                        >
                          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          sizeOptions: {
                            ...(prev.sizeOptions || {}),
                            options: [...((prev.sizeOptions?.options) || []), { widthMM: '', heightMM: '', label: '', value: '' }],
                          },
                        }))
                      }
                    >
                      + Add size
                    </button>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Enter size in millimeters. It will be stored as e.g. "200mm x 300mm".
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (product ? 'Updating...' : 'Saving...') : (product ? 'Update Product' : 'Save Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const orderIdShort = (order) => {
  const raw = order?._id != null ? String(order._id) : '';
  if (raw.length <= 10) return raw || '—';
  return `#${raw.slice(-8)}`;
};

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;
  const isCheckout = order.orderKind === 'checkout';
  const cust = isCheckout ? order.customer : null;
  const user = order.user;
  const od = order.orderDetails && typeof order.orderDetails === 'object' ? order.orderDetails : {};
  const summaryLines = Array.isArray(od.summary) ? od.summary : [];
  const shopItems =
    Array.isArray(order.items) && order.items.length > 0
      ? order.items
      : (Array.isArray(order.orderItems) ? order.orderItems : []);
  const shopGlobalInputsEntries =
    !isCheckout && order.globalInputs && typeof order.globalInputs === 'object'
      ? Object.entries(order.globalInputs).filter(([, v]) => v != null && String(v).trim() !== '')
      : [];
  const itemOptionEntries = (it) => {
    const fromObjects = [
      it?.customization,
      it?.variant,
      it?.selectedAttributes,
    ]
      .filter((o) => o && typeof o === 'object')
      .flatMap((obj) => Object.entries(obj));
    const explicit = [
      ['Size', it?.size],
      ['Material', it?.material],
      ['Sides Printed', it?.sidesPrinted],
      ['Lamination', it?.lamination],
      ['Round Corners', it?.roundCorners],
      ['Delivery Option', it?.deliveryOption],
      ['Design Option', it?.designOption],
    ];
    return [...fromObjects, ...explicit]
      .filter(([k, v]) => k && v != null && String(v).trim() !== '')
      .filter(([k]) => !['id', '_id', 'product', 'price', 'quantity', 'name'].includes(String(k).toLowerCase()));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Order details</p>
            <h3 id="order-detail-title" className="text-lg font-bold text-gray-900 mt-0.5">
              {orderIdShort(order)}
              {isCheckout ? (
                <span className="ml-2 text-xs font-semibold align-middle px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Paid · Worldpay
                </span>
              ) : (
                <span className="ml-2 text-xs font-semibold align-middle px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  Shop
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none px-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5 text-sm">
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Customer</h4>
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 space-y-1 text-gray-800">
              {isCheckout ? (
                <>
                  <p><span className="text-gray-500">Name:</span> {cust?.name || '—'}</p>
                  <p><span className="text-gray-500">Email:</span> {cust?.email || '—'}</p>
                  <p><span className="text-gray-500">Phone:</span> {cust?.phone || '—'}</p>
                  <p><span className="text-gray-500">Address:</span> {[cust?.address, cust?.city, cust?.postalCode].filter(Boolean).join(', ') || '—'}</p>
                </>
              ) : (
                <>
                  <p><span className="text-gray-500">Name:</span> {user?.name || order.shippingAddress?.name || '—'}</p>
                  <p><span className="text-gray-500">Email:</span> {user?.email || order.customer?.email || '—'}</p>
                  <p><span className="text-gray-500">Phone:</span> {order.shippingAddress?.phone || order.customer?.phone || '—'}</p>
                  {order.shippingAddress ? (
                    <p>
                      <span className="text-gray-500">Ship to:</span>{' '}
                      {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.zipCode, order.shippingAddress.country].filter(Boolean).join(', ') || '—'}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </section>

          {isCheckout ? (
            <section>
              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Payment</h4>
              <div className="rounded-lg border border-gray-100 p-3 space-y-1 font-mono text-xs">
                <p><span className="text-gray-500 font-sans">Reference:</span> {order.orderReference || '—'}</p>
                <p><span className="text-gray-500 font-sans">Payment ID:</span> {order.paymentId || '—'}</p>
                <p><span className="text-gray-500 font-sans">Tracking ID:</span> {order.trackingNumber || '—'}</p>
                <p><span className="text-gray-500 font-sans">Outcome:</span> {order.worldpay?.outcome || order.worldpay?.paymentStatus || '—'}</p>
              </div>
            </section>
          ) : null}

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
              {isCheckout ? 'Order' : 'Items & totals'}
            </h4>
            {isCheckout ? (
              <div className="space-y-3">
                {od.title ? <p className="font-semibold text-gray-900">{od.title}</p> : null}
                {od.description ? <p className="text-gray-600 text-sm whitespace-pre-wrap">{od.description}</p> : null}
                {summaryLines.length > 0 ? (
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <tbody className="divide-y divide-gray-100">
                      {summaryLines.map((row, i) => (
                        <tr key={`${row.label}-${i}`} className="bg-white">
                          <td className="px-3 py-2 text-gray-500 w-2/5">{row.label}</td>
                          <td className="px-3 py-2 text-gray-900">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
                <p className="text-base font-bold text-gray-900 pt-1">
                  Total: {order.currency === 'GBP' ? '£' : `${order.currency || ''} `}
                  {Number(order.total || 0).toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {shopGlobalInputsEntries.length > 0 ? (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Selected options
                    </div>
                    <dl className="divide-y divide-gray-100">
                      {shopGlobalInputsEntries.map(([k, v]) => (
                        <div key={k} className="px-3 py-2 flex items-start justify-between gap-3">
                          <dt className="text-gray-500 capitalize">{String(k).replace(/([A-Z])/g, ' $1')}</dt>
                          <dd className="text-gray-900 text-right break-words">{String(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
                {shopItems.length === 0 ? (
                  <p className="text-gray-500">No line items on record.</p>
                ) : (
                  <div className="space-y-2">
                    {shopItems.map((it, i) => {
                      const optEntries = itemOptionEntries(it);
                      return (
                        <div key={i} className="border border-gray-200 rounded-lg p-3 bg-white">
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {it.product?.name || it.name || 'Product'} × {Number(it.quantity || 1)}
                              </p>
                              {it.design?.previewImage ? (
                                <a
                                  href={it.design.previewImage}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  View artwork preview
                                </a>
                              ) : null}
                            </div>
                            <p className="tabular-nums font-semibold text-gray-900">
                              £{Number(it.price || 0).toFixed(2)}
                            </p>
                          </div>
                          {optEntries.length > 0 ? (
                            <dl className="mt-2 pt-2 border-t border-gray-100 grid gap-1.5">
                              {optEntries.map(([k, v], idx) => (
                                <div key={`${k}-${idx}`} className="flex justify-between gap-3 text-xs">
                                  <dt className="text-gray-500 capitalize">{String(k).replace(/([A-Z])/g, ' $1')}</dt>
                                  <dd className="text-gray-900 text-right break-words">{String(v)}</dd>
                                </div>
                              ))}
                            </dl>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-700">
                  {order.subtotal != null ? <span>Subtotal: £{Number(order.subtotal).toFixed(2)}</span> : null}
                  {order.shippingCost != null ? <span>Shipping: £{Number(order.shippingCost).toFixed(2)}</span> : null}
                  {order.tax != null ? <span>Tax: £{Number(order.tax).toFixed(2)}</span> : null}
                </div>
                <p className="text-base font-bold text-gray-900">
                  Total: £{Number(order.total || 0).toFixed(2)}
                  {order.paymentStatus ? (
                    <span className="ml-2 text-xs font-normal text-gray-500">({order.paymentStatus})</span>
                  ) : null}
                </p>
                {order.trackingNumber ? (
                  <p className="text-sm"><span className="text-gray-500">Tracking:</span> {order.trackingNumber}</p>
                ) : null}
              </div>
            )}
          </section>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Orders Tab Component
const OrdersTab = ({ orders, onStatusUpdate }) => {
  const [detailOrder, setDetailOrder] = useState(null);

  const statusColors = {
    waiting: 'bg-amber-100 text-amber-800',
    inprocess: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Orders Management
      </h2>
      <p className="text-sm text-gray-600 max-w-3xl">
        Includes shop orders and successful Worldpay checkouts. Open <strong>View</strong> for full customer, payment reference, and line details.
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                  No orders yet. Successful checkouts will appear here after payment.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isCheckout = order.orderKind === 'checkout';
                const custName = isCheckout ? order.customer?.name : order.user?.name;
                const custEmail = isCheckout ? order.customer?.email : order.user?.email;
                const projectLabel =
                  order.orderDetails?.title
                  || order.productType
                  || order.globalInputs?.productType
                  || order.orderItems?.[0]?.name
                  || (isCheckout ? 'Checkout' : 'General order');
                const cur = order.currency || 'GBP';
                const sym = cur === 'GBP' ? '£' : `${cur} `;

                return (
                  <tr key={String(order._id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {orderIdShort(order)}
                      </div>
                      {order.trackingNumber ? (
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">{order.trackingNumber}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isCheckout ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                          Worldpay
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          Shop
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{custName || '—'}</div>
                      <div className="text-sm text-gray-500">{custEmail || ''}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {projectLabel}
                      </div>
                      {!isCheckout && order.globalInputs?.width && order.globalInputs?.height ? (
                        <div className="text-xs text-gray-500">
                          {order.globalInputs.width} × {order.globalInputs.height} {order.globalInputs.unit || ''}
                          {order.globalInputs?.quantity ? ` · Qty ${order.globalInputs.quantity}` : ''}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 tabular-nums">
                        {sym}{Number(order.total || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status || 'waiting'}
                        onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                        className={`px-3 py-1 text-xs rounded-full border-0 ${statusColors[order.status] || statusColors.waiting}`}
                      >
                        <option value="waiting">Waiting</option>
                        <option value="inprocess">In Process</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        type="button"
                        onClick={() => setDetailOrder(order)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
    </div>
  );
};

// Quotes Tab Component
const QuotesTab = ({ quotes, onResponse }) => {
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusPillClasses = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'new') return 'bg-red-50 text-red-700 ring-red-600/10';
    if (s === 'quoted') return 'bg-blue-50 text-blue-700 ring-blue-600/10';
    if (s === 'contacted') return 'bg-amber-50 text-amber-700 ring-amber-600/10';
    return 'bg-emerald-50 text-emerald-700 ring-emerald-600/10';
  };

  const handleQuoteSelect = async (quote) => {
    setSelectedQuote(quote);
    setResponseText(quote?.adminResponse || '');
    setQuotedPrice(quote?.quotedPrice || '');

    // Mark quote as opened/read by moving from "new" to "contacted"
    if (quote.status === 'new') {
      try {
        await onResponse(quote._id, { status: 'contacted' });
        setSelectedQuote((prev) => (prev?._id === quote._id ? { ...prev, status: 'contacted' } : prev));
      } catch (error) {
        console.error('Error marking quote as contacted:', error);
      }
    }
  };

  const handleSubmitResponse = () => {
    if (!selectedQuote?._id) return;
    quoteService
      .sendQuotationEmail(selectedQuote._id, {
        status: 'quoted',
        adminResponse: responseText,
        quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
      })
      .then(() => {
        toast.success('Response submitted and email sent to customer');
        onResponse(selectedQuote._id, {
          status: 'quoted',
          adminResponse: responseText,
          quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
        });
        setSelectedQuote(null);
        setResponseText('');
        setQuotedPrice('');
      })
      .catch((error) => {
        console.error('Error submitting response email:', error);
        toast.error(error.message || 'Failed to send response email.');
      });
  };

  const handleSendQuotationEmail = () => {
    if (!selectedQuote?._id) return;
    quoteService
      .sendQuotationEmail(selectedQuote._id, {
        status: 'quoted',
        adminResponse: responseText,
        quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
      })
      .then(() => {
        toast.success('Quotation email sent to customer');
        onResponse(selectedQuote._id, {
          status: 'quoted',
          adminResponse: responseText,
          quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
        });
      })
      .catch((error) => {
        console.error('Error sending quotation email:', error);
        toast.error(error.message || 'Failed to send quotation email.');
      });
  };

  const parseFeatured = (q) => {
    const note = String(q?.additionalInfo || '');
    const marker = 'Featured Request • ';
    if (note.includes(marker)) {
      const slug = note.split(marker)[1]?.split('\n')[0]?.trim();
      return slug || true;
    }
    return null;
  };

  const isQuotePending = (q) => {
    const status = String(q?.status || '').toLowerCase();
    const customerReplyAt = q?.customerRepliedAt ? new Date(q.customerRepliedAt).getTime() : 0;
    const respondedAt = q?.respondedAt ? new Date(q.respondedAt).getTime() : 0;
    return status === 'new' || status === 'contacted' || customerReplyAt > respondedAt;
  };

  const getConversation = (quote) => {
    const thread = Array.isArray(quote?.conversation)
      ? quote.conversation
          .filter((entry) => String(entry?.message || '').trim())
          .map((entry) => ({
            sender: entry.sender === 'admin' ? 'admin' : 'customer',
            message: String(entry.message || '').trim(),
            sentAt: entry.sentAt || quote?.updatedAt || quote?.createdAt,
          }))
      : [];

    if (thread.length > 0) {
      return [...thread].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    }

    // Backward compatibility for old quotes that only stored latest fields
    const fallback = [];
    if (quote?.message) {
      fallback.push({
        sender: 'customer',
        message: quote.message,
        sentAt: quote.createdAt,
      });
    }
    if (quote?.adminResponse) {
      fallback.push({
        sender: 'admin',
        message: quote.adminResponse,
        sentAt: quote.respondedAt || quote.updatedAt || quote.createdAt,
      });
    }
    if (quote?.customerReply) {
      fallback.push({
        sender: 'customer',
        message: quote.customerReply,
        sentAt: quote.customerRepliedAt || quote.updatedAt || quote.createdAt,
      });
    }
    return fallback;
  };

  useEffect(() => {
    if (!selectedQuote?._id) return;
    const freshQuote = quotes.find((q) => q._id === selectedQuote._id);
    if (freshQuote) {
      setSelectedQuote(freshQuote);
      setResponseText(freshQuote?.adminResponse || '');
      setQuotedPrice(freshQuote?.quotedPrice || '');
    }
  }, [quotes, selectedQuote?._id]);

  const filteredQuotes = quotes.filter((q) => {
    const matchStatus = filterStatus === 'all' ? true : (String(q.status || '').toLowerCase() === filterStatus);
    const s = searchTerm.trim().toLowerCase();
    const matchSearch = !s
      ? true
      : [q.name, q.email, q.phone, q.projectType, q.additionalInfo]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(s));
    return matchStatus && matchSearch;
  }).sort((a, b) => {
    const pendingA = isQuotePending(a) ? 1 : 0;
    const pendingB = isQuotePending(b) ? 1 : 0;
    if (pendingA !== pendingB) return pendingB - pendingA;
    const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
    const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
    return bTime - aTime;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Quote Requests
      </h2>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
          </select>
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Search name, email, project..."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredQuotes.map((quote) => (
              <div
                key={quote._id}
                onClick={() => handleQuoteSelect(quote)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedQuote?._id === quote._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <span>{quote.name}</span>
                      {isQuotePending(quote) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-gray-500">{quote.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">{quote.projectType}</p>
                      {parseFeatured(quote) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                          Featured
                        </span>
                      ) : null}
                      {quote.customerReply ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Customer replied
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    quote.status === 'new' ? 'bg-red-100 text-red-800' :
                    quote.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {quote.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedQuote && (
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b bg-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote?.name || 'Quote Details'}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    <span className="truncate">{selectedQuote?.email || '—'}</span>
                    {selectedQuote?.phone ? <span> • {selectedQuote.phone}</span> : null}
                  </div>
                  <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Received: {selectedQuote?.createdAt ? new Date(selectedQuote.createdAt).toLocaleString() : '—'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusPillClasses(selectedQuote?.status)}`}
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    {(selectedQuote?.status || 'unknown').toString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(null)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                    style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Project Type</p>
                  <p className="font-semibold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote.projectType || '—'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Quote Type</p>
                  <p className="font-semibold text-gray-900 mt-1 capitalize" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {(selectedQuote.quoteType || 'standard').replace('-', ' ')}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Company</p>
                  <p className="font-semibold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote.company || 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Preferred Contact</p>
                  <p className="font-semibold text-gray-900 mt-1 capitalize" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote.preferredContact || 'email'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Country</p>
                  <p className="font-semibold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote.country || 'United Kingdom'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Quantity</p>
                  <p className="font-semibold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote.quantity || 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Ideal Sign Width</p>
                  <p className="font-semibold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote.idealSignWidth || 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Last Responded</p>
                  <p className="font-semibold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote.respondedAt ? new Date(selectedQuote.respondedAt).toLocaleString() : '—'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Customer Replied</p>
                  <p className="font-semibold text-gray-900 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote.customerRepliedAt ? new Date(selectedQuote.customerRepliedAt).toLocaleString() : '—'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Message</p>
                  <p className="font-medium text-gray-900 mt-2 whitespace-pre-wrap" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote.message || 'N/A'}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 p-4 bg-emerald-50/60">
                  <p className="text-xs text-emerald-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Customer Reply</p>
                  <p className="font-medium text-gray-900 mt-2 whitespace-pre-wrap" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {selectedQuote.customerReply || 'No reply from customer yet.'}
                  </p>
                </div>
                <AdditionalInfoPanel info={selectedQuote.additionalInfo} />
              </div>

              <div className="rounded-xl border border-gray-100 p-4 bg-white">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Conversation Thread
                  </p>
                  <span className="text-[11px] text-gray-400" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    {getConversation(selectedQuote).length} messages
                  </span>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {getConversation(selectedQuote).length ? (
                    getConversation(selectedQuote).map((item, idx) => (
                      <div
                        key={`${item.sentAt || 'na'}-${idx}`}
                        className={`rounded-lg border p-3 ${
                          item.sender === 'admin'
                            ? 'bg-blue-50 border-blue-100'
                            : 'bg-emerald-50 border-emerald-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-semibold uppercase tracking-wide ${
                              item.sender === 'admin' ? 'text-blue-700' : 'text-emerald-700'
                            }`}
                            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                          >
                            {item.sender === 'admin' ? 'Admin' : 'Customer'}
                          </span>
                          <span className="text-[11px] text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                            {item.sentAt ? new Date(item.sentAt).toLocaleString() : '—'}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-gray-900 whitespace-pre-wrap" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                          {item.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      No conversation yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-3" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Uploaded Artwork</p>
                {selectedQuote.artworkUrl ? (
                  <a
                    href={selectedQuote.artworkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 hover:bg-gray-50 rounded-lg p-2 -m-2"
                  >
                    <img
                      src={selectedQuote.artworkUrl}
                      alt="Uploaded artwork"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200 bg-white"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        View full image
                      </p>
                      <p className="text-xs text-blue-600 mt-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Opens in a new tab
                      </p>
                    </div>
                  </a>
                ) : (
                  <p className="font-medium text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>N/A</p>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Response
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
                      rows="5"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                      placeholder="Write a customer-friendly response..."
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Quoted Price (£)
                      </label>
                      <input
                        type="number"
                        value={quotedPrice}
                        onChange={(e) => setQuotedPrice(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        placeholder="e.g. 199.99"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                      <button
                        onClick={handleSubmitResponse}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        type="button"
                      >
                        Submit Response
                      </button>
                      <button
                        onClick={handleSendQuotationEmail}
                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
                        style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        type="button"
                      >
                        Send Quotation by Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Categories Tab Component
const CategoriesTab = ({ categories, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDelete = async (categoryId) => {
    try {
      // Use centralized service
      await categoryService.delete(categoryId);
      setDeleteConfirm(null);
      onRefresh && onRefresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Categories Management
        </h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
        >
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name (Slug)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No categories found. Add your first category to get started.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.displayName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {category.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{category.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setShowAddModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowAddModal(false);
            setEditingCategory(null);
          }}
          onSaved={() => {
            setShowAddModal(false);
            setEditingCategory(null);
            onRefresh && onRefresh();
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Delete Category
            </h3>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Are you sure you want to delete "{deleteConfirm.displayName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ category, API_BASE_URL, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    displayName: category?.displayName || '',
    description: category?.description || '',
    order: category?.order || 0,
    isActive: category?.isActive !== undefined ? category.isActive : true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name (slug) is required';
    if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required';
    if (formData.name.trim() && !/^[a-z0-9-]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name must be lowercase letters, numbers, and hyphens only';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        ...formData,
        name: formData.name.trim().toLowerCase(),
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        order: parseInt(formData.order) || 0,
      };

      // Use centralized service
      if (category) {
        await categoryService.update(category._id, payload);
      } else {
        await categoryService.create(payload);
      }

      onSaved && onSaved();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xl font-bold text-gray-900"
          >
            {category ? 'Edit Category' : 'Add Category'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {submitError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (Slug) *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., mug, pen, business-card"
              disabled={!!category}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } ${category ? 'bg-gray-100' : ''}`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Lowercase letters, numbers, and hyphens only. Cannot be changed after creation.
            </p>
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="e.g., Mug, Pen, Business Card"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.displayName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-600">{errors.displayName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Optional description for this category"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="isActive"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsTab = () => {
  const [formData, setFormData] = useState({
    enabled: true,
    prefix: 'Top Announcement',
    message: 'Price Promise | UK wide delivery',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [syncingThirdParty, setSyncingThirdParty] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [galleryProjects, setGalleryProjects] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editingGalleryProject, setEditingGalleryProject] = useState(null);
  const [gallerySaving, setGallerySaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [data, galleryData] = await Promise.all([
          adminService.getTopAnnouncement(),
          adminService.listGalleryProjectsAdmin(),
        ]);
        if (data) {
          setFormData({
            enabled: data.enabled !== false,
            prefix: data.prefix || 'Top Announcement',
            message: data.message || 'Price Promise | UK wide delivery',
          });
        }
        setGalleryProjects(Array.isArray(galleryData?.projects) ? galleryData.projects : []);
      } catch (e) {
        setError(e?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
        setGalleryLoading(false);
      }
    };
    load();
  }, []);

  const loadGalleryProjects = async () => {
    try {
      setGalleryLoading(true);
      const galleryData = await adminService.listGalleryProjectsAdmin();
      setGalleryProjects(Array.isArray(galleryData?.projects) ? galleryData.projects : []);
    } catch (e) {
      setError(e?.message || 'Failed to load gallery projects');
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');
    try {
      await adminService.updateTopAnnouncement(formData);
      setNotice('Top announcement updated successfully.');
    } catch (e) {
      setError(e?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncThirdPartyProducts = async () => {
    setSyncingThirdParty(true);
    setError('');
    setNotice('');
    setSyncResult(null);
    try {
      const response = await thirdPartyService.syncProductsToDb({ forceRefresh: true });
      setSyncResult({
        syncedCount: response?.syncedCount || 0,
        productsCount: Array.isArray(response?.products) ? response.products.length : 0,
      });
      setNotice('Third-party products synced successfully.');
    } catch (e) {
      setError(e?.message || 'Failed to sync third-party products');
    } finally {
      setSyncingThirdParty(false);
    }
  };

  const handleGalleryCreateClick = () => {
    setEditingGalleryProject(null);
    setGalleryModalOpen(true);
  };

  const handleGalleryEditClick = (project) => {
    setEditingGalleryProject(project);
    setGalleryModalOpen(true);
  };

  const handleGalleryDelete = async (projectId) => {
    const ok = window.confirm('Delete this gallery project? This cannot be undone.');
    if (!ok) return;
    try {
      await adminService.deleteGalleryProject(projectId);
      await loadGalleryProjects();
      setNotice('Gallery project deleted.');
    } catch (e) {
      setError(e?.message || 'Failed to delete gallery project');
    }
  };

  const handleGallerySave = async ({ payload, files, projectId }) => {
    try {
      setGallerySaving(true);
      if (projectId) {
        await adminService.updateGalleryProject(projectId, payload, files);
      } else {
        await adminService.createGalleryProject(payload, files);
      }
      await loadGalleryProjects();
      setGalleryModalOpen(false);
      setEditingGalleryProject(null);
      setNotice(projectId ? 'Gallery project updated.' : 'Gallery project created.');
    } catch (e) {
      setError(e?.message || 'Failed to save gallery project');
    } finally {
      setGallerySaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Site Settings</h2>

      <div className="bg-white rounded-xl shadow p-6 max-w-3xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Top Announcement Bar</h3>
        <p className="text-sm text-gray-600 mb-6" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
          Control the message displayed directly below the main header.
        </p>

        {notice ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {notice}
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSave} className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Show top announcement
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
            <input
              type="text"
              value={formData.prefix}
              onChange={(e) => setFormData((prev) => ({ ...prev, prefix: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Top Announcement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <input
              type="text"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Price Promise | UK wide delivery"
            />
            <p className="mt-1 text-xs text-gray-500">Tip: Use "|" to split segments.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Gallery Projects</h3>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
              Create and manage project galleries shown on the public Gallery page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGalleryCreateClick}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            style={{ fontFamily: 'Lexend Deca, sans-serif' }}
          >
            Add Project
          </button>
        </div>

        {galleryLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : null}

        {!galleryLoading && galleryProjects.length === 0 ? (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600 text-center">
            No gallery projects added yet.
          </div>
        ) : null}

        {!galleryLoading && galleryProjects.length > 0 ? (
          <div className="mt-5 space-y-3">
            {galleryProjects.map((project) => (
              <div key={project._id} className="rounded-xl border border-gray-200 p-4 bg-white">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">{project.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {(project.images || []).length} image(s) · Order {project.displayOrder || 0} · {project.isActive ? 'Active' : 'Hidden'}
                    </p>
                    {project.description ? (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{project.description}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGalleryEditClick(project)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGalleryDelete(project._id)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="bg-white rounded-xl shadow p-6 max-w-3xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Third-Party Product Sync</h3>
        <p className="text-sm text-gray-600 mb-6" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
          Click to fetch selected third-party products and store/update them in your product database.
        </p>

        {syncResult ? (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            Synced {syncResult.syncedCount} products ({syncResult.productsCount} filtered from source).
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSyncThirdPartyProducts}
          disabled={syncingThirdParty}
          className="px-5 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm disabled:opacity-50"
          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
        >
          {syncingThirdParty ? 'Syncing...' : 'Fetch 3rd Party Products'}
        </button>
      </div>

      {galleryModalOpen ? (
        <GalleryProjectModal
          project={editingGalleryProject}
          isSaving={gallerySaving}
          onClose={() => {
            if (gallerySaving) return;
            setGalleryModalOpen(false);
            setEditingGalleryProject(null);
          }}
          onSave={handleGallerySave}
        />
      ) : null}
    </div>
  );
};

const GalleryProjectModal = ({ project, onClose, onSave, isSaving }) => {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [displayOrder, setDisplayOrder] = useState(project?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(project?.isActive !== false);
  const [existingImages, setExistingImages] = useState(Array.isArray(project?.images) ? project.images : []);
  const [newFiles, setNewFiles] = useState([]);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!String(title || '').trim()) {
      setValidationError('Project title is required.');
      return;
    }
    if ((existingImages?.length || 0) + (newFiles?.length || 0) === 0) {
      setValidationError('Please keep or upload at least one image.');
      return;
    }

    await onSave({
      projectId: project?._id,
      files: newFiles,
      payload: {
        title: String(title || '').trim(),
        description: String(description || '').trim(),
        displayOrder: Number(displayOrder) || 0,
        isActive: Boolean(isActive),
        existingImages,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
            {project ? 'Edit Gallery Project' : 'Add Gallery Project'}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl" aria-label="Close">
            ×
          </button>
        </div>

        {validationError ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {validationError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Retail storefront branding rollout"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Share project scope, materials used, and final outcome."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mt-7">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              Show on public gallery page
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setNewFiles(Array.from(e.target.files || []))}
              className="w-full text-sm text-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              You can upload multiple images for each project.
            </p>
          </div>

          {existingImages.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Existing Images</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {existingImages.map((img, idx) => (
                  <div key={`${img?.url || 'img'}-${idx}`} className="relative border rounded-lg overflow-hidden">
                    <img src={img?.url} alt={`Existing ${idx + 1}`} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-white/90 text-red-600 rounded px-1.5 py-0.5 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;

// Pretty panel for Additional Info text containing labeled JSON sections
const AdditionalInfoPanel = ({ info }) => {
  const raw = String(info || '');
  const lines = raw.split('\n').map(l => l.trim());
  const featuredLine = lines.find(l => l.startsWith('Featured Request'));

  const extractJsonBlock = (label) => {
    const startIndex = raw.indexOf(`${label}:`);
    if (startIndex === -1) return null;
    const after = raw.slice(startIndex + label.length + 1).trimStart();
    // Capture the first {...} block after the label
    const open = after.indexOf('{');
    if (open === -1) return null;
    // naive brace matching
    let depth = 0;
    let end = -1;
    for (let i = open; i < after.length; i++) {
      if (after[i] === '{') depth++;
      if (after[i] === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) return null;
    const jsonStr = after.slice(open, end + 1);
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  };

  const globalInputs = extractJsonBlock('Global Inputs');
  const details = extractJsonBlock('Details');
  const notesIndex = raw.indexOf('Notes:');
  const notes = notesIndex !== -1 ? raw.slice(notesIndex + 'Notes:'.length).trim() : '';

  const renderPairs = (obj) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
      {Object.entries(obj || {})
        .filter(([, v]) => !(v === '' || v === null || v === undefined))
        .map(([k, v]) => (
          <div key={k} className="text-sm text-gray-800">
            <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:</span>{' '}
            <span className="font-medium">{String(v)}</span>
          </div>
        ))}
    </div>
  );

  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Additional Info</p>
      {featuredLine ? (
        <p className="mt-2 text-xs font-semibold inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5">
          {featuredLine}
        </p>
      ) : null}
      {globalInputs ? (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Global Inputs</p>
          {renderPairs(globalInputs)}
        </div>
      ) : null}
      {details ? (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Details</p>
          {renderPairs(details)}
        </div>
      ) : null}
      {notes ? (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Notes</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{notes}</p>
        </div>
      ) : null}
      {!featuredLine && !globalInputs && !details && !notes ? (
        <p className="font-medium text-gray-900 mt-2 whitespace-pre-wrap" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
          {raw || 'N/A'}
        </p>
      ) : null}
    </div>
  );
};
