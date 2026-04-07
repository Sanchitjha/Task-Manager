import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import TheManagerLogo from './TheManagerLogo';
import { useState, useRef, useEffect } from 'react';
import {
	Search, ShoppingCart, ChevronDown, Menu, X,
	User, LogOut, Settings, Shield, MapPin,
	BarChart3, Package, Coins, ClipboardList,
	Home, Store, LayoutDashboard
} from 'lucide-react';

// Cart count from localStorage
function useCartCount() {
	const [count, setCount] = useState(0);

	useEffect(() => {
		const update = () => {
			try {
				const cart = JSON.parse(localStorage.getItem('shopCart') || '[]');
				const total = cart.reduce((s, i) => s + (i.quantity || 1), 0);
				setCount(total);
			} catch {
				setCount(0);
			}
		};
		update();
		window.addEventListener('storage', update);
		// Poll every 500ms for same-tab updates
		const interval = setInterval(update, 500);
		return () => {
			window.removeEventListener('storage', update);
			clearInterval(interval);
		};
	}, []);

	return count;
}

const CATEGORY_LINKS = [
	{ to: '/products', label: 'All Products' },
	{ to: '/shops', label: 'Local Shops' },
	{ to: '/earn', label: 'Earn Coins' },
	{ to: '/orders', label: 'My Orders' },
];

const SELLER_LINKS = [
	{ to: '/seller/inventory', label: 'Inventory' },
	{ to: '/seller/orders', label: 'Orders' },
	{ to: '/seller/analytics', label: 'Analytics' },
	{ to: '/seller/wallet', label: 'Earnings' },
];

