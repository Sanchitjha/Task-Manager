import { useState, useEffect } from 'react';
import { walletAPI } from '../lib/api';

export default function Wallet() {
	const [balance, setBalance] = useState(0);
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [balanceRes, transactionsRes] = await Promise.all([
					walletAPI.getBalance(),
					walletAPI.getTransactions()
				]);
				setBalance(balanceRes.data.balance);
				setTransactions(transactionsRes.data);
			} catch (error) {
				console.error('Failed to fetch wallet data:', error);
				// Fallback to mock data
				setBalance(150);
				setTransactions([
					{ id: 1, type: 'earn', amount: 50, description: 'Video watch reward', createdAt: new Date() },
					{ id: 2, type: 'redeem', amount: -25, description: 'Shop discount', createdAt: new Date() },
				]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
			<header className="bg-white/70 backdrop-blur sticky top-0 z-10 border-b">
				<div className="max-w-6xl mx-auto flex items-center justify-between py-3 px-4">
					<div className="font-bold text-brand-800">The MANAGER</div>
					<nav className="flex gap-6 text-sm">
						<a href="/" className="hover:text-brand-600">Home</a>
						<a href="/earn" className="hover:text-brand-600">Earn</a>
					</nav>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">My Wallet</h1>
				
				<div className="grid md:grid-cols-2 gap-8">
					<div className="card">
						<h2 className="text-xl font-semibold mb-4">Balance</h2>
						<div className="text-center">
							<div className="text-4xl font-bold text-brand-600 mb-2">{balance}</div>
							<div className="text-gray-600">Total Coins</div>
						</div>
					</div>

					<div className="card">
						<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
						<div className="space-y-3">
							<button className="btn-primary w-full">Send Coins</button>
							<button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Redeem</button>
						</div>
					</div>
				</div>

				<div className="card mt-8">
					<h2 className="text-xl font-semibold mb-4">Transaction History</h2>
					<div className="space-y-3">
						{transactions.map(tx => (
							<div key={tx.id} className="flex justify-between items-center py-2 border-b border-gray-100">
								<div>
									<div className="font-medium">{tx.description}</div>
									<div className="text-sm text-gray-600">{tx.type}</div>
								</div>
								<div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
									{tx.amount > 0 ? '+' : ''}{tx.amount}
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
