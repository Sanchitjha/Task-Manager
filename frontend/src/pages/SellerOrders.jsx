import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  if (!user || (user.role !== 'vendor' && user.role !== 'partner')) {
    return <div className="p-6 text-red-600">Vendor access required.</div>;
  }

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/vendor/orders', { params });
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/vendor/orders/${orderId}/status`, { status: newStatus });
      setOrders(o => o.map(x => x._id === orderId ? { ...x, status: newStatus } : x));
    } catch (e) {
      alert('Failed to update: ' + (e.response?.data?.message || e.message));
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Orders</h1>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-4 py-2 rounded transition ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Orders'}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading && <div className="text-gray-600">Loading orders...</div>}

        {!loading && orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                  {/* Order Info */}
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold text-lg">{order.orderId}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{order.customer?.name}</p>
                    <p className="text-xs text-gray-500">{order.customer?.email}</p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold text-lg text-green-600">₹{order.finalAmount}</p>
                    <p className="text-xs text-gray-500">{order.items?.length} items</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className={`px-3 py-1 rounded text-sm font-semibold border-0 cursor-pointer ${statusColors[order.status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Action */}
                  <div className="text-right">
                    <button className="text-blue-600 hover:underline text-sm">
                      View Details →
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-600 mb-2">Items:</p>
                    <div className="flex gap-2 flex-wrap">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.product?.title} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 15 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${page === p ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
