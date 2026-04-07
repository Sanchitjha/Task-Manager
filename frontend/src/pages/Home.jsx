import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import {
	ShoppingBag, Coins, Store, Package, Star,
	ArrowRight, ChevronRight, Users, Building2,
	Truck, Shield, RefreshCw, HeadphonesIcon,
	BookOpen, Lock, FileText, Phone, Mail, Clock, MapPin, CheckCircle
} from 'lucide-react';

// Featured categories for the Amazon-style grid
const CATEGORIES = [
	{ label: 'Electronics',   emoji: '💻', color: '#E8F4F8' },
	{ label: 'Fashion',       emoji: '👗', color: '#FDF2F8' },
	{ label: 'Home & Garden', emoji: '🏡', color: '#F0FDF4' },
	{ label: 'Sports',        emoji: '⚽', color: '#FFF7ED' },
	{ label: 'Books',         emoji: '📚', color: '#FEFCE8' },
	{ label: 'Grocery',       emoji: '🛒', color: '#F0F9FF' },
	{ label: 'Beauty',        emoji: '💄', color: '#FDF4FF' },
	{ label: 'Toys',          emoji: '🧸', color: '#FFF1F2' },
];

const TABS = [
	{ id: 'about',   label: 'About',    Icon: BookOpen },
	{ id: 'privacy', label: 'Privacy',  Icon: Lock },
	{ id: 'terms',   label: 'Terms',    Icon: FileText },
	{ id: 'contact', label: 'Contact',  Icon: Phone },
];

