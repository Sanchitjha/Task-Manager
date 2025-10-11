import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const ProfileImage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            setError(null);
            await api.uploadProfileImage(user.id, file);
            // Reload the page to see the new image
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.msg || 'Error uploading image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <img
                    src={user?.profileImage ? user.profileImage : '/default-avatar.png'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                />
                <label 
                    htmlFor="profile-image" 
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </label>
                <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                />
            </div>
            {loading && <p className="text-blue-500">Uploading...</p>}
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
};

export default ProfileImage;