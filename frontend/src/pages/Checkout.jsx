import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  
  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    notes: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCart();
    loadUserBalance();
  }, [user, navigate]);

  const loadCart = () => {
    const savedCart = localStorage.getItem('shopCart');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      if (cartItems.length === 0) {
        navigate('/cart');
        return;
      }
      setCart(cartItems);
    } else {
      navigate('/cart');
    }
    setLoading(false);
  };

  const loadUserBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      setUserBalance(res.data.balance || 0);
    } catch (e) {
      console.error('Failed to load balance:', e);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const canAfford = userBalance >= getCartTotal();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setCustomerInfo(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setCustomerInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const isFormValid = () => {
    return (
      customerInfo.name.trim() &&
      customerInfo.phone.trim() &&
      customerInfo.address.street.trim() &&
      customerInfo.address.city.trim() &&
      customerInfo.address.state.trim() &&
      customerInfo.address.pincode.trim()
    );
  };

  const placeOrder = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!canAfford) {
      alert('Insufficient coins');
      return;
    }

    setOrderLoading(true);
    try {
      // Create order
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        customer: customerInfo,
        totalAmount: getCartTotal(),
        paymentMethod: 'coins'
      };

      const res = await api.post('/orders', orderData);
      
      if (res.data.success) {
        // Clear cart
        localStorage.removeItem('shopCart');
        
        // Redirect to success page or order confirmation
        alert('Order placed successfully! Your coins have been deducted.');
        navigate('/orders'); // You might want to create an orders page
      }
    } catch (e) {
      console.error('Failed to place order:', e);
      alert('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
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
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={customerInfo.address.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="House number, building name, street name"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={customerInfo.address.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={customerInfo.address.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={customerInfo.address.pincode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark
                    </label>
                    <input
                      type="text"
                      name="address.landmark"
                      value={customerInfo.address.landmark}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Special Instructions</h2>
              <textarea
                name="notes"
                value={customerInfo.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Any special delivery instructions..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.images && item.images[0] ? (
                        <img
                          src={`http://localhost:5000${item.images[0]}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-orange-600">
                      {item.price * item.quantity} coins
                    </p>
                  </div>
                ))}
              </div>

              <hr className="mb-6" />

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-medium">{getCartTotal()} coins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">{getCartTotal()} coins</span>
                </div>
              </div>

              {/* Balance Check */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Your Balance:</span>
                  <span className="font-bold text-orange-600">{userBalance} coins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">After Purchase:</span>
                  <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                    {userBalance - getCartTotal()} coins
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Payment Method</h3>
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600 text-lg">🪙</span>
                    <span className="font-medium">Pay with Coins</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Coins will be transferred to vendor wallet
                  </p>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={placeOrder}
                disabled={!canAfford || !isFormValid() || orderLoading}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  canAfford && isFormValid() && !orderLoading
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {orderLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </div>
                ) : !canAfford ? (
                  'Insufficient Coins'
                ) : !isFormValid() ? (
                  'Please Fill Required Fields'
                ) : (
                  'Place Order'
                )}
              </button>

              {/* Trust Indicators */}
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>🔒</span>
                  <span>Secure transaction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>Cash on Delivery available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🚚</span>
                  <span>Free delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}