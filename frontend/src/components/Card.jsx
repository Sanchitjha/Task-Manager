export const Card = ({ children, className = '', hover = true, gradient = false, glass = false }) => {
	const baseClass = glass 
		? 'card-glass' 
		: gradient 
			? 'card-gradient' 
			: 'card';
	
	const hoverClass = hover ? 'hover-lift' : '';
	
	return (
		<div className={`${baseClass} ${hoverClass} ${className}`}>
			{children}
		</div>
	);
};

export const StatCard = ({ icon, title, value, gradient = 'from-brand-500 to-brand-600', trend }) => {
	return (
		<Card gradient className="relative overflow-hidden">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-gray-600 font-semibold mb-1">{title}</p>
					<p className="text-3xl font-bold text-gray-800">{value}</p>
					{trend && (
						<p className={`text-sm mt-2 font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
							{trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
						</p>
					)}
				</div>
				<div className={`text-5xl opacity-20`}>{icon}</div>
			</div>
			<div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>
		</Card>
	);
};

export const FeatureCard = ({ icon, title, description, gradient = 'from-brand-400 to-brand-600' }) => {
	return (
		<Card className="text-center group cursor-pointer">
			<div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block group-hover:animate-bounce">
				{icon}
			</div>
			<h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
			<p className="text-gray-600">{description}</p>
			<div className={`mt-4 h-1 bg-gradient-to-r ${gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
		</Card>
	);
};
