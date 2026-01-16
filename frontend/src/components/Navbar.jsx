import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Navbar() {
	const { user, logout } = useAuth();
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	if (location.pathname === '/login' || location.pathname === '/register') {
		return null;
	}
	
	const handleLogout = () => {
		logout();
	};

	const isActive = (path) => location.pathname === path;

	return (
		<nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50 animate-slide-down">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center h-16">
					{/* Logo with gradient */}
					<Link to="/" className="group flex items-center gap-2">
						<div className="text-3xl font-bold text-gradient-hero hover:scale-110 transition-transform duration-300">
							⚡
						</div>
						<span className="text-2xl font-extrabold text-gradient group-hover:scale-105 transition-transform duration-300">
							The MANAGER
						</span>
					</Link>

					{/* Mobile Menu Button */}
					<button 
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{isMenuOpen ? (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							) : (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							)}
						</svg>
					</button>

					{/* Desktop Navigation Links */}
					<div className="hidden lg:flex items-center gap-4">
						{user && (
							<>
								{/* Earn Link - Client Only */}
								{user.role === 'client' && (
									<Link 
										to="/earn" 
										className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
											isActive('/earn') 
												? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
												: 'text-gray-700 hover:bg-green-50'
										}`}
									>
										💰 Earn
									</Link>
								)}
								{/* Wallet Link - Client Only */}
								{user.role === 'client' && (
									<Link 
										to="/wallet" 
										className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
											isActive('/wallet') 
												? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
												: 'text-gray-700 hover:bg-blue-50'
										}`}
									>
										👛 Wallet
									</Link>
								)}
								{/* Shop Link - Only for Clients and Admins */}
								{(user.role === 'client' || user.role === 'admin') && (
									<Link 
										to="/shop" 
										className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
											isActive('/shop') 
												? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
												: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
										}`}
									>
										🛍️ Shop
									</Link>
								)}
								{/* Orders Link - For clients and vendors */}
								{(user.role === 'client' || user.role === 'vendor' || user.role === 'admin') && (
									<Link 
										to="/orders" 
										className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
											isActive('/orders') 
												? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
												: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
										}`}
									>
										📋 Orders
									</Link>
								)}
								{/* Products Link - Not for Sub-Admins */}
								{user.role !== 'subadmin' && (
									<Link 
										to="/products" 
										className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
											isActive('/products') 
												? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg' 
												: 'text-gray-700 hover:bg-brand-50'
										}`}
									>
										📦 Products
									</Link>
								)}
								{/* Seller Portal Link */}
								{user.role === 'vendor' && (
									<Link 
										to="/seller/dashboard" 
										className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
											isActive('/seller/dashboard') 
												? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
												: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
										}`}
									>
										🏪 Seller Portal
									</Link>
								)}
								{/* Admin Dashboard Link */}
								{user.role === 'admin' && (
									<Link 
										to="/admin/dashboard" 
										className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
											isActive('/admin/dashboard') 
												? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
												: 'text-gray-700 hover:bg-purple-50'
										}`}
									>
										📊 Dashboard
									</Link>
								)}
								{/* Sub-Admin Dashboard Link */}
								{user.role === 'subadmin' && (
									<Link 
										to="/subadmin/dashboard" 
										className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
											isActive('/subadmin/dashboard') 
												? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
												: 'text-gray-700 hover:bg-purple-50'
										}`}
									>
										📊 My Dashboard
									</Link>
								)}
								{/* Admin Panel Link (Admin only) */}
								{user.role === 'admin' && (
									<Link 
										to="/admin" 
										className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
											isActive('/admin') 
												? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
												: 'text-gray-700 hover:bg-indigo-50'
										}`}
									>
										⚙️ Admin Panel
									</Link>
								)}
							</>
						)}
						{/* User Info & Login/Logout */}
						{user ? (
							<div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
								<div className="text-right">
									<div className="text-sm font-bold text-gray-800">{user.email}</div>
									<div className="text-xs font-semibold text-brand-600 capitalize">{user.role}</div>
								</div>
								<button 
									onClick={handleLogout}
									className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
								>
									🚪 Logout
								</button>
							</div>
						) : (
							<div className="flex items-center gap-3">
								<Link 
									to="/register" 
									className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
								>
									👤 New User
								</Link>
								<Link 
									to="/login" 
									className="px-6 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
								>
									🔑 Login
								</Link>
							</div>
						)}
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="lg:hidden py-4 animate-slide-down">
						<div className="flex flex-col gap-2">
							{user && (
								<>
									{user.role === 'client' && (
										<>
											<Link to="/earn" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-xl bg-green-50 text-green-700 font-semibold hover:bg-green-100 transition">💰 Earn</Link>
											<Link to="/wallet" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition">👛 Wallet</Link>
										</>
									)}
									{(user.role === 'client' || user.role === 'admin') && (
										<Link to="/shop" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-xl bg-orange-50 text-orange-700 font-semibold hover:bg-orange-100 transition">🛍️ Shop</Link>
									)}
									{(user.role === 'client' || user.role === 'vendor' || user.role === 'admin') && (
										<Link to="/orders" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition">📋 Orders</Link>
									)}
									{user.role !== 'subadmin' && (
										<Link to="/products" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-xl bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100 transition">📦 Products</Link>
									)}
									{user.role === 'vendor' && (
										<Link to="/seller/dashboard" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-xl bg-yellow-50 text-yellow-700 font-semibold hover:bg-yellow-100 transition">🏪 Seller Portal</Link>
									)}
									{user.role === 'admin' && (
										<>
											<Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 transition">📊 Dashboard</Link>
											<Link to="/admin" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition">⚙️ Admin Panel</Link>
										</>
									)}
									{user.role === 'subadmin' && (
										<Link to="/subadmin/dashboard" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 transition">📊 My Dashboard</Link>
									)}
								</>
							)}
							{user ? (
								<div className="mt-4 pt-4 border-t border-gray-200">
									<div className="px-4 py-2 bg-gray-50 rounded-xl mb-2">
										<div className="font-bold text-gray-800">{user.email}</div>
										<div className="text-sm text-brand-600 capitalize font-semibold">{user.role}</div>
									</div>
									<button onClick={handleLogout} className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition">🚪 Logout</button>
								</div>
							) : (
								<Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition">🔑 Login</Link>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
