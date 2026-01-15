import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		name: '',
		role: 'client',
		otp: ''
	});
	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showOTPStep, setShowOTPStep] = useState(false);
	
	const navigate = useNavigate();

	// Test API connectivity
	const testAPI = async () => {
		try {
			const response = await fetch('https://task-manager-x6vw.onrender.com/health');
			const data = await response.json();
			console.log('🔗 API Health Check:', data);
			return data.status === 'healthy';
		} catch (err) {
			console.error('❌ API Health Check Failed:', err);
			return false;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			if (isLogin) {
				// Simple login attempt
				const response = await fetch('https://task-manager-x6vw.onrender.com/api/auth/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: formData.email,
						password: formData.password
					})
				});
				
				const data = await response.json();
				if (data.token) {
					localStorage.setItem('token', data.token);
					navigate('/');
				} else {
					setError('Login failed');
				}
			} else {
				// Registration flow with OTP
				if (!showOTPStep) {
					// Test API connectivity first
					const apiHealthy = await testAPI();
					if (!apiHealthy) {
						throw new Error('Backend API is not responding. Please try again later.');
					}
					
					// Send OTP
					console.log('🔄 Sending OTP request to backend');
					console.log('📧 Email:', formData.email);
					
					const response = await fetch('https://task-manager-x6vw.onrender.com/api/auth/send-email-otp', {
						method: 'POST',
						headers: { 
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						},
						body: JSON.stringify({ email: formData.email })
					});
					
					console.log('📡 Response status:', response.status);
					
					if (!response.ok) {
						const errorText = await response.text();
						console.error('❌ Error response:', errorText);
						throw new Error(`HTTP ${response.status}: ${errorText}`);
					}
					
					const data = await response.json();
					console.log('✅ OTP Response:', data);
					
					if (data.success) {
						setShowOTPStep(true);
						setError('');
						// Show development OTP if available
						if (data.developmentOTP) {
							alert(`Development Mode - Your OTP is: ${data.developmentOTP}`);
						}
					} else {
						setError(data.message || 'Failed to send OTP');
					}
				} else {
					// Verify OTP
					const response = await fetch('https://task-manager-x6vw.onrender.com/api/auth/verify-email-otp', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							email: formData.email,
							otpCode: formData.otp,
							name: formData.name,
							password: formData.password
						})
					});
					
					const data = await response.json();
					if (data.success && data.token) {
						localStorage.setItem('token', data.token);
						navigate('/');
					} else {
						setError(data.message || 'Registration failed');
					}
				}
			}
		} catch (err) {
			console.error('❌ Full error details:', err);
			setError(`Error: ${err.message}. Check browser console for details.`);
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

	const toggleMode = () => {
		setIsLogin(!isLogin);
		setShowOTPStep(false);
		setError('');
		setFormData({ email: '', password: '', name: '', role: 'client', otp: '' });
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
			marginBottom: '30px',
			color: '#333'
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
					{isLogin ? 'Welcome Back' : 'Create Account'}
				</h1>
				
				<form onSubmit={handleSubmit}>
					<input
						type="email"
						name="email"
						placeholder="Email Address *"
						value={formData.email}
						onChange={handleChange}
						required
						disabled={showOTPStep}
						style={styles.input}
					/>

					{!isLogin && !showOTPStep && (
						<input
							type="text"
							name="name"
							placeholder="Full Name *"
							value={formData.name}
							onChange={handleChange}
							required
							style={styles.input}
						/>
					)}

					{(isLogin || !showOTPStep) && (
						<input
							type="password"
							name="password"
							placeholder="Password *"
							value={formData.password}
							onChange={handleChange}
							required
							style={styles.input}
						/>
					)}

					{!isLogin && !showOTPStep && (
						<select
							name="role"
							value={formData.role}
							onChange={handleChange}
							style={styles.input}
						>
							<option value="client">Client</option>
							<option value="vendor">Vendor</option>
							<option value="subadmin">Sub-Admin</option>
						</select>
					)}

					{showOTPStep && (
						<>
							<input
								type="text"
								name="otp"
								placeholder="Enter 6-digit verification code"
								value={formData.otp}
								onChange={handleChange}
								required
								maxLength="6"
								style={styles.input}
							/>
							<p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
								Check your email for the verification code
							</p>
							<button
								type="button"
								onClick={() => setShowOTPStep(false)}
								style={{ ...styles.link, marginTop: '0', marginBottom: '10px' }}
							>
								← Back to form
							</button>
						</>
					)}

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
						{loading ? 'Please wait...' : 
						 isLogin ? 'Sign In' : 
						 showOTPStep ? 'Verify & Create Account' : 'Send Verification Code'}
					</button>
				</form>

				<div
					onClick={toggleMode}
					style={styles.link}
				>
					{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
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
