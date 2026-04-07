import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { ShoppingCart, Search, SlidersHorizontal, Coins, ChevronRight } from 'lucide-react';

const CART_KEY = 'shopCart';

function StarRating({ rating = 4 }) {
  return <span className="stars text-xs">{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>;
}

export default function Shop() {
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const [products,      setProducts]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [categories,    setCategories]    = useState([]);
  const [selectedCat,   setSelectedCat]   = useState('All');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [cart,          setCart]          = useState([]);
  const [userBalance,   setUserBalance]   = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartOpen,      setCartOpen]      = useState(false);

  useEffect(() => {
    loadProducts();
    loadBalance();
    loadCart();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products', { params: { limit: 60 } });
      const items = res.data.items || [];
      setProducts(items);
      // Unique categories
      const cats = ['All', ...new Set(items.map((p) => p.category).filter(Boolean))];
      setCategories(cats);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    if (!user) return;
    try {
      const res = await api.get('/wallet/balance');
      setUserBalance(res.data.balance || res.data.coins || 0);
    } catch { /* silent */ }
  };

  const loadCart = () => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      setCart(saved ? JSON.parse(saved) : []);
    } catch { setCart([]); }
  };

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem(CART_KEY, JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    if (!user) { navigate('/login'); return; }
    const existing = cart.find((i) => i._id === product._id);
    if (existing) {
      saveCart(cart.map((i) => i._id === product._id ? { ...i, quantity: (i.quantity || 1) + 1 } : i));
    } else {
      saveCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => saveCart(cart.filter((i) => i._id !== id));

  const updateQty = (id, delta) => {
    const updated = cart
      .map((i) => i._id === id ? { ...i, quantity: Math.max(0, (i.quantity || 1) + delta) } : i)
      .filter((i) => (i.quantity || 0) > 0);
    saveCart(updated);
  };

  const getItemPrice = (p) => p.finalPrice ?? p.price ?? p.originalPrice ?? 0;
  const cartTotal    = cart.reduce((s, i) => s + getItemPrice(i) * (i.quantity || 1), 0);
  const cartCount    = cart.reduce((s, i) => s + (i.quantity || 1), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setIsCheckingOut(true);
      const orderData = {
        items: cart.map((item) => ({
          product:   item._id,
          quantity:  item.quantity || 1,
          price:     getItemPrice(item),
        })),
        paymentMethod: 'coins',
        totalAmount:   cartTotal,
      };
      await api.post('/orders', orderData);
      saveCart([]);
      await loadBalance();
      navigate('/orders');
    } catch (e) {
      console.error('Checkout failed:', e);
      alert('Checkout failed: ' + (e.response?.data?.message || 'Unknown error'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchCat  = selectedCat === 'All' || p.category === selectedCat;
    const matchSearch = !searchQuery || (p.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-amazon-bg flex items-center justify-center">
        <div className="bg-white rounded-sm border border-amazon-border p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to Shop</h2>
          <p className="text-gray-500 text-sm mb-6">Please sign in to browse and purchase products.</p>
          <Link to="/login" className="btn-amazon px-8">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon-bg">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-amazon-border sticky top-14 z-30">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products in shop…"
              className="w-full pl-9 pr-4 py-2 border border-amazon-border rounded text-sm focus:ring-2 focus:ring-amazon-orange/30 focus:border-amazon-orange outline-none"
            />
          </div>
          {/* Balance */}
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded px-3 py-2">
            <Coins size={14} className="text-amazon-orange" />
            <span className="text-sm font-bold text-amazon-orange-dark">{userBalance.toLocaleString()} coins</span>
          </div>
          {/* Cart toggle */}
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative flex items-center gap-1.5 bg-amazon-orange hover:bg-amazon-orange-light text-gray-900 px-4 py-2 rounded font-medium text-sm transition-colors"
          >
            <ShoppingCart size={16} />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-5">
        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                selectedCat === cat
                  ? 'bg-amazon-orange text-gray-900 border-amazon-orange'
                  : 'bg-white text-gray-600 border-amazon-border hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-5 items-start">
          {/* ── Products Grid ──────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-sm border border-amazon-border overflow-hidden">
                    <div className="h-44 shimmer" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 shimmer rounded" />
                      <div className="h-5 shimmer rounded w-1/2" />
                      <div className="h-7 shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-sm border border-amazon-border p-12 text-center">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-gray-500 font-medium">No products found</p>
                <p className="text-gray-400 text-sm mt-1">Try a different category or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filtered.map((product) => {
                  const price    = getItemPrice(product);
                  const original = product.originalPrice || 0;
                  const discount = product.discountPercentage || 0;
                  const inCart   = cart.find((i) => i._id === product._id);
                  const imgUrl   = product.images?.[0] ? api.getProfileImageUrl(product.images[0]) : null;
                  const inStock  = (product.stock || 0) > 0;

                  return (
                    <div key={product._id} className="product-card bg-white group flex flex-col">
                      {/* Image */}
                      <Link to={`/product/${product._id}`} className="block h-44 bg-white flex items-center justify-center overflow-hidden p-3 relative">
                        {imgUrl ? (
                          <img src={imgUrl} alt={product.title} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                        ) : (
                          <span className="text-4xl text-gray-200">📦</span>
                        )}
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 bg-amazon-red text-white text-xs px-1.5 py-0.5 rounded font-bold">-{discount}%</span>
                        )}
                      </Link>

                      <div className="p-3 flex flex-col flex-1">
                        <Link to={`/product/${product._id}`}>
                          <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-snug mb-1 hover:text-amazon-link">{product.title}</p>
                        </Link>
                        <StarRating rating={product.ratings || 4} />
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="text-amazon-red font-medium text-base">₹{price.toLocaleString('en-IN')}</span>
                          {discount > 0 && <span className="text-amazon-gray line-through text-xs">₹{original}</span>}
                        </div>
                        <p className={`text-xs mt-0.5 ${inStock ? 'text-amazon-green' : 'text-red-500'}`}>
                          {inStock ? 'In Stock' : 'Out of Stock'}
                        </p>

                        <div className="mt-auto pt-2">
                          {inCart ? (
                            <div className="flex items-center gap-1 border border-amazon-border rounded overflow-hidden text-sm">
                              <button onClick={() => updateQty(product._id, -1)} className="px-2.5 py-1.5 hover:bg-amazon-light-gray font-bold">−</button>
                              <span className="flex-1 text-center font-semibold">{inCart.quantity}</span>
                              <button onClick={() => updateQty(product._id, 1)} className="px-2.5 py-1.5 hover:bg-amazon-light-gray font-bold">+</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              disabled={!inStock}
                              className="w-full bg-amazon-orange hover:bg-amazon-orange-light disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 text-xs font-medium py-2 rounded transition-colors"
                            >
                              {inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Cart Sidebar ──────────────────────────────────── */}
          {cartOpen && cart.length > 0 && (
            <div className="w-72 shrink-0 bg-white rounded-sm border border-amazon-border p-4 sticky top-28 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">Cart ({cartCount})</h3>
                <button onClick={() => setCartOpen(false)} className="text-amazon-gray hover:text-gray-900 text-lg leading-none">×</button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-2 items-center border-b border-amazon-border pb-2">
                    <div className="w-10 h-10 bg-gray-50 rounded border border-amazon-border flex items-center justify-center shrink-0 overflow-hidden">
                      {item.images?.[0] ? (
                        <img src={api.getProfileImageUrl(item.images[0])} alt={item.title} className="w-full h-full object-contain" />
                      ) : <span className="text-lg">📦</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-amazon-red">₹{getItemPrice(item)} × {item.quantity}</p>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="text-amazon-gray hover:text-red-500 text-xs shrink-0">✕</button>
                  </div>
                ))}
              </div>

              <div className="border-t border-amazon-border pt-2">
                <div className="flex justify-between text-sm font-bold mb-3">
                  <span>Total:</span>
                  <span className="text-amazon-red">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cart.length === 0}
                  className="w-full btn-amazon py-2.5 font-semibold disabled:opacity-50"
                >
                  {isCheckingOut ? 'Processing…' : 'Checkout'}
                </button>
                <Link to="/cart" className="block text-center text-amazon-link text-xs mt-2 hover:underline">
                  View Full Cart <ChevronRight size={10} className="inline" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
