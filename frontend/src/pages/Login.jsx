import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		name: '',
		role: 'client'
	});
	const [isLogin, setIsLogin] = useState(true); // Changed to true so login form shows by default
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const { login, register } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			let result;
			if (isLogin) {
				console.log('Submitting login with:', formData.email); // Debug
				result = await login(formData.email, formData.password);
				console.log('Login result:', result); // Debug
			} else {
				result = await register(formData.name, formData.email, formData.password, formData.role);
			}

			if (result.success) {
				// Special handling for sub-admin pending approval
				if (result.pendingApproval) {
					setError(''); // Clear any previous errors
					alert('Sub-admin account created successfully! Your account is pending admin approval. You will be able to login once approved.');
					setIsLogin(true); // Switch to login view
					setFormData({ email: '', password: '', name: '', role: 'client' });
					return;
				}
				navigate('/');
			} else {
				setError(result.error || 'Authentication failed');
				console.error('Auth failed:', result); // Debug
			}
		} catch (err) {
			console.error('Unexpected error:', err); // Debug
			setError(err.message || 'An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center">
			<div className="max-w-md w-full mx-4">
				<div className="card">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-brand-800 mb-2">
							{isLogin ? 'Welcome Back' : 'Create Account'}
						</h1>
						<p className="text-gray-600">
							{isLogin ? 'Sign in to your account' : 'Join The MANAGER platform'}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{!isLogin && (
							<div>
								<label className="block text-sm font-medium mb-2">Full Name</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									required={!isLogin}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600"
								/>
							</div>
						)}

						<div>
							<label className="block text-sm font-medium mb-2">Email</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">Password</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600"
							/>
						</div>

						{!isLogin && (
							<div>
								<label className="block text-sm font-medium mb-2">Role</label>
								<select
									name="role"
									value={formData.role}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600"
								>
									<option value="client">Client</option>
									<option value="vendor">Vendor</option>
									<option value="subadmin">Sub-admin</option>
									<option value="admin">Admin</option>
								</select>
							</div>
						)}

						{error && (
							<div className="text-red-600 text-sm text-center">{error}</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="btn-primary w-full"
						>
							{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
						</button>
					</form>

					<div className="mt-6 text-center">
						<button
							type="button"
							onClick={() => setIsLogin(!isLogin)}
							className="text-brand-600 hover:underline"
						>
							{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
						</button>
					</div>

					<div className="mt-4 text-center">
						<Link to="/" className="text-gray-600 hover:text-brand-600">
							← Back to Home
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
