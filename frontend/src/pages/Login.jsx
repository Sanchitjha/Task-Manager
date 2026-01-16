import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		name: '',
		phone: '',
		category: ''
	});
	const [currentView, setCurrentView] = useState('choice'); // 'choice', 'login', 'register'
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	
	const navigate = useNavigate();
	const { login, user } = useAuth();

	// Redirect if already logged in
	useEffect(() => {
		if (user) {
			navigate('/', { replace: true });
		}
	}, [user, navigate]);

	// Test API connectivity
	const testAPI = async () => {
		try {
			const response = await fetch('https://task-manager-x6vw.onrender.com');
			const data = await response.json();
			console.log('🔗 API Health Check:', data);
			return data.ok === true; // Check for the basic response
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
			if (currentView === 'login') {
				// Use AuthContext login method
				const result = await login(formData.email, formData.password);
				if (result.success) {
					// Redirect based on user role
					if (result.user && result.user.role === 'admin') {
						navigate('/admin');
					} else {
						navigate('/');
					}
				} else {
					setError(result.error || 'Login failed');
				}
			} else if (currentView === 'register') {
				// Direct Registration
				// Validate required fields for registration
				if (!formData.name || !formData.phone || !formData.category) {
					setError('Name, phone number, and category are required for registration.');
					return;
				}
				
				try {
					const response = await fetch('https://task-manager-x6vw.onrender.com/api/auth/register', {
						method: 'POST',
						headers: { 
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							name: formData.name,
							email: formData.email,
							password: formData.password,
							phone: formData.phone,
							role: formData.category
						})
					});
					
					const data = await response.json();
					
					if (response.ok && (data.id || data.message)) {
						setMessage('✅ Registration successful! You can now login.');
						setCurrentView('login');
						setFormData({ name: '', email: '', password: '', phone: '', category: '' });
						setError('');
					} else {
						setError(data.message || 'Registration failed');
					}
				} catch (err) {
					setError('Registration failed. Please try again.');
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
		setCurrentView(currentView === 'login' ? 'register' : 'login');
		setError('');
		setMessage('');
		setFormData({ email: '', password: '', name: '', phone: '', category: '' });
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
		subtitle: {
			fontSize: '16px',
			color: '#666',
			textAlign: 'center',
			marginBottom: '30px'
		},
		buttonContainer: {
			display: 'flex',
			flexDirection: 'column',
			gap: '15px',
			marginBottom: '30px'
		},
		choiceButton: {
			width: '100%',
			padding: '20px',
			border: 'none',
			borderRadius: '8px',
			fontSize: '18px',
			fontWeight: 'bold',
			cursor: 'pointer',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '5px',
			transition: 'transform 0.2s, box-shadow 0.2s'
		},
		loginButton: {
			backgroundColor: '#007bff',
			color: 'white',
			boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
		},
		registerButton: {
			backgroundColor: '#28a745',
			color: 'white',
			boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
		},
		buttonSubtext: {
			fontSize: '12px',
			opacity: 0.9,
			fontWeight: 'normal'
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
				{currentView === 'choice' && (
					<>
						<h1 style={styles.title}>Welcome to Showcase Retail</h1>
						<p style={styles.subtitle}>Choose an option to continue</p>
						
						<div style={styles.buttonContainer}>
							<button
								onClick={() => setCurrentView('login')}
								style={{...styles.choiceButton, ...styles.loginButton}}
							>
								🔑 Login
								<span style={styles.buttonSubtext}>Sign in to your account</span>
							</button>
							
							<button
								onClick={() => setCurrentView('register')}
								style={{...styles.choiceButton, ...styles.registerButton}}
							>
								👤 New User
								<span style={styles.buttonSubtext}>Create a new account</span>
							</button>
						</div>
						
						<div style={styles.link}>
							<a href="/" style={{ color: '#666', textDecoration: 'none' }}>
								← Back to Home
							</a>
						</div>
					</>
				)}

				{(currentView === 'login' || currentView === 'register') && (
					<>
						<h1 style={styles.title}>
							{currentView === 'login' ? 'Welcome Back' : 'Create Account'}
						</h1>
						
						{message && (
							<div style={styles.success}>
								{message}
							</div>
						)}
						
						<form onSubmit={handleSubmit}>
					<input
						type="email"
						name="email"
						placeholder="Email Address *"
						value={formData.email}
						onChange={handleChange}
						required
						style={styles.input}
					/>

					{currentView === 'register' && (
						<input
							type="tel"
							name="phone"
							placeholder="Phone Number *"
							value={formData.phone}
							onChange={handleChange}
							required
							style={styles.input}
						/>
					)}

					{currentView === 'register' && (
						<>
							<input
								type="text"
								name="name"
								placeholder="Full Name *"
								value={formData.name}
								onChange={handleChange}
								required
								style={styles.input}
							/>
							<select
								name="category"
								value={formData.category}
								onChange={handleChange}
								required
								style={styles.input}
							>
								<option value="">Select Category *</option>
								<option value="client">Client</option>
								<option value="vendor">Vendor</option>
								<option value="subadmin">Sub-Admin</option>
							</select>
						</>
					)}

					<input
						type="password"
						name="password"
						placeholder="Password *"
						value={formData.password}
						onChange={handleChange}
						required
						style={styles.input}
						/>

					{error && (
						<div style={styles.error}>
							{error}
						</div>
					)}

					{currentView === 'login' && (
						<div style={{
							padding: '10px',
							backgroundColor: '#e3f2fd',
							color: '#0d47a1',
							borderRadius: '4px',
							fontSize: '12px',
							marginBottom: '15px',
							border: '1px solid #90caf9'
						}}>
							💡 <strong>Admin Access:</strong> Use your admin credentials to access the admin panel
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
						{loading ? 'Please wait...' : (currentView === 'login' ? 'Sign In' : 'Create Account')}
					</button>
				</form>

				<div
					onClick={() => setCurrentView('choice')}
					style={styles.link}
				>
					← Back to Options
				</div>
			</>
		)}
			</div>
		</div>
	);
}
