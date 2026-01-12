export const Badge = ({ children, variant = 'primary', className = '' }) => {
	const variants = {
		primary: 'badge-primary',
		success: 'badge-success',
		warning: 'badge-warning',
		danger: 'badge-danger',
		accent: 'badge-accent',
	};

	return (
		<span className={`${variants[variant]} ${className}`}>
			{children}
		</span>
	);
};

export const StatusBadge = ({ status }) => {
	const statusConfig = {
		active: { variant: 'success', icon: '✓', text: 'Active' },
		pending: { variant: 'warning', icon: '⏳', text: 'Pending' },
		expired: { variant: 'danger', icon: '✗', text: 'Expired' },
		cancelled: { variant: 'danger', icon: '⊘', text: 'Cancelled' },
		completed: { variant: 'success', icon: '✓', text: 'Completed' },
		paid: { variant: 'success', icon: '💰', text: 'Paid' },
		failed: { variant: 'danger', icon: '✗', text: 'Failed' },
	};

	const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

	return (
		<Badge variant={config.variant}>
			<span>{config.icon}</span>
			<span>{config.text}</span>
		</Badge>
	);
};
