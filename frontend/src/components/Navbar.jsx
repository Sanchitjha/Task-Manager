import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
	const { user, logout } = useAuth();
	const location = useLocation();

	if (location.pathname === '/login') {
		return null;
	}
	const handleLogout = () => {
		logout();
		
	};

	return (
		<nav className="bg-white shadow-md border-b border-gray-200">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link to="/" className="text-2xl font-bold text-brand-600 hover:text-brand-700 transition">
						The MANAGER
					</Link>

					{/* Navigation Links */}
					<div className="flex items-center gap-6">
						{user && (
							<>
								<Link 
									to="/earn" 
									className="text-gray-700 hover:text-brand-600 font-medium transition"
								>
									Earn
								</Link>
								<Link 
									to="/wallet" 
									className="text-gray-700 hover:text-brand-600 font-medium transition"
								>
									Wallet
								</Link>
								<Link 
									to="/shop" 
									className="text-gray-700 hover:text-brand-600 font-medium transition"
								>
									Shop
								</Link>
								{/* Profile Link with Image */}
								<Link 
									to="/profile" 
									className="flex items-center gap-2 text-gray-700 hover:text-brand-600 font-medium transition"
								>
									<img
										src={user.profileImage ? `http://localhost:5000${user.profileImage}` : '/default-avatar.png'}
										alt="Profile"
										className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
									/>
									Profile
								</Link>
								{(user.role === 'admin' || user.role === 'subadmin') && (
									<Link 
										to="/admin" 
										className="text-gray-700 hover:text-brand-600 font-medium transition"
									>
										Admin
									</Link>
								)}
							</>
						)}
						{/* User Info & Login/Logout */}
						{user ? (
							<div className="flex items-center gap-4">
								<div className="text-right">
									<div className="text-sm font-semibold text-gray-800">{user.email}</div>
									<div className="text-xs text-gray-500 capitalize">{user.role}</div>
								</div>
								<button 
									onClick={handleLogout}
									className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition font-medium"
								>
									Logout
								</button>
							</div>
						) : (
							<Link 
								to="/login" 
								className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition font-medium"
							>
								Login
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
