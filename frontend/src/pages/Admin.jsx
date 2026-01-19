import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [videos, setVideos] = useState([]);
	const [settings, setSettings] = useState({});

	useEffect(() => {
		// Mock data for now
		setUsers([
<<<<<<< HEAD
			{ id: 1, name: 'John Doe', email: 'john@example.com', role: 'client', walletBalance: 100 },
			{ id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Partner', walletBalance: 50 },
=======
			{ id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', walletBalance: 100 },
			{ id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'partner', walletBalance: 50 },
>>>>>>> b6bc9da1e30255cf3c160ed3ab93bd413ba4f91e
		]);
		setVideos([
			{ id: 1, title: 'Sample Video', url: 'https://youtube.com/watch?v=123', isActive: true },
		]);
		setSettings({ coinPerMinute: 10, maxPerVideo: 50 });
	}, []);

	if (!user || (user.role !== 'admin' && user.role !== 'subadmin')) {
		return (
			<div className="container mx-auto p-4">
				<div className="bg-red-100 text-red-700 p-4 rounded-lg">
					Access Denied. Admin or Sub-admin privileges required.
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
			
			<div className="grid md:grid-cols-3 gap-6 mb-8">
				<div className="bg-white rounded-lg shadow-md p-6 text-center">
					<div className="text-4xl font-bold text-blue-600">{users.length}</div>
					<div className="text-gray-600 mt-2">Total Users</div>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6 text-center">
					<div className="text-4xl font-bold text-green-600">{videos.length}</div>
					<div className="text-gray-600 mt-2">Active Videos</div>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6 text-center">
				<div className="text-4xl font-bold text-orange-600">{users.filter(u => u.role === 'Partner').length}</div>
				<div className="text-gray-600 mt-2">Active Partners</div>
				</div>
			</div>

			<div className="grid md:grid-cols-3 gap-6 mb-8">
				<button
					onClick={() => navigate('/admin/videos')}
					className="bg-white rounded-lg shadow-md p-8 text-left hover:shadow-lg transition group"
				>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600">
								📹 Video Management
							</h2>
							<p className="text-gray-600">
								Add, edit, and manage videos for users to watch and earn coins
							</p>
						</div>
						<div className="text-3xl group-hover:translate-x-2 transition-transform">
							→
						</div>
					</div>
				</button>

				<button
					onClick={() => navigate('/admin/partners')}
					className="bg-white rounded-lg shadow-md p-8 text-left hover:shadow-lg transition group"
				>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-semibold mb-2 group-hover:text-orange-600">
								🏪 Partner Management
							</h2>
							<p className="text-gray-600">
								Manage partners, products, orders, and e-commerce activities
							</p>
						</div>
						<div className="text-3xl group-hover:translate-x-2 transition-transform">
							→
						</div>
					</div>
				</button>

				<button
					onClick={() => navigate('/admin/subscriptions')}
					className="bg-white rounded-lg shadow-md p-8 text-left hover:shadow-lg transition group"
				>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-semibold mb-2 group-hover:text-green-600">
								💳 Subscriptions
							</h2>
							<p className="text-gray-600">
								Manage product subscriptions and vendor payments
							</p>
						</div>
						<div className="text-3xl group-hover:translate-x-2 transition-transform">
							→
						</div>
					</div>
				</button>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				<div className="bg-white rounded-lg shadow-md p-8">
					<h2 className="text-2xl font-semibold mb-2">👥 User Management</h2>
					<p className="text-gray-600">
						View and manage user accounts (Coming Soon)
					</p>
				</div>
				
				<div className="bg-white rounded-lg shadow-md p-8">
					<h2 className="text-2xl font-semibold mb-2">⚙️ Settings</h2>
					<p className="text-gray-600">
						System settings and configurations (Coming Soon)
					</p>
				</div>
			</div>
		</div>
	);
}

