import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);

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
      setCart(JSON.parse(savedCart));
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

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem('shopCart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item._id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    updateCart(updatedCart);
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    updateCart(updatedCart);
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      updateCart([]);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const canAfford = userBalance >= getCartTotal();

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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
            <Link
              to="/shop"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">{getTotalItems()} items in your cart</p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
            >
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.images && item.images[0] ? (
                      <img
                        src={`http://localhost:5000${item.images[0]}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.category}</p>
                    <p className="text-orange-600 font-bold">{item.price} coins each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      {item.price * item.quantity} coins
                    </p>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${item.title} from cart?`)) {
                          removeItem(item._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 text-sm mt-1 hover:bg-red-50 px-2 py-1 rounded"
                      title="Remove from cart"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-between items-center">
              <Link
                to="/shop"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                ← Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({getTotalItems()})</span>
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
                {!canAfford && (
                  <p className="text-red-600 text-sm">
                    You need {getCartTotal() - userBalance} more coins
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                disabled={!canAfford}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  canAfford
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canAfford ? 'Proceed to Checkout' : 'Insufficient Coins'}
              </button>

              {!canAfford && (
                <div className="mt-4 text-center">
                  <Link
                    to="/earn"
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    Earn more coins →
                  </Link>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>🔒</span>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🚚</span>
                  <span>Free delivery on all orders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>↩️</span>
                  <span>Easy returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}