import { useState, useEffect } from 'react';
import { videosAPI } from '../lib/api';

export default function Earn() {
	const [videos, setVideos] = useState([]);
	const [watchTime, setWatchTime] = useState(0);
	const [earnedCoins, setEarnedCoins] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchVideos = async () => {
			try {
				const response = await videosAPI.getVideos();
				setVideos(response.data);
			} catch (error) {
				console.error('Failed to fetch videos:', error);
				// Fallback to mock data
				setVideos([
					{
						id: 1,
						title: "Sample Video 1",
						url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
						duration: 180,
						coinsPerMinute: 10,
						maxCoins: 50
					}
				]);
			} finally {
				setLoading(false);
			}
		};

		fetchVideos();
	}, []);

	const handleWatchTime = (seconds) => {
		setWatchTime(seconds);
		const minutes = seconds / 60;
		const coins = Math.min(Math.floor(minutes * 10), 50);
		setEarnedCoins(coins);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
			<header className="bg-white/70 backdrop-blur sticky top-0 z-10 border-b">
				<div className="max-w-6xl mx-auto flex items-center justify-between py-3 px-4">
					<div className="font-bold text-brand-800">The MANAGER</div>
					<nav className="flex gap-6 text-sm">
						<a href="/" className="hover:text-brand-600">Home</a>
						<a href="/wallet" className="hover:text-brand-600">Wallet</a>
					</nav>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Earn Coins</h1>
				
				<div className="grid md:grid-cols-2 gap-8">
					<div className="card">
						<h2 className="text-xl font-semibold mb-4">Watch Videos</h2>
						{videos.map(video => (
							<div key={video.id} className="mb-6">
								<h3 className="font-medium mb-2">{video.title}</h3>
								<div className="aspect-video bg-gray-100 rounded-lg mb-4">
									<iframe
										src={video.url}
										className="w-full h-full rounded-lg"
										title={video.title}
									/>
								</div>
								<div className="text-sm text-gray-600">
									<p>Rate: {video.coinsPerMinute} coins/minute</p>
									<p>Max: {video.maxCoins} coins</p>
								</div>
							</div>
						))}
					</div>

					<div className="card">
						<h2 className="text-xl font-semibold mb-4">Earnings</h2>
						<div className="space-y-4">
							<div className="flex justify-between">
								<span>Watch Time:</span>
								<span>{Math.floor(watchTime / 60)}:{(watchTime % 60).toString().padStart(2, '0')}</span>
							</div>
							<div className="flex justify-between">
								<span>Earned Coins:</span>
								<span className="font-semibold text-brand-600">{earnedCoins}</span>
							</div>
							<button className="btn-primary w-full">Claim Coins</button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
