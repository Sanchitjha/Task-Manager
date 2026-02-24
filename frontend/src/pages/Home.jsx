import { Link } from 'react-router-dom';
import TheManagerLogo from '../components/TheManagerLogo';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
	const { user } = useAuth();
	
	const features = [
		{
			icon: '�',
			title: 'Analytics Dashboard',
			description: 'Track performance metrics and business insights in real-time',
			gradient: 'from-blue-400 to-cyan-500'
		},
		{
			icon: '👥',
			title: 'Team Management',
			description: 'Organize teams, assign roles, and monitor productivity',
			gradient: 'from-green-400 to-emerald-500'
		},
		{
			icon: '🎯',
			title: 'Goal Tracking',
			description: 'Set targets, track progress, and achieve business objectives',
			gradient: 'from-purple-400 to-pink-500'
		}
	];

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 animate-fade-in">
			{/* Logo and Title Section */}
			<div className="flex flex-col items-center justify-center mt-12 mb-8">
				<TheManagerLogo width={120} height={120} />
				<h1 className="text-5xl md:text-7xl font-extrabold leading-tight mt-6 mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
					The MANAGER
				</h1>
				<p className="text-lg md:text-xl text-gray-600 max-w-2xl mt-2 mb-6 text-center">
					Professional Management Platform for Rewards, Teamwork, and Growth
				</p>
			</div>

			{/* Main CTA Buttons */}
			<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
				<Link to="/login" className="btn-primary text-lg px-8 py-4">
					Sign In
				</Link>
				<Link to="/register" className="btn-secondary text-lg px-8 py-4">
					Create Account
				</Link>
			</div>

			{/* Optionally, keep the rest of your intro/feature sections below */}
			{/* Features Section */}
			<section className="max-w-6xl mx-auto px-4 py-20">
				<div className="text-center mb-12 animate-slide-up">
					<h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
						Powerful Features
					</h2>
					<p className="text-lg text-gray-600">Everything you need in one platform</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<div 
							key={index}
							className="card-gradient hover-lift group cursor-pointer"
							style={{ animationDelay: `${index * 100}ms` }}
						>
							<div className={`text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block group-hover:animate-bounce`}>
								{feature.icon}
							</div>
							<h3 className="text-2xl font-bold mb-3 text-gray-800">
								{feature.title}
							</h3>
							<p className="text-gray-600 leading-relaxed">
								{feature.description}
							</p>
							<div className={`mt-4 h-1 bg-gradient-to-r ${feature.gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
						</div>
					))}
				</div>
			</section>

			{/* How It Works Section */}
			<section className="max-w-6xl mx-auto px-4 py-20">
				<div className="text-center mb-12">
					<h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
						How It Works
					</h2>
					<p className="text-lg text-gray-600">Get started in 3 simple steps</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{[
						{ step: '1', title: 'Sign Up', description: 'Create your free account in seconds', icon: '✍️' },
						{ step: '2', title: 'Watch & Earn', description: 'Watch videos and accumulate coins', icon: '📺' },
						{ step: '3', title: 'Redeem', description: 'Use your coins for amazing rewards', icon: '🎉' }
					].map((item, index) => (
						<div key={index} className="relative">
							<div className="card-glass text-center hover-lift">
								<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white text-2xl font-bold mb-4 shadow-glow">
									{item.step}
								</div>
								<div className="text-4xl mb-3">{item.icon}</div>
								<h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
								<p className="text-gray-600">{item.description}</p>
							</div>
							{index < 2 && (
								<div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-brand-300 text-4xl">
									→
								</div>
							)}
						</div>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto px-4 py-20">
				<div className="card-gradient text-center p-12 relative overflow-hidden">
					{/* Background decoration */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-200 to-accent-200 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
					<div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent-200 to-brand-200 rounded-full blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
					
					<div className="relative z-10">
						<h2 className="text-4xl md:text-5xl font-bold mb-6">
							<span className="text-gradient-hero">Ready to Start Earning?</span>
						</h2>
						<p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
							Join thousands of users who are already earning and redeeming rewards every day
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/login" className="btn-primary text-lg px-8 py-4">
								Get Started Free 🚀
							</Link>
							<Link to="/products" className="btn-secondary text-lg px-8 py-4">
								Explore Products 🛍️
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
