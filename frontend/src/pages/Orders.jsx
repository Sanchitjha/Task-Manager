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
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/receipt`);
      if (response.data.receiptUrl) {
        // Open receipt in new tab
        window.open(`http://localhost:5000${response.data.receiptUrl}`, '_blank');
      }
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Receipt not available');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-8">Start shopping to place your first order</p>
            <Link
              to="/shop"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid gap-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.images && item.product.images[0] ? (
                              <img
                                src={`http://localhost:5000${item.product.images[0]}`}
                                alt={item.product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-400 text-xl">📦</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product.title}</h4>
                            <p className="text-sm text-gray-600">{item.product.category}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {item.price * item.quantity} coins
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.price} coins each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {order.trackingNumber && (
                          <p>Tracking: {order.trackingNumber}</p>
                        )}
                        {order.deliveredAt && (
                          <p>Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          Total: {order.totalAmount} coins
                        </p>
                        <button className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-1">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{order.customer.name}</p>
                      <p>{order.customer.phone}</p>
                      <p>
                        {order.customer.address.street}, {order.customer.address.city}
                      </p>
                      <p>
                        {order.customer.address.state} - {order.customer.address.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}