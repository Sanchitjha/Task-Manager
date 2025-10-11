import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../lib/api';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage({ type: 'info', text: 'Updating profile...' });

            const response = await userAPI.updateProfile(user._id, { name: formData.name });
            
            if (response.data) {
                setUser(prev => ({ ...prev, name: response.data.name }));
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setEditMode(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.msg || 'Error updating profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            setMessage({ type: 'info', text: 'Uploading image...' });
            
            const response = await userAPI.uploadImage(user._id, file);
            
            if (response.data) {
                setUser(prev => ({ ...prev, profileImage: response.data.profileImage }));
                setMessage({ type: 'success', text: 'Profile image updated successfully!' });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.msg || 'Error uploading image'
            });
        } finally {
            setLoading(false);
        }

        try {
            setLoading(true);
            setMessage({ type: 'info', text: 'Uploading image...' });

            // Upload the image
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        {editMode ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        ) : (
                            <div className="mt-1 text-lg flex items-center gap-2">
                                {user?.name}
                                <button
                                    type="button"
                                    onClick={() => setEditMode(true)}
                                    className="text-blue-500 hover:text-blue-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 text-lg">{user?.email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <div className="mt-1 text-lg capitalize">{user?.role}</div>
                    </div>
                    {editMode && (
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditMode(false);
                                    setFormData({ name: user?.name || '' });
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>

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
            </div>
        </div>
    );
};

export default Profile;