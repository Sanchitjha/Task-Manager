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
	const [message, setMessage] = useState({ text: '', type: '' });
	const [formData, setFormData] = useState({ name: '', email: '', password: '' });
	const [activeTab, setActiveTab] = useState('list'); // list, details

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
			showMessage('Failed to load client details', 'error');
		}
	};

	const handleAddClient = async (e) => {
		e.preventDefault();
		try {
			await api.post('/admin/clients', formData);
			showMessage('Client added successfully', 'success');
			setShowAddModal(false);
			setFormData({ name: '', email: '', password: '' });
			fetchDashboardData();
		} catch (error) {
			showMessage(error.response?.data?.message || 'Failed to add client', 'error');
		}
	};

	const deleteClient = async (clientId) => {
		if (!confirm('Are you sure you want to delete this client?')) return;
		
		try {
			await api.delete(`/admin/clients/${clientId}`);
			showMessage('Client deleted successfully', 'success');
			fetchDashboardData();
			if (selectedClient === clientId) {
				setSelectedClient(null);
				setClientDetails(null);
				setActiveTab('list');
			}
		} catch (error) {
			showMessage(error.response?.data?.message || 'Failed to delete client', 'error');
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
						<p className="text-gray-600 mt-2">Manage your clients</p>
					</div>
					<button
						onClick={() => setShowAddModal(true)}
						className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
					>
						+ Add Client
					</button>
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
							<div className="mt-2 text-3xl font-bold text-gray-900">{stats.clients.total}</div>
						</div>
						<div className="bg-white rounded-lg shadow p-6">
							<div className="text-sm font-medium text-gray-500">Active Clients</div>
							<div className="mt-2 text-3xl font-bold text-green-600">{stats.clients.active}</div>
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
								My Clients ({clients.length})
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
									Client Details
								</button>
							)}
						</nav>
					</div>

					<div className="p-6">
						{/* Clients List Tab */}
						{activeTab === 'list' && (
							<div>
								{clients.length === 0 ? (
									<div className="text-center py-12 text-gray-500">
										<p className="mb-4">No clients added yet</p>
										<button
											onClick={() => setShowAddModal(true)}
											className="text-blue-600 hover:text-blue-800 font-medium"
										>
											Add your first client
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
												{clients.map((client) => (
													<tr key={client._id} className="hover:bg-gray-50">
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="font-medium text-gray-900">{client.name}</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-gray-600">
															{client.email}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															{client.stats.videosWatched}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-green-600">
															{client.stats.totalEarnings} coins
														</td>
														<td className="px-6 py-4 whitespace-nowrap font-semibold">
															{client.coinsBalance} coins
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm">
															<button
																onClick={() => fetchClientDetails(client._id)}
																className="text-blue-600 hover:text-blue-800 mr-3"
															>
																View Details
															</button>
															<button
																onClick={() => deleteClient(client._id)}
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

						{/* Client Details Tab */}
						{activeTab === 'details' && clientDetails && (
							<div>
								<button
									onClick={() => setActiveTab('list')}
									className="mb-4 text-blue-600 hover:text-blue-800"
								>
									← Back to list
								</button>
								
								<div className="bg-white border rounded-lg p-6 mb-6">
									<h3 className="text-xl font-bold mb-4">Client Information</h3>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500">Name</p>
											<p className="font-semibold">{clientDetails.client.name}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Email</p>
											<p className="font-semibold">{clientDetails.client.email}</p>
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
					</div>
				</div>
			</div>

			{/* Add Client Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
						<h2 className="text-2xl font-bold mb-4">Add New Client</h2>
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
									Add Client
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
