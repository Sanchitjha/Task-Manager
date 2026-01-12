import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function VendorSubscriptions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadSubscriptions();
  }, [filter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const response = await api.get(`/subscriptions/my-subscriptions?${params.toString()}`);
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = (subscriptionId, productId) => {
    navigate(`/subscription/payment/${productId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📋 My Product Subscriptions</h1>
          <p className="text-gray-600 mt-1">Manage your product listings</p>
        </div>
        <Link
          to="/seller/dashboard"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'pending', 'expired'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded capitalize ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <p>No subscriptions found</p>
            <Link
              to="/seller/products/new"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Product
            </Link>
          </div>
        ) : (
          subscriptions.map((sub) => (
            <div key={sub._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Product Image */}
              {sub.product?.images?.[0] && (
                <img
                  src={sub.product.images[0]}
                  alt={sub.product.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                {/* Product Title */}
                <h3 className="font-bold text-lg mb-2">{sub.product?.title || 'Unknown Product'}</h3>
                
                {/* Status Badge */}
                <div className="mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                  {sub.paymentStatus && sub.paymentStatus !== 'paid' && (
                    <span className="ml-2 px-2 py-1 rounded text-xs bg-orange-100 text-orange-700">
                      Payment: {sub.paymentStatus}
                    </span>
                  )}
                </div>

                {/* Subscription Details */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images:</span>
                    <span className="font-semibold">{sub.numberOfImages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{sub.numberOfDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-green-600">₹{sub.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-semibold">{new Date(sub.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span className="font-semibold">{new Date(sub.endDate).toLocaleDateString()}</span>
                  </div>
                  
                  {sub.status === 'active' && sub.daysRemaining !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Remaining:</span>
                      <span className={`font-bold ${sub.daysRemaining < 3 ? 'text-red-600' : 'text-blue-600'}`}>
                        {sub.daysRemaining} days
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {(sub.status === 'expired' || (sub.status === 'active' && sub.daysRemaining < 7)) && (
                    <button
                      onClick={() => handleRenew(sub._id, sub.product._id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                    >
                      🔄 Renew
                    </button>
                  )}
                  <Link
                    to={`/seller/products/${sub.product._id}/edit`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium text-center"
                  >
                    ✏️ Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 Subscription Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Products require active subscriptions to be visible to customers</li>
          <li>• Renew subscriptions before they expire to keep products live</li>
          <li>• You'll receive notifications 1 day before expiry</li>
          <li>• Pricing: ₹1 per image per day</li>
          <li>• Expired subscriptions can be renewed anytime</li>
        </ul>
      </div>
    </div>
  );
}
