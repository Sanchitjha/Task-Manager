import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

export default function ForgotPassword() {
	const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
	const [email, setEmail] = useState('');
	const [otp, setOtp] = useState('');
	const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const [otpTimer, setOtpTimer] = useState(0);

	const navigate = useNavigate();

	// OTP countdown
	useEffect(() => {
		if (otpTimer <= 0) return;
		const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
		return () => clearInterval(interval);
	}, [otpTimer]);

	// Step 1: Send OTP
	const handleSendOTP = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setMessage('');
		try {
			const response = await api.post('/auth/forgot-password', { email });
			if (response.data.success) {
				setStep(2);
				setOtpTimer(60);
				setMessage(`OTP sent to ${email}`);
				if (response.data.developmentOTP) {
					setMessage(`[DEV] OTP: ${response.data.developmentOTP}`);
				}
			} else {
				setError(response.data.message || 'Failed to send OTP');
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Step 2: Verify OTP
	const handleVerifyOTP = (e) => {
		e.preventDefault();
		if (otp.length !== 6) {
			setError('Please enter the 6-digit OTP.');
			return;
		}
		setError('');
		setMessage('');
		setStep(3);
	};

	// Step 3: Reset Password
	const handleResetPassword = async (e) => {
		e.preventDefault();
		setError('');

		if (passwords.newPassword !== passwords.confirmPassword) {
			setError('Passwords do not match.');
			return;
		}
		if (passwords.newPassword.length < 6) {
			setError('Password must be at least 6 characters.');
			return;
		}

		setLoading(true);
		try {
			const response = await api.post('/auth/reset-password', {
				email,
				otp,
				newPassword: passwords.newPassword,
			});
			if (response.data.success) {
				setMessage('Password reset successfully! Redirecting to login...');
				setTimeout(() => navigate('/login'), 2000);
			} else {
				// OTP invalid - go back to OTP step
				if (response.data.message?.toLowerCase().includes('otp')) {
					setStep(2);
				}
				setError(response.data.message || 'Failed to reset password.');
			}
		} catch (err) {
			const msg = err.response?.data?.message || 'Failed to reset password.';
			if (msg.toLowerCase().includes('otp')) setStep(2);
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const stepLabels = ['Email', 'Verify OTP', 'New Password'];

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-10">
			<div className="w-full max-w-md">

				{/* Header */}
				<div className="text-center mb-8">
					<div className="text-5xl mb-3">🔐</div>
					<h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
						Forgot Password
					</h1>
					<p className="text-gray-500 mt-1 text-sm">Reset your account password via OTP</p>
				</div>

				{/* Card */}
				<div className="bg-white rounded-2xl shadow-xl p-8">

					{/* Step Indicator */}
					<div className="flex items-center justify-center gap-2 mb-6">
						{[1, 2, 3].map((s) => (
							<div key={s} className="flex items-center gap-2">
								<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
									step >= s
										? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
										: 'bg-gray-200 text-gray-400'
								}`}>
									{step > s ? '✓' : s}
								</div>
								{s < 3 && <div className={`w-8 h-1 rounded ${step > s ? 'bg-purple-400' : 'bg-gray-200'}`} />}
							</div>
						))}
					</div>
					<div className="flex justify-between text-xs text-gray-400 mb-6 px-1">
						{stepLabels.map((l) => <span key={l}>{l}</span>)}
					</div>

					{/* Messages */}
					{message && (
						<div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
							{message}
						</div>
					)}
					{error && (
						<div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
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
									placeholder="Enter your registered email"
									required
									autoComplete="email"
									className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800 text-base"
								/>
								<p className="text-xs text-gray-400 mt-1">An OTP will be sent to this email</p>
							</div>
							<button
								type="submit"
								disabled={loading}
								className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-base hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-60 shadow-lg active:scale-95"
							>
								{loading ? 'Sending OTP...' : 'Send OTP →'}
							</button>
						</form>
					)}

					{/* STEP 2: OTP */}
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
								disabled={otp.length !== 6}
								className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-base hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-60 shadow-lg active:scale-95"
							>
								Verify OTP →
							</button>

							{/* Resend */}
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

					{/* STEP 3: New Password */}
					{step === 3 && (
						<form onSubmit={handleResetPassword} className="space-y-4">
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
								<div className="relative">
									<input
										type={showPassword ? 'text' : 'password'}
										value={passwords.newPassword}
										onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
										placeholder="Minimum 6 characters"
										required
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

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
								<input
									type={showPassword ? 'text' : 'password'}
									value={passwords.confirmPassword}
									onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
									placeholder="Re-enter new password"
									required
									className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition text-gray-800 text-base"
								/>
								{passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
									<p className="text-xs text-red-500 mt-1">Passwords do not match</p>
								)}
								{passwords.confirmPassword && passwords.newPassword === passwords.confirmPassword && (
									<p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
								)}
							</div>

							<button
								type="submit"
								disabled={loading || passwords.newPassword !== passwords.confirmPassword}
								className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-60 shadow-lg active:scale-95"
							>
								{loading ? 'Resetting...' : 'Reset Password ✓'}
							</button>

							<button
								type="button"
								onClick={() => { setStep(2); setError(''); }}
								className="w-full text-sm text-gray-500 hover:text-gray-700 transition"
							>
								← Back to OTP
							</button>
						</form>
					)}

					{/* Footer */}
					<div className="mt-6 text-center space-y-2">
						<p className="text-sm text-gray-500">
							Remember your password?{' '}
							<Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
						</p>
						<Link to="/" className="text-xs text-gray-400 hover:text-gray-600 block">← Back to Home</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
