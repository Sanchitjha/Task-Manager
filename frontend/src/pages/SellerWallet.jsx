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
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  });
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendor/wallet');
      setWalletData(response.data);
      if (response.data.bankDetails) {
        setBankDetails(response.data.bankDetails);
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (amount > walletData.balance) {
      alert('Insufficient balance');
      return;
    }
    if (amount < 100) {
      alert('Minimum withdrawal amount is 100 coins');
      return;
    }
    if (!bankDetails.accountNumber) {
      alert('Please add your bank details first');
      return;
    }

    try {
      setWithdrawing(true);
      await api.post('/vendor/wallet/withdraw', {
        amount,
        bankDetails
      });
      alert('Withdrawal request submitted successfully! It will be processed within 2-3 business days.');
      setWithdrawAmount('');
      setShowWithdrawForm(false);
      loadWalletData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  const saveBankDetails = async () => {
    try {
      await api.post('/vendor/wallet/bank-details', bankDetails);
      alert('Bank details saved successfully!');
    } catch (error) {
      alert('Failed to save bank details');
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
          <p className="text-gray-600 mt-1">Manage your earnings and withdrawals</p>
        </div>
        <Link
          to="/seller/dashboard"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm mb-2 opacity-90">Available Balance</div>
          <div className="text-4xl font-bold">{walletData.balance} 🪙</div>
          <button
            onClick={() => setShowWithdrawForm(!showWithdrawForm)}
            className="mt-4 px-4 py-2 bg-white text-green-600 rounded hover:bg-green-50 font-medium w-full"
          >
            Withdraw Funds
          </button>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm mb-2 opacity-90">Pending Earnings</div>
          <div className="text-4xl font-bold">{walletData.pendingEarnings} 🪙</div>
          <div className="mt-4 text-sm opacity-90">
            From orders being processed
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm mb-2 opacity-90">Total Earnings</div>
          <div className="text-4xl font-bold">{walletData.totalEarnings} 🪙</div>
          <div className="mt-4 text-sm opacity-90">
            All-time earnings
          </div>
        </div>
      </div>

      {/* Withdraw Form */}
      {showWithdrawForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">💸 Withdraw Funds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Account Holder Name"
              value={bankDetails.accountName}
              onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Account Number"
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Bank Name"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="IFSC Code"
              value={bankDetails.ifscCode}
              onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button
            onClick={saveBankDetails}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Save Bank Details
          </button>
          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2">
              Withdrawal Amount (Min: 100 coins)
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              min="100"
              max={walletData.balance}
            />
            <div className="flex gap-2">
              <button
                onClick={handleWithdraw}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {withdrawing ? 'Processing...' : 'Submit Withdrawal Request'}
              </button>
              <button
                onClick={() => setShowWithdrawForm(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                        transaction.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3">{transaction.description}</td>
                    <td className="py-3 text-right font-semibold">
                      {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} 🪙
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

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 Withdrawal Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Minimum withdrawal amount: 100 coins</li>
          <li>• Withdrawals are processed within 2-3 business days</li>
          <li>• Make sure your bank details are correct before submitting</li>
          <li>• Earnings from orders are added after delivery confirmation</li>
        </ul>
      </div>
    </div>
  );
}
