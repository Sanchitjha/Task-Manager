import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/receipt`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600">Please login to view your orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">📋 My Orders</h1>
          <p className="text-gray-600 mt-2">Track your purchases and download receipts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
            <a 
              href="/shop" 
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 inline-block"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')} at {new Date(order.createdAt).toLocaleTimeString('en-IN')}
                      </p>
                      {order.vendor && (
                        <p className="text-sm text-gray-600">
                          Vendor: {order.vendor.name}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                      </span>
                      {order.receiptGenerated && (
                        <button
                          onClick={() => downloadReceipt(order.orderId)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          📄 Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="grid gap-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                          {item.productSnapshot?.images?.[0] ? (
                            <img 
                              src={`http://localhost:5000${item.productSnapshot.images[0]}`}
                              alt={item.productSnapshot.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {item.productSnapshot?.title || 'Product'}
                          </h4>
                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            <p>Quantity: {item.quantity}</p>
                            {item.unitDiscountAmount > 0 && (
                              <div className="flex items-center space-x-2">
                                <span className="text-green-600 font-medium">₹{item.unitFinalPrice}</span>
                                <span className="text-gray-500 line-through">₹{item.unitOriginalPrice}</span>
                                <span className="text-red-600 text-xs">
                                  {((item.unitDiscountAmount / item.unitOriginalPrice) * 100).toFixed(0)}% off
                                </span>
                              </div>
                            )}
                            <p>Coins Used: <span className="font-semibold text-orange-600">{item.totalCoinsPaid} coins</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{item.totalFinalPrice}</p>
                          <p className="text-sm text-orange-600">{item.totalCoinsPaid} coins</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Original Amount</p>
                        <p className="font-semibold">₹{order.totalOriginalAmount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Discount</p>
                        <p className="font-semibold text-green-600">₹{order.totalDiscountAmount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Final Amount</p>
                        <p className="font-semibold">₹{order.totalFinalAmount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Coins Used</p>
                        <p className="font-semibold text-orange-600">{order.totalCoinsUsed} coins</p>
                      </div>
                    </div>
                    
                    {order.coinConversionRate && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-gray-600">
                          Conversion Rate: 1 coin = ₹{order.coinConversionRate}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.email}</p>
                        {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                        {order.shippingAddress.street && (
                          <p>
                            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}