import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProductSubscriptionPayment() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [numberOfDays, setNumberOfDays] = useState(7);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (product && numberOfDays) {
      calculateCost();
    }
  }, [product, numberOfDays]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      setError('Failed to load product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = async () => {
    try {
      const response = await api.post('/subscriptions/calculate', {
        numberOfImages: product.images.length,
        numberOfDays: numberOfDays
      });
      setCalculation(response.data.calculation);
    } catch (error) {
      console.error('Failed to calculate cost:', error);
    }
  };

  const handlePayment = async () => {
    try {
      setPaying(true);
      setError('');

      // Step 1: Create subscription
      const createResponse = await api.post('/subscriptions/create', {
        productId: product._id,
        numberOfDays: numberOfDays
      });

      const subscriptionId = createResponse.data.subscription._id;

      // Step 2: Complete payment
      const payResponse = await api.post(`/subscriptions/${subscriptionId}/pay`, {
        transactionId: transactionId || `MANUAL-${Date.now()}`,
        paymentMethod: 'online'
      });

      alert('Payment successful! Your product is now live.');
      navigate('/seller/inventory');
      
    } catch (error) {
      setError(error.response?.data?.message || 'Payment failed');
      console.error('Payment error:', error);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">💳 Product Subscription Payment</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Product Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Product Details</h2>
        <div className="flex gap-4">
          {product.images && product.images.length > 0 && (
            <img 
              src={product.images[0]} 
              alt={product.title}
              className="w-24 h-24 object-cover rounded"
            />
          )}
          <div>
            <h3 className="font-bold text-lg">{product.title}</h3>
            <p className="text-gray-600">{product.category}</p>
            <p className="text-sm text-gray-500">
              {product.images.length} image{product.images.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Duration */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Select Subscription Duration</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Number of Days to Publish
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={numberOfDays}
            onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Quick Select Buttons */}
        <div className="flex gap-2 mb-4">
          {[7, 15, 30, 60, 90].map(days => (
            <button
              key={days}
              onClick={() => setNumberOfDays(days)}
              className={`px-4 py-2 rounded ${
                numberOfDays === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Cost Calculation */}
      {calculation && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border border-green-200">
          <h2 className="text-xl font-bold mb-4">💰 Cost Breakdown</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Number of Images:</span>
              <span className="font-semibold">{calculation.numberOfImages}</span>
            </div>
            <div className="flex justify-between">
              <span>Number of Days:</span>
              <span className="font-semibold">{calculation.numberOfDays}</span>
            </div>
            <div className="flex justify-between">
              <span>Price per Image per Day:</span>
              <span className="font-semibold">₹{calculation.pricePerImagePerDay}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold text-green-700">
                <span>Total Amount:</span>
                <span>₹{calculation.totalAmount}</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {calculation.breakdown}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Payment Information</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Transaction ID (Optional)
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter transaction ID if you have one"
          />
          <p className="text-xs text-gray-500 mt-1">
            If you leave this blank, a transaction ID will be auto-generated
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={paying || !calculation}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {paying ? '⏳ Processing Payment...' : `💳 Pay ₹${calculation?.totalAmount || 0} & Publish Product`}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">ℹ️ Subscription Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your product will be published immediately after payment</li>
          <li>• Subscription is valid for the selected number of days</li>
          <li>• Product will automatically unpublish when subscription expires</li>
          <li>• You and admin will receive notification when subscription expires</li>
          <li>• You can renew subscription before or after expiry</li>
          <li>• Pricing: ₹1 per image per day</li>
        </ul>
      </div>
    </div>
  );
}
