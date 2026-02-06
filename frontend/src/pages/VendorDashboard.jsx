import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../lib/api';
import api from '../lib/api';
import { Link } from 'react-router-dom';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  
  const [purchaseForm, setPurchaseForm] = useState({
    userId: '',
    productId: '',
    coinsUsed: 0,
    verificationCode: '',
    notes: ''
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  if (!user) return <div className="p-6">Please login.</div>;
  if (user.role !== 'partner' && user.role !== 'admin') {
    return <div className="p-6 text-red-600">Partner access required.</div>;
  }

  const loadDashboard = async () => {
    try {
      const response = await api.get('/partners/shop-dashboard');
      setDashboardData(response.data.dashboard);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.list({ partner: user._id, limit: 100 });
      setProducts(res.data.items || []);
    } catch (e) {
      console.error('Failed to load products', e);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadProducts(); 
    loadDashboard();
  }, [user._id]);

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/api/partners/confirm-purchase', purchaseForm);
      alert(`Purchase confirmed! Final amount paid: ₹${response.data.purchase.finalAmountPaid}`);
      
      // Reset form
      setPurchaseForm({
        userId: '',
        productId: '',
        coinsUsed: 0,
        verificationCode: '',
        notes: ''
      });
      setShowPurchaseModal(false);
      
      // Reload dashboard
      loadDashboard();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm purchase');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm(prev => ({
      ...prev,
      [name]: name === 'coinsUsed' ? parseInt(value) || 0 : value
    }));
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productsAPI.remove(id);
      setProducts(p => p.filter(x => x._id !== id));
    } catch (e) {
      alert('Failed to delete: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Stats */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  📦
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.totalProducts || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  🪙
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Coins Redeemed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.totalCoinsRedeemed || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  💰
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Discount Given</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{dashboardData.totalDiscountGiven || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  🛒
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Sales</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.todayPurchases || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Partner Dashboard</h1>
          <div className="space-x-2">
            <button 
              onClick={() => setShowPurchaseModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirm Purchase
            </button>
            <Link to="/partner/products/new" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              + New Product
            </Link>
          </div>
        </div>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm In-Store Purchase</h3>
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Phone/Email
                </label>
                <input
                  type="text"
                  name="userId"
                  value={purchaseForm.userId}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter customer's registered phone or email"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  name="productId"
                  value={purchaseForm.productId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.title} - ₹{product.originalPrice || product.price}
                      {product.coinDiscount > 0 && ` (Max ${product.coinDiscount} coins)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coins Used for Discount
                </label>
                <input
                  type="number"
                  name="coinsUsed"
                  value={purchaseForm.coinsUsed}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code (Optional)
                </label>
                <input
                  type="text"
                  name="verificationCode"
                  value={purchaseForm.verificationCode}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={purchaseForm.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Confirm Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Your Products</h2>
        </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div className="text-gray-600">Loading products...</div>}

      {!loading && products.length === 0 && (
        <div className="text-gray-500">No products yet. <Link to="/partner/products/new" className="text-blue-600 hover:underline">Create one!</Link></div>
      )}

      <div className="grid gap-4">
        {products.map((p) => (
          <div key={p._id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
            <div className="flex gap-4 flex-1">
              {p.images && p.images[0] && (
                <img src={p.images && p.images[0] ? api.getProfileImageUrl(p.images[0]) : ''} alt={p.title} className="w-20 h-20 object-cover rounded" />
              )}
              <div>
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.description?.substring(0, 60)}...</p>
                <p className="text-sm mt-2"><strong>Price:</strong> ₹{p.price} | <strong>Stock:</strong> {p.stock}</p>
                <p className="text-xs text-gray-500 mt-1"><strong>Status:</strong> {p.isPublished ? '✅ Published' : '❌ Draft'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/partner/products/${p._id}/edit`} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Edit
              </Link>
              <button onClick={() => deleteProduct(p._id)} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
      </div>
    </div>
  );
}
