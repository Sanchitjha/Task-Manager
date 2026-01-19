import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function SubAdminDashboard() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState(null);
	const [clients, setClients] = useState([]);
	const [selectedClient, setSelectedClient] = useState(null);
	const [clientDetails, setClientDetails] = useState(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showCoinModal, setShowCoinModal] = useState(false);
	const [message, setMessage] = useState({ text: '', type: '' });
	const [formData, setFormData] = useState({ name: '', email: '', password: '' });
	const [coinFormData, setCoinFormData] = useState({ clientEmail: '', amount: '', description: '' });
	const [activeTab, setActiveTab] = useState('list'); // list, details, wallet

	useEffect(() => {
		if (user?.role === 'subadmin') {
			fetchDashboardData();
		}
	}, [user]);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			const [statsRes, clientsRes] = await Promise.all([
				api.get('/admin/dashboard/subadmin-stats'),
				api.get('/admin/clients')
			]);
			setStats(statsRes.data);
			setClients(clientsRes.data);
		} catch (error) {
			showMessage('Failed to load dashboard data', 'error');
		} finally {
			setLoading(false);
		}
	};

	const fetchClientDetails = async (clientId) => {
		try {
			const res = await api.get(`/admin/clients/${clientId}`);
			setClientDetails(res.data);
			setSelectedClient(clientId);
			setActiveTab('details');
		} catch (error) {
			showMessage('Failed to load user details', 'error');
		}
	};

	const handleAddClient = async (e) => {
		e.preventDefault();
		try {
			await api.post('/admin/clients', formData);
			showMessage('User added successfully', 'success');
			setShowAddModal(false);
			setFormData({ name: '', email: '', password: '' });
			fetchDashboardData();
		} catch (error) {
			showMessage(error.response?.data?.message || 'Failed to add user', 'error');
		}
	};

	const handleCoinDistribution = async (e) => {
		e.preventDefault();
		try {
			const response = await api.post('/admin/subadmin/distribute-coins', coinFormData);
			showMessage(response.data.message, 'success');
			setShowCoinModal(false);
			setCoinFormData({ clientEmail: '', amount: '', description: '' });
			fetchDashboardData(); // Refresh data
		} catch (error) {
			showMessage(error.response?.data?.error || 'Failed to distribute coins', 'error');
		}
	};

	const openCoinModal = () => {
		setShowCoinModal(true);
	};

	const deleteClient = async (clientId) => {
		if (!confirm('Are you sure you want to delete this user?')) return;
		
		try {
			await api.delete(`/admin/clients/${clientId}`);
			showMessage('User deleted successfully', 'success');
			fetchDashboardData();
			if (selectedClient === clientId) {
				setSelectedClient(null);
				setClientDetails(null);
				setActiveTab('list');
			}
		} catch (error) {
			showMessage(error.response?.data?.message || 'Failed to delete user', 'error');
		}
	};

	const showMessage = (text, type) => {
		setMessage({ text, type });
		setTimeout(() => setMessage({ text: '', type: '' }), 3000);
	};

	if (user?.role !== 'subadmin') {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
					<p className="text-gray-600 mt-2">Only sub-admins can access this page</p>
				</div>
			</div>
		);
	}

	if (!user.isApproved) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center max-w-md bg-white rounded-lg shadow-lg p-8">
					<div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Approval</h1>
					<p className="text-gray-600">
						Your sub-admin account is awaiting approval from an administrator. 
						You'll be able to access the dashboard once your account is approved.
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Sub-Admin Dashboard</h1>
						<p className="text-gray-600 mt-2">Manage your clients and distribute coins</p>
						<div className="mt-3 bg-blue-50 inline-flex items-center px-3 py-1 rounded-full text-sm">
							<svg className="w-4 h-4 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
							</svg>
							<span className="text-blue-700 font-medium">Your Balance: {user?.coinBalance || 0} coins</span>
						</div>
					</div>
					<div className="flex gap-3">
						<button
							onClick={openCoinModal}
							className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
						>
							🪙 Distribute Coins
						</button>
						<button
							onClick={() => setShowAddModal(true)}
							className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
						>
							+ Add User
						</button>
					</div>
				</div>

				{/* Message */}
				{message.text && (
					<div className={`mb-6 p-4 rounded-lg ${
						message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
					}`}>
						{message.text}
					</div>
				)}

				{/* Statistics Cards */}
				{stats && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<div className="bg-white rounded-lg shadow p-6">
							<div className="text-sm font-medium text-gray-500">Total Clients</div>
							<div className="mt-2 text-3xl font-bold text-gray-900">{stats.users.total}</div>
						</div>
						<div className="bg-white rounded-lg shadow p-6">
							<div className="text-sm font-medium text-gray-500">Active Clients</div>
							<div className="mt-2 text-3xl font-bold text-green-600">{stats.users.active}</div>
							<div className="text-xs text-gray-500 mt-1">Clients with coins balance</div>
						</div>
					</div>
				)}

				{/* Tabs */}
				<div className="bg-white rounded-lg shadow">
					<div className="border-b border-gray-200">
						<nav className="flex -mb-px">
							<button
								onClick={() => setActiveTab('list')}
								className={`py-4 px-6 text-sm font-medium border-b-2 ${
									activeTab === 'list'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								📋 My Clients ({users.length})
							</button>
							<button
								onClick={() => setActiveTab('wallet')}
								className={`py-4 px-6 text-sm font-medium border-b-2 ${
									activeTab === 'wallet'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								💰 Wallet & Rewards
							</button>
							{selectedClient && (
								<button
									onClick={() => setActiveTab('details')}
									className={`py-4 px-6 text-sm font-medium border-b-2 ${
										activeTab === 'details'
											? 'border-blue-500 text-blue-600'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									}`}
								>
									👤 User Details
								</button>
							)}
						</nav>
					</div>

					<div className="p-6">
						{/* Clients List Tab */}
						{activeTab === 'list' && (
							<div>
								{users.length === 0 ? (
									<div className="text-center py-12 text-gray-500">
										<p className="mb-4">No clients added yet</p>
										<button
											onClick={() => setShowAddModal(true)}
											className="text-blue-600 hover:text-blue-800 font-medium"
										>
											Add your first user
										</button>
									</div>
								) : (
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Videos Watched</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Balance</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{users.map((user) => (
													<tr key={user._id} className="hover:bg-gray-50">
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="font-medium text-gray-900">{user.name}</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-gray-600">
															{user.email}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															{user.stats.videosWatched}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-green-600">
															{user.stats.totalEarnings} coins
														</td>
														<td className="px-6 py-4 whitespace-nowrap font-semibold">
															{user.coinsBalance} coins
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm">
															<button
																onClick={() => fetchClientDetails(user._id)}
																className="text-blue-600 hover:text-blue-800 mr-3"
															>
																View Details
															</button>
															<button
																onClick={() => deleteClient(user._id)}
																className="text-red-600 hover:text-red-800"
															>
																Delete
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}

						{/* User Details Tab */}
						{activeTab === 'details' && clientDetails && (
							<div>
								<button
									onClick={() => setActiveTab('list')}
									className="mb-4 text-blue-600 hover:text-blue-800"
								>
									← Back to list
								</button>
								
								<div className="bg-white border rounded-lg p-6 mb-6">
									<h3 className="text-xl font-bold mb-4">User Information</h3>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500">Name</p>
											<p className="font-semibold">{clientDetails.user.name}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Email</p>
											<p className="font-semibold">{clientDetails.user.email}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Videos Watched</p>
											<p className="font-semibold">{clientDetails.stats.videosWatched}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Coins Balance</p>
											<p className="font-semibold text-green-600">{clientDetails.stats.coinsBalance} coins</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Wallet Balance</p>
											<p className="font-semibold text-blue-600">₹{clientDetails.stats.walletBalance.toFixed(2)}</p>
										</div>
									</div>
								</div>

								{/* Recent Transactions */}
								<h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
								{clientDetails.recentTransactions.length === 0 ? (
									<div className="text-center py-8 text-gray-500">
										<p>No transactions yet</p>
									</div>
								) : (
									<div className="overflow-x-auto mb-6">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{clientDetails.recentTransactions.map((txn) => (
													<tr key={txn._id}>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
															{new Date(txn.createdAt).toLocaleDateString()}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
																txn.type === 'earn'
																	? 'bg-green-100 text-green-800'
																	: 'bg-blue-100 text-blue-800'
															}`}>
																{txn.type}
															</span>
														</td>
														<td className="px-6 py-4 text-sm text-gray-600">
															{txn.description}
														</td>
														<td className={`px-6 py-4 whitespace-nowrap font-semibold ${
															txn.type === 'earn' ? 'text-green-600' : 'text-blue-600'
														}`}>
															{txn.type === 'earn' ? `${txn.amount} coins` : `₹${(txn.amount / 100).toFixed(2)}`}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}

								{/* Recent Videos */}
								<h3 className="text-xl font-bold mb-4">Recently Watched Videos</h3>
								{clientDetails.recentVideos.length === 0 ? (
									<div className="text-center py-8 text-gray-500">
										<p>No videos watched yet</p>
									</div>
								) : (
									<div className="grid grid-cols-1 gap-4">
										{clientDetails.recentVideos.map((watch) => (
											<div key={watch._id} className="border rounded-lg p-4">
												<div className="flex justify-between items-start">
													<div>
														<h4 className="font-semibold">{watch.videoId?.title || 'Unknown Video'}</h4>
														<p className="text-sm text-gray-500 mt-1">
															Last watched: {new Date(watch.lastWatchedAt).toLocaleDateString()}
														</p>
													</div>
													<div className="text-right">
														<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
															watch.completed
																? 'bg-green-100 text-green-800'
																: 'bg-orange-100 text-orange-800'
														}`}>
															{watch.completed ? 'Completed' : `${watch.watchPercentage}%`}
														</span>
														{watch.completed && (
															<p className="text-sm text-green-600 mt-1">
																+{watch.videoId?.coinsReward || 0} coins
															</p>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}

						{/* Wallet Tab */}
						{activeTab === 'wallet' && (
							<div>
								<div className="mb-6">
									<h3 className="text-xl font-bold text-gray-900 mb-2">Wallet & Rewards System</h3>
									<p className="text-gray-600">Manage your coin balance and distribute rewards to your clients</p>
								</div>

								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
									{/* Earn Coins Card */}
									<div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
										<div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mb-4">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
											</svg>
										</div>
										<h4 className="text-lg font-semibold text-gray-900 mb-2">Earn Coins</h4>
										<p className="text-gray-600 text-sm mb-4">
											Receive coins from admin for distribution to your clients
										</p>
										<div className="bg-white rounded px-3 py-2 text-center">
											<span className="text-2xl font-bold text-blue-600">{user?.coinBalance || 0}</span>
											<div className="text-xs text-gray-500">Available Coins</div>
										</div>
									</div>

									{/* Track Wallet Card */}
									<div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-6 border border-green-200">
										<div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
											</svg>
										</div>
										<h4 className="text-lg font-semibold text-gray-900 mb-2">Track Wallet</h4>
										<p className="text-gray-600 text-sm mb-4">
											Monitor your transactions and distributions
										</p>
										<div className="bg-white rounded px-3 py-2 text-center">
											<span className="text-2xl font-bold text-green-600">{users.length}</span>
											<div className="text-xs text-gray-500">Clients Managed</div>
										</div>
									</div>

									{/* Redeem Rewards Card */}
									<div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-6 border border-purple-200">
										<div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-lg mb-4">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
											</svg>
										</div>
										<h4 className="text-lg font-semibold text-gray-900 mb-2">Redeem Rewards</h4>
										<p className="text-gray-600 text-sm mb-4">
											Use coins to reward user performance
										</p>
										<div className="bg-white rounded px-3 py-2 text-center">
											<span className="text-2xl font-bold text-purple-600">{stats?.clients?.total || 0}</span>
											<div className="text-xs text-gray-500">Total Distributions</div>
										</div>
									</div>
								</div>

								<div className="bg-white border rounded-lg p-6">
									<h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
									<div className="flex gap-4">
										<button
											onClick={openCoinModal}
											className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
											</svg>
											Distribute Coins to User
										</button>
										<button
											onClick={() => setActiveTab('list')}
											className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
											View All Clients
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Coin Distribution Modal */}
			{showCoinModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h3 className="text-lg font-bold mb-4">Distribute Coins to User</h3>
						<form onSubmit={handleCoinDistribution}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Select User
								</label>
								<select
									value={coinFormData.clientEmail}
									onChange={(e) => setCoinFormData({...coinFormData, clientEmail: e.target.value})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
									required
								>
									<option value="">Select a user...</option>
									{users.map((user) => (
										<option key={user._id} value={user.email}>
											{user.name} ({user.email}) - Balance: {user.coinsBalance} coins
										</option>
									))}
								</select>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Amount (Coins)
								</label>
								<input
									type="number"
									value={coinFormData.amount}
									onChange={(e) => setCoinFormData({...coinFormData, amount: e.target.value})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
									min="1"
									max={user?.coinBalance || 0}
									required
								/>
								<p className="text-xs text-gray-500 mt-1">
									Your available balance: {user?.coinBalance || 0} coins
								</p>
							</div>
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Description (Optional)
								</label>
								<textarea
									value={coinFormData.description}
									onChange={(e) => setCoinFormData({...coinFormData, description: e.target.value})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
									rows="3"
									placeholder="Reason for coin distribution..."
								/>
							</div>
							<div className="flex gap-3">
								<button
									type="submit"
									className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
								>
									Distribute Coins
								</button>
								<button
									type="button"
									onClick={() => {
										setShowCoinModal(false);
										setCoinFormData({ clientEmail: '', amount: '', description: '' });
									}}
									className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Add User Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
						<h2 className="text-2xl font-bold mb-4">Add New User</h2>
						<form onSubmit={handleAddClient}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Name
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Email
								</label>
								<input
									type="email"
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
							</div>
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Password
								</label>
								<input
									type="password"
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
									minLength={6}
								/>
							</div>
							<div className="flex gap-3">
								<button
									type="submit"
									className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
								>
									Add User
								</button>
								<button
									type="button"
									onClick={() => {
										setShowAddModal(false);
										setFormData({ name: '', email: '', password: '' });
									}}
									className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
