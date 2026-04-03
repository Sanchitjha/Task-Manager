import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://task-manager-x6vw.onrender.com/api';

// Step 1: Email entry
// Step 2: OTP verification
// Step 3: Fill remaining details

export default function Register() {
	const [step, setStep] = useState(1);

	// Step 1
	const [email, setEmail] = useState('');

	// Step 2
	const [otp, setOtp] = useState('');
	const [otpTimer, setOtpTimer] = useState(0);

	// Step 3
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		password: '',
		confirmPassword: '',
		category: ''
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');

	const navigate = useNavigate();
	const { user } = useAuth();

	useEffect(() => {
		if (user) navigate('/', { replace: true });
	}, [user, navigate]);

	// OTP countdown timer
	useEffect(() => {
		if (otpTimer <= 0) return;
		const interval = setInterval(() => {
			setOtpTimer((t) => t - 1);
		}, 1000);
		return () => clearInterval(interval);
	}, [otpTimer]);

	// STEP 1: Send OTP to email
	const handleSendOTP = async (e) => {
		e.preventDefault();
		setError('');

		// Basic email format validation
		const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(email)) {
			setError('Please enter a valid email address.');
			return;
		}

		setLoading(true);

		try {
			const res = await fetch(`${API_URL}/auth/send-email-otp`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			const data = await res.json();

			if (res.ok && data.success) {
				setStep(2);
				setOtpTimer(60);
				setMessage(`OTP sent to ${email}`);
				if (data.developmentOTP) {
					setMessage(`[DEV] OTP: ${data.developmentOTP}`);
				}
			} else {
				setError(data.message || 'Failed to send OTP. Please try again.');
			}
		} catch {
			setError('Network error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// STEP 2: Verify OTP
	const handleVerifyOTP = async (e) => {
		e.preventDefault();
		setError('');

		if (otp.length !== 6) {
			setError('Please enter the 6-digit OTP.');
			return;
		}

		// We just move to step 3 - actual OTP verification happens at final submit
		setStep(3);
		setMessage('');
	};

	// STEP 3: Final registration
	const handleRegister = async (e) => {
		e.preventDefault();
		setError('');

		if (!formData.name || !formData.phone || !formData.password || !formData.category) {
			setError('All fields are required.');
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters.');
			return;
		}

		setLoading(true);

		try {
			const res = await fetch(`${API_URL}/auth/verify-email-otp-register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					otp,
					name: formData.name,
					password: formData.password,
					phone: formData.phone,
					role: formData.category,
				}),
			});

			const data = await res.json();

			if (res.ok && data.success) {
				setMessage('Account created successfully! Redirecting to login...');
				setTimeout(() => navigate('/login'), 2000);
			} else {
				// If OTP error, send back to OTP step
				if (data.message?.toLowerCase().includes('otp')) {
					setStep(2);
					setError(data.message);
				} else {
					setError(data.message || 'Registration failed. Please try again.');
				}
			}
		} catch {
			setError('Network error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-10">
			<div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
						Create Account
					</h1>
					<p className="text-gray-500 mt-1 text-sm">The MANAGER - Housing Society Platform</p>
				</div>

				{/* Step Indicator */}
				<div className="flex items-center justify-center gap-2 mb-8">
					{[1, 2, 3].map((s) => (
						<div key={s} className="flex items-center gap-2">
							<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
								step >= s
									? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
									: 'bg-gray-200 text-gray-400'
							}`}>
								{step > s ? '✓' : s}
							</div>
							{s < 3 && <div className={`w-10 h-1 rounded ${step > s ? 'bg-purple-400' : 'bg-gray-200'}`} />}
						</div>
					))}
				</div>
				<div className="flex justify-between text-xs text-gray-400 mb-6 px-1">
					<span>Email</span>
					<span className="ml-2">Verify OTP</span>
					<span>Details</span>
				</div>

				{/* Messages */}
				{message && (
					<div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
						{message}
					</div>
				)}
				{error && (
					<div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
						{error}
					</div>
				)}

				{/* STEP 1: Email */}
				{step === 1 && (
					<form onSubmit={handleSendOTP} className="space-y-4">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								required
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800"
							/>
							<p className="text-xs text-gray-400 mt-1">An OTP will be sent to verify your email</p>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-base hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-60"
						>
							{loading ? 'Sending OTP...' : 'Send OTP →'}
						</button>
					</form>
				)}

				{/* STEP 2: OTP Verification */}
				{step === 2 && (
					<form onSubmit={handleVerifyOTP} className="space-y-4">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Enter OTP</label>
							<input
								type="text"
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
								placeholder="6-digit OTP"
								maxLength={6}
								required
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800 text-center text-2xl font-bold tracking-widest"
							/>
							<p className="text-xs text-gray-400 mt-1">OTP sent to <strong>{email}</strong></p>
						</div>

						<button
							type="submit"
							disabled={loading || otp.length !== 6}
							className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-base hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-60"
						>
							Verify OTP →
						</button>

						{/* Resend OTP */}
						<div className="text-center">
							{otpTimer > 0 ? (
								<p className="text-sm text-gray-400">Resend OTP in <strong>{otpTimer}s</strong></p>
							) : (
								<button
									type="button"
									onClick={handleSendOTP}
									disabled={loading}
									className="text-sm text-blue-600 hover:text-blue-700 font-semibold underline"
								>
									Resend OTP
								</button>
							)}
						</div>

						<button
							type="button"
							onClick={() => { setStep(1); setError(''); setOtp(''); }}
							className="w-full text-sm text-gray-500 hover:text-gray-700 transition"
						>
							← Change Email
						</button>
					</form>
				)}

				{/* STEP 3: Account Details */}
				{step === 3 && (
					<form onSubmit={handleRegister} className="space-y-4">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="Enter your full name"
								required
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
							<input
								type="tel"
								value={formData.phone}
								onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
								placeholder="Enter your phone number"
								required
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Account Type</label>
							<select
								value={formData.category}
								onChange={(e) => setFormData({ ...formData, category: e.target.value })}
								required
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800 bg-white"
							>
								<option value="">Select Account Type</option>
								<option value="user">User (Resident)</option>
								<option value="Partner">Partner / Vendor</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
							<input
								type="password"
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								placeholder="Minimum 6 characters"
								required
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
							<input
								type="password"
								value={formData.confirmPassword}
								onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
								placeholder="Re-enter your password"
								required
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-60"
						>
							{loading ? 'Creating Account...' : 'Create Account ✓'}
						</button>
					</form>
				)}

				{/* Footer Links */}
				<div className="mt-6 text-center space-y-2">
					<p className="text-sm text-gray-500">
						Already have an account?{' '}
						<Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
					</p>
					<Link to="/" className="text-xs text-gray-400 hover:text-gray-600 block">← Back to Home</Link>
				</div>
			</div>
		</div>
	);
}
