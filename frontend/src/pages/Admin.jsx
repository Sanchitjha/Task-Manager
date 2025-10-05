import { useState, useEffect } from 'react';

export default function Admin() {
	const [users, setUsers] = useState([]);
	const [videos, setVideos] = useState([]);
	const [settings, setSettings] = useState({});

	useEffect(() => {
		// Mock data
		setUsers([
			{ id: 1, name: 'John Doe', email: 'john@example.com', role: 'client', walletBalance: 100 },
			{ id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'vendor', walletBalance: 50 },
		]);
		setVideos([
			{ id: 1, title: 'Sample Video', url: 'https://youtube.com/watch?v=123', isActive: true },
		]);
		setSettings({ coinPerMinute: 10, maxPerVideo: 50 });
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
			<header className="bg-white/70 backdrop-blur sticky top-0 z-10 border-b">
				<div className="max-w-6xl mx-auto flex items-center justify-between py-3 px-4">
					<div className="font-bold text-brand-800">Admin Panel</div>
					<nav className="flex gap-6 text-sm">
						<a href="/" className="hover:text-brand-600">Home</a>
					</nav>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
				
				<div className="grid md:grid-cols-3 gap-8 mb-8">
					<div className="card text-center">
						<div className="text-2xl font-bold text-brand-600">{users.length}</div>
						<div className="text-gray-600">Total Users</div>
					</div>
					<div className="card text-center">
						<div className="text-2xl font-bold text-brand-600">{videos.length}</div>
						<div className="text-gray-600">Active Videos</div>
					</div>
					<div className="card text-center">
						<div className="text-2xl font-bold text-brand-600">{settings.coinPerMinute}</div>
						<div className="text-gray-600">Coins per Minute</div>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					<div className="card">
						<h2 className="text-xl font-semibold mb-4">Users</h2>
						<div className="space-y-3">
							{users.map(user => (
								<div key={user.id} className="flex justify-between items-center py-2 border-b border-gray-100">
									<div>
										<div className="font-medium">{user.name}</div>
										<div className="text-sm text-gray-600">{user.email} • {user.role}</div>
									</div>
									<div className="text-sm">
										<div>{user.walletBalance} coins</div>
										<button className="text-brand-600 hover:underline">Manage</button>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="card">
						<h2 className="text-xl font-semibold mb-4">Videos</h2>
						<div className="space-y-3">
							{videos.map(video => (
								<div key={video.id} className="flex justify-between items-center py-2 border-b border-gray-100">
									<div>
										<div className="font-medium">{video.title}</div>
										<div className="text-sm text-gray-600">{video.url}</div>
									</div>
									<div className="text-sm">
										<span className={`px-2 py-1 rounded ${video.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
											{video.isActive ? 'Active' : 'Inactive'}
										</span>
									</div>
								</div>
							))}
						</div>
						<button className="btn-primary w-full mt-4">Add Video</button>
					</div>
				</div>

				<div className="card mt-8">
					<h2 className="text-xl font-semibold mb-4">Settings</h2>
					<div className="grid md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-2">Coins per Minute</label>
							<input type="number" value={settings.coinPerMinute} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">Max Coins per Video</label>
							<input type="number" value={settings.maxPerVideo} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
						</div>
					</div>
					<button className="btn-primary mt-4">Save Settings</button>
				</div>
			</main>
		</div>
	);
}

