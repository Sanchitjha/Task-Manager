import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [userBalance, setUserBalance] = useState(0);
  const [cart, setCart] = useState([]);
  const [vendorInfo, setVendorInfo] = useState(null);

  useEffect(() => {
    loadProduct();
    loadUserBalance();
    loadCart();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
      
      // Load vendor info
      if (res.data.product.vendor) {
        const vendorRes = await api.get(`/vendor/profile/${res.data.product.vendor}`);
        setVendorInfo(vendorRes.data.vendor);
      }
    } catch (e) {
      console.error('Failed to load product:', e);
      setError('Failed to load product');
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

  const addToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const existingItem = cart.find(item => item._id === product._id);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('shopCart', JSON.stringify(updatedCart));
    alert('Product added to cart!');
  };

  const buyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (userBalance < product.price * quantity) {
      alert('Insufficient coins! Please earn more coins to purchase this item.');
      return;
    }
    
    // Add to cart and go to checkout
    addToCart();
    navigate('/checkout');
  };

  const contactVendor = () => {
    if (vendorInfo && vendorInfo.whatsapp) {
      const message = `Hi, I'm interested in your product: ${product.title}`;
      const whatsappUrl = `https://wa.me/${vendorInfo.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-4">Please login to view product details</p>
          <Link to="/login" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
            Login
          </Link>
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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Link to="/shop" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;
  const canAfford = userBalance >= totalPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/shop" className="hover:text-orange-600">Shop</Link>
            <span>›</span>
            <span className="text-gray-900">{product.title}</span>
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000${product.images[selectedImage]}`}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-6xl">📦</span>
                  </div>
                )}
              </div>
              
              {/* Image thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-orange-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={`http://localhost:5000${image}`}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-gray-600">{product.category}</p>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-orange-600">{product.price} coins</span>
                {product.stock > 0 ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    Out of Stock
                  </span>
                )}
              </div>

              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {/* Vendor Info */}
              {vendorInfo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Sold by</h3>
                  <p className="text-gray-600">{vendorInfo.name}</p>
                  {vendorInfo.whatsapp && (
                    <button
                      onClick={contactVendor}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      📱 Contact Seller
                    </button>
                  )}
                </div>
              )}

              {/* Your Balance */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your Balance:</span>
                  <span className="font-bold text-orange-600">{userBalance} coins</span>
                </div>
              </div>

              {/* Quantity and Actions */}
              {product.stock > 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="w-16 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium">Total:</span>
                      <span className="text-2xl font-bold text-orange-600">{totalPrice} coins</span>
                    </div>

                    {!canAfford && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                        <p className="text-red-700 text-sm">
                          Insufficient coins. You need {totalPrice - userBalance} more coins.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={addToCart}
                        className="w-full bg-orange-100 text-orange-700 py-3 rounded-lg font-medium hover:bg-orange-200 transition"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={buyNow}
                        className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition"
                      >
                        {!canAfford ? '🪙 Insufficient Coins - Buy Now' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 text-xl">🚚</span>
              </div>
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Quick and secure delivery to your doorstep</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <h3 className="font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600 text-sm">100% authentic products from verified vendors</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">💬</span>
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Customer support via WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}