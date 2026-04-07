import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, Tag, Truck, Shield, RefreshCw, Coins } from 'lucide-react';

const CART_KEY = 'shopCart';

export default function Cart() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [cart,     setCart]     = useState([]);
  const [balance,  setBalance]  = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [promoMsg, setPromoMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadCart();
    loadBalance();
  }, [user]);

  const loadCart = () => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      setCart(saved ? JSON.parse(saved) : []);
    } catch { setCart([]); }
    setLoading(false);
  };

  const loadBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      setBalance(res.data.balance || res.data.coins || 0);
    } catch { /* silent */ }
  };

  const persist = (newCart) => {
    setCart(newCart);
    localStorage.setItem(CART_KEY, JSON.stringify(newCart));
  };

  const updateQty = (id, delta) => {
    const updated = cart
      .map((i) => i._id === id ? { ...i, quantity: Math.max(0, (i.quantity || 1) + delta) } : i)
      .filter((i) => (i.quantity || 0) > 0);
    persist(updated);
  };

  const removeItem = (id) => persist(cart.filter((i) => i._id !== id));

  const clearCart = () => {
    if (window.confirm('Clear your entire cart?')) persist([]);
  };

  // Price helpers
  const itemPrice = (item) => item.finalPrice ?? item.price ?? item.originalPrice ?? 0;
  const itemTotal = (item) => itemPrice(item) * (item.quantity || 1);
  const cartSubtotal = cart.reduce((s, i) => s + itemTotal(i), 0);
  const totalItems   = cart.reduce((s, i) => s + (i.quantity || 1), 0);
  const totalDiscount = cart.reduce((s, i) => {
    const orig = i.originalPrice || 0;
    const fin  = itemPrice(i);
    return s + Math.max(0, (orig - fin) * (i.quantity || 1));
  }, 0);
  const orderTotal = cartSubtotal;
  const canAfford  = balance >= orderTotal;

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-amazon-bg flex items-center justify-center">
        <div className="loading-spinner w-10 h-10" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-amazon-bg">
        <div className="max-w-[1200px] mx-auto px-4 py-12">
          <div className="bg-white rounded-sm border border-amazon-border p-10 text-center max-w-md mx-auto">
            <ShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products" className="btn-amazon px-8 py-3 font-medium">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon-bg">
      <div className="max-w-[1200px] mx-auto px-4 py-6">

        <h1 className="text-2xl font-black text-gray-900 mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">

          {/* ── Cart Items ──────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Deselect all / clear */}
            <div className="bg-white rounded-sm border border-amazon-border px-5 py-3 flex items-center justify-between text-sm text-amazon-gray">
              <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
              <button onClick={clearCart} className="text-amazon-link hover:text-amazon-link-hover hover:underline">
                Clear cart
              </button>
            </div>

            {cart.map((item) => {
              const price    = itemPrice(item);
              const original = item.originalPrice || 0;
              const discount = item.discountPercentage || 0;
              const total    = itemTotal(item);
              const imgUrl   = item.images?.[0] ? api.getProfileImageUrl(item.images[0]) : null;

              return (
                <div key={item._id} className="bg-white rounded-sm border border-amazon-border p-4 sm:p-5">
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link to={`/product/${item._id}`} className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 border border-amazon-border rounded overflow-hidden flex items-center justify-center bg-white">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.title}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-3xl text-gray-200">📦</span>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item._id}`}>
                        <h3 className="text-sm font-medium text-gray-800 hover:text-amazon-link line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                      </Link>

                      {item.category && (
                        <p className="text-xs text-amazon-gray mt-0.5">{item.category}</p>
                      )}

                      <p className="text-amazon-green text-xs mt-1 font-medium">In Stock</p>

                      {/* Eligible for delivery badge */}
                      <div className="flex items-center gap-1 mt-1">
                        <Truck size={10} className="text-amazon-green" />
                        <span className="text-[10px] text-amazon-gray">Eligible for Free Delivery</span>
                      </div>

                      {/* Controls row */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {/* Quantity */}
                        <div className="flex items-center border border-amazon-border rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQty(item._id, -1)}
                            className="px-3 py-1.5 hover:bg-amazon-light-gray transition-colors"
                            title="Decrease"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 py-1.5 text-sm font-semibold min-w-[36px] text-center border-x border-amazon-border">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQty(item._id, 1)}
                            className="px-3 py-1.5 hover:bg-amazon-light-gray transition-colors"
                            title="Increase"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="text-amazon-border">|</span>

                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-amazon-link hover:text-red-600 text-xs flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-amazon-red font-medium text-lg">
                        ₹{total.toLocaleString('en-IN')}
                      </p>
                      {discount > 0 && (
                        <p className="text-amazon-gray line-through text-xs">
                          ₹{(original * (item.quantity || 1)).toLocaleString('en-IN')}
                        </p>
                      )}
                      {discount > 0 && (
                        <p className="text-amazon-green text-xs font-medium">-{discount}%</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continue shopping */}
            <div className="flex items-center justify-between bg-white rounded-sm border border-amazon-border px-5 py-4">
              <Link to="/products" className="text-amazon-link hover:text-amazon-link-hover text-sm flex items-center gap-1">
                ← Continue Shopping
              </Link>
              {totalDiscount > 0 && (
                <p className="text-amazon-green text-sm font-medium">
                  Subtotal savings: ₹{totalDiscount.toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </div>

          {/* ── Order Summary ──────────────────────────────────── */}
          <div className="space-y-3 lg:sticky lg:top-20">
            {/* Summary card */}
            <div className="bg-white rounded-sm border border-amazon-border p-5 space-y-3">
              <h2 className="font-semibold text-gray-900 text-base">
                Order Summary ({totalItems} item{totalItems !== 1 ? 's' : ''})
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-amazon-green">
                    <span>Discount</span>
                    <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-amazon-green">
                  <span>Delivery</span>
                  <span className="font-medium">FREE</span>
                </div>
                <div className="border-t border-amazon-border pt-2 flex justify-between font-bold text-base">
                  <span className="text-gray-900">Order Total</span>
                  <span className="text-amazon-red">₹{orderTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {totalDiscount > 0 && (
                <div className="bg-amazon-green/5 border border-amazon-green/20 rounded p-2.5 text-amazon-green text-xs font-medium text-center">
                  🎉 You're saving ₹{totalDiscount.toLocaleString('en-IN')} on this order!
                </div>
              )}
            </div>

            {/* Coin wallet card */}
            <div className="bg-white rounded-sm border border-amazon-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins size={16} className="text-amazon-orange" />
                <h3 className="text-sm font-semibold text-gray-900">Coin Wallet</h3>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-amazon-gray">Available coins:</span>
                <span className="font-bold text-amazon-orange-dark">{balance.toLocaleString()} 🪙</span>
              </div>
              {!canAfford && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                  You need more coins to pay entirely with coins.
                </div>
              )}
              <Link to="/earn" className="block mt-2 text-amazon-link hover:underline text-xs">
                Earn more coins →
              </Link>
            </div>

            {/* Checkout button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-amazon py-3 font-semibold rounded-full text-base flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ChevronRight size={18} />
            </button>

            {/* Trust badges */}
            <div className="bg-white rounded-sm border border-amazon-border p-4 space-y-2.5">
              {[
                { Icon: Shield,   text: 'Secure checkout - SSL encrypted' },
                { Icon: Truck,    text: 'Free delivery on all orders' },
                { Icon: RefreshCw, text: 'Easy 30-day returns' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-xs text-amazon-gray">
                  <Icon size={13} className="text-amazon-green shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
