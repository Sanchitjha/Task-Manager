export const PrimaryButton = ({ children, loading, ...props }) => {
	return (
		<button
			{...props}
			disabled={loading || props.disabled}
			className={`btn-primary ${props.className || ''} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
		>
			{loading && (
				<div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full loading-spinner"></div>
			)}
			{children}
		</button>
	);
};

export const SecondaryButton = ({ children, loading, ...props }) => {
	return (
		<button
			{...props}
			disabled={loading || props.disabled}
			className={`btn-secondary ${props.className || ''} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
		>
			{loading && (
				<div className="w-5 h-5 border-3 border-brand-600 border-t-transparent rounded-full loading-spinner"></div>
			)}
			{children}
		</button>
	);
};

export const DangerButton = ({ children, loading, ...props }) => {
	return (
		<button
			{...props}
			disabled={loading || props.disabled}
			className={`btn-danger ${props.className || ''} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
		>
			{loading && (
				<div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full loading-spinner"></div>
			)}
			{children}
		</button>
	);
};

export const SuccessButton = ({ children, loading, ...props }) => {
	return (
		<button
			{...props}
			disabled={loading || props.disabled}
			className={`btn-success ${props.className || ''} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
		>
			{loading && (
				<div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full loading-spinner"></div>
			)}
			{children}
		</button>
	);
};
