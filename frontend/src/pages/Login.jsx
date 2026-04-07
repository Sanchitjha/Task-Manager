import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TheManagerLogo from '../components/TheManagerLogo';
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';

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
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
			<div className="w-full max-w-sm">

				{/* Logo */}
				<div className="text-center mb-8">
					<Link to="/" className="inline-flex justify-center mb-5">
						<TheManagerLogo width={56} height={56} className="drop-shadow" />
					</Link>
					<h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
					<p className="text-gray-500 mt-1 text-sm">Sign in to The MANAGER</p>
				</div>

				{/* Card */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7">

					{error && (
						<div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700">
							<AlertCircle size={16} className="shrink-0 mt-0.5" strokeWidth={2} />
							<span className="text-sm font-medium">{error}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Email */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								Email address
							</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								placeholder="you@example.com"
								required
								autoComplete="email"
								className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
							/>
						</div>

						{/* Password */}
						<div>
							<div className="flex items-center justify-between mb-1.5">
								<label className="block text-sm font-medium text-gray-700">Password</label>
								<Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
									Forgot password?
								</Link>
							</div>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									placeholder="Enter your password"
									required
									autoComplete="current-password"
									className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
								</button>
							</div>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="w-full py-2.5 px-4 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
						>
							{loading ? (
								<>
									<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
									</svg>
									Signing in…
								</>
							) : 'Sign In'}
						</button>
					</form>

					<p className="mt-5 text-center text-sm text-gray-500">
						Don't have an account?{' '}
						<Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
							Create one
						</Link>
					</p>
				</div>

				{/* Back link */}
				<div className="mt-6 text-center">
					<Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
						<ArrowLeft size={12} />
						Back to home
					</Link>
				</div>
			</div>
		</div>
	);
}