export default function Navbar() {
	const { user, logout } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const cartCount = useCartCount();
	const [searchQuery, setSearchQuery] = useState('');
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setIsProfileOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		setIsMenuOpen(false);
	}, [location.pathname]);

	const isAuthPage = ['/login', '/register'].includes(location.pathname);
	if (isAuthPage) return null;

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
		}
	};

	const isActive = (path) => location.pathname === path;
	const isPartner = user?.role === 'partner';
	const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

	return (
		<>
			{/* ── Primary Header ─────────────────────────────────────────── */}
			<header className="bg-amazon-dark sticky top-0 z-50">
				<div className="max-w-[1500px] mx-auto px-3 sm:px-4">
					<div className="flex items-center gap-2 sm:gap-3 h-14">

						{/* Logo */}
						<Link
							to="/"
							className="flex items-center gap-2 shrink-0 px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white/50 transition-all"
						>
							<TheManagerLogo width={30} height={30} />
							<div className="hidden sm:block leading-tight">
								<div className="text-white font-bold text-sm tracking-tight">the</div>
								<div className="text-amazon-orange font-black text-base leading-none tracking-tight">MANAGER</div>
							</div>
						</Link>

						{/* Deliver to (desktop) */}
						{user && (
							<div className="hidden lg:flex items-end gap-1 text-white px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white/50 cursor-pointer shrink-0">
								<MapPin size={14} className="text-gray-300 mb-1" />
								<div>
									<div className="text-[10px] text-gray-300 leading-tight">Hello, {user.name?.split(' ')[0] || 'User'}</div>
									<div className="text-xs font-bold leading-tight">Account</div>
								</div>
							</div>
						)}

						{/* Search Bar */}
						<form onSubmit={handleSearch} className="flex-1 flex items-center min-w-0">
							<div className="flex w-full rounded-lg overflow-hidden ring-2 ring-transparent focus-within:ring-amazon-orange transition-all">
								<select className="bg-amazon-light-gray text-gray-700 text-xs px-2 py-0 border-0 outline-none hidden sm:block shrink-0 h-10 cursor-pointer">
									<option>All</option>
									<option>Products</option>
									<option>Shops</option>
								</select>
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search products, shops, categories…"
									className="flex-1 px-3 py-2.5 text-gray-900 text-sm outline-none bg-white min-w-0"
								/>
								<button
									type="submit"
									className="bg-amazon-orange hover:bg-amazon-orange-light px-4 flex items-center justify-center shrink-0 h-10 transition-colors"
								>
									<Search size={18} className="text-gray-900" />
								</button>
							</div>
						</form>

						{/* Right side actions */}
						<div className="flex items-center gap-1 shrink-0">

							{/* Account / Sign In */}
							{user ? (
								<div className="relative" ref={dropdownRef}>
									<button
										onClick={() => setIsProfileOpen(!isProfileOpen)}
										className="flex flex-col items-start px-2 py-1 rounded text-white hover:outline hover:outline-1 hover:outline-white/50 transition-all"
									>
										<span className="text-[10px] text-gray-300 leading-tight hidden sm:block">Hello, {user.name?.split(' ')[0]}</span>
										<span className="text-xs font-bold flex items-center gap-0.5 leading-tight">
											Account
											<ChevronDown size={12} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
										</span>
									</button>

									{isProfileOpen && (
										<div className="absolute right-0 top-[calc(100%+4px)] w-60 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50 animate-fade-in">
											{/* User info */}
											<div className="px-4 py-2 border-b border-gray-100">
												<div className="flex items-center gap-3">
													<div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0">
														<img
															src={user.profileImage ? api.getProfileImageUrl(user.profileImage) : '/default-avatar.png'}
															alt={user.name}
															className="w-full h-full object-cover"
															onError={(e) => { e.target.src = '/default-avatar.png'; }}
														/>
													</div>
													<div>
														<div className="font-semibold text-gray-900 text-sm truncate max-w-[150px]">{user.name}</div>
														<div className="text-xs text-amazon-orange capitalize">{user.role}</div>
													</div>
												</div>
											</div>

											<Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
												<User size={15} className="text-gray-500" /> Profile Settings
											</Link>
											<Link to="/wallet" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
												<Coins size={15} className="text-amazon-orange" /> My Wallet
											</Link>
											<Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
												<ClipboardList size={15} className="text-gray-500" /> My Orders
											</Link>
											<Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
												<LayoutDashboard size={15} className="text-gray-500" /> Dashboard
											</Link>
											{isAdmin && (
												<Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
													<Shield size={15} className="text-brand-600" /> Admin Panel
												</Link>
											)}
											<div className="border-t border-gray-100 my-1" />
											<button
												onClick={() => { setIsProfileOpen(false); logout(); }}
												className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
											>
												<LogOut size={15} /> Sign Out
											</button>
										</div>
									)}
								</div>
							) : (
								<div className="flex items-center gap-1">
									<Link
										to="/login"
										className="flex flex-col items-start px-2 py-1 rounded text-white hover:outline hover:outline-1 hover:outline-white/50 transition-all"
									>
										<span className="text-[10px] text-gray-300 leading-tight hidden sm:block">Hello, Sign in</span>
										<span className="text-xs font-bold leading-tight flex items-center gap-0.5">
											Account <ChevronDown size={12} />
										</span>
									</Link>
								</div>
							)}

							{/* Returns & Orders */}
							<Link
								to="/orders"
								className="hidden md:flex flex-col items-start px-2 py-1 rounded text-white hover:outline hover:outline-1 hover:outline-white/50 transition-all"
							>
								<span className="text-[10px] text-gray-300 leading-tight">Returns</span>
								<span className="text-xs font-bold leading-tight">&amp; Orders</span>
							</Link>

							{/* Cart */}
							<Link
								to="/cart"
								className="relative flex items-end gap-1 px-2 py-1 rounded text-white hover:outline hover:outline-1 hover:outline-white/50 transition-all"
							>
								<div className="relative">
									<ShoppingCart size={26} strokeWidth={1.5} />
									{cartCount > 0 && (
										<span className="absolute -top-2 -right-1 min-w-[18px] h-[18px] bg-amazon-orange text-gray-900 text-xs font-bold rounded-full flex items-center justify-center px-1 leading-none">
											{cartCount > 99 ? '99+' : cartCount}
										</span>
									)}
								</div>
								<span className="text-xs font-bold leading-tight pb-0.5 hidden sm:block">Cart</span>
							</Link>

							{/* Mobile menu toggle */}
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className="lg:hidden p-2 text-white hover:text-amazon-orange transition-colors"
								aria-label="Toggle menu"
							>
								{isMenuOpen ? <X size={20} /> : <Menu size={20} />}
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* ── Secondary Nav Bar ──────────────────────────────────────── */}
			<nav className="bg-amazon-navy hidden lg:block">
				<div className="max-w-[1500px] mx-auto px-4">
					<div className="flex items-center gap-0 h-10 text-white text-sm">
						{/* All menu */}
						<button className="flex items-center gap-1.5 px-3 h-full font-semibold hover:outline hover:outline-1 hover:outline-white/50 transition-all rounded">
							<Menu size={16} /> All
						</button>

						{/* Dynamic links based on role */}
						{user && isPartner ? (
							SELLER_LINKS.map(({ to, label }) => (
								<Link
									key={to}
									to={to}
									className={`px-3 h-full flex items-center text-sm hover:outline hover:outline-1 hover:outline-white/50 transition-all rounded ${isActive(to) ? 'font-bold' : ''}`}
								>
									{label}
								</Link>
							))
						) : (
							CATEGORY_LINKS.map(({ to, label }) => (
								<Link
									key={to}
									to={to}
									className={`px-3 h-full flex items-center text-sm hover:outline hover:outline-1 hover:outline-white/50 transition-all rounded ${isActive(to) ? 'font-bold' : ''}`}
								>
									{label}
								</Link>
							))
						)}

						{user && (
							<Link
								to="/dashboard"
								className={`px-3 h-full flex items-center text-sm hover:outline hover:outline-1 hover:outline-white/50 transition-all rounded ${isActive('/dashboard') ? 'font-bold' : ''}`}
							>
								Dashboard
							</Link>
						)}

						<div className="ml-auto flex items-center">
							<span className="text-[11px] text-gray-300 px-3">
								The MANAGER Public Services
							</span>
						</div>
					</div>
				</div>
			</nav>

			{/* ── Mobile Menu ────────────────────────────────────────────── */}
			{isMenuOpen && (
				<div className="lg:hidden bg-amazon-dark border-t border-white/10 z-40">
					<div className="px-4 py-3 flex flex-col gap-1">
						{/* Search on mobile */}
						<form onSubmit={handleSearch} className="flex gap-2 mb-3">
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search…"
								className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
							/>
							<button type="submit" className="bg-amazon-orange px-3 py-2 rounded-lg">
								<Search size={16} className="text-gray-900" />
							</button>
						</form>

						{(isPartner ? SELLER_LINKS : CATEGORY_LINKS).map(({ to, label }) => (
							<Link
								key={to}
								to={to}
								onClick={() => setIsMenuOpen(false)}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(to) ? 'bg-amazon-orange text-gray-900' : 'text-white hover:bg-white/10'}`}
							>
								{label}
							</Link>
						))}

						{user && (
							<>
								<Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/10">
									Dashboard
								</Link>
								<Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/10">
									Profile Settings
								</Link>
								<div className="border-t border-white/20 my-1" />
								<button
									onClick={() => { setIsMenuOpen(false); logout(); }}
									className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-white/10"
								>
									<LogOut size={16} /> Sign Out
								</button>
							</>
						)}

						{!user && (
							<div className="flex gap-2 mt-1">
								<Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 border border-white/30 text-white rounded-lg text-sm">
									Register
								</Link>
								<Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 bg-amazon-orange text-gray-900 rounded-lg text-sm font-medium">
									Sign In
								</Link>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
