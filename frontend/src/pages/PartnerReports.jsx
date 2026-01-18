import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  FaChartLine, FaCoins, FaEye, FaShoppingCart, FaRupeeSign, 
  FaCalendarAlt, FaDownload, FaFilter, FaSpinner, FaTrendingUp,
  FaTrendingDown, FaEquals, FaBoxes, FaUsers, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const PartnerReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [reportData, setReportData] = useState({
    overview: {},
    productViews: [],
    coinsRedeemed: [],
    purchaseHistory: [],
    dailyStats: [],
    topProducts: []
  });

  const dateRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' }
  ];

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/api/partners/reports?range=${dateRange}`);
      setReportData(response.data);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    try {
      const response = await api.get(`/api/partners/reports/download?range=${dateRange}&format=${format}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `partner-report-${dateRange}.${format}`;
      link.click();
      
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (!user || user.role !== 'Partner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Partner access required to view reports.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const { overview, dailyStats, topProducts, productViews, coinsRedeemed, purchaseHistory } = reportData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 flex items-center">
                <FaChartLine className="mr-2" />
                Track your store performance and earnings
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              
              {/* Download Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadReport('pdf')}
                  className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center space-x-2"
                >
                  <FaDownload />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => downloadReport('csv')}
                  className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 flex items-center space-x-2"
                >
                  <FaDownload />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Revenue',
              value: formatCurrency(overview?.totalRevenue || 0),
              change: getPercentageChange(overview?.totalRevenue || 0, overview?.previousRevenue || 0),
              icon: FaRupeeSign,
              color: 'from-green-500 to-emerald-600',
              bgColor: 'from-green-50 to-emerald-100'
            },
            {
              title: 'Coins Redeemed',
              value: overview?.totalCoinsRedeemed || 0,
              change: getPercentageChange(overview?.totalCoinsRedeemed || 0, overview?.previousCoinsRedeemed || 0),
              icon: FaCoins,
              color: 'from-orange-500 to-yellow-600',
              bgColor: 'from-orange-50 to-yellow-100'
            },
            {
              title: 'Product Views',
              value: overview?.totalViews || 0,
              change: getPercentageChange(overview?.totalViews || 0, overview?.previousViews || 0),
              icon: FaEye,
              color: 'from-purple-500 to-indigo-600',
              bgColor: 'from-purple-50 to-indigo-100'
            },
            {
              title: 'Transactions',
              value: overview?.totalTransactions || 0,
              change: getPercentageChange(overview?.totalTransactions || 0, overview?.previousTransactions || 0),
              icon: FaShoppingCart,
              color: 'from-blue-500 to-cyan-600',
              bgColor: 'from-blue-50 to-cyan-100'
            }
          ].map((card, index) => {
            const IconComponent = card.icon;
            const isPositive = card.change > 0;
            const isNegative = card.change < 0;
            
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
                    isPositive ? 'bg-green-100 text-green-700' : 
                    isNegative ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {isPositive ? <FaArrowUp className="mr-1" /> : 
                     isNegative ? <FaArrowDown className="mr-1" /> :
                     <FaEquals className="mr-1" />}
                    {Math.abs(card.change).toFixed(1)}%
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Revenue Chart */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaChartLine className="mr-3 text-blue-500" />
              Daily Revenue
            </h2>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 5 }}
                    activeDot={{ r: 7, fill: '#1D4ED8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Coins Redeemed Chart */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaCoins className="mr-3 text-orange-500" />
              Coins Redeemed
            </h2>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [value, 'Coins']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
                  />
                  <Bar 
                    dataKey="coinsRedeemed" 
                    fill="#F59E0B" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Products */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaBoxes className="mr-3 text-green-500" />
              Top Performing Products
            </h2>
            
            <div className="space-y-4">
              {(topProducts || []).slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{product.productName}</h3>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Category Distribution */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaTrendingUp className="mr-3 text-purple-500" />
              Category Distribution
            </h2>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={12}
                  >
                    {(overview?.categoryDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Purchase History Table */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaUsers className="mr-3 text-indigo-500" />
            Recent Purchase History
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Coins Used</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount Paid</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(purchaseHistory || []).slice(0, 10).map((transaction, index) => (
                  <tr key={transaction._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-800">{transaction.customerName}</p>
                        <p className="text-sm text-gray-500">{transaction.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-800">{transaction.productName}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold flex items-center w-fit">
                        <FaCoins className="mr-1" />
                        {transaction.coinsUsed}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {formatCurrency(transaction.finalAmount)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      {formatCurrency(transaction.originalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(!purchaseHistory || purchaseHistory.length === 0) && (
            <div className="text-center py-12">
              <FaShoppingCart className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">No purchase history available for the selected period</p>
            </div>
          )}
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

export default PartnerReports;