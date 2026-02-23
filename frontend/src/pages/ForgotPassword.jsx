import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function ForgotPassword() {
	const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
	const [formData, setFormData] = useState({
		email: '',
		otp: '',
		newPassword: '',
		confirmPassword: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const [devOtp, setDevOtp] = useState('');
	
	const navigate = useNavigate();

	const handleSendOTP = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setMessage('');

		try {
			const response = await api.post('/auth/forgot-password', {
				email: formData.email
			});

			if (response.data.success) {
				setMessage(response.data.message);
				setStep(2);
				
				// Store dev OTP if available
				if (response.data.developmentOTP) {
					setDevOtp(response.data.developmentOTP);
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

	const handleResetPassword = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setMessage('');

		// Validate passwords match
		if (formData.newPassword !== formData.confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		// Validate password length
		if (formData.newPassword.length < 6) {
			setError('Password must be at least 6 characters long');
			setLoading(false);
			return;
		}

		try {
			const response = await api.post('/auth/reset-password', {
				email: formData.email,
				otp: formData.otp,
				newPassword: formData.newPassword
			});

			if (response.data.success) {
				setMessage(response.data.message);
				setTimeout(() => {
					navigate('/login');
				}, 2000);
			} else {
				setError(response.data.message || 'Failed to reset password');
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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

	const styles = {
		container: {
			minHeight: '100vh',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: '#f5f5f5',
			padding: '20px'
		},
		form: {
			backgroundColor: 'white',
			padding: '40px',
			borderRadius: '8px',
			boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
			width: '100%',
			maxWidth: '400px'
		},
		title: {
			fontSize: '24px',
			fontWeight: 'bold',
			textAlign: 'center',
			marginBottom: '10px',
			color: '#333'
		},
		subtitle: {
			fontSize: '14px',
			textAlign: 'center',
			marginBottom: '30px',
			color: '#666'
		},
		input: {
			width: '100%',
			padding: '12px',
			border: '1px solid #ddd',
			borderRadius: '4px',
			marginBottom: '15px',
			fontSize: '14px'
		},
		button: {
			width: '100%',
			padding: '12px',
			backgroundColor: '#007bff',
			color: 'white',
			border: 'none',
			borderRadius: '4px',
			fontSize: '16px',
			cursor: 'pointer',
			marginTop: '10px'
		},
		error: {
			backgroundColor: '#ffebee',
			color: '#d32f2f',
			padding: '10px',
			borderRadius: '4px',
			marginBottom: '15px',
			fontSize: '14px'
		},
		success: {
			backgroundColor: '#e8f5e8',
			color: '#2e7d32',
			padding: '10px',
			borderRadius: '4px',
			marginBottom: '15px',
			fontSize: '14px'
		},
		devInfo: {
			backgroundColor: '#fff3cd',
			color: '#856404',
			padding: '10px',
			borderRadius: '4px',
			marginBottom: '15px',
			fontSize: '13px',
			border: '1px solid #ffeeba'
		},
		link: {
			color: '#007bff',
			cursor: 'pointer',
			textDecoration: 'underline',
			textAlign: 'center',
			marginTop: '20px',
			display: 'block'
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.form}>
				<h1 style={styles.title}>
					{step === 1 ? 'Forgot Password?' : 'Reset Password'}
				</h1>
				<p style={styles.subtitle}>
					{step === 1 
						? 'Enter your email address and we\'ll send you an OTP to reset your password.' 
						: 'Enter the OTP sent to your email and create a new password.'}
				</p>
				
				{message && (
					<div style={styles.success}>
						{message}
					</div>
				)}
				
				{devOtp && (
					<div style={styles.devInfo}>
						<strong>🔧 Development Mode:</strong><br />
						Your OTP is: <strong>{devOtp}</strong>
					</div>
				)}
				
				{step === 1 ? (
					<form onSubmit={handleSendOTP}>
						<input
							type="email"
							name="email"
							placeholder="Email Address *"
							value={formData.email}
							onChange={handleChange}
							required
							style={styles.input}
						/>

						{error && (
							<div style={styles.error}>
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							style={{
								...styles.button,
								opacity: loading ? 0.7 : 1,
								cursor: loading ? 'not-allowed' : 'pointer'
							}}
						>
							{loading ? 'Sending OTP...' : 'Send OTP'}
						</button>
					</form>
				) : (
					<form onSubmit={handleResetPassword}>
						<input
							type="text"
							name="otp"
							placeholder="Enter OTP *"
							value={formData.otp}
							onChange={handleChange}
							required
							maxLength="6"
							style={styles.input}
						/>

						<input
							type="password"
							name="newPassword"
							placeholder="New Password *"
							value={formData.newPassword}
							onChange={handleChange}
							required
							style={styles.input}
						/>

						<input
							type="password"
							name="confirmPassword"
							placeholder="Confirm Password *"
							value={formData.confirmPassword}
							onChange={handleChange}
							required
							style={styles.input}
						/>

						{error && (
							<div style={styles.error}>
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							style={{
								...styles.button,
								opacity: loading ? 0.7 : 1,
								cursor: loading ? 'not-allowed' : 'pointer'
							}}
						>
							{loading ? 'Resetting Password...' : 'Reset Password'}
						</button>

						<button
							type="button"
							onClick={() => {
								setStep(1);
								setFormData({ email: formData.email, otp: '', newPassword: '', confirmPassword: '' });
								setError('');
								setMessage('');
								setDevOtp('');
							}}
							style={{
								...styles.button,
								backgroundColor: '#6c757d',
								marginTop: '10px'
							}}
						>
							← Back to Email
						</button>
					</form>
				)}

				<div style={styles.link}>
					<a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
						Remember your password? Sign in
					</a>
				</div>

				<div style={styles.link}>
					<a href="/" style={{ color: '#666', textDecoration: 'none' }}>
						← Back to Home
					</a>
				</div>
			</div>
		</div>
	);
}
