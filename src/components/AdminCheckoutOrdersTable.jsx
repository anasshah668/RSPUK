import React, { useCallback, useEffect, useState } from 'react';
import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const font = { fontFamily: 'Lexend Deca, sans-serif' };

/**
 * Lists paid Worldpay checkout orders from GET /api/admin/orders-from-checkout.
 *
 * Embed in your existing Admin → Orders tab:
 *   import AdminCheckoutOrdersTable from './components/AdminCheckoutOrdersTable';
 *   <AdminCheckoutOrdersTable />
 *
 * Server: mount checkoutAdmin routes (see backend/.env.worldpay.example).
 * Optional: set VITE_CHECKOUT_ORDERS_ADMIN_TOKEN if CHECKOUT_ORDERS_ADMIN_TOKEN is set on the API.
 */
const AdminCheckoutOrdersTable = ({ className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const secret = import.meta.env.VITE_CHECKOUT_ORDERS_ADMIN_TOKEN;
      const data = await httpClient.get(
        apiRoutes.admin.ordersFromCheckout,
        {},
        {
          headers: secret ? { 'x-checkout-orders-token': secret } : {},
        },
      );
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (e) {
      setError(e?.message || 'Could not load checkout orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatMoney = (amount, currency = 'GBP') => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return String(amount ?? '—');
    try {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(n);
    } catch {
      return `${currency} ${n.toFixed(2)}`;
    }
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`} style={font}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Online checkout (Worldpay)</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Payments completed on the secure checkout page. Refreshes when you reload this panel.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mx-4 my-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading && !orders.length && !error ? (
        <p className="text-sm text-gray-500 px-4 py-6">Loading orders…</p>
      ) : !orders.length && !error ? (
        <p className="text-sm text-gray-500 px-4 py-6">No checkout orders recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs uppercase text-gray-500 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 font-semibold">Date</th>
                <th className="px-4 py-2 font-semibold">Reference</th>
                <th className="px-4 py-2 font-semibold">Customer</th>
                <th className="px-4 py-2 font-semibold">Item</th>
                <th className="px-4 py-2 font-semibold text-right">Amount</th>
                <th className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((row) => {
                const c = row.customer || {};
                const title = row.orderDetails?.title || row.orderDetails?.description || '—';
                return (
                  <tr key={row.id || row.orderReference} className="hover:bg-gray-50/80">
                    <td className="px-4 py-2 whitespace-nowrap text-gray-600 tabular-nums">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString('en-GB') : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-mono text-xs text-gray-900">{row.orderReference || '—'}</span>
                      {row.paymentId && row.paymentId !== row.orderReference && (
                        <div className="text-[10px] text-gray-400 font-mono truncate max-w-[140px]" title={row.paymentId}>
                          {row.paymentId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-gray-900">{c.name || '—'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]" title={c.email}>
                        {c.email || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-700 max-w-[200px] truncate" title={title}>
                      {title}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums text-gray-900">
                      {formatMoney(row.amount, row.currency)}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold px-2 py-0.5 capitalize">
                        {row.status || 'paid'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCheckoutOrdersTable;
