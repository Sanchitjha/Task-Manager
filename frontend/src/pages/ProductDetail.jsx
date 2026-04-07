import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import {
  ShoppingCart, Zap, MessageCircle, Star, ChevronRight,
  Truck, Shield, RefreshCw, Package, Minus, Plus, Heart
} from 'lucide-react';

function StarRating({ rating = 4.5, count = 0 }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-2">
      <span className="stars text-lg">
        {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}
      </span>
      <span className="text-amazon-link text-sm font-medium">{rating.toFixed(1)}</span>
      {count > 0 && <span className="text-amazon-gray text-sm">({count} reviews)</span>}
    </div>
  );
}

export default function ProductDetail() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [product,      setProduct]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [selectedImg,  setSelectedImg]  = useState(0);
  const [quantity,     setQuantity]     = useState(1);
  const [userBalance,  setUserBalance]  = useState(0);
  const [addedToCart,  setAddedToCart]  = useState(false);
  const [vendorName,   setVendorName]   = useState('');

  useEffect(() => {
    loadProduct();
    if (user) loadUserBalance();
  }, [id, user]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      const p   = res.data.product || res.data;
      setProduct(p);

      // Try to get vendor name from the users endpoint (safe fallback)
      if (p.vendor) {
        try {
          const vRes = await api.get(`/users/${p.vendor}`);
          setVendorName(vRes.data.user?.name || vRes.data.name || 'Partner');
        } catch {
          setVendorName('Partner Seller');
        }
      }
    } catch (e) {
      console.error('Failed to load product:', e);
      setError('Product not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      setUserBalance(res.data.balance || res.data.coins || 0);
    } catch { /* silent */ }
  };

  // Price helpers - handle multiple possible field names
  const getPrice = () => {
    if (!product) return 0;
    return product.finalPrice ?? product.price ?? product.originalPrice ?? 0;
  };

  const getOriginalPrice = () => {
    if (!product) return 0;
    return product.originalPrice ?? product.price ?? 0;
  };

  const getDiscount = () => product?.discountPercentage || 0;

  const addToCart = (goToCart = false) => {
    if (!user) { navigate('/login'); return; }
    try {
      const cart = JSON.parse(localStorage.getItem('shopCart') || '[]');
      const idx  = cart.findIndex((i) => i._id === product._id);
      if (idx >= 0) {
        cart[idx].quantity = (cart[idx].quantity || 1) + quantity;
      } else {
        cart.push({ ...product, quantity });
      }
      localStorage.setItem('shopCart', JSON.stringify(cart));
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      if (goToCart) navigate('/cart');
    } catch { /* ignore */ }
  };

  const contactVendor = () => {
    const msg = `Hi, I'm interested in: ${product.title}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-amazon-bg">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="bg-white rounded-sm border border-amazon-border p-6 grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="h-80 bg-gray-100 shimmer rounded" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => <div key={i} className="w-16 h-16 bg-gray-100 shimmer rounded" />)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-100 shimmer rounded w-3/4" />
              <div className="h-4 bg-gray-100 shimmer rounded w-1/2" />
              <div className="h-8 bg-gray-100 shimmer rounded w-1/3" />
              <div className="h-24 bg-gray-100 shimmer rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !product) {
    return (
      <div className="min-h-screen bg-amazon-bg flex items-center justify-center">
        <div className="bg-white rounded-sm border border-amazon-border p-10 text-center max-w-md">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <Link to="/products" className="btn-amazon px-6">← Back to Products</Link>
        </div>
      </div>
    );
  }

  const price      = getPrice();
  const original   = getOriginalPrice();
  const discount   = getDiscount();
  const totalPrice = price * quantity;
  const inStock    = (product.stock || 0) > 0;
  const images     = product.images || [];

  return (
    <div className="min-h-screen bg-amazon-bg">
      <div className="max-w-[1200px] mx-auto px-4 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-amazon-gray mb-4 flex-wrap">
          <Link to="/" className="hover:text-amazon-link">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-amazon-link">Products</Link>
          {product.category && (
            <>
              <ChevronRight size={12} />
              <Link to={`/products?category=${product.category}`} className="hover:text-amazon-link">
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-gray-700 truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* ── Main Product Block ──────────────────────────────────── */}
        <div className="bg-white rounded-sm border border-amazon-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_320px] gap-0 divide-y lg:divide-y-0 lg:divide-x divide-amazon-border">

            {/* Column 1: Images */}
            <div className="p-6 flex flex-col gap-4">
              {/* Main image */}
              <div className="aspect-square bg-white flex items-center justify-center border border-amazon-border rounded overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={api.getProfileImageUrl(images[selectedImg])}
                    alt={product.title}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/default-product.png'; }}
                  />
                ) : (
                  <div className="text-7xl text-gray-200">📦</div>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`w-14 h-14 rounded border-2 overflow-hidden transition-all ${
                        selectedImg === i ? 'border-amazon-orange' : 'border-amazon-border hover:border-gray-400'
                      }`}
                    >
                      <img src={api.getProfileImageUrl(img)} alt={`img ${i + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Info */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <h1 className="text-xl font-medium text-gray-900 leading-snug">{product.title}</h1>

              {/* Brand / Vendor */}
              {vendorName && (
                <p className="text-amazon-link text-sm">
                  by <span className="font-medium">{vendorName}</span>
                </p>
              )}

              {/* Rating */}
              <StarRating rating={product.ratings || 4.5} />

              <div className="border-t border-amazon-border" />

              {/* Price block */}
              <div className="space-y-1.5">
                {discount > 0 ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 bg-amazon-red text-white px-1.5 py-0.5 rounded">
                        -{discount}%
                      </span>
                      <span className="text-amazon-red text-2xl font-medium">
                        <span className="text-sm align-top">₹</span>
                        {price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-amazon-gray text-sm">
                      M.R.P.: <span className="line-through">₹{original.toLocaleString('en-IN')}</span>
                      <span className="text-amazon-green ml-2">You save ₹{(original - price).toLocaleString('en-IN')}</span>
                    </p>
                  </>
                ) : (
                  <span className="text-amazon-red text-2xl font-medium">
                    <span className="text-sm align-top">₹</span>
                    {price.toLocaleString('en-IN')}
                  </span>
                )}

                {/* Coin discount info */}
                {product.coinDiscount > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded px-3 py-1.5">
                    <span className="text-orange-500">🪙</span>
                    <span className="text-sm text-orange-700 font-medium">
                      Apply {product.coinDiscount} coins for extra discount
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-amazon-border" />

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">About this product</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Stock status */}
              <div className={`text-sm font-medium ${inStock ? 'text-amazon-green' : 'text-red-600'}`}>
                {inStock ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
              </div>

              {/* Category */}
              {product.category && (
                <p className="text-xs text-amazon-gray">
                  Category: <Link to={`/products?category=${product.category}`} className="text-amazon-link hover:underline">{product.category}</Link>
                </p>
              )}
            </div>

            {/* Column 3: Buy Box */}
            <div className="p-5">
              <div className="border border-amazon-border rounded-lg p-4 space-y-4">
                {/* Price in buy box */}
                <div>
                  <span className="text-amazon-red text-2xl font-medium">
                    <span className="text-sm align-top">₹</span>
                    {(price * quantity).toLocaleString('en-IN')}
                  </span>
                  {discount > 0 && <span className="text-amazon-green text-xs ml-2">({discount}% off)</span>}
                </div>

                {/* Your balance */}
                {user && (
                  <div className="bg-amazon-bg rounded p-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amazon-gray">Coin Balance:</span>
                      <span className="font-bold text-amazon-orange-dark">🪙 {userBalance.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Delivery */}
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <Truck size={14} className="text-amazon-green mt-0.5 shrink-0" />
                  <span><span className="text-amazon-green font-medium">FREE Delivery</span> on eligible orders</span>
                </div>

                {/* Stock */}
                <p className={`text-sm font-bold ${inStock ? 'text-amazon-green' : 'text-red-600'}`}>
                  {inStock ? 'In Stock' : 'Currently Unavailable'}
                </p>

                {inStock && (
                  <>
                    {/* Quantity */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 font-medium">Qty:</label>
                      <div className="flex items-center border border-amazon-border rounded overflow-hidden">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="px-2.5 py-1.5 hover:bg-amazon-light-gray transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 py-1.5 text-sm font-semibold border-x border-amazon-border min-w-[40px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                          className="px-2.5 py-1.5 hover:bg-amazon-light-gray transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <button
                      onClick={() => addToCart(false)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all ${
                        addedToCart
                          ? 'bg-green-500 text-white'
                          : 'bg-amazon-orange hover:bg-amazon-orange-light text-gray-900'
                      }`}
                    >
                      <ShoppingCart size={16} />
                      {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
                    </button>

                    <button
                      onClick={() => addToCart(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium bg-amazon-orange-dark hover:bg-amazon-orange text-white transition-all"
                    >
                      <Zap size={16} />
                      Buy Now
                    </button>

                    {!user && (
                      <p className="text-xs text-center text-amazon-gray">
                        <Link to="/login" className="text-amazon-link hover:underline">Sign in</Link> to purchase
                      </p>
                    )}
                  </>
                )}

                {/* Contact vendor */}
                <button
                  onClick={contactVendor}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded border border-amazon-border text-xs text-gray-600 hover:bg-amazon-light-gray transition-colors"
                >
                  <MessageCircle size={14} className="text-green-600" />
                  Contact Seller
                </button>

                {/* Security badges */}
                <div className="space-y-1.5 pt-2 border-t border-amazon-border">
                  {[
                    { icon: Shield,   text: 'Secure transaction' },
                    { icon: Package,  text: 'Quality Guaranteed' },
                    { icon: RefreshCw, text: 'Easy returns' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-amazon-gray">
                      <Icon size={12} className="text-amazon-green" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── More info section ──────────────────────────────────── */}
        <div className="mt-4 bg-white rounded-sm border border-amazon-border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-amazon-border">
            Product Details
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-amazon-border">
              {[
                ['Category', product.category],
                ['Stock', product.stock ? `${product.stock} units` : 'N/A'],
                ['Seller', vendorName || 'Partner Seller'],
                product.coinDiscount > 0 && ['Coin Discount', `${product.coinDiscount} coins`],
              ].filter(Boolean).map(([key, val]) => (
                <tr key={key} className="hover:bg-amazon-bg">
                  <td className="py-2.5 pr-6 font-medium text-gray-700 w-1/3">{key}</td>
                  <td className="py-2.5 text-gray-600">{val || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
