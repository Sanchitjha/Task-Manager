import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://task-manager-x6vw.onrender.com/api';

// Helper function to get complete profile image URL
const getProfileImageUrl = (path) => {
    if (!path) return '/default-avatar.png';
    return `${API_BASE_URL}${path}`;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Add this to handle cookies properly
});

// Add helper function to api object
api.getProfileImageUrl = getProfileImageUrl;

// Add auth token to requests
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Upload profile image
api.uploadProfileImage = async (userId, imageFile) => {
	const formData = new FormData();
	formData.append('profileImage', imageFile);
	
	const response = await api.post(`/users/${userId}/profile-image`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};

// Handle auth errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error('API Error:', error.response || error);
		if (error.response?.status === 401) {
			localStorage.removeItem('token');
			if (window.location.pathname !== '/login') {
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);

// Debug helper function
api.getMe = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const response = await api.get(`/users/${decoded.id}`);
    return response.data;
};

// User profile functions
api.updateProfile = async (userId, data) => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
};

export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role }),
    sendEmailOTP: (email) => api.post('/auth/send-email-otp', { email }),
    verifyEmailOTP: (email, otpCode, name, password) => api.post('/auth/verify-email-otp', { email, otpCode, name, password }),
};


export const videosAPI = {
	getVideos: () => api.get('/videos'),
	addVideo: (videoData) => api.post('/videos', videoData),
};

export const walletAPI = {
	getBalance: () => api.get('/wallet/balance'),
	getTransactions: () => api.get('/wallet/transactions'),
};

export const usersAPI = {
	getUsers: () => api.get('/users'),
};

export const settingsAPI = {
	getSettings: () => api.get('/settings'),
	updateSettings: (settings) => api.post('/settings', settings),
};

// Products API
export const productsAPI = {
	list: (params) => api.get('/products', { params }),
	get: (id) => api.get(`/products/${id}`),
	create: (data) => api.post('/products', data),
	update: (id, data) => api.put(`/products/${id}`, data),
	remove: (id) => api.delete(`/products/${id}`),
	uploadImages: (id, files) => {
		const form = new FormData();
		files.forEach((f) => form.append('images', f));
		return api.post(`/products/${id}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
	}
};

export default api;