const TRUST_BADGES = [
	{ Icon: Truck,          title: 'Fast Delivery',   desc: 'Quick delivery to your door' },
	{ Icon: Shield,         title: 'Secure Payments', desc: 'Your data is always protected' },
	{ Icon: RefreshCw,      title: 'Easy Returns',    desc: 'Hassle-free return process' },
	{ Icon: HeadphonesIcon, title: '24/7 Support',    desc: 'We're here whenever you need us' },
];

function StarRating({ rating = 4.5, count = 0 }) {
	const full  = Math.floor(rating);
	const half  = rating % 1 >= 0.5;
	return (
		<div className="flex items-center gap-1">
			<span className="stars">
				{'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
			</span>
			{count > 0 && <span className="text-amazon-link text-xs">{count}</span>}
		</div>
	);
}

function ProductCard({ product }) {
	const price     = product.finalPrice || product.originalPrice || 0;
	const original  = product.originalPrice || 0;
	const discount  = product.discountPercentage || 0;
	const imageUrl  = product.images?.[0] ? api.getProfileImageUrl(product.images[0]) : null;

	return (
		<Link to={`/product/${product._id}`} className="product-card block group">
			{/* Image */}
			<div className="h-44 sm:h-48 bg-white flex items-center justify-center overflow-hidden p-3">
				{imageUrl ? (
					<img src={imageUrl} alt={product.title} className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300" />
				) : (
					<div className="text-5xl text-gray-300">📦</div>
				)}
			</div>
			{/* Info */}
			<div className="p-3 border-t border-gray-100">
				<p className="text-sm text-gray-800 font-medium line-clamp-2 leading-snug mb-1 group-hover:text-amazon-link">
					{product.title}
				</p>
				<StarRating rating={product.ratings || 4} />
				<div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
					<span className="text-amazon-red text-base font-medium">
						<span className="text-xs align-top">₹</span>
						<span className="text-lg">{Math.floor(price)}</span>
						<span className="text-xs">.{String(price % 1 === 0 ? '00' : Math.round((price % 1) * 100)).padStart(2, '0')}</span>
					</span>
					{discount > 0 && (
						<span className="text-amazon-gray line-through text-xs">₹{original}</span>
					)}
				</div>
				{discount > 0 && (
					<p className="text-amazon-green text-xs font-medium">Save {discount}%</p>
				)}
				{product.stock > 0 ? (
					<p className="text-amazon-green text-xs mt-1">In Stock</p>
				) : (
					<p className="text-red-500 text-xs mt-1">Out of Stock</p>
				)}
			</div>
		</Link>
	);
}

export default function Home() {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState('about');
	const [products, setProducts] = useState([]);
	const [loadingProducts, setLoadingProducts] = useState(false);

	useEffect(() => {
		const loadFeatured = async () => {
			try {
				setLoadingProducts(true);
				const res = await api.get('/products', { params: { limit: 8 } });
				setProducts(res.data.items || []);
			} catch { /* silent fail */ }
			finally { setLoadingProducts(false); }
		};
		loadFeatured();
	}, []);

	return (
		<div className="min-h-screen bg-amazon-bg">

			{/* ── Hero Banner ─────────────────────────────────────────── */}
			<section
				className="relative overflow-hidden"
				style={{ background: 'linear-gradient(135deg, #131921 0%, #232F3E 60%, #37475A 100%)' }}
			>
				{/* Decorative circles */}
				<div className="absolute top-0 right-0 w-96 h-96 bg-amazon-orange opacity-5 rounded-full translate-x-1/3 -translate-y-1/2 pointer-events-none" />
				<div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400 opacity-10 rounded-full -translate-x-1/3 translate-y-1/2 pointer-events-none" />

				<div className="relative max-w-[1200px] mx-auto px-6 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
					{/* Text */}
					<div className="text-white">
						<div className="inline-flex items-center gap-2 bg-amazon-orange/20 text-amazon-orange px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border border-amazon-orange/30">
							🏪 Coin-based Marketplace
						</div>
						<h1 className="text-4xl md:text-5xl font-black leading-tight mb-5">
							Shop Smart,
							<br />
							<span className="text-amazon-orange">Earn Rewards</span>
						</h1>
						<p className="text-gray-300 text-base leading-relaxed mb-8 max-w-md">
							Discover thousands of products from verified partners. Watch videos, earn coins, and use them to unlock exclusive discounts.
						</p>
						<div className="flex flex-wrap gap-3">
							<Link
								to={user ? '/products' : '/register'}
								className="btn-amazon font-semibold px-7 py-3"
							>
								{user ? 'Shop Now' : 'Get Started'}
								<ArrowRight size={16} />
							</Link>
							{!user ? (
								<Link
									to="/login"
									className="btn-amazon-secondary px-7 py-3 bg-transparent text-white border-white/30 hover:bg-white/10"
								>
									Sign In
								</Link>
							) : (
								<Link to="/earn" className="btn-amazon-secondary px-7 py-3 bg-transparent text-white border-white/30 hover:bg-white/10">
									<Coins size={16} className="text-amazon-orange" />
									Earn Coins
								</Link>
							)}
						</div>
					</div>

					{/* Stats cards */}
					<div className="grid grid-cols-2 gap-4">
						{[
							{ icon: '🏪', label: 'Partner Shops',  value: '200+',   sub: 'Verified sellers' },
							{ icon: '🛍️', label: 'Products',       value: '5,000+', sub: 'Listed & growing' },
							{ icon: '🪙', label: 'Coins Rewarded', value: '50K+',   sub: 'Given to members' },
							{ icon: '⭐', label: 'Happy Users',    value: '10K+',   sub: '98% satisfaction' },
						].map(({ icon, label, value, sub }) => (
							<div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-white">
								<div className="text-2xl mb-1">{icon}</div>
								<div className="text-2xl font-black">{value}</div>
								<div className="text-sm font-semibold">{label}</div>
								<div className="text-xs text-gray-400 mt-0.5">{sub}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Category Grid ─────────────────────────────────────────── */}
			<section className="max-w-[1200px] mx-auto px-4 py-8">
				<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
					{CATEGORIES.map(({ label, emoji, color }) => (
						<Link
							key={label}
							to={`/products?category=${encodeURIComponent(label)}`}
							className="flex flex-col items-center gap-2 p-3 rounded-lg hover:shadow-amazon transition-all duration-200 group"
							style={{ background: color }}
						>
							<span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
							<span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
						</Link>
					))}
				</div>
			</section>

			{/* ── Featured Products ─────────────────────────────────────── */}
			<section className="max-w-[1200px] mx-auto px-4 pb-8">
				<div className="bg-white rounded-sm border border-amazon-border p-5">
					<div className="section-header">
						<h2 className="section-title">Featured Products</h2>
						<Link to="/products" className="text-amazon-link hover:text-amazon-link-hover text-sm font-medium flex items-center gap-1">
							See all <ChevronRight size={14} />
						</Link>
					</div>

					{loadingProducts ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
							{[...Array(8)].map((_, i) => (
								<div key={i} className="rounded-sm overflow-hidden">
									<div className="h-44 bg-gray-100 shimmer" />
									<div className="p-3 space-y-2">
										<div className="h-3 bg-gray-100 shimmer rounded" />
										<div className="h-3 bg-gray-100 shimmer rounded w-3/4" />
										<div className="h-4 bg-gray-100 shimmer rounded w-1/2" />
									</div>
								</div>
							))}
						</div>
					) : products.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
							{products.map((p) => <ProductCard key={p._id} product={p} />)}
						</div>
					) : (
						<div className="text-center py-12">
							<div className="text-5xl mb-3">📦</div>
							<p className="text-gray-500 font-medium">No products yet</p>
							<p className="text-gray-400 text-sm mt-1">Products will appear here once vendors add them</p>
						</div>
					)}
				</div>
			</section>

			{/* ── How It Works ──────────────────────────────────────────── */}
			<section className="bg-white border-y border-amazon-border py-12">
				<div className="max-w-[1200px] mx-auto px-4">
					<h2 className="text-2xl font-black text-gray-900 text-center mb-8">How It Works</h2>
					<div className="grid sm:grid-cols-3 gap-6">
						{[
							{ step: '01', icon: '📺', title: 'Watch Videos', desc: 'Earn coins by watching educational and promotional videos on our platform.' },
							{ step: '02', icon: '🪙', title: 'Collect Coins', desc: 'Coins accumulate in your wallet. More videos = more coins = bigger discounts.' },
							{ step: '03', icon: '🛍️', title: 'Shop & Save', desc: 'Use your coins at checkout to get exclusive discounts from verified partner shops.' },
						].map(({ step, icon, title, desc }) => (
							<div key={step} className="relative flex flex-col items-center text-center p-6 rounded-xl bg-amazon-bg">
								<div className="text-5xl mb-3">{icon}</div>
								<div className="absolute top-4 right-4 text-4xl font-black text-gray-100">{step}</div>
								<h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
								<p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
					{!user && (
						<div className="text-center mt-8">
							<Link to="/register" className="btn-amazon px-8 py-3 text-base font-semibold">
								Start Earning Today <ArrowRight size={18} />
							</Link>
						</div>
					)}
				</div>
			</section>

			{/* ── Trust Badges ──────────────────────────────────────────── */}
			<section className="max-w-[1200px] mx-auto px-4 py-10">
				<div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
					{TRUST_BADGES.map(({ Icon, title, desc }) => (
						<div key={title} className="flex items-start gap-4 bg-white rounded-sm border border-amazon-border p-5">
							<div className="w-10 h-10 bg-amazon-orange/10 rounded-full flex items-center justify-center shrink-0">
								<Icon size={20} className="text-amazon-orange" />
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
								<p className="text-gray-500 text-xs mt-0.5">{desc}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ── Partner CTA ───────────────────────────────────────────── */}
			<section className="bg-amazon-dark py-12">
				<div className="max-w-[1200px] mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
					<div className="text-white">
						<h2 className="text-2xl font-black mb-3">Become a Partner Seller</h2>
						<p className="text-gray-300 text-sm leading-relaxed mb-6">
							List your products on The MANAGER marketplace. Reach thousands of active buyers, manage your inventory, process orders, and grow your business — all from one dashboard.
						</p>
						<div className="flex flex-wrap gap-3">
							<Link to="/partner/register" className="btn-amazon font-semibold">
								<Store size={16} /> Start Selling
							</Link>
							<Link to="/shops" className="btn-amazon-secondary bg-transparent text-white border-white/30 hover:bg-white/10">
								Browse Shops
							</Link>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						{[
							{ icon: '📦', label: 'Easy Listings',    desc: 'Add products in minutes' },
							{ icon: '📊', label: 'Analytics',        desc: 'Track your performance' },
							{ icon: '💰', label: 'Coin Rewards',     desc: 'Earn on every sale' },
							{ icon: '🔒', label: 'Secure Payouts',   desc: 'Fast & reliable payments' },
						].map(({ icon, label, desc }) => (
							<div key={label} className="bg-white/10 rounded-xl p-4 text-white border border-white/10">
								<div className="text-2xl mb-2">{icon}</div>
								<div className="font-semibold text-sm">{label}</div>
								<div className="text-xs text-gray-400 mt-0.5">{desc}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Info Tabs ─────────────────────────────────────────────── */}
			<section className="max-w-[1200px] mx-auto px-4 py-10">
				<div className="bg-white rounded-sm border border-amazon-border overflow-hidden">
					{/* Tab Nav */}
					<div className="flex border-b border-amazon-border overflow-x-auto">
						{TABS.map(({ id, label, Icon }) => (
							<button
								key={id}
								onClick={() => setActiveTab(id)}
								className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
									activeTab === id
										? 'border-amazon-orange text-amazon-orange-dark'
										: 'border-transparent text-gray-600 hover:text-gray-900'
								}`}
							>
								<Icon size={14} />
								{label}
							</button>
						))}
					</div>

					<div className="p-6 md:p-8">
						{/* About */}
						{activeTab === 'about' && (
							<div>
								<h2 className="text-xl font-bold text-gray-900 mb-4">About The MANAGER</h2>
								<div className="space-y-3 text-gray-600 text-sm leading-relaxed mb-6">
									<p>The Manager is a structured social management service designed to support housing societies and community-based organizations in running their operations efficiently and transparently.</p>
									<p>Our role focuses on simplifying society operations such as administrative coordination, process management, compliance assistance, and communication flow.</p>
								</div>
								<div className="grid gap-2.5">
									{[
										'Streamlined administrative coordination and process management',
										'Compliance assistance and structured reporting',
										'Verified vendor network and marketplace access',
										'Coin-based rewards for active community participation',
									].map((item) => (
										<div key={item} className="flex items-start gap-2.5">
											<CheckCircle size={16} className="text-amazon-orange shrink-0 mt-0.5" />
											<span className="text-sm text-gray-600">{item}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Privacy */}
						{activeTab === 'privacy' && (
							<div>
								<h2 className="text-xl font-bold text-gray-900 mb-1">Privacy Policy</h2>
								<p className="text-gray-400 text-xs mb-5">Last updated: January 2025</p>
								<div className="space-y-4">
									{[
										{ title: 'Information We Collect', body: 'We collect basic personal and operational information such as name, contact details, and society details to deliver our services effectively.' },
										{ title: 'Use of Information', body: 'Data is used strictly for society operations, service coordination, and improving platform functionality. We do not sell or rent data to third parties.' },
										{ title: 'Data Protection', body: 'We implement administrative, technical, and organizational measures to protect your information from unauthorized access.' },
										{ title: 'Data Sharing', body: 'Information may be shared with verified service partners strictly for service fulfillment. You may request access or deletion at any time.' },
									].map(({ title, body }) => (
										<div key={title} className="border-l-2 border-amazon-orange pl-4">
											<h3 className="font-semibold text-gray-800 text-sm mb-1">{title}</h3>
											<p className="text-sm text-gray-500">{body}</p>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Terms */}
						{activeTab === 'terms' && (
							<div>
								<h2 className="text-xl font-bold text-gray-900 mb-1">Terms & Conditions</h2>
								<p className="text-gray-400 text-xs mb-5">By using The Manager, you agree to these terms.</p>
								<div className="space-y-4">
									{[
										{ title: 'Service Scope', body: 'The Manager provides operational coordination and structured support for housing societies.' },
										{ title: 'User Responsibilities', body: 'Users agree to provide accurate information. Misuse may result in service suspension.' },
										{ title: 'Payments & Fees', body: 'Service fees are defined through formal agreements. Coin rewards are subject to platform terms.' },
										{ title: 'Liability', body: 'The Manager is not liable for circumstances beyond its control. Society decisions remain the responsibility of the managing committee.' },
									].map(({ title, body }) => (
										<div key={title} className="flex gap-3">
											<ChevronRight size={14} className="text-amazon-orange shrink-0 mt-1" />
											<div>
												<h3 className="font-semibold text-gray-800 text-sm mb-0.5">{title}</h3>
												<p className="text-sm text-gray-500">{body}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Contact */}
						{activeTab === 'contact' && (
							<div>
								<h2 className="text-xl font-bold text-gray-900 mb-1">Contact Us</h2>
								<p className="text-gray-400 text-xs mb-5">We're here to help societies and residents manage operations better.</p>
								<div className="grid sm:grid-cols-2 gap-4">
									{[
										{ Icon: Mail,  title: 'Email',          value: 'support@themanager.in',       href: 'mailto:support@themanager.in', color: 'text-brand-600', bg: 'bg-blue-50', border: 'border-blue-200' },
										{ Icon: Phone, title: 'Phone',          value: '+91-9328961255',               href: 'tel:+919328961255',            color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
										{ Icon: Clock, title: 'Business Hours', value: 'Mon–Sat, 10 AM – 6 PM',       href: null,                           color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
										{ Icon: MapPin, title: 'Office',        value: 'Address to be updated',       href: null,                           color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
									].map(({ Icon, title, value, href, color, bg, border }) => (
										<div key={title} className={`${bg} border ${border} rounded-xl p-4`}>
											<div className="flex items-center gap-2 mb-1.5">
												<Icon size={14} className={color} />
												<span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</span>
											</div>
											{href ? (
												<a href={href} className={`font-medium ${color} hover:underline text-sm`}>{value}</a>
											) : (
												<span className="font-medium text-gray-700 text-sm">{value}</span>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* ── Footer ────────────────────────────────────────────────── */}
			<footer className="bg-amazon-navy text-white">
				<div className="max-w-[1200px] mx-auto px-4 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
					<div>
						<div className="flex items-center gap-2 mb-3">
							<div className="text-amazon-orange font-black text-lg">THE MANAGER</div>
						</div>
						<p className="text-gray-400 text-xs leading-relaxed">
							Structured social management for housing societies and communities.
						</p>
					</div>
					<div>
						<h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Quick Links</h4>
						<ul className="space-y-2">
							{[['Products', '/products'], ['Local Shops', '/shops'], ['Sign In', '/login'], ['Register', '/register']].map(([label, to]) => (
								<li key={to}>
									<Link to={to} className="text-sm text-gray-300 hover:text-amazon-orange transition-colors">{label}</Link>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Policies</h4>
						<ul className="space-y-2">
							{[['Privacy Policy', '/privacy'], ['Terms & Conditions', '/terms'], ['Security Policy', '/security']].map(([label, to]) => (
								<li key={to}>
									<Link to={to} className="text-sm text-gray-300 hover:text-amazon-orange transition-colors">{label}</Link>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Contact</h4>
						<ul className="space-y-2 text-sm text-gray-400">
							<li>support@themanager.in</li>
							<li>+91-9328961255</li>
							<li>Mon–Sat · 10 AM – 6 PM</li>
						</ul>
					</div>
				</div>
				<div className="border-t border-white/10 py-4 text-center">
					<p className="text-xs text-gray-500">© {new Date().getFullYear()} The MANAGER. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}
