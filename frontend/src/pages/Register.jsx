import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TheManagerLogo from '../components/TheManagerLogo';
import { AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://task-manager-x6vw.onrender.com/api';

const STEPS = [
	{ num: 1, label: 'Email' },
	{ num: 2, label: 'Verify OTP' },
	{ num: 3, label: 'Details' },
];

function StepIndicator({ step }) {
	return (
		<div className="flex items-center justify-center gap-0 mb-8">
			{STEPS.map(({ num, label }, i) => (
				<div key={num} className="flex items-center">
					<div className="flex flex-col items-center gap-1.5">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
								step > num
									? 'bg-brand-600 text-white'
									: step === num
									? 'bg-brand-600 text-white ring-4 ring-brand-100'
									: 'bg-gray-100 text-gray-400 border border-gray-200'
							}`}
						>
							{step > num ? <CheckCircle size={14} strokeWidth={2.5} /> : num}
						</div>
						<span className={`text-xs font-medium ${step >= num ? 'text-brand-600' : 'text-gray-400'}`}>
							{label}
						</span>
					</div>
					{i < STEPS.length - 1 && (
						<div className={`w-16 h-0.5 mb-5 mx-1 transition-colors duration-300 ${step > num ? 'bg-brand-600' : 'bg-gray-200'}`} />
					)}
				</div>
			))}
		</div>
	);
}

export default function Register() {
	const [step, setStep] = useState(1);
	const [email, setEmail] = useState('');
	const [otp, setOtp] = useState('');
	const [otpTimer, setOtpTimer] = useState(0);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		password: '',
		confirmPassword: '',
		category: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');

	const navigate = useNavigate();
	const { user } = useAuth();

	useEffect(() => {
		if (user) navigate('/', { replace: true });
	}, [user, navigate]);

	useEffect(() => {
		if (otpTimer <= 0) return;
		const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
		return () => clearInterval(interval);
	}, [otpTimer]);

	const handleSendOTP = async (e) => {
		e?.preventDefault();
		setError('');
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
				setMessage(`A 6-digit OTP has been sent to ${email}`);
			} else {
				setError(data.message || 'Failed to send OTP. Please try again.');
			}
		} catch {
			setError('Network error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOTP = (e) => {
		e.preventDefault();
		setError('');
		if (otp.length !== 6) {
			setError('Please enter the complete 6-digit OTP.');
			return;
		}
		setStep(3);
		setMessage('');
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setError('');

		if (!formData.name.trim() || !formData.phone || !formData.password || !formData.category) {
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
					name: formData.name.trim(),
					password: formData.password,
					phone: formData.phone,
					role: formData.category,
				}),
			});
			const data = await res.json();
			if (res.ok && data.success) {
				setMessage('Account created successfully! Redirecting to login…');
				setTimeout(() => navigate('/login'), 2000);
			} else {
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
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
			<div className="w-full max-w-sm">

				{/* Logo */}
				<div className="text-center mb-8">
					<Link to="/" className="inline-flex justify-center mb-5">
						<TheManagerLogo width={56} height={56} className="drop-shadow" />
					</Link>
					<h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
					<p className="text-gray-500 mt-1 text-sm">The MANAGER — Housing Society Platform</p>
				</div>

				{/* Card */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-7">

					<StepIndicator step={step} />

					{/* Feedback */}
					{message && (
						<div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700">
							<CheckCircle size={16} className="shrink-0 mt-0.5" strokeWidth={2} />
							<span className="text-sm font-medium">{message}</span>
						</div>
					)}
					{error && (
						<div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700">
							<AlertCircle size={16} className="shrink-0 mt-0.5" strokeWidth={2} />
							<span className="text-sm font-medium">{error}</span>
						</div>
					)}

					{/* Step 1: Email */}
					{step === 1 && (
						<form onSubmit={handleSendOTP} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									required
									autoFocus
									className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
								/>
								<p className="text-xs text-gray-400 mt-1.5">A 6-digit OTP will be sent to verify your email.</p>
							</div>
							<button
								type="submit"
								disabled={loading}
								className="w-full py-2.5 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
							>
								{loading ? 'Sending…' : 'Send OTP'}
							</button>
						</form>
					)}

					{/* Step 2: OTP */}
					{step === 2 && (
						<form onSubmit={handleVerifyOTP} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
								<input
									type="text"
									value={otp}
									onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
									placeholder="000000"
									maxLength={6}
									required
									autoFocus
									className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-gray-900 text-xl font-bold text-center tracking-[0.4em] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
								/>
								<p className="text-xs text-gray-400 mt-1.5">
									Sent to <span className="font-medium text-gray-600">{email}</span>
								</p>
							</div>

							<button
								type="submit"
								disabled={loading || otp.length !== 6}
								className="w-full py-2.5 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
							>
								Verify & Continue
							</button>

							<div className="text-center">
								{otpTimer > 0 ? (
									<p className="text-xs text-gray-400">Resend available in <span className="font-semibold text-gray-600">{otpTimer}s</span></p>
								) : (
									<button
										type="button"
										onClick={handleSendOTP}
										disabled={loading}
										className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
									>
										Resend OTP
									</button>
								)}
							</div>

							<button
								type="button"
								onClick={() => { setStep(1); setError(''); setOtp(''); }}
								className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mx-auto"
							>
								<ArrowLeft size={12} /> Change email
							</button>
						</form>
					)}

					{/* Step 3: Account details */}
					{step === 3 && (
						<form onSubmit={handleRegister} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder="Your full name"
									required
									autoFocus
									className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
								<input
									type="tel"
									value={formData.phone}
									onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
									placeholder="+91 99999 99999"
									required
									className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Account type</label>
								<select
									value={formData.category}
									onChange={(e) => setFormData({ ...formData, category: e.target.value })}
									required
									className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white appearance-none"
								>
									<option value="">Select account type</option>
									<option value="user">Resident / User</option>
									<option value="partner">Partner / Vendor</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
								<div className="relative">
									<input
										type={showPassword ? 'text' : 'password'}
										value={formData.password}
										onChange={(e) => setFormData({ ...formData, password: e.target.value })}
										placeholder="Min. 6 characters"
										required
										className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
									/>
									<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Toggle password">
										{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
									</button>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
								<div className="relative">
									<input
										type={showConfirmPassword ? 'text' : 'password'}
										value={formData.confirmPassword}
										onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
										placeholder="Re-enter password"
										required
										className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
									/>
									<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Toggle confirm password">
										{showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
									</button>
								</div>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full py-2.5 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
							>
								{loading ? (
									<>
										<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
										</svg>
										Creating account…
									</>
								) : 'Create Account'}
							</button>
						</form>
					)}

					<p className="mt-5 text-center text-sm text-gray-500">
						Already have an account?{' '}
						<Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
							Sign in
						</Link>
					</p>
				</div>

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
