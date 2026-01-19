import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

// Helper function to decode JWT token
const decodeToken = (token) => {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error('Failed to decode token:', error);
		return null;
	}
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const token = localStorage.getItem('token');
				if (token) {
					const decoded = decodeToken(token);
					if (decoded && decoded.id) {
						const response = await api.get(`/users/${decoded.id}`);
						setUser(response.data);
					} else {
						localStorage.removeItem('token');
						setUser(null);
					}
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
				localStorage.removeItem('token');
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, []);

	const login = async (email, password) => {
		try {
			console.log('Attempting login with:', { email }); // Debug log
			const response = await api.post('/auth/login', { email, password });
			console.log('Login response:', response.data); // Debug log
			const { token, user: userData } = response.data;
			localStorage.setItem('token', token);
			setUser(userData);
			// Set authorization header
			api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
			
			// Return success with user role for redirect logic
			return { success: true, user: userData };
		} catch (error) {
			console.error('Login error details:', {
				message: error.message,
				response: error.response?.data,
				status: error.response?.status
			});
			return { success: false, error: error.response?.data?.message || 'Login failed' };
		}
	};

	const register = async (name, email, password, role = 'user') => {
		try {
			let endpoint = '/auth/register'; // Default for users
			
			// Route to different endpoints based on role
			if (role === 'subadmin') {
				endpoint = '/auth/register-subadmin';
			} else if (role === 'admin') {
				endpoint = '/auth/register-admin';
			}
			
			const response = await api.post(endpoint, { name, email, password, role });
			
			// Handle sub-admin pending approval case
			if (role === 'subadmin') {
				return { 
					success: true, 
					message: 'Sub-admin account created. Awaiting admin approval.',
					pendingApproval: true 
				};
			}
			
			// For user and admin, automatically log in
			const loginResult = await login(email, password);
			if (loginResult.success) {
				return { success: true };
			} else {
				return { success: false, error: loginResult.error || 'Registration successful, but auto-login failed.' };
			}
		} catch (error) {
			return { success: false, error: error.response?.data?.message || 'Registration failed' };
		}
	};

	const logout = async () => {
		try {
			// Call backend logout endpoint (optional but recommended)
			const token = localStorage.getItem('token');
			if (token) {
				await fetch('http://localhost:5000/api/auth/logout', {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
					credentials: 'include'
				}).catch(err => console.error('Backend logout failed:', err));
			}
		} finally {
			// Always clear local state regardless of API call result
			localStorage.removeItem('token');
			setUser(null);
			// Force redirect to login page
			window.location.href = '/login';
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	const value = {
		user,
		setUser,
		loading,
		login,
		register,
		logout,
		error
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};