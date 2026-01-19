import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editMode, setEditMode] = useState({ name: false, phone: false });
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    // Auto-dismiss messages after 3 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleFieldUpdate = async (field) => {
        if (!formData[field].trim() || formData[field] === user?.[field]) {
            setEditMode({ ...editMode, [field]: false });
            return;
        }

        try {
            setLoading(true);
            if (!user?._id) {
                throw new Error('User ID is missing');
            }
            
            const updateData = { [field]: formData[field] };
            const response = await api.patch(`/users/${user._id}`, updateData);
            
            // Update the user context
            setUser({ ...user, ...response.data });
            setMessage({ type: 'success', text: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!` });
            setEditMode({ ...editMode, [field]: false });
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            setMessage({
                type: 'error',
                text: error.response?.data?.msg || `Error updating ${field}`
            });
            // Reset form data on error
            setFormData({ ...formData, [field]: user?.[field] || '' });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
            e.target.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            setLoading(true);
            setMessage({ type: 'info', text: 'Uploading image...' });

            const response = await api.post(`/users/${user._id}/profile-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update user context with new image
            const updatedUser = { ...user, profileImage: response.data.profileImage };
            setUser(updatedUser);
            setMessage({ type: 'success', text: 'Profile image updated successfully!' });
            
            // Clear the file input
            e.target.value = '';
        } catch (error) {
            console.error('Error uploading image:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.msg || 'Error uploading image' 
            });
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = (field) => {
        setEditMode({ ...editMode, [field]: false });
        setFormData({ ...formData, [field]: user?.[field] || '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Profile Settings
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your account information</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Profile Image Section */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                                <img
                                    key={user?.profileImage || 'default'}
                                    src={user?.profileImage ? `http://localhost:5000${user.profileImage}?t=${Date.now()}` : '/default-avatar.png'}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/default-avatar.png';
                                    }}
                                />
                            </div>
                            <label 
                                htmlFor="profile-image"
                                className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full p-3 cursor-pointer shadow-lg transition-all duration-300 hover:scale-110"
                                title="Change Profile Picture"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-5 w-5" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                                    />
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                                    />
                                </svg>
                            </label>
                            <input
                                type="file"
                                id="profile-image"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* User Info Grid */}
                    <div className="space-y-6">
                        {/* Name Field */}
                        <div className="bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                👤 Full Name
                            </label>
                            {editMode.name ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        disabled={loading}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                    <button
                                        onClick={() => handleFieldUpdate('name')}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold transition-all duration-300 hover:scale-105"
                                        disabled={loading}
                                    >
                                        ✓ Save
                                    </button>
                                    <button
                                        onClick={() => cancelEdit('name')}
                                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-all duration-300"
                                        disabled={loading}
                                    >
                                        ✕ Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium text-gray-800">{user?.name}</span>
                                    <button
                                        onClick={() => setEditMode({ ...editMode, name: true })}
                                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email Field (Read-only) */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📧 Email Address
                            </label>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-medium text-gray-800">{user?.email}</span>
                                <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                                    Cannot be changed
                                </span>
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div className="bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📱 Phone Number
                            </label>
                            {editMode.phone ? (
                                <div className="flex gap-2">
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        disabled={loading}
                                        required
                                        placeholder="Enter your phone number"
                                    />
                                    <button
                                        onClick={() => handleFieldUpdate('phone')}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold transition-all duration-300 hover:scale-105"
                                        disabled={loading}
                                    >
                                        ✓ Save
                                    </button>
                                    <button
                                        onClick={() => cancelEdit('phone')}
                                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-all duration-300"
                                        disabled={loading}
                                    >
                                        ✕ Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium text-gray-800">{user?.phone || 'Not provided'}</span>
                                    <button
                                        onClick={() => setEditMode({ ...editMode, phone: true })}
                                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Role Field (Read-only) */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🎭 Account Role
                            </label>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {user?.role}
                                </span>
                                {user?.role === 'admin' && <span className="text-2xl">👑</span>}
                                {user?.role === 'subadmin' && <span className="text-2xl">⭐</span>}
                                {user?.role === 'partner' && <span className="text-2xl">🤝</span>}
                                {user?.role === 'user' && <span className="text-2xl">👤</span>}
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    {message.text && (
                        <div className={`mt-6 p-4 rounded-xl font-semibold animate-slide-down ${
                            message.type === 'error' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                            message.type === 'success' ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                            'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        }`}>
                            <div className="flex items-center gap-2">
                                {message.type === 'success' && <span className="text-xl">✓</span>}
                                {message.type === 'error' && <span className="text-xl">✗</span>}
                                {message.type === 'info' && <span className="text-xl">ℹ</span>}
                                {message.text}
                            </div>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="mt-6 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
