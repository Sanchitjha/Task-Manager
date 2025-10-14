import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Admin() {
	const { user } = useAuth();
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState({ type: '', text: '' });
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingVideo, setEditingVideo] = useState(null);
	const [formData, setFormData] = useState({
		title: '',
		url: '',
		description: '',
		duration: '',
		coinsPerMinute: '',
		thumbnailUrl: ''
	});

	useEffect(() => {
		if (user && (user.role === 'admin' || user.role === 'subadmin')) {
			fetchVideos();
		}
	}, [user]);

	useEffect(() => {
		// Auto-dismiss messages after 3 seconds
		if (message.text) {
			const timer = setTimeout(() => {
				setMessage({ type: '', text: '' });
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [message]);

	const fetchVideos = async () => {
		try {
			const response = await api.get('/videos/admin');
			setVideos(response.data);
		} catch (error) {
			console.error('Failed to fetch videos:', error);
			setMessage({ type: 'error', text: 'Failed to load videos' });
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		try {
			setLoading(true);
			
			if (editingVideo) {
				// Update existing video
				await api.patch(`/videos/${editingVideo._id}`, formData);
				setMessage({ type: 'success', text: 'Video updated successfully!' });
			} else {
				// Add new video
				await api.post('/videos', formData);
				setMessage({ type: 'success', text: 'Video added successfully!' });
			}
			
			// Reset form and close modal
			setFormData({
				title: '',
				url: '',
				description: '',
				duration: '',
				coinsPerMinute: '',
				thumbnailUrl: ''
			});
			setShowAddModal(false);
			setEditingVideo(null);
			
			// Refresh videos list
			fetchVideos();
		} catch (error) {
			console.error('Failed to save video:', error);
			setMessage({ 
				type: 'error', 
				text: error.response?.data?.message || 'Failed to save video' 
			});
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (video) => {
		setEditingVideo(video);
		setFormData({
			title: video.title,
			url: video.url,
			description: video.description || '',
			duration: video.duration,
			coinsPerMinute: video.coinsPerMinute || 5,
			thumbnailUrl: video.thumbnailUrl || ''
		});
		setShowAddModal(true);
	};

	const handleDelete = async (videoId) => {
		if (!confirm('Are you sure you want to delete this video?')) return;
		
		try {
			setLoading(true);
			await api.delete(`/videos/${videoId}`);
			setMessage({ type: 'success', text: 'Video deleted successfully!' });
			fetchVideos();
		} catch (error) {
			console.error('Failed to delete video:', error);
			setMessage({ type: 'error', text: 'Failed to delete video' });
		} finally {
			setLoading(false);
		}
	};

	const handleToggleActive = async (video) => {
		try {
			await api.patch(`/videos/${video._id}`, { isActive: !video.isActive });
			setMessage({ 
				type: 'success', 
				text: `Video ${!video.isActive ? 'activated' : 'deactivated'} successfully!` 
			});
			fetchVideos();
		} catch (error) {
			console.error('Failed to toggle video status:', error);
			setMessage({ type: 'error', text: 'Failed to update video status' });
		}
	};

	const formatDuration = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

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
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Video Management</h1>
				<button
					onClick={() => {
						setEditingVideo(null);
						setFormData({
							title: '',
							url: '',
							description: '',
							duration: '',
							coinsPerMinute: '',
							thumbnailUrl: ''
						});
						setShowAddModal(true);
					}}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
				>
					+ Add Video
				</button>
			</div>

			{/* Status Messages */}
			{message.text && (
				<div className={`mb-4 p-4 rounded-lg ${
					message.type === 'error' ? 'bg-red-100 text-red-700' :
					message.type === 'success' ? 'bg-green-100 text-green-700' :
					'bg-blue-100 text-blue-700'
				}`}>
					{message.text}
				</div>
			)}

			{/* Videos List */}
			<div className="bg-white rounded-lg shadow-md">
				{loading ? (
					<div className="p-8 text-center">
						<div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading videos...</p>
					</div>
				) : videos.length === 0 ? (
					<div className="p-8 text-center text-gray-500">
						No videos yet. Click "Add Video" to get started!
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Video
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Duration
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Reward
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{videos.map(video => (
									<tr key={video._id} className="hover:bg-gray-50">
										<td className="px-6 py-4">
											<div className="flex items-center">
												<div>
													<div className="font-medium text-gray-900">{video.title}</div>
													<div className="text-sm text-gray-500 truncate max-w-xs">
														{video.url}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-900">
												{formatDuration(video.duration)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm">
												<div className="font-medium text-green-600">
													{video.coinsPerMinute || 5} coins/min
												</div>
												<div className="text-gray-500 text-xs">
													Total: {Math.ceil(video.duration / 60) * (video.coinsPerMinute || 5)} coins
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<button
												onClick={() => handleToggleActive(video)}
												className={`px-3 py-1 rounded-full text-xs font-medium ${
													video.isActive
														? 'bg-green-100 text-green-800 hover:bg-green-200'
														: 'bg-red-100 text-red-800 hover:bg-red-200'
												}`}
											>
												{video.isActive ? 'Active' : 'Inactive'}
											</button>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<button
												onClick={() => handleEdit(video)}
												className="text-blue-600 hover:text-blue-900 mr-3"
											>
												Edit
											</button>
											<button
												onClick={() => handleDelete(video._id)}
												className="text-red-600 hover:text-red-900"
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

			{/* Add/Edit Video Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<h3 className="text-xl font-bold mb-4">
							{editingVideo ? 'Edit Video' : 'Add New Video'}
						</h3>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">Title *</label>
								<input
									type="text"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">YouTube URL *</label>
								<input
									type="url"
									value={formData.url}
									onChange={(e) => setFormData({ ...formData, url: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="https://www.youtube.com/watch?v=..."
									required
								/>
								<p className="text-xs text-gray-500 mt-1">
									Enter full YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">Description</label>
								<textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows="3"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-2">Duration (seconds) *</label>
									<input
										type="number"
										value={formData.duration}
										onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										min="1"
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">Coins Per Minute *</label>
									<input
										type="number"
										value={formData.coinsPerMinute}
										onChange={(e) => setFormData({ ...formData, coinsPerMinute: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										min="1"
										required
									/>
									{formData.duration && formData.coinsPerMinute && (
										<p className="text-xs text-gray-500 mt-1">
											Total: {Math.ceil(formData.duration / 60) * formData.coinsPerMinute} coins for this video
										</p>
									)}
								</div>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="submit"
									disabled={loading}
									className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
								>
									{loading ? 'Saving...' : editingVideo ? 'Update Video' : 'Add Video'}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowAddModal(false);
										setEditingVideo(null);
										setFormData({
											title: '',
											url: '',
											description: '',
											duration: '',
											coinsPerMinute: '',
											thumbnailUrl: ''
										});
									}}
									className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
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
