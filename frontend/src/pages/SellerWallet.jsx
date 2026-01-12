import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function SellerWallet() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState({
    balance: 0,
    pendingEarnings: 0,
    totalEarnings: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendor/wallet');
      setWalletData(response.data);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading wallet...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Seller Wallet</h1>
          <p className="text-gray-600 mt-1">Track your earnings from sales</p>
        </div>
        <Link
          to="/seller/dashboard"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">💡 About Coin Earnings</h3>
        <p className="text-sm text-blue-800">
          Coins earned from sales represent customer discounts. These coins stay in the system to provide value to your customers. 
          Track your sales performance and customer satisfaction through your earnings metrics.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm mb-2 opacity-90">Total Coins Earned</div>
          <div className="text-4xl font-bold">{walletData.balance} 🪙</div>
          <div className="mt-4 text-sm opacity-90">
            From completed sales
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm mb-2 opacity-90">Pending Earnings</div>
          <div className="text-4xl font-bold">{walletData.pendingEarnings} 🪙</div>
          <div className="mt-4 text-sm opacity-90">
            From orders being processed
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm mb-2 opacity-90">Lifetime Earnings</div>
          <div className="text-4xl font-bold">{walletData.totalEarnings} 🪙</div>
          <div className="mt-4 text-sm opacity-90">
            All-time sales revenue
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">📜 Transaction History</h2>
        {walletData.transactions && walletData.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {walletData.transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.type === 'sale' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3">{transaction.description}</td>
                    <td className="py-3 text-right font-semibold">
                      +{transaction.amount} 🪙
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No transactions yet. Start selling to earn coins!
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4 justify-center">
        <Link
          to="/seller/inventory"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📦 Manage Inventory
        </Link>
        <Link
          to="/seller/orders"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          📋 View Orders
        </Link>
        <Link
          to="/seller/analytics"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          📊 View Analytics
        </Link>
      </div>
    </div>
  );
}
