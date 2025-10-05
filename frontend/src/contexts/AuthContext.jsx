import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

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
			// In a real app, you'd verify the token with the backend
			// For now, we'll just set a mock user
			setUser({ name: 'John Doe', email: 'john@example.com', role: 'client' });
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			const response = await authAPI.login(email, password);
			const { token } = response.data;
			localStorage.setItem('token', token);
			// In a real app, you'd decode the token to get user info
			setUser({ name: 'John Doe', email, role: 'client' });
			return { success: true };
		} catch (error) {
			return { success: false, error: error.response?.data?.message || 'Login failed' };
		}
	};

	const register = async (name, email, password, role = 'client') => {
		try {
			const response = await authAPI.register(name, email, password, role);
			return { success: true };
		} catch (error) {
			return { success: false, error: error.response?.data?.message || 'Registration failed' };
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
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