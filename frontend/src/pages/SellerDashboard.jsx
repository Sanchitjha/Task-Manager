import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin')) return;

    const loadStats = async () => {
      try {
        const res = await api.get('/vendor/stats');
        setStats(res.data.stats);
      } catch (e) {
        console.error(e);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (!user || (user.role !== 'vendor' && user.role !== 'partner' && user.role !== 'admin')) {
    return <div className="p-6 text-red-600">Vendor access required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Seller Dashboard</h1>
          <Link to="/seller/profile" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Store Settings
          </Link>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {loading ? (
          <div className="text-gray-600">Loading dashboard...</div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Orders" value={stats.totalOrders} icon="📦" color="blue" />
              <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon="💰" color="green" />
              <StatCard title="Products" value={stats.totalProducts} icon="🛍️" color="purple" />
              <StatCard title="Average Rating" value={stats.averageRating} subtitle={`${stats.totalReviews} reviews`} icon="⭐" color="yellow" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Pending Orders" value={stats.pendingOrders} color="orange" />
              <StatCard title="Shipped Orders" value={stats.shippedOrders} color="blue" />
              <StatCard title="Delivered Orders" value={stats.deliveredOrders} color="green" />
            </div>

            {/* Wallet & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Wallet */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Wallet Balance</h3>
                <p className="text-3xl font-bold text-green-600">₹{stats.walletBalance.toLocaleString()}</p>
                <Link to="/seller/wallet" className="text-blue-600 hover:underline text-sm mt-2 block">
                  View Details →
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6 col-span-2">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <ActionButton to="/seller/products/new" label="Add Product" icon="➕" />
                  <ActionButton to="/seller/inventory" label="Inventory" icon="📋" />
                  <ActionButton to="/seller/orders" label="Orders" icon="📦" />
                  <ActionButton to="/seller/reviews" label="Reviews" icon="⭐" />
                  <ActionButton to="/seller/profile" label="Store Profile" icon="🏪" />
                  <ActionButton to="/seller/analytics" label="Analytics" icon="📊" />
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
                <Link to="/seller/orders" className="text-blue-600 hover:underline text-sm">
                  View All →
                </Link>
              </div>
              <p className="text-gray-600 text-sm">Orders appear here when customers make purchases.</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color = 'gray' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className={`${colorMap[color]} rounded-lg p-4 shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
}

function ActionButton({ to, label, icon }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition text-sm font-medium"
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
