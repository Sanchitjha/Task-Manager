import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Shop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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
          category: selectedCategory === 'all' ? undefined : selectedCategory
        }
      });
      setProducts(res.data.items || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(res.data.items.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUserBalance = async () => {
    try {
      if (user) {
        const res = await api.get('/users/me');
        setUserBalance(res.data.user?.coinsBalance || 0);
      }
    } catch (e) {
      console.error('Failed to load balance:', e);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    localStorage.setItem('shoppingCart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product._id);
    if (existingItem) {
      const newCart = cart.map(item =>
        item.id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(newCart);
    } else {
      const newCart = [...cart, {
        id: product._id,
        name: product.name,
        price: product.finalPrice || product.originalPrice,
        coinPrice: product.coinPrice || Math.ceil(product.finalPrice / 10),
        image: product.images?.[0],
        quantity: 1
      }];
      saveCart(newCart);
    }
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCoinTotal = () => {
    return cart.reduce((total, item) => total + (item.coinPrice * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setIsCheckingOut(true);
      const orderData = {
        items: cart.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
          coinPrice: item.coinPrice
        })),
        paymentMethod: 'coins',
        totalAmount: getCartTotal(),
        totalCoins: getCartCoinTotal()
      };

      const res = await api.post('/orders', orderData);
      
      // Clear cart
      saveCart([]);
      
      // Refresh balance
      await loadUserBalance();
      
      // Navigate to orders page
      navigate('/orders');
      
    } catch (e) {
      console.error('Checkout failed:', e);
      alert('Checkout failed: ' + (e.response?.data?.message || 'Unknown error'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the shop</p>
          <Link to="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Balance: </span>
                <span className="font-bold text-orange-600">{userBalance} coins</span>
              </div>
              <div className="relative">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  Cart ({cart.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded ${selectedCategory === 'all' ? 'bg-orange-100 text-orange-800' : 'hover:bg-gray-100'}`}
                >
                  All Products
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded ${selectedCategory === category ? 'bg-orange-100 text-orange-800' : 'hover:bg-gray-100'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          ₹{item.price} ({item.coinPrice} coins)
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-sm"
                          >
                            -
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600">
                      Total: ₹{getCartTotal().toFixed(2)}
                    </div>
                    <div className="text-sm font-bold text-orange-600">
                      {getCartCoinTotal()} coins needed
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full mt-3 py-2 px-4 rounded bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isCheckingOut ? '⏳ Processing...' : 
                       userBalance < getCartCoinTotal() ? '🪙 Checkout (Need More Coins)' : '✅ Checkout'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          {product.originalPrice !== product.finalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                          <div className="text-lg font-bold">
                            ₹{product.finalPrice || product.originalPrice}
                          </div>
                          <div className="text-sm text-orange-600">
                            {product.coinPrice || Math.ceil(product.finalPrice / 10)} coins
                          </div>
                        </div>
                        
                        {product.discountPercentage > 0 && (
                          <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                            {product.discountPercentage}% OFF
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No products found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

