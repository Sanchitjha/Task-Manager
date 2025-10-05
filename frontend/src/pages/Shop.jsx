import { useState } from 'react';

export default function Shop() {
	const [balance, setBalance] = useState(150);
	const [discountAmount, setDiscountAmount] = useState(0);

	const handleRedeem = () => {
		if (discountAmount > balance) {
			alert('Insufficient coins');
			return;
		}
		alert(`Redeemed ${discountAmount} coins for discount!`);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
			<header className="bg-white/70 backdrop-blur sticky top-0 z-10 border-b">
				<div className="max-w-6xl mx-auto flex items-center justify-between py-3 px-4">
					<div className="font-bold text-brand-800">The MANAGER</div>
					<nav className="flex gap-6 text-sm">
						<a href="/" className="hover:text-brand-600">Home</a>
						<a href="/wallet" className="hover:text-brand-600">Wallet</a>
					</nav>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Shop & Redeem</h1>
				
				<div className="grid md:grid-cols-2 gap-8">
					<div className="card">
						<h2 className="text-xl font-semibold mb-4">Your Balance</h2>
						<div className="text-center">
							<div className="text-4xl font-bold text-brand-600 mb-2">{balance}</div>
							<div className="text-gray-600">Available Coins</div>
						</div>
					</div>

					<div className="card">
						<h2 className="text-xl font-semibold mb-4">Redeem Coins</h2>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">Discount Amount (₹)</label>
								<input
									type="number"
									value={discountAmount}
									onChange={(e) => setDiscountAmount(Number(e.target.value))}
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									placeholder="Enter amount"
								/>
							</div>
							<div className="text-sm text-gray-600">
								Coins needed: {discountAmount} (1 coin = ₹1)
							</div>
							<button 
								onClick={handleRedeem}
								className="btn-primary w-full"
								disabled={discountAmount <= 0 || discountAmount > balance}
							>
								Redeem Now
							</button>
						</div>
					</div>
				</div>

				<div className="card mt-8">
					<h2 className="text-xl font-semibold mb-4">Partner Stores</h2>
					<div className="grid md:grid-cols-3 gap-4">
						<div className="border border-gray-200 rounded-lg p-4 text-center">
							<div className="font-medium mb-2">Amazon</div>
							<div className="text-sm text-gray-600">Use coins for discounts</div>
						</div>
						<div className="border border-gray-200 rounded-lg p-4 text-center">
							<div className="font-medium mb-2">Flipkart</div>
							<div className="text-sm text-gray-600">Redeem for cashback</div>
						</div>
						<div className="border border-gray-200 rounded-lg p-4 text-center">
							<div className="font-medium mb-2">Myntra</div>
							<div className="text-sm text-gray-600">Fashion discounts</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

