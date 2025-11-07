import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Earn() {
	const { user, setUser } = useAuth();
	const [videos, setVideos] = useState([]);
	const [selectedVideo, setSelectedVideo] = useState(null);
	const [watchTime, setWatchTime] = useState(0);
	const [videoDuration, setVideoDuration] = useState(0);
	const [coinsBalance, setCoinsBalance] = useState(0);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState({ type: '', text: '' });
	const [isPlaying, setIsPlaying] = useState(false);
	const [highestWatchedTime, setHighestWatchedTime] = useState(0);
	
	const playerRef = useRef(null);
	const intervalRef = useRef(null);
	const iframeRef = useRef(null);

	useEffect(() => {
		fetchVideos();
		fetchBalance();
	}, []);

	useEffect(() => {
		// Auto-dismiss messages after 5 seconds
		if (message.text) {
			const timer = setTimeout(() => {
				setMessage({ type: '', text: '' });
			}, 5000);
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
		if (video.progress?.completed) {
			setMessage({ type: 'info', text: 'You have already completed this video!' });
			return;
		}

		// If clicking the same video that's already selected, don't restart
		if (selectedVideo && selectedVideo._id === video._id) {
			setMessage({ type: 'info', text: 'This video is already loaded. Click play to continue watching!' });
			return;
		}

		// Stop any existing timer and player
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		
		if (playerRef.current && playerRef.current.destroy) {
			try {
				playerRef.current.destroy();
			} catch (e) {
				console.error('Error destroying player:', e);
			}
			playerRef.current = null;
		}

		// Reset states
		setIsPlaying(false);
		setSelectedVideo(video);
		const startTime = video.progress?.watchTime || 0;
		setWatchTime(startTime);
		setHighestWatchedTime(startTime);
		setVideoDuration(video.duration);

		setMessage({ 
			type: 'info', 
			text: 'Video loaded! Click play on the video to start earning. Do not skip forward!' 
		});
	};

	const stopWatching = async () => {
		// Stop tracking
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setIsPlaying(false);
		
		// Save current progress if there's a selected video
		if (selectedVideo && highestWatchedTime > 0 && !selectedVideo.progress?.completed) {
			const timeToSave = Math.floor(highestWatchedTime); // Save highest watched time, not current time
			
			try {
				// Submit watch time to backend
				const response = await api.post(`/videos/${selectedVideo._id}/watch`, {
					watchTime: timeToSave
				});
				
				setMessage({ 
					type: 'success', 
					text: `✅ Progress saved! You can resume from ${formatTime(timeToSave)} next time. Remember: no skipping allowed!` 
				});
				
				// Refresh videos to update progress
				fetchVideos();
			} catch (error) {
				console.error('Failed to save progress:', error);
				setMessage({ 
					type: 'error', 
					text: 'Failed to save progress. Please try again.' 
				});
			}
		}
		
		// Destroy the player
		if (playerRef.current && playerRef.current.destroy) {
			try {
				playerRef.current.destroy();
			} catch (e) {
				console.error('Error destroying player:', e);
			}
			playerRef.current = null;
		}
		
		// Clear selected video
		setSelectedVideo(null);
		setWatchTime(0);
		setHighestWatchedTime(0);
		setVideoDuration(0);
	};

	const submitWatchTime = async (video, time) => {
		try {
			const response = await api.post(`/videos/${video._id}/watch`, {
				watchTime: time
			});

			if (response.data.coinsAwarded > 0) {
				setMessage({ 
					type: 'success', 
					text: `🎉 Congratulations! You completed the video and earned ${response.data.coinsAwarded} coins! Coins automatically added to your balance.` 
				});
				setCoinsBalance(response.data.totalCoins);
				
				// Update user context
				setUser({ ...user, coinsBalance: response.data.totalCoins });
				
				// Refresh videos to update progress
				fetchVideos();
				
				// Clear selected video
				setTimeout(() => {
					setSelectedVideo(null);
					setWatchTime(0);
					setHighestWatchedTime(0);
					setIsPlaying(false);
				}, 2000);
			}

			// Stop the timer if video is completed
			if (response.data.watchRecord?.completed && intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
				setIsPlaying(false);
			}
		} catch (error) {
			console.error('Failed to submit watch time:', error);
			setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to track watch progress' });
		}
	};

	// Setup YouTube player tracking
	useEffect(() => {
		if (!selectedVideo || selectedVideo.progress?.completed) {
			return;
		}

		// Cleanup function
		return () => {
			if (playerRef.current && playerRef.current.destroy) {
				try {
					playerRef.current.destroy();
				} catch (e) {
					console.error('Error destroying player:', e);
				}
				playerRef.current = null;
			}
		};
	}, [selectedVideo]);

	// Separate effect for loading YouTube API and initializing player
	useEffect(() => {
		if (!selectedVideo || selectedVideo.progress?.completed) return;
		
		// Load YouTube IFrame API if not already loaded
		if (!window.YT) {
			const tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}

		// Initialize player after a short delay to ensure iframe is ready
		const initPlayer = () => {
			// Wait for iframe to be rendered
			setTimeout(() => {
				if (window.YT && window.YT.Player && iframeRef.current && !playerRef.current) {
					try {
						playerRef.current = new window.YT.Player(iframeRef.current, {
							events: {
								onReady: onPlayerReady,
								onStateChange: onPlayerStateChange
							}
						});
					} catch (error) {
						console.error('Error creating YouTube player:', error);
					}
				}
			}, 500);
		};

		if (window.YT && window.YT.Player) {
			initPlayer();
		} else {
			window.onYouTubeIframeAPIReady = initPlayer;
		}
	}, [selectedVideo?._id]); // Only re-run when video ID changes

	const onPlayerReady = (event) => {
		// Player is ready
		const duration = event.target.getDuration();
		if (duration > 0) {
			setVideoDuration(duration);
		}
		
		// Start from previous position if available
		const startTime = selectedVideo.progress?.watchTime || 0;
		
		// IMPORTANT: Set highest watched time to saved position
		// This prevents users from skipping beyond where they left off
		setWatchTime(startTime);
		setHighestWatchedTime(startTime); // Critical for anti-cheat
		
		if (startTime > 0) {
			// Seek to the saved position
			setTimeout(() => {
				event.target.seekTo(startTime, true);
			}, 1000); // Small delay to ensure player is fully ready
			
			setMessage({ 
				type: 'info', 
				text: `▶️ Resuming from ${formatTime(startTime)}. Click play to continue! You must watch from here - no skipping forward allowed.` 
			});
		} else {
			setMessage({ 
				type: 'info', 
				text: '🎬 Video loaded! Click play to start earning coins. You must watch the complete video - no skipping allowed!' 
			});
		}
		
		console.log('Player ready, duration:', duration, 'starting at:', startTime, 'highest allowed:', startTime);
	};

	const onPlayerStateChange = (event) => {
		const player = event.target;
		
		// YT.PlayerState.PLAYING = 1
		// YT.PlayerState.PAUSED = 2
		// YT.PlayerState.ENDED = 0
		
		if (event.data === 1) { // Playing
			console.log('Video started playing, current time:', player.getCurrentTime());
			setIsPlaying(true);
			
			// Short delay to let player stabilize, then start tracking
			setTimeout(() => {
				startTracking(player);
			}, 1000);
		} else if (event.data === 2 || event.data === 0) { // Paused or Ended
			setIsPlaying(false);
			stopTracking();
			
			// If video ended, submit final watch time
			if (event.data === 0) {
				const currentTime = player.getCurrentTime();
				if (currentTime >= videoDuration * 0.99) {
					// Video fully watched
					submitWatchTime(selectedVideo, Math.ceil(videoDuration));
				}
			}
		}
	};

	const startTracking = (player) => {
		// Clear any existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// Track every 2 seconds for smooth experience
		intervalRef.current = setInterval(() => {
			if (player && player.getCurrentTime) {
				try {
					const currentTime = player.getCurrentTime();
					const playerDuration = player.getDuration();
					
					// Update video duration if we get it from player
					if (playerDuration > 0 && playerDuration !== videoDuration) {
						setVideoDuration(playerDuration);
					}
					
					// Update watch time for UI
					setWatchTime(currentTime);
					
					// Always update highest watched time when moving forward
					// Allow natural video progression without interference
					if (currentTime > highestWatchedTime) {
						setHighestWatchedTime(currentTime);
					}
					
					// Check if video is complete
					const actualDuration = playerDuration > 0 ? playerDuration : videoDuration;
					if (currentTime >= actualDuration * 0.98 && actualDuration > 0) {
						stopTracking();
						submitWatchTime(selectedVideo, Math.ceil(actualDuration));
					}
				} catch (error) {
					console.error('Error tracking video:', error);
				}
			}
		}, 2000); // Track every 2 seconds for smooth experience
	};

	const stopTracking = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	// Cleanup interval on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			if (playerRef.current && playerRef.current.destroy) {
				playerRef.current.destroy();
			}
		};
	}, []);

	// Helper function to extract YouTube video ID
	const getYouTubeVideoId = (url) => {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return (match && match[2].length === 11) ? match[2] : null;
	};

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const getProgressPercentage = () => {
		if (videoDuration === 0) return 0;
		return Math.min((watchTime / videoDuration) * 100, 100);
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
			<h1 className="text-3xl font-bold mb-6">Earn Coins by Watching Videos</h1>

			{/* Status Messages */}
			{message.text && (
				<div className={`mb-4 p-4 rounded-lg ${
					message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
					message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
					'bg-blue-100 text-blue-700 border border-blue-300'
				}`}>
					<div className="flex items-center">
						<span className="text-xl mr-2">
							{message.type === 'error' ? '⚠️' : message.type === 'success' ? '✅' : 'ℹ️'}
						</span>
						{message.text}
					</div>
				</div>
			)}

			<div className="grid md:grid-cols-3 gap-6">
				{/* Video Player Section */}
				<div className="md:col-span-2">
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-xl font-semibold mb-4">Video Player</h2>
						
						{selectedVideo ? (
							<div>
								<div className="mb-4">
									<h3 className="font-medium text-lg">{selectedVideo.title}</h3>
									{selectedVideo.description && (
										<p className="text-sm text-gray-600 mt-1">{selectedVideo.description}</p>
									)}
									<div className="mt-2 flex items-center gap-3">
										<span className="text-sm font-medium text-green-600">
											Reward: {Math.ceil(selectedVideo.duration / 60) * (selectedVideo.coinsPerInterval || 5)} coins
										</span>
										<span className="text-xs text-gray-500">
											({selectedVideo.coinsPerInterval || 5} per minute)
										</span>
										<span className="text-sm text-gray-500">
											Duration: {formatTime(selectedVideo.duration)}
										</span>
									</div>
								</div>

								{/* Video Player */}
								<div className="aspect-video bg-gray-900 rounded-lg mb-4 relative">
									<iframe
										ref={iframeRef}
										src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.url)}?enablejsapi=1&rel=0&modestbranding=1`}
										className="w-full h-full rounded-lg"
										title={selectedVideo.title}
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
										id="youtube-player"
									/>
								</div>

								{/* Watch Progress */}
								<div className="mb-4">
									<div className="flex justify-between text-sm text-gray-600 mb-1">
										<span>Watch Progress</span>
										<span>{Math.floor(getProgressPercentage())}%</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-3">
										<div
											className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
											style={{ width: `${getProgressPercentage()}%` }}
										/>
									</div>
									<div className="flex justify-between text-xs text-gray-500 mt-1">
										<span>{formatTime(Math.floor(watchTime))}</span>
										<span>{formatTime(Math.floor(videoDuration))}</span>
									</div>
									<div className="text-center mt-2">
										<span className="text-sm font-medium text-blue-600">
											Coins Earned: {Math.floor(watchTime / 60) * (selectedVideo.coinsPerInterval || 5)} / {Math.ceil(selectedVideo.duration / 60) * (selectedVideo.coinsPerInterval || 5)}
										</span>
									</div>
								</div>

								{/* Controls */}
								<div className="flex gap-3">
									<button
										onClick={stopWatching}
										className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center"
									>
										<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v6a2 2 0 002 2h3m8 0h3a2 2 0 002-2V9a2 2 0 00-2-2h-3m-6 4h6" />
										</svg>
										Save Progress & Stop
									</button>
									{isPlaying && (
										<span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md flex items-center">
											<span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
											Watching... (Earning coins)
										</span>
									)}
								</div>

								{/* Important Instructions */}
								<div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
									<h4 className="font-semibold text-green-800 mb-2">✅ Video Watching - Normal Mode:</h4>
									<ul className="text-sm text-green-700 space-y-1">
										<li>• <strong>Watch naturally!</strong> All YouTube controls work normally</li>
										<li>• <strong>No restrictions:</strong> Pause, rewind, fast-forward as needed</li>
										<li>• <strong>"Save Progress & Stop"</strong> saves your exact position to resume later</li>
										<li>• <strong>Resume feature:</strong> Start from where you left off</li>
										<li>• <strong>Earn coins:</strong> Complete the video to get your reward</li>
										<li>• Enjoy watching! No interference from the system</li>
									</ul>
								</div>
							</div>
						) : (
							<div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
								<svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
								<p className="text-lg font-medium">No video selected</p>
								<p className="mt-1">Select a video from the list below to start earning coins</p>
							</div>
						)}

						{/* Available Videos List */}
						<div className="mt-6">
							<h3 className="font-semibold text-lg mb-3">Available Videos</h3>
							<div className="space-y-3 max-h-96 overflow-y-auto">
								{videos.length === 0 ? (
									<p className="text-gray-500 text-center py-8">No videos available yet. Check back later!</p>
								) : (
									videos.map(video => (
										<div
											key={video._id}
											className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
												selectedVideo?._id === video._id
													? 'border-blue-500 bg-blue-50 shadow-md'
													: video.progress?.completed
													? 'border-green-300 bg-green-50 opacity-75'
													: 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow'
											}`}
											onClick={() => startWatching(video)}
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<h4 className="font-medium text-gray-900">{video.title}</h4>
													<div className="text-sm text-gray-600 mt-1 flex items-center gap-3">
														<span>⏱️ {formatTime(video.duration)}</span>
														<span className="text-green-600 font-semibold">
															🪙 {Math.ceil(video.duration / 60) * (video.coinsPerInterval || 5)} coins
														</span>
														<span className="text-xs text-gray-500">
															({video.coinsPerInterval || 5} per minute)
														</span>
													</div>
													{video.progress && video.progress.watchTime > 0 && (
														<div className="mt-2">
															<div className="flex justify-between text-xs text-gray-500 mb-1">
																<span>Progress: {Math.round((video.progress.watchTime / video.duration) * 100)}%</span>
																<span>{formatTime(video.progress.watchTime)} / {formatTime(video.duration)}</span>
															</div>
															<div className="w-full bg-gray-200 rounded-full h-1.5">
																<div
																	className="bg-blue-500 h-1.5 rounded-full"
																	style={{ width: `${Math.min((video.progress.watchTime / video.duration) * 100, 100)}%` }}
																/>
															</div>
															<div className="text-xs text-blue-600 mt-1 font-medium">
																📍 Will resume from {formatTime(video.progress.watchTime)}
															</div>
														</div>
													)}
												</div>
												{video.progress?.completed && (
													<div className="ml-3 flex flex-col items-center">
														<span className="text-green-500 text-2xl">✓</span>
														<span className="text-xs text-green-600 font-medium">Completed</span>
													</div>
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
						<h2 className="text-xl font-semibold mb-4">Your Earnings</h2>
						
						<div className="space-y-6">
							<div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
								<label className="block text-sm text-gray-600 mb-1">Total Coins Balance</label>
								<div className="text-4xl font-bold text-blue-600">
									{coinsBalance}
								</div>
								<div className="text-xs text-gray-500 mt-1">
									= ₹{(coinsBalance / 100).toFixed(2)}
								</div>
							</div>

							{selectedVideo && (
								<>
									<div className="p-4 bg-gray-50 rounded-lg">
										<label className="block text-sm text-gray-600 mb-1">Current Video Progress</label>
										<div className="text-2xl font-bold text-gray-800">
											{formatTime(Math.floor(watchTime))} / {formatTime(Math.floor(videoDuration))}
										</div>
										<div className="text-sm text-gray-500 mt-1">
											{Math.floor(getProgressPercentage())}% completed
										</div>
										<div className="text-sm text-blue-600 mt-1 font-medium">
											Coins Earned So Far: {Math.floor(watchTime / 60) * (selectedVideo.coinsPerInterval || 5)}
										</div>
									</div>

									<div className="p-4 bg-green-50 rounded-lg border border-green-200">
										<label className="block text-sm text-green-700 mb-1">Coins on Completion</label>
										<div className="text-3xl font-bold text-green-600">
											+{Math.ceil(selectedVideo.duration / 60) * (selectedVideo.coinsPerInterval || 5)}
										</div>
										<div className="text-xs text-green-600 mt-1">
											{Math.ceil(selectedVideo.duration / 60)} minutes × {selectedVideo.coinsPerInterval || 5} coins per minute
										</div>
									</div>
								</>
							)}

							<div className="pt-4 border-t">
								<h3 className="font-semibold text-sm mb-2">How it Works:</h3>
								<ul className="text-xs text-gray-600 space-y-2">
									<li className="flex items-start">
										<span className="mr-2">1️⃣</span>
										<span>Select a video from the list</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">2️⃣</span>
										<span>Watch it completely without skipping</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">3️⃣</span>
										<span>Use "Save Progress & Stop" to resume later</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">4️⃣</span>
										<span>Coins automatically credited at 100%</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">5️⃣</span>
										<span>Redeem coins in your wallet</span>
									</li>
								</ul>
							</div>

							<div className="pt-4 border-t">
								<p className="text-xs text-gray-500 italic">
									💡 Tip: Use "Save Progress & Stop" to save your position and resume exactly where you left off. Anti-cheat prevents any forward skipping!
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
