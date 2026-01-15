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
		role: 'client',
		otp: ''
	});
	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showOTPStep, setShowOTPStep] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			if (isLogin) {
				// Login flow
				const result = await login(formData.email, formData.password);
				if (result.success) {
					navigate('/');
				} else {
					setError(result.error || 'Login failed');
				}
			} else {
				// Registration flow
				if (!showOTPStep) {
					// Step 1: Send OTP
					try {
						const response = await api.post('/auth/send-email-otp', { 
							email: formData.email 
						});
						setShowOTPStep(true);
						setError('');
					} catch (err) {
						setError(err.response?.data?.message || 'Failed to send OTP');
					}
				} else {
					// Step 2: Verify OTP and complete registration
					try {
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
							setError('Registration failed');
						}
					} catch (err) {
						setError(err.response?.data?.message || 'OTP verification failed');
					}
				}
			}
		} catch (err) {
			setError('An error occurred. Please try again.');
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

	const resetForm = () => {
		setShowOTPStep(false);
		setFormData({ 
			email: '', 
			password: '', 
			name: '', 
			phone: '', 
			role: 'client', 
			otp: '' 
		});
		setError('');
	};

	const toggleMode = () => {
		setIsLogin(!isLogin);
		resetForm();
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{isLogin ? 'Welcome Back' : 'Create Account'}
					</h1>
					<p className="text-gray-600">
						{isLogin ? 'Sign in to your account' : 'Join The MANAGER platform'}
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email Address *
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							disabled={showOTPStep}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{!isLogin && !showOTPStep && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Full Name *
							</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					)}

					{(isLogin || !showOTPStep) && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Password *
							</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					)}

					{!isLogin && !showOTPStep && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Role
							</label>
							<select
								name="role"
								value={formData.role}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="client">Client</option>
								<option value="vendor">Vendor</option>
								<option value="subadmin">Sub-Admin</option>
							</select>
						</div>
					)}

					{showOTPStep && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Verification Code *
							</label>
							<input
								type="text"
								name="otp"
								value={formData.otp}
								onChange={handleChange}
								required
								maxLength="6"
								placeholder="Enter 6-digit code"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
							/>
							<p className="text-sm text-gray-500 mt-1">
								Check your email for the verification code
							</p>
							<button
								type="button"
								onClick={() => setShowOTPStep(false)}
								className="text-sm text-blue-600 hover:text-blue-800 mt-2"
							>
								← Back to form
							</button>
						</div>
					)}

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Please wait...' : 
						 isLogin ? 'Sign In' : 
						 showOTPStep ? 'Verify & Create Account' : 'Send Verification Code'}
					</button>
				</form>

				<div className="mt-6 text-center">
					<button
						type="button"
						onClick={toggleMode}
						className="text-blue-600 hover:text-blue-800"
					>
						{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
					</button>
				</div>

				<div className="mt-4 text-center">
					<Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
						← Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}
