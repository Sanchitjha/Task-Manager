import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  FaQrcode, FaSearch, FaUser, FaCoins, FaRupeeSign, FaCheck, 
  FaTimes, FaShoppingCart, FaCamera, FaSpinner, FaClipboard,
  FaUserCheck, FaHistory, FaCalculator, FaExclamationTriangle
} from 'react-icons/fa';
import QrScanner from 'qr-scanner';

const PurchaseConfirmation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scan'); // scan, manual, history
  const [loading, setLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  
  // Purchase form state
  const [purchaseData, setPurchaseData] = useState({
    userId: '',
    userName: '',
    userEmail: '',
    userCoins: 0,
    productId: '',
    productName: '',
    productPrice: 0,
    discountCoins: 0,
    coinsToRedeem: 0,
    finalAmount: 0,
    verificationCode: '',
    notes: ''
  });
  
  const [searchResults, setSearchResults] = useState({
    users: [],
    products: []
  });
  
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Initialize camera and QR scanner
  useEffect(() => {
    if (activeTab === 'scan' && !scannerActive) {
      startQrScanner();
    }
    
    return () => {
      stopQrScanner();
    };
  }, [activeTab]);

  // Load recent transactions
  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const startQrScanner = async () => {
    try {
      if (videoRef.current && !qrScannerRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => handleQrScan(result.data),
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        
        await qrScannerRef.current.start();
        setScannerActive(true);
        setQrError('');
      }
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setQrError('Camera not available or permission denied');
    }
  };

  const stopQrScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScannerActive(false);
  };

  const handleQrScan = async (qrData) => {
    try {
      const parsedData = JSON.parse(qrData);
      
      if (parsedData.type === 'purchase' && parsedData.userId) {
        await fetchUserData(parsedData.userId);
        if (parsedData.productId) {
          await fetchProductData(parsedData.productId);
        }
        setActiveTab('manual'); // Switch to manual tab for final confirmation
        toast.success('QR code scanned successfully!');
      } else {
        toast.error('Invalid QR code format');
      }
    } catch (error) {
      console.error('Error parsing QR data:', error);
      toast.error('Failed to parse QR code data');
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      const userData = response.data;
      
      setPurchaseData(prev => ({
        ...prev,
        userId: userData._id,
        userName: userData.name,
        userEmail: userData.email,
        userCoins: userData.coinsBalance || 0
      }));
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch user data');
    }
  };

  const fetchProductData = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      const productData = response.data;
      
      setPurchaseData(prev => ({
        ...prev,
        productId: productData._id,
        productName: productData.name,
        productPrice: productData.originalPrice,
        discountCoins: productData.discountCoins || 0
      }));
      
    } catch (error) {
      console.error('Error fetching product data:', error);
      toast.error('Failed to fetch product data');
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults(prev => ({ ...prev, users: [] }));
      return;
    }
    
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(prev => ({ ...prev, users: response.data.users || [] }));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const searchProducts = async (query) => {
    if (query.length < 2) {
      setSearchResults(prev => ({ ...prev, products: [] }));
      return;
    }
    
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}&partner=${user._id}`);
      setSearchResults(prev => ({ ...prev, products: response.data.products || [] }));
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const selectUser = (selectedUser) => {
    setPurchaseData(prev => ({
      ...prev,
      userId: selectedUser._id,
      userName: selectedUser.name,
      userEmail: selectedUser.email,
      userCoins: selectedUser.coinsBalance || 0
    }));
    setSearchResults(prev => ({ ...prev, users: [] }));
  };

  const selectProduct = (selectedProduct) => {
    setPurchaseData(prev => ({
      ...prev,
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      productPrice: selectedProduct.originalPrice,
      discountCoins: selectedProduct.discountCoins || 0
    }));
    setSearchResults(prev => ({ ...prev, products: [] }));
  };

  const calculateFinalAmount = () => {
    const coinsToRedeem = Math.min(
      purchaseData.coinsToRedeem || 0,
      purchaseData.discountCoins || 0,
      purchaseData.userCoins || 0
    );
    
    const discount = coinsToRedeem * 1; // 1 coin = ₹1
    const finalAmount = Math.max(0, purchaseData.productPrice - discount);
    
    setPurchaseData(prev => ({
      ...prev,
      finalAmount,
      coinsToRedeem
    }));
  };

  // Recalculate when relevant values change
  useEffect(() => {
    calculateFinalAmount();
  }, [purchaseData.productPrice, purchaseData.coinsToRedeem, purchaseData.discountCoins, purchaseData.userCoins]);

  const confirmPurchase = async () => {
    if (!purchaseData.userId || !purchaseData.productId) {
      toast.error('Please select both user and product');
      return;
    }
    
    if (purchaseData.coinsToRedeem > purchaseData.userCoins) {
      toast.error('User does not have enough coins');
      return;
    }
    
    if (purchaseData.coinsToRedeem > purchaseData.discountCoins) {
      toast.error('Coins exceed maximum discount allowed');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post('/api/partners/confirm-purchase', {
        userId: purchaseData.userId,
        productId: purchaseData.productId,
        coinsUsed: purchaseData.coinsToRedeem,
        finalAmountPaid: purchaseData.finalAmount,
        verificationCode: purchaseData.verificationCode,
        notes: purchaseData.notes
      });
      
      toast.success(`Purchase confirmed! Final amount: ₹${response.data.purchase.finalAmountPaid}`);
      
      // Reset form
      setPurchaseData({
        userId: '',
        userName: '',
        userEmail: '',
        userCoins: 0,
        productId: '',
        productName: '',
        productPrice: 0,
        discountCoins: 0,
        coinsToRedeem: 0,
        finalAmount: 0,
        verificationCode: '',
        notes: ''
      });
      
      // Refresh recent transactions
      fetchRecentTransactions();
      
    } catch (error) {
      console.error('Error confirming purchase:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm purchase');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await api.get(`/partners/transactions?limit=10`);
      setRecentTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  if (!user || user.role !== 'partner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Partner access required to confirm purchases.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Purchase Confirmation
          </h1>
          <p className="text-gray-600 flex items-center">
            <FaShoppingCart className="mr-2" />
            Confirm in-store purchases and redeem customer coins
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white/80 backdrop-blur-lg rounded-xl p-1 shadow-lg border border-white/20">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'scan'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaQrcode />
            <span>QR Scanner</span>
          </button>
          
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'manual'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaUserCheck />
            <span>Manual Entry</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaHistory />
            <span>Recent Transactions</span>
          </button>
        </div>

        {/* QR Scanner Tab */}
        {activeTab === 'scan' && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">QR Code Scanner</h2>
              <p className="text-gray-600">Ask customer to show their purchase QR code</p>
            </div>

            <div className="max-w-md mx-auto">
              {qrError ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                  <FaExclamationTriangle className="mx-auto text-4xl text-red-500 mb-4" />
                  <p className="text-red-700">{qrError}</p>
                  <button
                    onClick={startQrScanner}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full aspect-square object-cover"
                    playsInline
                    muted
                  />
                  
                  {scannerActive && (
                    <div className="absolute inset-4 border-2 border-blue-400 rounded-xl">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white text-sm bg-black/50 inline-block px-3 py-1 rounded-full">
                      Position QR code within the frame
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaUserCheck className="mr-3 text-blue-500" />
                Purchase Details
              </h2>

              <div className="space-y-6">
                {/* User Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <FaUser className="inline mr-2 text-blue-500" />
                    Search Customer
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter name, email, or phone"
                      onChange={(e) => searchUsers(e.target.value)}
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    
                    {/* User Search Results */}
                    {searchResults.users.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.users.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => selectUser(user)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            <div className="text-sm text-orange-600 flex items-center">
                              <FaCoins className="mr-1" />
                              {user.coinsBalance || 0} coins
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected User Info */}
                {purchaseData.userName && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Selected Customer</h3>
                    <p className="text-blue-700">{purchaseData.userName}</p>
                    <p className="text-sm text-blue-600">{purchaseData.userEmail}</p>
                    <p className="text-sm text-orange-600 flex items-center mt-1">
                      <FaCoins className="mr-1" />
                      Available: {purchaseData.userCoins} coins
                    </p>
                  </div>
                )}

                {/* Product Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <FaShoppingCart className="inline mr-2 text-green-500" />
                    Search Product
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter product name"
                      onChange={(e) => searchProducts(e.target.value)}
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    
                    {/* Product Search Results */}
                    {searchResults.products.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.products.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => selectProduct(product)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-sm text-gray-600">₹{product.originalPrice}</div>
                            <div className="text-sm text-orange-600 flex items-center">
                              <FaCoins className="mr-1" />
                              Max {product.discountCoins || 0} coins
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Product Info */}
                {purchaseData.productName && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Selected Product</h3>
                    <p className="text-green-700">{purchaseData.productName}</p>
                    <p className="text-sm text-green-600">Price: ₹{purchaseData.productPrice}</p>
                    <p className="text-sm text-orange-600 flex items-center mt-1">
                      <FaCoins className="mr-1" />
                      Max discount: {purchaseData.discountCoins} coins
                    </p>
                  </div>
                )}

                {/* Coins to Redeem */}
                {purchaseData.userId && purchaseData.productId && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <FaCoins className="inline mr-2 text-orange-500" />
                      Coins to Redeem
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={Math.min(purchaseData.userCoins, purchaseData.discountCoins)}
                      value={purchaseData.coinsToRedeem}
                      onChange={(e) => setPurchaseData(prev => ({ ...prev, coinsToRedeem: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder="Enter coins to redeem"
                    />
                    <p className="text-xs text-gray-500">
                      Maximum: {Math.min(purchaseData.userCoins, purchaseData.discountCoins)} coins
                    </p>
                  </div>
                )}

                {/* Additional Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <FaClipboard className="inline mr-2 text-purple-500" />
                    Notes (Optional)
                  </label>
                  <textarea
                    value={purchaseData.notes}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    placeholder="Additional notes about the purchase..."
                  />
                </div>
              </div>
            </div>

            {/* Summary & Confirmation */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaCalculator className="mr-3 text-green-500" />
                Purchase Summary
              </h2>

              {purchaseData.userId && purchaseData.productId ? (
                <div className="space-y-6">
                  {/* Calculation Breakdown */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="font-semibold">₹{purchaseData.productPrice}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coins Used:</span>
                        <span className="font-semibold text-orange-600">
                          {purchaseData.coinsToRedeem} × ₹1 = ₹{purchaseData.coinsToRedeem}
                        </span>
                      </div>
                      
                      <div className="border-t border-gray-300 pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Final Amount:</span>
                          <span className="text-green-600">₹{purchaseData.finalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                      <FaExclamationTriangle className="mr-2" />
                      Important Notice
                    </h3>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Customer will pay ₹{purchaseData.finalAmount} in cash</li>
                      <li>• {purchaseData.coinsToRedeem} coins will be deducted from their wallet</li>
                      <li>• No delivery or return policy applies</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={confirmPurchase}
                    disabled={loading || !purchaseData.userId || !purchaseData.productId}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        <span>Confirm Purchase</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaShoppingCart className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500">Select customer and product to see purchase summary</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaHistory className="mr-3 text-purple-500" />
              Recent Transactions
            </h2>

            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheck className="text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{transaction.userName}</h3>
                        <p className="text-gray-600">{transaction.productName}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{transaction.finalAmount}</p>
                      <p className="text-sm text-orange-600 flex items-center justify-end">
                        <FaCoins className="mr-1" />
                        {transaction.coinsUsed} coins
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaHistory className="mx-auto text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500">No recent transactions</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseConfirmation;