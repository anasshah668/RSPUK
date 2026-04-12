import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCheckoutOrdersTable from '../components/AdminCheckoutOrdersTable';

/**
 * Standalone admin view for Worldpay checkout orders.
 * Register route (admin-only in your app):
 *   <Route path="/admin/checkout-orders" element={<AdminCheckoutOrdersPage />} />
 */
const AdminCheckoutOrdersPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout orders</h1>
            <p className="text-sm text-gray-600 mt-1">
              Paid orders from the Worldpay secure checkout flow.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 text-sm font-semibold hover:bg-gray-50"
          >
            Back
          </button>
        </div>
        <AdminCheckoutOrdersTable />
      </div>
    </div>
  );
};

export default AdminCheckoutOrdersPage;
