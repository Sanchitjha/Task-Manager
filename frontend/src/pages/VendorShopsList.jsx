import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const PartnerShopsList = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const categories = [
    'Electronics', 'Clothing', 'Food & Beverages', 'Books', 'Home & Garden',
    'Health & Beauty', 'Sports', 'Toys & Games', 'Automotive', 'Other'
  ];

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      // Get all users with Partner role who have shop details
      const response = await api.get('/api/users?role=Partner&hasShop=true');
      const partnerUsers = response.data.users || [];
      
      // Filter partners who have shop details set up
      const partnersWithShops = partnerUsers.filter(partner => 
        partner.shopDetails && 
        partner.shopDetails.shopName && 
        partner.shopDetails.address && 
        partner.shopDetails.address.city
      );
      
      setPartners(partnersWithShops);
    } catch (error) {
      console.error('Failed to load partners:', error);
      setError('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = !searchTerm || 
      partner.shopDetails?.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.shopDetails?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = !selectedCategory || 
      partner.shopDetails?.category === selectedCategory;
      
    const matchesCity = !selectedCity || 
      partner.shopDetails?.address?.city?.toLowerCase() === selectedCity.toLowerCase();

    return matchesSearch && matchesCategory && matchesCity;
  });

  const uniqueCities = [...new Set(partners.map(partner => 
    partner.shopDetails?.address?.city
  ).filter(Boolean))];

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

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Local Shops & Partners</h1>
        <p className="text-gray-600">Discover local businesses and earn coin discounts!</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Shops
            </label>
            <input
              type="text"
              placeholder="Shop name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedCity('');
              }}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Found {filteredPartners.length} shop{filteredPartners.length !== 1 ? 's' : ''} 
          {searchTerm && ` matching "${searchTerm}"`}
          {selectedCategory && ` in ${selectedCategory}`}
          {selectedCity && ` in ${selectedCity}`}
        </p>
      </div>

      {/* Shop Cards */}
      {filteredPartners.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No shops found</h3>
          <p className="text-gray-500">Try adjusting your search filters or check back later for new shops!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map(partner => (
            <div key={partner._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Shop Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
                <h3 className="text-xl font-bold mb-1">
                  {partner.shopDetails?.shopName || partner.name}
                </h3>
                {partner.shopDetails?.category && (
                  <span className="inline-block bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-xs">
                    {partner.shopDetails.category}
                  </span>
                )}
              </div>

              <div className="p-6">
                {/* Description */}
                {partner.shopDetails?.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {partner.shopDetails.description}
                  </p>
                )}

                {/* Address */}
                <div className="mb-4">
                  <div className="flex items-start space-x-2 text-sm">
                    <span className="text-gray-400 mt-0.5">📍</span>
                    <div>
                      <p className="text-gray-700">
                        {partner.shopDetails?.address?.street}
                        {partner.shopDetails?.address?.area && `, ${partner.shopDetails.address.area}`}
                      </p>
                      <p className="text-gray-700">
                        {partner.shopDetails?.address?.city} - {partner.shopDetails?.address?.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-4 space-y-2">
                  {partner.shopDetails?.contactNumber && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-green-600">📞</span>
                      <span className="text-gray-700">{partner.shopDetails.contactNumber}</span>
                    </div>
                  )}
                  
                  {partner.shopDetails?.timing && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-blue-600">🕒</span>
                      <span className="text-gray-700">
                        {partner.shopDetails.timing.isOpen24x7 
                          ? 'Open 24/7' 
                          : `${partner.shopDetails.timing.openTime || 'N/A'} - ${partner.shopDetails.timing.closeTime || 'N/A'}`
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    to={`/shop/${partner._id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Visit Shop
                  </Link>
                  
                  {partner.shopDetails?.address && (
                    <button
                      onClick={() => openMap(partner.shopDetails.address)}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      📍
                    </button>
                  )}
                  
                  {partner.shopDetails?.contactNumber && (
                    <a
                      href={`tel:${partner.shopDetails.contactNumber}`}
                      className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      📞
                    </a>
                  )}
                </div>

                {/* Special Features */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span>🪙</span>
                      <span>Coin Discounts Available</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>🏪</span>
                      <span>In-Store Only</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">How it Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-blue-800 mb-2">Browse Shops</h3>
            <p className="text-blue-700 text-sm">Find local vendors and browse their products online</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-3">🪙</div>
            <h3 className="font-semibold text-blue-800 mb-2">Check Discounts</h3>
            <p className="text-blue-700 text-sm">See how many coins you can use for discounts on products</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="font-semibold text-blue-800 mb-2">Visit & Buy</h3>
            <p className="text-blue-700 text-sm">Visit the physical store, make payment and apply coin discounts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerShopsList;