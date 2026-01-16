import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TheManagerLogo from '../components/TheManagerLogo';

export default function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	
	const navigate = useNavigate();
	const { login, user } = useAuth();

	// Redirect if already logged in
	useEffect(() => {
		if (user) {
			navigate('/', { replace: true });
		}
	}, [user, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
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
				<h1 style={styles.title}>Welcome Back</h1>
				
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

					<div style={{
						padding: '15px',
						backgroundColor: '#e3f2fd',
						color: '#0d47a1',
						borderRadius: '8px',
						fontSize: '12px',
						marginBottom: '15px',
						border: '1px solid #90caf9',
						display: 'flex',
						alignItems: 'center',
						gap: '10px'
					}}>
						<TheManagerLogo width={24} height={24} />
						<div>
							<strong>Admin Access:</strong> Use your admin credentials to access the admin panel
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						style={{
							...styles.button,
							opacity: loading ? 0.7 : 1,
							cursor: loading ? 'not-allowed' : 'pointer'
						}}
					>
						{loading ? 'Signing In...' : 'Sign In'}
					</button>
				</form>

				<div style={styles.link}>
					<a href="/register" style={{ color: '#28a745', textDecoration: 'none' }}>
						Don't have an account? Create one
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