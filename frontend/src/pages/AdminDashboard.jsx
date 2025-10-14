import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function AdminDashboard() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState(null);
	const [pendingSubadmins, setPendingSubadmins] = useState([]);
	const [allSubadmins, setAllSubadmins] = useState([]);
	const [selectedSubadmin, setSelectedSubadmin] = useState(null);
	const [subadminDetails, setSubadminDetails] = useState(null);
	const [message, setMessage] = useState({ text: '', type: '' });
	const [activeTab, setActiveTab] = useState('pending'); // pending, approved, details

	useEffect(() => {
		if (user?.role === 'admin') {
			fetchDashboardData();
		}
	}, [user]);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			const [statsRes, pendingRes, allRes] = await Promise.all([
				api.get('/admin/dashboard/stats'),
				api.get('/admin/subadmins/pending'),
				api.get('/admin/subadmins')
			]);
			setStats(statsRes.data);
			setPendingSubadmins(pendingRes.data);
			setAllSubadmins(allRes.data);
		} catch (error) {
			showMessage('Failed to load dashboard data', 'error');
		} finally {
			setLoading(false);
		}
	};

	const fetchSubadminDetails = async (subadminId) => {
		try {
			const res = await api.get(`/admin/subadmins/${subadminId}`);
			setSubadminDetails(res.data);
			setSelectedSubadmin(subadminId);
			setActiveTab('details');
		} catch (error) {
			showMessage('Failed to load sub-admin details', 'error');
		}
	};

	const approveSubadmin = async (subadminId) => {
		try {
			await api.post(`/admin/subadmins/${subadminId}/approve`);
			showMessage('Sub-admin approved successfully', 'success');
			fetchDashboardData();
		} catch (error) {
			showMessage(error.response?.data?.message || 'Failed to approve sub-admin', 'error');
		}
	};

	const revokeSubadmin = async (subadminId) => {
		if (!confirm('Are you sure you want to revoke this sub-admin\'s approval?')) return;
		
		try {
			await api.post(`/admin/subadmins/${subadminId}/revoke`);
			showMessage('Sub-admin approval revoked', 'success');
			fetchDashboardData();
		} catch (error) {
			showMessage(error.response?.data?.message || 'Failed to revoke approval', 'error');
		}
	};

	const deleteSubadmin = async (subadminId) => {
		if (!confirm('Are you sure you want to delete this sub-admin? This action cannot be undone.')) return;
		
		try {
			await api.delete(`/admin/subadmins/${subadminId}`);
			showMessage('Sub-admin deleted successfully', 'success');
			fetchDashboardData();
			if (selectedSubadmin === subadminId) {
				setSelectedSubadmin(null);
				setSubadminDetails(null);
				setActiveTab('approved');
			}
		} catch (error) {
			showMessage(error.response?.data?.message || 'Failed to delete sub-admin', 'error');
		}
	};

	const showMessage = (text, type) => {
		setMessage({ text, type });
		setTimeout(() => setMessage({ text: '', type: '' }), 3000);
	};

	if (user?.role !== 'admin') {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
					<p className="text-gray-600 mt-2">Only admins can access this page</p>
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
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
					<p className="text-gray-600 mt-2">Manage sub-admins and monitor system activity</p>
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
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<div className="bg-white rounded-lg shadow p-6">
							<div className="text-sm font-medium text-gray-500">Total Sub-Admins</div>
							<div className="mt-2 text-3xl font-bold text-gray-900">{stats.subadmins.total}</div>
						</div>
						<div className="bg-white rounded-lg shadow p-6">
							<div className="text-sm font-medium text-gray-500">Pending Approval</div>
							<div className="mt-2 text-3xl font-bold text-orange-600">{stats.subadmins.pending}</div>
						</div>
						<div className="bg-white rounded-lg shadow p-6">
							<div className="text-sm font-medium text-gray-500">Total Clients</div>
							<div className="mt-2 text-3xl font-bold text-gray-900">{stats.clients.total}</div>
						</div>
						<div className="bg-white rounded-lg shadow p-6">
							<div className="text-sm font-medium text-gray-500">Total Coins Earned</div>
							<div className="mt-2 text-3xl font-bold text-green-600">{stats.earnings.totalCoinsEarned}</div>
						</div>
					</div>
				)}

				{/* Tabs */}
				<div className="bg-white rounded-lg shadow">
					<div className="border-b border-gray-200">
						<nav className="flex -mb-px">
							<button
								onClick={() => setActiveTab('pending')}
								className={`py-4 px-6 text-sm font-medium border-b-2 ${
									activeTab === 'pending'
										? 'border-orange-500 text-orange-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								Pending Approvals ({pendingSubadmins.length})
							</button>
							<button
								onClick={() => setActiveTab('approved')}
								className={`py-4 px-6 text-sm font-medium border-b-2 ${
									activeTab === 'approved'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								All Sub-Admins ({allSubadmins.length})
							</button>
							{selectedSubadmin && (
								<button
									onClick={() => setActiveTab('details')}
									className={`py-4 px-6 text-sm font-medium border-b-2 ${
										activeTab === 'details'
											? 'border-blue-500 text-blue-600'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									}`}
								>
									Sub-Admin Details
								</button>
							)}
						</nav>
					</div>

					<div className="p-6">
						{/* Pending Approvals Tab */}
						{activeTab === 'pending' && (
							<div>
								{pendingSubadmins.length === 0 ? (
									<div className="text-center py-12 text-gray-500">
										<p>No pending sub-admin approvals</p>
									</div>
								) : (
									<div className="space-y-4">
										{pendingSubadmins.map((subadmin) => (
											<div key={subadmin._id} className="border rounded-lg p-4 bg-orange-50">
												<div className="flex justify-between items-start">
													<div>
														<h3 className="font-semibold text-lg">{subadmin.name}</h3>
														<p className="text-gray-600">{subadmin.email}</p>
														<p className="text-sm text-gray-500 mt-1">
															Registered: {new Date(subadmin.createdAt).toLocaleDateString()}
														</p>
													</div>
													<div className="flex gap-2">
														<button
															onClick={() => approveSubadmin(subadmin._id)}
															className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
														>
															Approve
														</button>
														<button
															onClick={() => deleteSubadmin(subadmin._id)}
															className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
														>
															Reject
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}

						{/* All Sub-Admins Tab */}
						{activeTab === 'approved' && (
							<div>
								{allSubadmins.length === 0 ? (
									<div className="text-center py-12 text-gray-500">
										<p>No sub-admins found</p>
									</div>
								) : (
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clients</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{allSubadmins.map((subadmin) => (
													<tr key={subadmin._id} className="hover:bg-gray-50">
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="font-medium text-gray-900">{subadmin.name}</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-gray-600">
															{subadmin.email}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
																subadmin.isApproved
																	? 'bg-green-100 text-green-800'
																	: 'bg-orange-100 text-orange-800'
															}`}>
																{subadmin.isApproved ? 'Approved' : 'Pending'}
															</span>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-gray-600">
															{subadmin.clientCount}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{subadmin.approvedBy?.name || '-'}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm">
															<button
																onClick={() => fetchSubadminDetails(subadmin._id)}
																className="text-blue-600 hover:text-blue-800 mr-3"
															>
																View Details
															</button>
															{subadmin.isApproved ? (
																<button
																	onClick={() => revokeSubadmin(subadmin._id)}
																	className="text-orange-600 hover:text-orange-800 mr-3"
																>
																	Revoke
																</button>
															) : (
																<button
																	onClick={() => approveSubadmin(subadmin._id)}
																	className="text-green-600 hover:text-green-800 mr-3"
																>
																	Approve
																</button>
															)}
															<button
																onClick={() => deleteSubadmin(subadmin._id)}
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

						{/* Sub-Admin Details Tab */}
						{activeTab === 'details' && subadminDetails && (
							<div>
								<button
									onClick={() => setActiveTab('approved')}
									className="mb-4 text-blue-600 hover:text-blue-800"
								>
									← Back to list
								</button>
								
								<div className="bg-white border rounded-lg p-6 mb-6">
									<h3 className="text-xl font-bold mb-4">Sub-Admin Information</h3>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500">Name</p>
											<p className="font-semibold">{subadminDetails.subadmin.name}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Email</p>
											<p className="font-semibold">{subadminDetails.subadmin.email}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Status</p>
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
												subadminDetails.subadmin.isApproved
													? 'bg-green-100 text-green-800'
													: 'bg-orange-100 text-orange-800'
											}`}>
												{subadminDetails.subadmin.isApproved ? 'Approved' : 'Pending'}
											</span>
										</div>
										<div>
											<p className="text-sm text-gray-500">Total Clients</p>
											<p className="font-semibold">{subadminDetails.totalClients}</p>
										</div>
									</div>
								</div>

								<h3 className="text-xl font-bold mb-4">Clients Managed</h3>
								{subadminDetails.clients.length === 0 ? (
									<div className="text-center py-8 text-gray-500">
										<p>No clients added yet</p>
									</div>
								) : (
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Videos Watched</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coins Earned</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redeemed</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Balance</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{subadminDetails.clients.map((client) => (
													<tr key={client._id} className="hover:bg-gray-50">
														<td className="px-6 py-4 whitespace-nowrap font-medium">{client.name}</td>
														<td className="px-6 py-4 whitespace-nowrap text-gray-600">{client.email}</td>
														<td className="px-6 py-4 whitespace-nowrap">{client.stats.videosWatched}</td>
														<td className="px-6 py-4 whitespace-nowrap text-green-600">{client.stats.totalCoinsEarned}</td>
														<td className="px-6 py-4 whitespace-nowrap text-blue-600">₹{(client.stats.totalRedeemed / 100).toFixed(2)}</td>
														<td className="px-6 py-4 whitespace-nowrap font-semibold">{client.coinsBalance} coins</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
