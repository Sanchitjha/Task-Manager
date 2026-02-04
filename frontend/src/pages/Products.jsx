import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../lib/api';

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.list({ page: 1, limit: 24 });
      setItems(res.data.items || []);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
            <Link 
              to="/shop" 
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
            >
              🛍️ Shop with Coins
            </Link>
          </div>
          <p className="text-gray-600 mt-2">Browse our complete product catalog</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Yet</h2>
                <p className="text-gray-600">Products will appear here once vendors start adding them</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((p) => (
                  <div key={p._id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition border overflow-hidden relative">
                    <div className="aspect-w-1 aspect-h-1">
                      {p.images && p.images[0] ? (
                        <img 
                          src={p.images && p.images[0] ? api.getProfileImageUrl(p.images[0]) : ''} 
                          alt={p.title} 
                          className="w-full h-48 object-cover" 
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-4xl">📦</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Discount Badge */}
                    {p.discountPercentage > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {p.discountPercentage}% OFF
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h2 className="font-semibold text-gray-900 mb-1 line-clamp-2">{p.title}</h2>
                      <p className="text-sm text-gray-600 mb-2">{p.category}</p>
                      
                      {/* Pricing Information */}
                      <div className="mb-3 space-y-1">
                        {p.discountPercentage > 0 ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-green-600">₹{p.finalPrice}</span>
                              <span className="text-sm text-gray-500 line-through">₹{p.originalPrice}</span>
                            </div>
                            <div className="text-sm text-orange-600 font-semibold">
                              {p.coinPrice} coins
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-lg font-bold text-gray-900">₹{p.originalPrice || p.finalPrice}</div>
                            <div className="text-sm text-orange-600 font-semibold">
                              {p.coinPrice} coins
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Stock: {p.stock || 0}
                        </span>
                        <Link
                          to={`/product/${p._id}`}
                          className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
