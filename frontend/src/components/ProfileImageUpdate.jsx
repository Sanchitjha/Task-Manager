import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { 
  FaCamera, 
  FaUser, 
  FaUpload, 
  FaSpinner, 
  FaEdit,
  FaTimes,
  FaCheck 
} from 'react-icons/fa';

const ProfileImageUpdate = ({ 
  user, 
  onImageUpdate, 
  size = 'large', 
  showLabel = true,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-12 h-12 text-xl',
    medium: 'w-20 h-20 text-2xl',
    large: 'w-32 h-32 text-4xl',
    xl: 'w-48 h-48 text-6xl'
  };

  const getImageUrl = () => {
    if (previewUrl) return previewUrl;
    if (user?.profileImage) {
      // Handle both absolute and relative paths
      if (user.profileImage.startsWith('http')) {
        return user.profileImage;
      }
      return `${api.getProfileImageUrl(user.profileImage)}${user?.profileImageVersion ? `?v=${user.profileImageVersion}` : ''}`;
    }
    return null;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setShowUploadModal(true);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file || !user?._id) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await api.post(`/users/${user._id}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.profileImage) {
        // Update parent component with new image URL
        if (onImageUpdate) {
          onImageUpdate(response.data.profileImage);
        }
        toast.success('Profile image updated successfully!');
        setShowUploadModal(false);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error(error.response?.data?.msg || 'Failed to upload profile image');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setShowUploadModal(false);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Profile Image Display */}
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-white shadow-lg`}>
        {getImageUrl() ? (
          <img
            src={getImageUrl()}
            alt={user?.name || 'Profile'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600">
            <FaUser />
          </div>
        )}
        
        {/* Camera Icon Overlay */}
        <button
          onClick={triggerFileInput}
          className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center group"
          disabled={isUploading}
        >
          <div className="text-white text-center">
            {isUploading ? (
              <FaSpinner className="animate-spin text-2xl" />
            ) : (
              <>
                <FaCamera className="text-2xl mb-1" />
                <span className="text-xs font-medium">Edit</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* User Info */}
      {showLabel && (
        <div className="mt-3 text-center">
          <p className="font-semibold text-gray-800 text-sm">
            {user?.name || 'Unknown User'}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user?.role || 'user'}
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Update Profile Image
              </h3>
              <p className="text-gray-600 text-sm">
                Preview your new profile image
              </p>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mb-6 flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelUpload}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
                disabled={isUploading}
              >
                <FaTimes />
                Cancel
              </button>
              
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpdate;