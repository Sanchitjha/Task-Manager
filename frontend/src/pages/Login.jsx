import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		name: '',
		phone: '',
		role: 'client'
	});
	const [isLogin, setIsLogin] = useState(true); // Changed to true so login form shows by default
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

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
		<div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4 relative overflow-hidden">
			{/* Animated background circles */}
			<div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-brand-300 to-accent-300 rounded-full blur-3xl opacity-20 animate-float"></div>
			<div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent-300 to-brand-300 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
			
			<div className="max-w-md w-full mx-4 relative z-10 animate-scale-in">
				<div className="card-glass shadow-2xl">
					<div className="text-center mb-8">
						<div className="text-5xl mb-4 animate-bounce-slow">⚡</div>
						<h1 className="text-4xl font-extrabold mb-2">
							<span className="text-gradient-hero">
								{isLogin ? 'Welcome Back' : 'Create Account'}
							</span>
						</h1>
						<p className="text-gray-600 text-lg">
							{isLogin ? 'Sign in to your account' : 'Join The MANAGER platform'}
						</p>
					</div>

					{/* Login Form */}
					{isLogin && (
						<form onSubmit={handleSubmit} className="space-y-6">
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

							{error && (
								<div className="text-red-600 text-sm text-center">{error}</div>
							)}

							<button
								type="submit"
								disabled={loading}
								className="btn-primary w-full"
							>
								{loading ? 'Signing In...' : 'Sign In'}
							</button>
						</form>
					)}

					{/* Registration Form */}
					{!isLogin && (
						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label className="block text-sm font-medium mb-2">
									Email Address <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="your.email@example.com"
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Full Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Password <span className="text-red-500">*</span>
								</label>
								<input
									type="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Phone Number (Optional)
								</label>
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									placeholder="+1234567890 or 1234567890"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600"
								/>
							</div>

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

							{error && (
								<div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
									{error}
								</div>
							)}

							{success && (
								<div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-md text-sm">
									{success}
								</div>
							)}

							<button
								type="submit"
								disabled={loading}
								className="btn-primary w-full"
							>
								{loading ? 'Creating Account...' : 'Create Account'}
							</button>
						</form>
					)}

					<div className="mt-6 text-center">
						<button
							type="button"
							onClick={() => {
								setIsLogin(!isLogin);
								setError('');
								setSuccess('');
								setFormData({ email: '', password: '', name: '', phone: '', role: 'client' });
							}}
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
