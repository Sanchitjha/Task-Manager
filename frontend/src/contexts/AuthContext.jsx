import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

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

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			const decoded = decodeToken(token);
			if (decoded && decoded.id) {
				setUser({ id: decoded.id, role: decoded.role, email: decoded.email });
			} else {
				localStorage.removeItem('token');
			}
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			const response = await authAPI.login(email, password);
			const { token } = response.data;
			localStorage.setItem('token', token);
			const decoded = decodeToken(token);
			if (decoded && decoded.id) {
				setUser({ id: decoded.id, role: decoded.role, email });
				return { success: true };
			} else {
				return { success: false, error: 'Failed to decode token after login' };
			}
		} catch (error) {
			return { success: false, error: error.response?.data?.message || 'Login failed' };
		}
	};

	const register = async (name, email, password, role = 'client') => {
		try {
			await authAPI.register(name, email, password, role);
			// After successful registration, automatically log in the user
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

	const value = {
		user,
		loading,
		login,
		register,
		logout
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};