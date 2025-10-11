import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
	const { user } = useAuth();
	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
			<main>
				<section className="max-w-6xl mx-auto px-4 py-16 text-center">
					<h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-brand-800">
						Modern Rewards Platform
					</h1>
					<p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
						Watch videos, earn coins, redeem discounts, and manage everything with a sleek admin panel.
					</p>
					<div className="mt-8 flex gap-4 justify-center">
						<Link to="/earn" className="btn-primary">Start Earning</Link>
						<Link to="/wallet" className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white">View Wallet</Link>
					</div>
				</section>

				<section className="max-w-6xl mx-auto px-4 py-16">
					<div className="grid md:grid-cols-3 gap-8">
						<div className="card text-center">
							<h3 className="text-xl font-semibold mb-3">Earn Coins</h3>
							<p className="text-gray-600">Watch videos and earn coins based on your watch time</p>
						</div>
						<div className="card text-center">
							<h3 className="text-xl font-semibold mb-3">Track Wallet</h3>
							<p className="text-gray-600">Monitor your balance and transaction history</p>
						</div>
						<div className="card text-center">
							<h3 className="text-xl font-semibold mb-3">Redeem Rewards</h3>
							<p className="text-gray-600">Use coins for discounts on external purchases</p>
						</div>
					</div>
				</section>
			</main>

			<footer className="text-center py-10 text-sm text-gray-600">
				© {new Date().getFullYear()} The MANAGER
			</footer>
		</div>
	);
}
