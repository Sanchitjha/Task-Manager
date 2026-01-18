import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  FaStore, FaUser, FaCoins, FaEye, FaPlus, FaBoxes, FaChartLine, 
  FaBell, FaUsers, FaWallet, FaMapMarkerAlt, FaClock, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaTrendingUp, FaShoppingCart, FaCamera,
  FaStar, FaCalendarDay, FaArrowUp, FaArrowDown, FaEdit, FaCog
} from 'react-icons/fa';

const PartnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalVisits: 0,
    walletDiscountsGiven: 0,
    todayFootfall: 0,
    totalEarnings: 0,
    pendingApproval: 0,
    lowStockProducts: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Check user permissions
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'Partner' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaTimesCircle className="mx-auto text-6xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Partner access required to view this page.</p>
        </div>
      </div>
    );
  }

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch partner stats
        const statsResponse = await api.get('/api/partners/dashboard-stats');
        setStats(statsResponse.data);
        
        // Fetch notifications
        const notificationsResponse = await api.get('/api/partners/notifications');
        setNotifications(notificationsResponse.data.slice(0, 5)); // Show latest 5
        
        // Fetch recent products
        const productsResponse = await api.get('/api/products', { 
          params: { partner: user._id, limit: 5, sort: '-createdAt' }
        });
        setRecentProducts(productsResponse.data.products || []);
        
        // Fetch recent transactions
        const transactionsResponse = await api.get('/api/partners/recent-transactions');
        setRecentTransactions(transactionsResponse.data.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      change: '+12%',
      changeType: 'positive',
      icon: FaBoxes,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      change: '+5%',
      changeType: 'positive',
      icon: FaStore,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      title: 'Total Visits',
      value: stats.totalVisits,
      change: '+23%',
      changeType: 'positive',
      icon: FaEye,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Wallet Discounts',
      value: `₹${stats.walletDiscountsGiven}`,
      change: '+8%',
      changeType: 'positive',
      icon: FaWallet,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100'
    },
    {
      title: "Today's Footfall",
      value: stats.todayFootfall,
      change: '+15%',
      changeType: 'positive',
      icon: FaUsers,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'from-teal-50 to-teal-100'
    },
    {
      title: 'Total Earnings',
      value: `₹${stats.totalEarnings}`,
      change: '+18%',
      changeType: 'positive',
      icon: FaChartLine,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Partner Dashboard
              </h1>
              <p className="text-gray-600 flex items-center">
                <FaStore className="mr-2" />
                Welcome back, {user.name || 'Partner'}
              </p>
            </div>
            <div className="flex space-x-4 mt-4 lg:mt-0">
              <Link
                to="/products/create"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <FaPlus />
                <span>Add Product</span>
              </Link>
              <Link
                to="/partner/settings"
                className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <FaCog />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {overviewCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.title}
                className={`bg-gradient-to-br ${card.bgColor} backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${card.color} rounded-2xl shadow-lg`}>
                    <IconComponent className="text-2xl text-white" />
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    card.changeType === 'positive' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {card.changeType === 'positive' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                    {card.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Notifications Panel */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaBell className="mr-3 text-orange-500" />
                  Notifications
                </h2>
                <Link 
                  to="/partner/notifications"
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {notifications.length > 0 ? notifications.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className={`p-2 rounded-full ${
                      notification.type === 'warning' ? 'bg-orange-100' :
                      notification.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {notification.type === 'warning' ? (
                        <FaExclamationTriangle className="text-orange-500" />
                      ) : notification.type === 'success' ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaBell className="text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <span className="text-xs text-gray-400 mt-2 block">{notification.time}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <FaBell className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500">No new notifications</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaBoxes className="mr-3 text-blue-500" />
                  Recent Products
                </h2>
                <Link 
                  to="/products"
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  Manage All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentProducts.length > 0 ? recentProducts.map((product) => (
                  <div key={product._id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl overflow-hidden">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaCamera className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">₹{product.price}</span>
                        <span className="text-sm text-orange-600">{product.discountCoins} coins</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/products/edit/${product._id}`}
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded-xl transition-all duration-300"
                    >
                      <FaEdit />
                    </Link>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <FaBoxes className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500">No products yet</p>
                    <Link
                      to="/products/create"
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      Add your first product
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FaTrendingUp className="mr-3 text-green-500" />
                Quick Actions
              </h2>
              
              <div className="space-y-4">
                <Link
                  to="/products/create"
                  className="block p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-center font-semibold"
                >
                  <FaPlus className="mx-auto mb-2 text-xl" />
                  Add New Product
                </Link>
                
                <Link
                  to="/partner/purchase-confirm"
                  className="block p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-center font-semibold"
                >
                  <FaShoppingCart className="mx-auto mb-2 text-xl" />
                  Confirm Purchase
                </Link>
                
                <Link
                  to="/partner/reports"
                  className="block p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-center font-semibold"
                >
                  <FaChartLine className="mx-auto mb-2 text-xl" />
                  View Reports
                </Link>
                
                <Link
                  to="/partner/store-page"
                  className="block p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-center font-semibold"
                >
                  <FaStore className="mx-auto mb-2 text-xl" />
                  My Store Page
                </Link>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaWallet className="mr-3 text-green-500" />
                  Recent Transactions
                </h2>
                <Link 
                  to="/partner/transactions"
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentTransactions.length > 0 ? recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCoins className="text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{transaction.userName}</p>
                        <p className="text-sm text-gray-600">{transaction.productName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+{transaction.coinsUsed} coins</p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <FaWallet className="mx-auto text-3xl text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No recent transactions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shop Status */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FaStore className="mr-3 text-blue-500" />
                Shop Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Approval Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.isApproved === true 
                      ? 'bg-green-100 text-green-700' 
                      : user.isApproved === false
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {user.isApproved === true ? 'Approved' : user.isApproved === false ? 'Rejected' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shop Timing</span>
                  <div className="flex items-center space-x-2 text-sm">
                    <FaClock className="text-gray-400" />
                    <span className="text-gray-700">
                      {user.shopDetails?.timing?.isOpen24x7 
                        ? '24/7' 
                        : `${user.shopDetails?.timing?.openTime || 'Not set'} - ${user.shopDetails?.timing?.closeTime || 'Not set'}`
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <div className="flex items-center space-x-2 text-sm">
                    <FaMapMarkerAlt className="text-red-400" />
                    <span className="text-gray-700">
                      {user.shopDetails?.address?.city || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PartnerDashboard;