import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editName, setEditName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (user?.name) {
            setNewName(user.name);
        }
    }, [user]);

    const handleNameUpdate = async (e) => {
        e.preventDefault();
        if (!newName.trim() || newName === user?.name) {
            setEditName(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Current user state:', user); // Debug log
            if (!user?._id) {
                throw new Error('User ID is missing');
            }
            const response = await api.updateProfile(user._id, { name: newName });
            setUser({ ...user, name: response.data.name });
            setMessage({ type: 'success', text: 'Name updated successfully!' });
            setEditName(false);
        } catch (error) {
            console.error('Error updating name:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.msg || 'Error updating name'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            setLoading(true);
            setMessage({ type: 'info', text: 'Uploading image...' });

            console.log('Uploading image for user:', user); // Debug log
            const response = await api.post(`/users/${user._id}/profile-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update user context with new image
            setUser({ ...user, profileImage: response.data.profileImage });
            setMessage({ type: 'success', text: 'Profile image updated successfully!' });
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

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Profile</h1>
                
                {/* Profile Image Section */}
                <div className="mb-6">
                    <div className="relative inline-block">
                        <img
                            src={user?.profileImage || '/default-avatar.png'}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        />
                        <label 
                            htmlFor="profile-image"
                            className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer"
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

                {/* User Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <div className="mt-1">
                            {editName ? (
                                <form onSubmit={handleNameUpdate} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditName(false);
                                            setNewName(user?.name || '');
                                        }}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </form>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <span className="text-lg">{user?.name}</span>
                                    <button
                                        onClick={() => setEditName(true)}
                                        className="text-blue-500 hover:text-blue-600 focus:outline-none"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 text-lg">{user?.email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <div className="mt-1 text-lg capitalize">{user?.role}</div>
                    </div>
                </div>

                {/* Status Messages */}
                {message.text && (
                    <div className={`mt-4 p-3 rounded ${
                        message.type === 'error' ? 'bg-red-100 text-red-700' :
                        message.type === 'success' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Debug Information */}
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
                    <pre className="whitespace-pre-wrap">
                        {JSON.stringify({ user }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default Profile;