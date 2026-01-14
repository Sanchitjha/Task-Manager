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
			if (isLogin) {
				console.log('Submitting login with:', formData.email);
				const result = await login(formData.email, formData.password);
				console.log('Login result:', result);
				
				if (result.success) {
					navigate('/');
				} else {
					setError(result.error || 'Login failed');
				}
			} else {
				// Registration flow
				if (!showOTPStep) {
					// Step 1: Send OTP
					if (formData.role === 'client' || formData.role === 'vendor') {
						const response = await api.post('/auth/send-email-otp', { email: formData.email });
						if (response.data.success) {
							setOtpSent(true);
							setShowOTPStep(true);
							setError('');
						} else {
							setError(response.data.message || 'Failed to send OTP');
						}
					} else {
						// Direct registration for sub-admin/admin
						const endpoint = formData.role === 'subadmin' ? '/auth/register-subadmin' : '/auth/register-admin';
						const response = await api.post(endpoint, {
							name: formData.name,
							email: formData.email,
							password: formData.password,
							role: formData.role
						});
						
						if (formData.role === 'subadmin') {
							alert('Sub-admin account created successfully! Your account is pending admin approval.');
							setIsLogin(true);
							setFormData({ email: '', password: '', name: '', role: 'client', otp: '' });
						} else {
							navigate('/');
						}
					}
				} else {
					// Step 2: Verify OTP and complete registration
					const response = await api.post('/auth/verify-email-otp', {
						email: formData.email,
						otpCode: formData.otp,
						name: formData.name,
						password: formData.password
					});
					
					if (response.data.success && response.data.token) {
						localStorage.setItem('token', response.data.token);
						navigate('/');
					} else {
						setError(response.data.message || 'OTP verification failed');
					}
				}
			}
		} catch (err) {
			console.error('Error:', err);
			setError(err.response?.data?.message || err.message || 'An error occurred');
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
	
	const resetRegistration = () => {
		setShowOTPStep(false);
		setOtpSent(false);
		setFormData({ ...formData, otp: '' });
		setError('');
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

							{showOTPStep && (
								<div>
									<label className="block text-sm font-medium mb-2">
										Email Verification Code <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										name="otp"
										value={formData.otp}
										onChange={handleChange}
										required
										maxLength="6"
										placeholder="Enter 6-digit OTP"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600 text-center tracking-widest"
									/>
									<p className="text-sm text-gray-600 mt-1">
										Check your email for the verification code. Check console logs in development mode.
									</p>
									<button
										type="button"
										onClick={resetRegistration}
										className="text-sm text-blue-600 hover:text-blue-800 mt-2"
									>
										← Change email or resend
									</button>
								</div>
							)}

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
								{loading ? 
									(showOTPStep ? 'Verifying...' : 'Sending OTP...') : 
									(showOTPStep ? 'Verify OTP & Create Account' : 'Send Verification Code')
								}
							</button>
						</form>
					)}

					<div className="mt-6 text-center">
						<button
							type="button"
							onClick={() => {
								setIsLogin(!isLogin);
								setError('');
								setShowOTPStep(false);
								setOtpSent(false);
								setFormData({ email: '', password: '', name: '', role: 'client', otp: '' });
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
