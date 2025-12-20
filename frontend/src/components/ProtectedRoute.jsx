import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, clientOnly = false }) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-xl text-gray-600">Loading...</div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!user) {
		return <Navigate to="/login" replace />;
	}

	// Check admin/subadmin access if required
	if (adminOnly && user.role !== 'admin' && user.role !== 'subadmin') {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="card max-w-md text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
					<p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
					<a href="/" className="text-brand-600 hover:underline">
						Go back to Home
					</a>
				</div>
			</div>
		);
	}

	// Check client-only access if required
	if (clientOnly && user.role !== 'client') {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="card max-w-md text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
					<p className="text-gray-600 mb-4">This feature is only available for clients.</p>
					<a href="/" className="text-brand-600 hover:underline">
						Go back to Home
					</a>
				</div>
			</div>
		);
	}

	return children;
}
