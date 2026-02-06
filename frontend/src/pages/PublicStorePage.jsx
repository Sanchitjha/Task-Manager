import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  FaStore, FaMapMarkerAlt, FaClock, FaPhone, FaStar, FaCoins,
  FaDirections, FaWhatsapp, FaImage, FaRupeeSign, FaExclamationTriangle,
  FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaSpinner
} from 'react-icons/fa';

const PublicStorePage = () => {
  const { partnerId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (partnerId) {
      fetchStoreData();
    }
  }, [partnerId]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      
      // Fetch store details
      const storeResponse = await api.get(`/partners/${partnerId}/store`);
      setStore(storeResponse.data);
      
      // Fetch store products
      const productsResponse = await api.get(`/products?partner=${partnerId}&status=active`);
      setProducts(productsResponse.data.products || []);
      
    } catch (error) {
      console.error('Error fetching store data:', error);
      setError('Store not found or unavailable');
      toast.error('Failed to load store information');
    } finally {
      setLoading(false);
    }
  };

  const getOpenStatus = () => {
    if (!store?.shopDetails?.timing) return 'Unknown';
    
    if (store.shopDetails.timing.isOpen24x7) {
      return 'Open 24/7';
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    
    const workingDays = store.shopDetails.timing.workingDays || [];
    if (!workingDays.includes(currentDay)) {
      return 'Closed today';
    }
    
    const openTime = store.shopDetails.timing.openTime ? 
      parseInt(store.shopDetails.timing.openTime.replace(':', '')) : null;
    const closeTime = store.shopDetails.timing.closeTime ? 
      parseInt(store.shopDetails.timing.closeTime.replace(':', '')) : null;
    
    if (openTime && closeTime) {
      if (currentTime >= openTime && currentTime <= closeTime) {
        return 'Open now';
      } else {
        return 'Closed now';
      }
    }
    
    return 'Unknown';
  };

  const openInMaps = () => {
    const { latitude, longitude } = store?.shopDetails?.location || {};
    const address = store?.shopDetails?.address;
    
    if (latitude && longitude) {
      window.open(`https://maps.google.com/maps?q=${latitude},${longitude}`, '_blank');
    } else if (address) {
      const fullAddress = `${address.street}, ${address.area}, ${address.city}, ${address.pincode}`;
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}`, '_blank');
    } else {
      toast.error('Location not available');
    }
  };

  const openWhatsApp = () => {
    const whatsappNumber = store?.shopDetails?.whatsappNumber || store?.shopDetails?.contactNumber;
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`, '_blank');
    } else {
      toast.error('WhatsApp number not available');
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/shops" 
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            Browse Other Stores
          </Link>
        </div>
      </div>
    );
  }

  const openStatus = getOpenStatus();
  const isOpen = openStatus === 'Open now' || openStatus === 'Open 24/7';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Store Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
            {/* Store Logo/Image */}
            <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white rounded-3xl p-4 shadow-xl mb-6 lg:mb-0 flex-shrink-0">
              {store.shopDetails?.verification?.shopPhoto ? (
                <img 
                  src={store.shopDetails.verification.shopPhoto} 
                  alt={store.shopDetails?.shopName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
                  <FaStore className="text-4xl text-gray-400" />
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold">{store.shopDetails?.shopName || 'Store'}</h1>
                {store.isApproved && (
                  <FaCheckCircle className="text-green-400 text-2xl" title="Verified Partner" />
                )}
              </div>
              
              <p className="text-xl text-blue-100 mb-4">{store.shopDetails?.ownerName}</p>
              
              {store.shopDetails?.description && (
                <p className="text-lg text-blue-50 mb-4">{store.shopDetails.description}</p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                  <FaStore className="text-blue-200" />
                  <span className="capitalize">{store.shopDetails?.category || 'General'}</span>
                </div>
                
                <div className={`flex items-center space-x-2 backdrop-blur-lg rounded-xl px-4 py-2 ${
                  isOpen ? 'bg-green-500/30' : 'bg-red-500/30'
                }`}>
                  <FaClock className={isOpen ? 'text-green-200' : 'text-red-200'} />
                  <span>{openStatus}</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                  <FaCoins className="text-orange-300" />
                  <span>{products.length} Products</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openInMaps}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <FaDirections />
                  <span>Get Directions</span>
                </button>
                
                {store.shopDetails?.contactNumber && (
                  <a
                    href={`tel:${store.shopDetails.contactNumber}`}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <FaPhone />
                    <span>Call Store</span>
                  </a>
                )}
                
                {store.shopDetails?.whatsappNumber && (
                  <button
                    onClick={openWhatsApp}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <FaWhatsapp />
                    <span>WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Store Details Sidebar */}
          <div className="lg:col-span-1">
            {/* Address */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-3 text-red-500" />
                Location
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    {store.shopDetails?.address?.street}
                  </p>
                  <p className="text-gray-600">
                    {store.shopDetails?.address?.area}, {store.shopDetails?.address?.city}
                  </p>
                  <p className="text-gray-600">
                    {store.shopDetails?.address?.state} - {store.shopDetails?.address?.pincode}
                  </p>
                </div>
                
                <button
                  onClick={openInMaps}
                  className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <FaDirections />
                  <span>View on Map</span>
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaPhone className="mr-3 text-blue-500" />
                Contact
              </h2>
              
              <div className="space-y-3">
                {store.shopDetails?.contactNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <a 
                      href={`tel:${store.shopDetails.contactNumber}`}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      {store.shopDetails.contactNumber}
                    </a>
                  </div>
                )}
                
                {store.shopDetails?.whatsappNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">WhatsApp:</span>
                    <button
                      onClick={openWhatsApp}
                      className="text-green-600 hover:text-green-700 font-semibold"
                    >
                      {store.shopDetails.whatsappNumber}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Timing */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaClock className="mr-3 text-orange-500" />
                Store Hours
              </h2>
              
              <div className="space-y-3">
                {store.shopDetails?.timing?.isOpen24x7 ? (
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold text-green-600 mb-2">24/7</div>
                    <p className="text-sm text-gray-600">Open all day, every day</p>
                  </div>
                ) : (
                  <>
                    {store.shopDetails?.timing?.openTime && store.shopDetails?.timing?.closeTime && (
                      <div className="text-center py-2 bg-gray-50 rounded-lg">
                        <span className="font-semibold">
                          {store.shopDetails.timing.openTime} - {store.shopDetails.timing.closeTime}
                        </span>
                      </div>
                    )}
                    
                    {store.shopDetails?.timing?.workingDays && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Working Days:</p>
                        <div className="flex flex-wrap gap-1">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <span
                              key={day}
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                store.shopDetails.timing.workingDays.includes(day)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {day.slice(0, 3).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Policy Notice */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
              <h3 className="font-bold text-orange-800 mb-3 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                Store Policy
              </h3>
              <ul className="text-sm text-orange-700 space-y-2">
                <li>• Visit the store to make purchases</li>
                <li>• No delivery service available</li>
                <li>• No returns or refunds</li>
                <li>• Pay with cash after coin discount</li>
                <li>• Coin redemption at store only</li>
              </ul>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  Products Available
                </h2>
                
                {/* Category Filter */}
                {categories.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                        !selectedCategory
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      All
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 capitalize ${
                          selectedCategory === category
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      {/* Product Image */}
                      <div className="h-48 bg-gray-200 relative">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaImage className="text-4xl text-gray-400" />
                          </div>
                        )}
                        
                        {/* Discount Badge */}
                        {product.discountCoins > 0 && (
                          <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full px-3 py-1 text-sm font-bold flex items-center space-x-1">
                            <FaCoins />
                            <span>{product.discountCoins}</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Original Price:</span>
                            <span className="font-semibold text-gray-700">₹{product.originalPrice}</span>
                          </div>
                          
                          {product.discountCoins > 0 && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Max Discount:</span>
                                <span className="font-semibold text-orange-600 flex items-center">
                                  <FaCoins className="mr-1 text-sm" />
                                  {product.discountCoins} coins
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between border-t pt-2">
                                <span className="text-sm font-semibold text-gray-700">Final Price:</span>
                                <span className="font-bold text-green-600 text-lg">
                                  ₹{product.finalPrice}
                                </span>
                              </div>
                            </>
                          )}
                          
                          {product.stockQuantity !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">In Stock:</span>
                              <span className={`font-semibold text-sm ${
                                product.stockQuantity > 5 ? 'text-green-600' : 'text-orange-600'
                              }`}>
                                {product.stockQuantity} units
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Visit Store Notice */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-700 text-center font-semibold">
                            Visit store to purchase with coin discount
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaStore className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Available</h3>
                  <p className="text-gray-500">
                    {selectedCategory 
                      ? `No products found in ${selectedCategory} category` 
                      : 'This store has no products listed yet'
                    }
                  </p>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      Show All Products
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicStorePage;