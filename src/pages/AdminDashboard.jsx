import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { quoteService } from '../services/quoteService';
import { categoryService } from '../services/categoryService';

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [activeTab, user]);

  const fetchData = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
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
                onClick={() => {
                  logout();
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
            {['overview', 'products', 'categories', 'orders', 'quotes', 'settings'].map((tab) => (
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
                {tab}
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

    if (!formData.basePrice || Number.isNaN(Number(formData.basePrice))) {
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
      const parseCsvNumbers = (str) =>
        String(str || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .map(n => Number(n))
          .filter(n => !Number.isNaN(n));

      const quantities = parseCsvNumbers(formData.pricingTable?.quantities);
      const saverPrices = parseCsvNumbers(formData.pricingTable?.saverPrices);
      const standardPrices = parseCsvNumbers(formData.pricingTable?.standardPrices);
      const expressPrices = parseCsvNumbers(formData.pricingTable?.expressPrices);

      const pricingTablePayload = {
        enabled: !!formData.pricingTable?.enabled,
        quantities,
        deliveryOptions: [
          {
            key: 'saver',
            label: 'Saver',
            etaDays: Number(formData.pricingTable?.saverEtaDays) || 6,
            prices: saverPrices,
          },
          {
            key: 'standard',
            label: 'Standard',
            etaDays: Number(formData.pricingTable?.standardEtaDays) || 4,
            prices: standardPrices,
          },
          {
            key: 'express',
            label: 'Express',
            etaDays: Number(formData.pricingTable?.expressEtaDays) || 2,
            prices: expressPrices,
          },
        ],
      };

      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        basePrice: String(formData.basePrice),
        isActive: String(formData.isActive),
        uiOptions: formData.uiOptions,
        sizeOptions: formData.sizeOptions,
        pricingTable: pricingTablePayload,
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

            {/* Delivery Pricing Table */}
            <div className="mt-6 border-t pt-4">
              <label className="flex items-center gap-2 text-sm text-gray-700" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                <input
                  type="checkbox"
                  checked={!!formData.pricingTable?.enabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricingTable: { ...(prev.pricingTable || {}), enabled: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                Enable delivery pricing table
              </label>

              {formData.pricingTable?.enabled && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                      Quantities (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.pricingTable?.quantities || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pricingTable: { ...(prev.pricingTable || {}), quantities: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="250, 500, 1000, 1500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Saver</p>
                        <input
                          type="number"
                          value={formData.pricingTable?.saverEtaDays ?? 6}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pricingTable: { ...(prev.pricingTable || {}), saverEtaDays: e.target.value },
                            }))
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs"
                          title="ETA days"
                        />
                      </div>
                      <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Prices (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.pricingTable?.saverPrices || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pricingTable: { ...(prev.pricingTable || {}), saverPrices: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="20.80, 29.18, 37.27"
                      />
                    </div>

                    <div className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Standard</p>
                        <input
                          type="number"
                          value={formData.pricingTable?.standardEtaDays ?? 4}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pricingTable: { ...(prev.pricingTable || {}), standardEtaDays: e.target.value },
                            }))
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs"
                          title="ETA days"
                        />
                      </div>
                      <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Prices (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.pricingTable?.standardPrices || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pricingTable: { ...(prev.pricingTable || {}), standardPrices: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="21.89, 30.72, 39.23"
                      />
                    </div>

                    <div className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>Express</p>
                        <input
                          type="number"
                          value={formData.pricingTable?.expressEtaDays ?? 2}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pricingTable: { ...(prev.pricingTable || {}), expressEtaDays: e.target.value },
                            }))
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs"
                          title="ETA days"
                        />
                      </div>
                      <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                        Prices (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.pricingTable?.expressPrices || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pricingTable: { ...(prev.pricingTable || {}), expressPrices: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="24.07, 33.79, 43.15"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
                    Quantities count must match each prices list count (same order).
                  </p>
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

// Orders Tab Component
const OrdersTab = ({ orders, onStatusUpdate }) => {
  const statusColors = {
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{order._id.toString().slice(-8)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.user?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{order.user?.email || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">£{order.total}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                    className={`px-3 py-1 text-xs rounded-full border-0 ${statusColors[order.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-900">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Quotes Tab Component
const QuotesTab = ({ quotes, onResponse }) => {
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');

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
    onResponse(selectedQuote._id, {
      status: 'quoted',
      adminResponse: responseText,
      quotedPrice: parseFloat(quotedPrice),
    });
    setSelectedQuote(null);
    setResponseText('');
    setQuotedPrice('');
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Quote Requests
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {quotes.map((quote) => (
              <div
                key={quote._id}
                onClick={() => handleQuoteSelect(quote)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedQuote?._id === quote._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{quote.name}</p>
                    <p className="text-sm text-gray-500">{quote.email}</p>
                    <p className="text-sm text-gray-600 mt-1">{quote.projectType}</p>
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
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Quote Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{selectedQuote.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Received</p>
                  <p className="font-medium">{new Date(selectedQuote.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedQuote.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedQuote.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedQuote.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="font-medium">{selectedQuote.country || 'United Kingdom'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium">{selectedQuote.company || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Contact</p>
                <p className="font-medium capitalize">{selectedQuote.preferredContact || 'email'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Project Type</p>
                <p className="font-medium">{selectedQuote.projectType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quote Type</p>
                <p className="font-medium capitalize">{(selectedQuote.quoteType || 'standard').replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ideal Sign Width</p>
                <p className="font-medium">{selectedQuote.idealSignWidth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-medium">{selectedQuote.quantity || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Message</p>
                <p className="font-medium">{selectedQuote.message || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Additional Info</p>
                <p className="font-medium">{selectedQuote.additionalInfo || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Uploaded Artwork</p>
                {selectedQuote.artworkUrl ? (
                  <a href={selectedQuote.artworkUrl} target="_blank" rel="noreferrer" className="inline-block">
                    <img
                      src={selectedQuote.artworkUrl}
                      alt="Uploaded artwork"
                      className="w-28 h-28 object-cover rounded-lg border border-gray-200"
                    />
                    <p className="text-xs text-blue-600 mt-1">Open full image</p>
                  </a>
                ) : (
                  <p className="font-medium">N/A</p>
                )}
              </div>

              {selectedQuote.respondedAt && (
                <div>
                  <p className="text-sm text-gray-500">Last Responded At</p>
                  <p className="font-medium">{new Date(selectedQuote.respondedAt).toLocaleString()}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="4"
                />
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Quoted Price (£)
                </label>
                <input
                  type="number"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleSubmitResponse}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Response
                </button>
                <button
                  onClick={handleSendQuotationEmail}
                  className="mt-3 ml-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Send Quotation by Email
                </button>
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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await adminService.getTopAnnouncement();
        if (data) {
          setFormData({
            enabled: data.enabled !== false,
            prefix: data.prefix || 'Top Announcement',
            message: data.message || 'Price Promise | UK wide delivery',
          });
        }
      } catch (e) {
        setError(e?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
    </div>
  );
};

export default AdminDashboard;
