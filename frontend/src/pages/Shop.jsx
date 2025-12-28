import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../lib/api';

export default function Shop() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');
  const [cart, setCart] = useState([]);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    loadProducts();
    loadUserBalance();
    loadCart();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products', {
        params: {
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sortBy: sortBy
        }
      });
      setProducts(res.data.items || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(res.data.items.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (e) {
      console.error('Failed to load products:', e);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadUserBalance = async () => {
    try {
      if (user) {
        const res = await api.get('/wallet/balance');
        setUserBalance(res.data.balance || 0);
      }
    } catch (e) {
      console.error('Failed to load balance:', e);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('shopCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (product, quantity = 1) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (product.stock < quantity) {
      addNotification(`Sorry, only ${product.stock} items available in stock`, 'warning');
      return;
    }

    const existingItem = cart.find(item => item._id === product._id);
    let updatedCart;
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        addNotification(`Cannot add more items. Maximum ${product.stock} available`, 'warning');
        return;
      }
      updatedCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: newQuantity }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('shopCart', JSON.stringify(updatedCart));
    
    // Show success feedback
    setError('');
    addNotification(`🛒 ${product.title} added to cart! (Qty: ${quantity})`, 'success');
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleQuickBuy = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (userBalance < product.price) {
      addNotification(`💰 Insufficient coins! You need ${product.price - userBalance} more coins to buy this item.`, 'warning', 4000);
      return;
    }
    
    // Add to cart and go to checkout
    addToCart(product, 1);
    addNotification('🚀 Added to cart! Redirecting to checkout...', 'success');
    setTimeout(() => navigate('/checkout'), 1000);
  };

  const featuredCategories = [
    { name: 'clothes', label: 'Clothing', icon: '👕', color: 'bg-rose-100 text-rose-800' },
    { name: 'retail', label: 'Retail', icon: '🛍️', color: 'bg-blue-100 text-blue-800' },
    { name: 'home', label: 'Home Products', icon: '🏠', color: 'bg-green-100 text-green-800' },
    { name: 'cosmetic', label: 'Cosmetics', icon: '💄', color: 'bg-pink-100 text-pink-800' },
    { name: 'essential', label: 'Essentials', icon: '🧴', color: 'bg-purple-100 text-purple-800' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-4">Please login to access the shop</p>
          <Link to="/login" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-orange-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🛍️ The MANAGER Shop
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">Balance:</span>
                <span className="text-orange-600 font-bold">{userBalance} coins</span>
              </div>
              
              <Link to="/cart" className="relative bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">
                🛒 Cart
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Shop with Your Coins</h2>
          <p className="text-xl mb-8 opacity-90">Turn your earned coins into amazing products</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {featuredCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`${cat.color} p-4 rounded-xl hover:shadow-lg transition text-center`}
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="font-semibold text-sm">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            
            <button
              onClick={loadProducts}
              className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button onClick={loadProducts} className="bg-orange-600 text-white px-4 py-2 rounded">
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">No products found</div>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition border overflow-hidden">
                <div className="aspect-w-1 aspect-h-1">
                  {product.images && product.images[0] ? (
                    <img
                      src={`http://localhost:5000${product.images[0]}`}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📦</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-orange-600">{product.price} coins</span>
                    {product.stock > 0 ? (
                      <span className="text-green-600 text-sm">In Stock</span>
                    ) : (
                      <span className="text-red-600 text-sm">Out of Stock</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/product/${product._id}`}
                      className="flex-1 bg-gray-100 text-gray-800 px-3 py-2 rounded text-center text-sm hover:bg-gray-200 transition"
                    >
                      View Details
                    </Link>
                    
                    {product.stock > 0 && (
                    <div className="space-y-2">
                      {/* Add to Cart with Quantity */}
                      <div className="flex items-center space-x-2">
                        <select 
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          id={`quantity-${product._id}`}
                          defaultValue="1"
                        >
                          {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const quantity = parseInt(document.getElementById(`quantity-${product._id}`).value);
                            addToCart(product, quantity);
                          }}
                          className="bg-orange-100 text-orange-700 px-3 py-2 rounded text-sm hover:bg-orange-200 transition"
                        >
                          🛒 Add to Cart
                        </button>
                      </div>
                      
                      {/* Buy Now Button */}
                      <button
                        onClick={() => handleQuickBuy(product)}
                        className={`w-full py-2 rounded text-sm font-medium transition ${
                          userBalance >= product.price
                            ? 'bg-orange-600 text-white hover:bg-orange-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={userBalance < product.price}
                        title={userBalance < product.price ? `Need ${product.price - userBalance} more coins` : 'Buy now with coins'}
                      >
                        {userBalance >= product.price ? '⚡ Buy Now' : '💰 Insufficient Coins'}
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Summary */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-4 right-4 bg-white border-2 border-orange-600 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">🛒 Cart</span>
            <Link to="/cart" className="text-orange-600 hover:text-orange-700">
              <span className="text-sm">View Cart →</span>
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            <div>{getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}</div>
            <div className="font-bold text-orange-600">{getCartTotal()} coins total</div>
          </div>
          <div className="mt-3 flex space-x-2">
            <Link 
              to="/cart" 
              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-center text-sm hover:bg-gray-200 transition"
            >
              Edit Cart
            </Link>
            <Link 
              to="/checkout" 
              className={`flex-1 px-3 py-2 rounded text-center text-sm font-medium transition ${
                userBalance >= getCartTotal()
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {userBalance >= getCartTotal() ? 'Checkout' : 'Need More Coins'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

