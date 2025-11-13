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
		otp: '',
		role: 'client'
	});
	const [isLogin, setIsLogin] = useState(true); // Changed to true so login form shows by default
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [currentStep, setCurrentStep] = useState('register'); // 'register', 'otp', 'complete'
	const [otpSent, setOtpSent] = useState(false);
	const [emailAddress, setEmailAddress] = useState('');

	const { login, register } = useAuth();
	const navigate = useNavigate();

	// Send Email OTP for verification
	const sendEmailOTP = async (e) => {
		e.preventDefault();
		if (!formData.email.trim()) {
			setError('Email address is required');
			return;
		}

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const response = await api.post('/auth/send-email-otp', {
				email: formData.email
			});

			if (response.data.success) {
				let successMessage = 'OTP sent successfully! Check your email inbox.';
				
				// Show OTP in development mode
				if (response.data.developmentOTP) {
					successMessage = `Development Mode: Your OTP is ${response.data.developmentOTP}`;
					
					// Auto-fill OTP in development for easier testing
					setFormData({ ...formData, otp: response.data.developmentOTP });
				}
				
				setSuccess(successMessage);
				setOtpSent(true);
				setCurrentStep('otp');
				setEmailAddress(response.data.email);
			}
		} catch (error) {
			setError(error.response?.data?.message || 'Failed to send OTP');
		} finally {
			setLoading(false);
		}
	};

	// Verify Email OTP and complete registration
	const verifyEmailOTPAndRegister = async (e) => {
		e.preventDefault();
		if (!formData.otp || !formData.name || !formData.password) {
			setError('OTP, name, and password are required');
			return;
		}

		setLoading(true);
		setError('');

		try {
			const response = await api.post('/auth/verify-email-otp-register', {
				email: emailAddress,
				otp: formData.otp,
				name: formData.name,
				password: formData.password,
				phone: formData.phone || null, // Optional phone number
				role: formData.role
			});

			if (response.data.success) {
				setSuccess('Registration completed successfully! Email verified. You can now login.');
				setTimeout(() => {
					setIsLogin(true);
					setCurrentStep('register');
					setOtpSent(false);
					setFormData({ email: '', password: '', name: '', phone: '', otp: '', role: 'client' });
					setError('');
					setSuccess('');
				}, 2000);
			}
		} catch (error) {
			setError(error.response?.data?.message || 'Failed to verify OTP');
		} finally {
			setLoading(false);
		}
	};

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
							{isLogin ? 'Welcome Back' : 
							 currentStep === 'otp' ? 'Verify Email' : 'Create Account'}
						</h1>
						<p className="text-gray-600">
							{isLogin ? 'Sign in to your account' : 
							 currentStep === 'otp' ? 'Enter the OTP sent to your email' : 'Join The MANAGER platform'}
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

					{/* Registration Step 1: Email Address */}
					{!isLogin && currentStep === 'register' && (
						<form onSubmit={sendEmailOTP} className="space-y-6">
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
								<p className="text-xs text-gray-500 mt-1">
									We'll send a verification OTP to your email address
								</p>
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
								{loading ? 'Sending OTP...' : 'Send Email OTP'}
							</button>
						</form>
					)}

					{/* Registration Step 2: Email OTP Verification */}
					{!isLogin && currentStep === 'otp' && (
						<form onSubmit={verifyEmailOTPAndRegister} className="space-y-6">
							{/* Development OTP Display */}
							{formData.otp && (
								<div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
									<div className="flex items-center">
										<svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
										</svg>
										<div>
											<p className="text-yellow-800 font-medium">Development Mode</p>
											<p className="text-yellow-700 text-sm">OTP auto-filled: <strong>{formData.otp}</strong></p>
										</div>
									</div>
								</div>
							)}

							<div>
								<label className="block text-sm font-medium mb-2">
									Enter Email OTP <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="otp"
									value={formData.otp}
									onChange={handleChange}
									placeholder="Enter 6-digit OTP"
									maxLength={6}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600 text-center text-xl tracking-wider"
								/>
								<p className="text-xs text-gray-500 mt-1">
									OTP sent to: <strong>{emailAddress}</strong>
								</p>
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
								<p className="text-xs text-gray-500 mt-1">
									Phone number can be added to your profile (no verification required)
								</p>
							</div>
									Email <span className="text-red-500">*</span>
								</label>
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

							<div className="flex space-x-3">
								<button
									type="button"
									onClick={() => {
										setCurrentStep('register');
										setOtpSent(false);
										setError('');
										setSuccess('');
									}}
									className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
								>
									← Back
								</button>
								<button
									type="submit"
									disabled={loading}
									className="flex-1 btn-primary"
								>
									{loading ? 'Verifying...' : 'Complete Registration'}
								</button>
							</div>
						</form>
					)}

					<div className="mt-6 text-center">
						<button
							type="button"
							onClick={() => {
								setIsLogin(!isLogin);
								setCurrentStep('register');
								setOtpSent(false);
								setError('');
								setSuccess('');
								setFormData({ email: '', password: '', name: '', phone: '', otp: '', role: 'client' });
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
