import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const VendorShop = () => {
  const { vendorId } = useParams();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountInfo, setDiscountInfo] = useState(null);

  useEffect(() => {
    loadVendorData();
  }, [vendorId]);

  const loadVendorData = async () => {
    try {
      // Get vendor info and products
      const [vendorRes, productsRes] = await Promise.all([
        api.get(`/users/${vendorId}`),
        api.get(`/products?vendor=${vendorId}&published=true`)
      ]);

      setVendor(vendorRes.data.user);
      setProducts(productsRes.data.products || []);
    } catch (error) {
      setError('Failed to load shop data');
    } finally {
      setLoading(false);
    }
  };

  const checkDiscount = async (productId) => {
    if (!user) {
      alert('Please login to check discount availability');
      return;
    }

    try {
      const response = await api.get(`/wallet/check-discount/${productId}`);
      setDiscountInfo(response.data);
      setSelectedProduct(productId);
      setShowDiscountModal(true);
    } catch (error) {
      alert('Failed to check discount: ' + (error.response?.data?.message || error.message));
    }
  };

  const openMap = (address) => {
    const query = encodeURIComponent(`${address.street}, ${address.area}, ${address.city}, ${address.pincode}`);
    window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  if (!vendor) {
    return <div className="text-center p-4">Shop not found</div>;
  }

  const shopDetails = vendor.shopDetails;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Shop Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">
              {shopDetails?.shopName || vendor.name}
            </h1>
            {shopDetails?.ownerName && (
              <p className="text-gray-600">Owner: {shopDetails.ownerName}</p>
            )}
            {shopDetails?.category && (
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mt-2">
                {shopDetails.category}
              </span>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            {shopDetails?.contactNumber && (
              <a 
                href={`tel:${shopDetails.contactNumber}`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-center hover:bg-green-700"
              >
                📞 Call Shop
              </a>
            )}
            
            {shopDetails?.whatsappNumber && (
              <a 
                href={`https://wa.me/${shopDetails.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-center hover:bg-green-600"
              >
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>

        {shopDetails?.description && (
          <p className="text-gray-700 mt-4">{shopDetails.description}</p>
        )}
      </div>

      {/* Shop Address & Timing */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📍 Address</h3>
          {shopDetails?.address && (
            <div>
              <p className="text-gray-700">
                {shopDetails.address.street}
                {shopDetails.address.area && `, ${shopDetails.address.area}`}
              </p>
              <p className="text-gray-700">
                {shopDetails.address.city} - {shopDetails.address.pincode}
              </p>
              {shopDetails.address.state && (
                <p className="text-gray-700">{shopDetails.address.state}</p>
              )}
              
              <button 
                onClick={() => openMap(shopDetails.address)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                🗺️ View on Map
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🕒 Timing</h3>
          {shopDetails?.timing?.isOpen24x7 ? (
            <p className="text-green-600 font-semibold">Open 24/7</p>
          ) : (
            <div>
              {shopDetails?.timing?.openTime && shopDetails?.timing?.closeTime && (
                <p className="text-gray-700">
                  {shopDetails.timing.openTime} - {shopDetails.timing.closeTime}
                </p>
              )}
              
              {shopDetails?.timing?.workingDays && shopDetails.timing.workingDays.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Working Days:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {shopDetails.timing.workingDays.map(day => (
                      <span key={day} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Available Products</h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {product.images && product.images.length > 0 && (
                  <img 
                    src={product.images[0]} 
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        ₹{product.originalPrice || product.price}
                      </span>
                      {product.coinDiscount > 0 && (
                        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          🪙 Up to {product.coinDiscount} coins off
                        </span>
                      )}
                    </div>
                    
                    {product.coinDiscount > 0 && (
                      <p className="text-sm text-gray-600">
                        Max discount: ₹{(product.coinDiscount * (product.coinConversionRate || 1)).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert('Visit the physical store to purchase this item')}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                      🏪 Buy In-Store
                    </button>
                    
                    {product.coinDiscount > 0 && user && (
                      <button
                        onClick={() => checkDiscount(product._id)}
                        className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                      >
                        🪙
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount Info Modal */}
      {showDiscountModal && discountInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">💰 Discount Calculator</h3>
              <button 
                onClick={() => setShowDiscountModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{discountInfo.product.title}</h4>
                <p className="text-2xl font-bold text-green-600">₹{discountInfo.product.originalPrice}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Your Coins:</p>
                    <p className="font-semibold">{discountInfo.user.availableCoins}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Max Usable:</p>
                    <p className="font-semibold">{discountInfo.user.maxUsableCoins}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Max Discount:</p>
                    <p className="font-semibold text-green-600">₹{discountInfo.user.maxDiscountAmount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Final Price:</p>
                    <p className="font-semibold text-blue-600">₹{discountInfo.user.finalPrice}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Visit {discountInfo.vendor.shopName || discountInfo.vendor.name} 
                  to make the purchase and apply your coin discount.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowDiscountModal(false)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop Policies */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-yellow-800">📋 Shop Policies</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2">💰 Payment</h4>
            <p className="text-yellow-800">Cash only at store. Use coins for discounts.</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2">🚫 No Delivery</h4>
            <p className="text-yellow-800">In-store pickup only. Visit the physical location.</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2">↩️ No Returns</h4>
            <p className="text-yellow-800">All sales final. Check products before purchase.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorShop;