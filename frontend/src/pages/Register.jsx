import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		name: '',
		phone: '',
		category: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	
	const navigate = useNavigate();
	const { user } = useAuth();

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
			// Validate required fields for registration
			if (!formData.name || !formData.phone || !formData.category) {
				setError('Name, phone number, and category are required for registration.');
				return;
			}
			
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
				setMessage('✅ Registration successful! Redirecting to login...');
				setTimeout(() => {
					navigate('/login');
				}, 2000);
				setFormData({ name: '', email: '', password: '', phone: '', category: '' });
				setError('');
			} else {
				setError(data.message || 'Registration failed');
			}
		} catch (err) {
			setError('Registration failed. Please try again.');
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
			backgroundColor: '#28a745',
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
				<h1 style={styles.title}>Create New Account</h1>
				
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

					<input
						type="tel"
						name="phone"
						placeholder="Phone Number *"
						value={formData.phone}
						onChange={handleChange}
						required
						style={styles.input}
					/>

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
					<option value="user">User</option>
					<option value="partner">Partner</option>
						<option value="subadmin">Sub-Admin</option>
					</select>

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

					<button
						type="submit"
						disabled={loading}
						style={{
							...styles.button,
							opacity: loading ? 0.7 : 1,
							cursor: loading ? 'not-allowed' : 'pointer'
						}}
					>
						{loading ? 'Creating Account...' : 'Create Account'}
					</button>
				</form>

				<div style={styles.link}>
					<a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
						Already have an account? Sign in
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