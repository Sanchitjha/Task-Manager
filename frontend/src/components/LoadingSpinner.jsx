export const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
	const sizes = {
		sm: 'w-6 h-6',
		md: 'w-12 h-12',
		lg: 'w-16 h-16',
		xl: 'w-24 h-24'
	};

	const spinner = (
		<div className={`${sizes[size]} border-4 border-gray-200 border-t-brand-600 rounded-full loading-spinner`}></div>
	);

	if (fullScreen) {
		return (
			<div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
				<div className="text-center">
					{spinner}
					<p className="mt-4 text-gray-600 font-semibold">Loading...</p>
				</div>
			</div>
		);
	}

	return spinner;
};

export const SkeletonCard = () => {
	return (
		<div className="card animate-pulse">
			<div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
			<div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
			<div className="h-4 bg-gray-200 rounded w-5/6"></div>
		</div>
	);
};
