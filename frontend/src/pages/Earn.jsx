import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Earn() {
	const { user, setUser } = useAuth();
	const [videos, setVideos] = useState([]);
	const [selectedVideo, setSelectedVideo] = useState(null);
	const [watchTime, setWatchTime] = useState(0);
	const [coinsBalance, setCoinsBalance] = useState(0);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState({ type: '', text: '' });
	const intervalRef = useRef(null);

	useEffect(() => {
		fetchVideos();
		fetchBalance();
	}, []);

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
			const response = await api.get('/videos');
			setVideos(response.data);
		} catch (error) {
			console.error('Failed to fetch videos:', error);
			setMessage({ type: 'error', text: 'Failed to load videos' });
		} finally {
			setLoading(false);
		}
	};

	const fetchBalance = async () => {
		try {
			const response = await api.get('/wallet/balance');
			setCoinsBalance(response.data.coinsBalance || 0);
		} catch (error) {
			console.error('Failed to fetch balance:', error);
		}
	};

	const startWatching = (video) => {
		// Stop any existing timer
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		setSelectedVideo(video);
		setWatchTime(video.progress?.watchTime || 0);

		// Start tracking watch time
		intervalRef.current = setInterval(() => {
			setWatchTime(prev => {
				const newTime = prev + 1;
				// Auto-submit when reaching video duration
				if (newTime >= video.duration) {
					submitWatchTime(video, video.duration);
					return video.duration;
				}
				return newTime;
			});
		}, 1000);
	};

	const stopWatching = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		if (selectedVideo && watchTime > 0) {
			submitWatchTime(selectedVideo, watchTime);
		}
	};

	const submitWatchTime = async (video, time) => {
		try {
			const response = await api.post(`/videos/${video._id}/watch`, {
				watchTime: time
			});

			if (response.data.coinsAwarded > 0) {
				setMessage({ 
					type: 'success', 
					text: `🎉 Congratulations! You earned ${response.data.coinsAwarded} coins!` 
				});
				setCoinsBalance(response.data.totalCoins);
				
				// Update user context
				setUser({ ...user, coinsBalance: response.data.totalCoins });
				
				// Refresh videos to update progress
				fetchVideos();
			}

			// Stop the timer if video is completed
			if (response.data.watchRecord?.completed) {
				stopWatching();
			}
		} catch (error) {
			console.error('Failed to submit watch time:', error);
			setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to track watch progress' });
		}
	};

	const handleClaimCoins = () => {
		if (selectedVideo && watchTime > 0) {
			submitWatchTime(selectedVideo, watchTime);
		}
	};

	// Cleanup interval on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	// Helper function to extract YouTube video ID
	const getYouTubeEmbedUrl = (url) => {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		const videoId = (match && match[2].length === 11) ? match[2] : null;
		return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
	};

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
					<p className="mt-4 text-gray-600">Loading videos...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-6">Earn Coins</h1>

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

			<div className="grid md:grid-cols-3 gap-6">
				{/* Video Player Section */}
				<div className="md:col-span-2">
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-xl font-semibold mb-4">Watch Videos</h2>
						
						{selectedVideo ? (
							<div>
								<h3 className="font-medium mb-2">{selectedVideo.title}</h3>
								{selectedVideo.description && (
									<p className="text-sm text-gray-600 mb-4">{selectedVideo.description}</p>
								)}
								<div className="aspect-video bg-gray-900 rounded-lg mb-4">
									<iframe
										src={getYouTubeEmbedUrl(selectedVideo.url)}
										className="w-full h-full rounded-lg"
										title={selectedVideo.title}
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
									/>
								</div>
								<div className="flex gap-2 mb-4">
									<button
										onClick={stopWatching}
										className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
									>
										Stop & Save Progress
									</button>
									{selectedVideo.progress?.completed && (
										<span className="px-4 py-2 bg-green-100 text-green-700 rounded-md">
											✓ Completed
										</span>
									)}
								</div>
							</div>
						) : (
							<div className="text-center py-12 text-gray-500">
								<p>Select a video from the list to start earning coins</p>
							</div>
						)}

						{/* Available Videos List */}
						<div className="mt-6">
							<h3 className="font-semibold mb-3">Available Videos</h3>
							<div className="space-y-3 max-h-96 overflow-y-auto">
								{videos.length === 0 ? (
									<p className="text-gray-500 text-center py-8">No videos available yet</p>
								) : (
									videos.map(video => (
										<div
											key={video._id}
											className={`p-4 border rounded-lg cursor-pointer transition ${
												selectedVideo?._id === video._id
													? 'border-blue-500 bg-blue-50'
													: 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
											} ${video.progress?.completed ? 'opacity-60' : ''}`}
											onClick={() => startWatching(video)}
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<h4 className="font-medium">{video.title}</h4>
													<div className="text-sm text-gray-600 mt-1">
														<span>Duration: {formatTime(video.duration)}</span>
														<span className="mx-2">•</span>
														<span className="text-green-600 font-medium">
															Reward: {video.coinsReward} coins
														</span>
													</div>
													{video.progress && video.progress.watchTime > 0 && (
														<div className="mt-2">
															<div className="text-xs text-gray-500 mb-1">
																Progress: {Math.round((video.progress.watchTime / video.duration) * 100)}%
															</div>
															<div className="w-full bg-gray-200 rounded-full h-2">
																<div
																	className="bg-blue-500 h-2 rounded-full"
																	style={{ width: `${Math.min((video.progress.watchTime / video.duration) * 100, 100)}%` }}
																/>
															</div>
														</div>
													)}
												</div>
												{video.progress?.completed && (
													<span className="ml-2 text-green-500 text-xl">✓</span>
												)}
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Earnings Sidebar */}
				<div className="md:col-span-1">
					<div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
						<h2 className="text-xl font-semibold mb-4">Earnings</h2>
						
						<div className="space-y-4">
							<div>
								<label className="block text-sm text-gray-600">Watch Time:</label>
								<div className="text-2xl font-bold text-gray-800">
									{formatTime(watchTime)}
								</div>
							</div>

							<div>
								<label className="block text-sm text-gray-600">Earned Coins:</label>
								<div className="text-3xl font-bold text-blue-600">
									{coinsBalance}
								</div>
							</div>

							{selectedVideo && !selectedVideo.progress?.completed && (
								<button
									onClick={handleClaimCoins}
									disabled={watchTime === 0}
									className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
								>
									Claim Coins
								</button>
							)}

							<div className="pt-4 border-t">
								<p className="text-sm text-gray-600">
									💡 Watch videos to completion (90%+) to earn coins!
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
