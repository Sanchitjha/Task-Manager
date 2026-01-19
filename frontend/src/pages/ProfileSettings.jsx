import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileImageUpdate from '../components/ProfileImageUpdate';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { 
  FaUser, 
  FaSave, 
  FaEdit, 
  FaShoppingBag, 
  FaUserShield, 
  FaEnvelope, 
  FaPhone,
  FaMapMarkerAlt,
  FaStore,
  FaSpinner,
  FaKey
} from 'react-icons/fa';

const ProfileSettings = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Partner specific fields
    shopName: '',
    ownerName: '',
    description: '',
    category: '',
    street: '',
    area: '',
    city: '',
    pincode: '',
    state: '',
    country: 'India',
    contactNumber: '',
    whatsappNumber: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        shopName: currentUser.shopDetails?.shopName || '',
        ownerName: currentUser.shopDetails?.ownerName || '',
        description: currentUser.shopDetails?.description || '',
        category: currentUser.shopDetails?.category || '',
        street: currentUser.shopDetails?.address?.street || '',
        area: currentUser.shopDetails?.address?.area || '',
        city: currentUser.shopDetails?.address?.city || '',
        pincode: currentUser.shopDetails?.address?.pincode || '',
        state: currentUser.shopDetails?.address?.state || '',
        country: currentUser.shopDetails?.address?.country || 'India',
        contactNumber: currentUser.shopDetails?.contactNumber || '',
        whatsappNumber: currentUser.shopDetails?.whatsappNumber || ''
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpdate = async (newImageUrl) => {
    // Refresh user data to get the updated profile image
    if (refreshUser) {
      await refreshUser();
    }
    toast.success('Profile updated successfully!');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      // Add partner-specific data if user is a partner
      if (currentUser.role === 'Partner') {
        updateData.shopDetails = {
          shopName: formData.shopName,
          ownerName: formData.ownerName,
          description: formData.description,
          category: formData.category,
          address: {
            street: formData.street,
            area: formData.area,
            city: formData.city,
            pincode: formData.pincode,
            state: formData.state,
            country: formData.country
          },
          contactNumber: formData.contactNumber,
          whatsappNumber: formData.whatsappNumber
        };
      }

      const response = await api.patch(`/users/${currentUser._id}`, updateData);
      
      if (response.data) {
        await refreshUser?.();
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.msg || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Partner':
        return <FaStore className="text-green-500" />;
      case 'admin':
        return <FaUserShield className="text-red-500" />;
      case 'subadmin':
        return <FaUserShield className="text-blue-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Partner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'subadmin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Profile Image Section */}
            <div className="flex-shrink-0">
              <ProfileImageUpdate
                user={currentUser}
                onImageUpdate={handleImageUpdate}
                size="xl"
                showLabel={false}
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-800">
                  {currentUser.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(currentUser.role)} flex items-center gap-2`}>
                  {getRoleIcon(currentUser.role)}
                  {currentUser.role === 'Partner' ? 'Partner' : currentUser.role}
                </span>
              </div>

              <div className="space-y-2 text-gray-600">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <FaEnvelope className="text-sm" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <FaPhone className="text-sm" />
                  <span>{currentUser.phone}</span>
                </div>
                {currentUser.role === 'Partner' && currentUser.shopDetails?.shopName && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <FaStore className="text-sm" />
                    <span>{currentUser.shopDetails.shopName}</span>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <div className="mt-6">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 mx-auto md:mx-0"
                >
                  <FaEdit />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaEdit />
              Edit Profile Information
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Partner Specific Information */}
              {currentUser.role === 'Partner' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Name
                      </label>
                      <input
                        type="text"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your shop name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Owner Name
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter owner name"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Describe your business"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Category</option>
                        <option value="grocery">Grocery</option>
                        <option value="fashion">Fashion</option>
                        <option value="electronics">Electronics</option>
                        <option value="pharmacy">Pharmacy</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="beauty">Beauty & Personal Care</option>
                        <option value="books">Books & Stationery</option>
                        <option value="sports">Sports & Fitness</option>
                        <option value="toys">Toys & Games</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Business contact number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="WhatsApp number"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <FaMapMarkerAlt />
                      Business Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="Street address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area/Locality
                        </label>
                        <input
                          type="text"
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="Area or locality"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="City"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="Pincode"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="State"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;