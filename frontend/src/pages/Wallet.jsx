import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Wallet() {
	const { user, setUser } = useAuth();
	const [coinsBalance, setCoinsBalance] = useState(0);
	const [walletBalance, setWalletBalance] = useState(0);
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [redeemAmount, setRedeemAmount] = useState('');
	const [message, setMessage] = useState({ type: '', text: '' });
	const [showRedeemModal, setShowRedeemModal] = useState(false);

	useEffect(() => {
		fetchWalletData();
	}, []);

	useEffect(() => {
		// Auto-dismiss messages after 3 seconds
		if (message.text) {
			const timer = setTimeout(() => {
				setMessage({ type: '', text: '' });
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [message]);

	const fetchWalletData = async () => {
		try {
			const [balanceRes, transactionsRes] = await Promise.all([
				api.get('/wallet/balance'),
				api.get('/wallet/transactions')
			]);
			
			setCoinsBalance(balanceRes.data.coinsBalance || 0);
			setWalletBalance(balanceRes.data.walletBalance || 0);
			setTransactions(transactionsRes.data);
		} catch (error) {
			console.error('Failed to fetch wallet data:', error);
			setMessage({ type: 'error', text: 'Failed to load wallet data' });
		} finally {
			setLoading(false);
		}
	};

	const handleRedeem = async (e) => {
		e.preventDefault();
		
		const coins = parseInt(redeemAmount);
		if (!coins || coins <= 0) {
			setMessage({ type: 'error', text: 'Please enter a valid amount' });
			return;
		}

		if (coins > coinsBalance) {
			setMessage({ type: 'error', text: 'Insufficient coins balance' });
			return;
		}

		if (coins < 100) {
			setMessage({ type: 'error', text: 'Minimum redemption is 100 coins' });
			return;
		}

		try {
			setLoading(true);
			const response = await api.post('/wallet/redeem', { coinsAmount: coins });
			
			setMessage({ 
				type: 'success', 
				text: `Successfully redeemed ${coins} coins for ₹${response.data.walletAmountAdded.toFixed(2)}!` 
			});
			
			// Update balances
			setCoinsBalance(response.data.newCoinsBalance);
			setWalletBalance(response.data.newWalletBalance);
			
			// Update user context
			setUser({ 
				...user, 
				coinsBalance: response.data.newCoinsBalance,
				walletBalance: response.data.newWalletBalance
			});
			
			// Refresh transactions
			fetchWalletData();
			
			// Reset form
			setRedeemAmount('');
			setShowRedeemModal(false);
		} catch (error) {
			console.error('Redeem failed:', error);
			setMessage({ 
				type: 'error', 
				text: error.response?.data?.message || 'Failed to redeem coins' 
			});
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	const getTransactionIcon = (type) => {
		switch (type) {
			case 'earn':
				return '🎬';
			case 'redeem':
				return '💰';
			case 'transfer_send':
				return '📤';
			case 'transfer_receive':
				return '📥';
			default:
				return '💳';
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
					<p className="mt-4 text-gray-600">Loading wallet...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-6">My Wallet</h1>

			{/* Status Messages */}
			{message.text && (
				<div className={`mb-4 p-4 rounded-lg ${
					message.type === 'error' ? 'bg-red-100 text-red-700' :
					message.type === 'success' ? 'bg-green-100 text-green-700' :
					'bg-blue-100 text-blue-700'
				}`}>
					{message.text}
				</div>
			)}

			<div className="grid md:grid-cols-2 gap-6 mb-6">
				{/* Balance Cards */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-lg font-semibold mb-4 text-gray-700">Coins Balance</h2>
					<div className="text-center">
						<div className="text-5xl font-bold text-blue-600 mb-2">{coinsBalance}</div>
						<div className="text-gray-600">Available Coins</div>
						<div className="text-sm text-gray-500 mt-2">
							= ₹{(coinsBalance / 100).toFixed(2)}
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-lg font-semibold mb-4 text-gray-700">Wallet Balance</h2>
					<div className="text-center">
						<div className="text-5xl font-bold text-green-600 mb-2">₹{walletBalance.toFixed(2)}</div>
						<div className="text-gray-600">Available Money</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
				<div className="grid md:grid-cols-2 gap-4">
					<button
						onClick={() => window.location.href = '/earn'}
						className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-medium"
					>
						🎬 Earn More Coins
					</button>
					<button
						onClick={() => setShowRedeemModal(true)}
						className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition font-medium"
					>
						{coinsBalance < 100 ? '🪙 Redeem Coins (Need 100 Min)' : '💰 Redeem Coins'}
					</button>
				</div>
				<p className="text-sm text-gray-500 mt-3 text-center">
					💡 Conversion Rate: 100 coins = ₹1.00
				</p>
			</div>

			{/* Transaction History */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-semibold mb-4">Transaction History</h2>
				{transactions.length === 0 ? (
					<p className="text-gray-500 text-center py-8">No transactions yet</p>
				) : (
					<div className="space-y-3 max-h-96 overflow-y-auto">
						{transactions.map(tx => (
							<div key={tx._id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
								<div className="flex items-start gap-3 flex-1">
									<span className="text-2xl">{getTransactionIcon(tx.type)}</span>
									<div className="flex-1">
										<div className="font-medium text-gray-800">{tx.description}</div>
										<div className="text-sm text-gray-500">{formatDate(tx.createdAt)}</div>
										{tx.metadata?.videoId?.title && (
											<div className="text-xs text-gray-400 mt-1">
												Video: {tx.metadata.videoId.title}
											</div>
										)}
									</div>
								</div>
								<div className="text-right">
									<div className={`font-bold text-lg ${
										tx.type === 'earn' || tx.type === 'transfer_receive' 
											? 'text-green-600' 
											: 'text-red-600'
									}`}>
										{tx.type === 'earn' ? '+' : tx.type === 'redeem' || tx.type === 'transfer_send' ? '-' : ''}
										₹{tx.amount.toFixed(2)}
									</div>
									<div className="text-xs text-gray-500 capitalize">{tx.type.replace('_', ' ')}</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Redeem Modal */}
			{showRedeemModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h3 className="text-xl font-bold mb-4">Redeem Coins</h3>
						<form onSubmit={handleRedeem}>
							<div className="mb-4">
								<label className="block text-sm font-medium mb-2">
									Coins to Redeem (Min: 100)
								</label>
								<input
									type="number"
									value={redeemAmount}
									onChange={(e) => setRedeemAmount(e.target.value)}
									min="100"
									max={coinsBalance}
									step="100"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Enter coins amount"
									required
								/>
								<p className="text-sm text-gray-500 mt-1">
									Available: {coinsBalance} coins
								</p>
								{redeemAmount && (
									<p className="text-sm text-green-600 mt-1">
										You will receive: ₹{(parseInt(redeemAmount) / 100).toFixed(2)}
									</p>
								)}
							</div>
							<div className="flex gap-3">
								<button
									type="submit"
									disabled={loading}
									className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
								>
									{loading ? 'Processing...' : 'Redeem'}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowRedeemModal(false);
										setRedeemAmount('');
									}}
									className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
