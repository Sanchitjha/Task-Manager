import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, expired, pending
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadSubscriptions();
  }, [filter, page]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('page', page);
      
      const response = await api.get(`/subscriptions/admin/all?${params.toString()}`);
      setSubscriptions(response.data.subscriptions);
      setStats(response.data.stats || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subscriptionId) => {
    if (!confirm('Are you sure you want to delete this subscription? The product will be unpublished.')) {
      return;
    }

    try {
      await api.delete(`/subscriptions/admin/${subscriptionId}`);
      alert('Subscription deleted successfully');
      loadSubscriptions();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete subscription');
    }
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600">Admin access required</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📋 Product Subscriptions</h1>
          <p className="text-gray-600 mt-1">Manage partner product subscriptions</p>
        </div>
        <Link
          to="/admin/dashboard"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600 capitalize">{stat._id} Subscriptions</div>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs text-gray-500">Revenue: ₹{stat.totalRevenue}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'pending', 'expired', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded capitalize ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No subscriptions found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4">Partner</th>
                    <th className="text-left p-4">Images</th>
                    <th className="text-left p-4">Days</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Expiry</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const daysRemaining = getDaysRemaining(sub.endDate);
                    return (
                      <tr key={sub._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {sub.product?.images?.[0] && (
                              <img
                                src={sub.product.images[0]}
                                alt={sub.product.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium">{sub.product?.title || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{sub.product?.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{sub.vendor?.name}</div>
                          <div className="text-xs text-gray-500">{sub.vendor?.email}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-semibold">{sub.numberOfImages}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-semibold">{sub.numberOfDays}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-green-600">₹{sub.totalAmount}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sub.status)}`}>
                            {sub.status}
                          </span>
                          {sub.paymentStatus && (
                            <div className="text-xs text-gray-500 mt-1">
                              Payment: {sub.paymentStatus}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {new Date(sub.endDate).toLocaleDateString()}
                          </div>
                          {sub.status === 'active' && (
                            <div className={`text-xs ${daysRemaining < 3 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDelete(sub._id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-bold text-yellow-900 mb-2">⚠️ Admin Actions</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Deleting a subscription will immediately unpublish the product</li>
          <li>• Expired subscriptions are checked automatically every hour</li>
          <li>• Vendors and admins receive notifications when subscriptions expire</li>
          <li>• Pricing: ₹1 per image per day</li>
        </ul>
      </div>
    </div>
  );
}
