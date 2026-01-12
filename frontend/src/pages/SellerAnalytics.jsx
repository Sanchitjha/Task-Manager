import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function SellerAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageRating: 0,
    topProducts: [],
    recentOrders: [],
    salesTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vendor/analytics?range=${timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your store performance</p>
        </div>
        <Link
          to="/seller/dashboard"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Time Range Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-4 py-2 rounded ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Last Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-4 py-2 rounded ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Last Month
        </button>
        <button
          onClick={() => setTimeRange('year')}
          className={`px-4 py-2 rounded ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Last Year
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-500 text-sm mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-green-600">
            {analytics.totalRevenue} 🪙
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-500 text-sm mb-2">Total Orders</div>
          <div className="text-3xl font-bold text-blue-600">{analytics.totalOrders}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-500 text-sm mb-2">Total Products</div>
          <div className="text-3xl font-bold text-purple-600">{analytics.totalProducts}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-500 text-sm mb-2">Average Rating</div>
          <div className="text-3xl font-bold text-yellow-600">
            ⭐ {analytics.averageRating.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">🏆 Top Performing Products</h2>
        {analytics.topProducts && analytics.topProducts.length > 0 ? (
          <div className="space-y-3">
            {analytics.topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.salesCount} sales
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{product.revenue} 🪙</div>
                  <div className="text-sm text-gray-500">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No sales data available yet. Start selling to see your top products!
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">📦 Recent Orders</h2>
        {analytics.recentOrders && analytics.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Order ID</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Items</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-3">#{order._id.slice(-6)}</td>
                    <td className="py-3">{order.customerName}</td>
                    <td className="py-3">{order.itemCount}</td>
                    <td className="py-3 font-semibold">{order.total} 🪙</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No recent orders. <Link to="/seller/inventory" className="text-blue-600 hover:underline">Add products</Link> to start selling!
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4 justify-center">
        <Link
          to="/seller/inventory"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Manage Inventory
        </Link>
        <Link
          to="/seller/orders"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          View All Orders
        </Link>
        <Link
          to="/seller/reviews"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Customer Reviews
        </Link>
      </div>
    </div>
  );
}
