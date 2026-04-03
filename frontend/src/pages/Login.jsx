import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TheManagerLogo from '../components/TheManagerLogo';

export default function Login() {
	const [formData, setFormData] = useState({ email: '', password: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const navigate = useNavigate();
	const { login, user } = useAuth();

	useEffect(() => {
		if (user) navigate('/dashboard', { replace: true });
	}, [user, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const result = await login(formData.email, formData.password);
			if (result.success) {
				navigate('/dashboard');
			} else {
				setError(result.error || 'Login failed. Please check your credentials.');
			}
		} catch (err) {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-10">
			<div className="w-full max-w-md">

				{/* Logo + Title */}
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<TheManagerLogo width={72} height={72} className="drop-shadow-lg" />
					</div>
					<h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
						Welcome Back
					</h1>
					<p className="text-gray-500 mt-1 text-sm">Sign in to The MANAGER</p>
				</div>

				{/* Card */}
				<div className="bg-white rounded-2xl shadow-xl p-8">

					{error && (
						<div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2">
							<span className="text-lg leading-none">✗</span>
							<span>{error}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Email */}
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								placeholder="Enter your email"
								required
								autoComplete="email"
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800 text-base"
							/>
						</div>

						{/* Password */}
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									placeholder="Enter your password"
									required
									autoComplete="current-password"
									className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800 text-base pr-12"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
								>
									{showPassword ? '🙈' : '👁️'}
								</button>
							</div>
						</div>

						{/* Forgot Password */}
						<div className="text-right">
							<Link to="/forgot-password" className="text-sm text-blue-600 font-semibold hover:underline">
								Forgot Password?
							</Link>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-base hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-60 shadow-lg hover:shadow-xl active:scale-95"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
									</svg>
									Signing In...
								</span>
							) : 'Sign In →'}
						</button>
					</form>

					{/* Register Link */}
					<div className="mt-6 text-center space-y-2">
						<p className="text-sm text-gray-500">
							Don't have an account?{' '}
							<Link to="/register" className="text-green-600 font-semibold hover:underline">Create Account</Link>
						</p>
						<Link to="/" className="text-xs text-gray-400 hover:text-gray-600 block">← Back to Home</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
