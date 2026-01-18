import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  FaStore, FaUser, FaPhone, FaLock, FaMapMarkerAlt, 
  FaClock, FaTag, FaCamera, FaIdCard, FaArrowRight,
  FaEye, FaEyeSlash, FaSpinner, FaCheck
} from 'react-icons/fa';

const PartnerRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
    
    // Shop Details
    shopName: '',
    ownerName: '',
    description: '',
    category: '',
    
    // Address
    street: '',
    area: '',
    city: '',
    pincode: '',
    state: '',
    country: 'India',
    
    // Location
    latitude: '',
    longitude: '',
    mapUrl: '',
    
    // Contact & Timing
    contactNumber: '',
    whatsappNumber: '',
    openTime: '',
    closeTime: '',
    workingDays: [],
    isOpen24x7: false,
    
    // Verification (Optional)
    shopPhoto: null,
    idProof: null
  });

  const categories = [
    'grocery', 'fashion', 'electronics', 'pharmacy', 'restaurant', 
    'beauty', 'books', 'sports', 'toys', 'other'
  ];

  const weekDays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWorkingDaysChange = (day) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.files[0]
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            mapUrl: `https://maps.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`
          }));
          setLoading(false);
          toast.success('Location captured successfully!');
        },
        (error) => {
          setLoading(false);
          toast.error('Unable to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const sendOTP = async () => {
    if (!formData.phone && !formData.email) {
      toast.error('Please enter phone number or email');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/send-otp', {
        phone: formData.phone,
        email: formData.email,
        type: 'registration'
      });
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/verify-otp', {
        phone: formData.phone,
        email: formData.email,
        otp: formData.otp,
        type: 'registration'
      });
      setOtpVerified(true);
      toast.success('OTP verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error('Please verify OTP first');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'shopPhoto' && key !== 'idProof' && key !== 'confirmPassword') {
          if (key === 'workingDays') {
            submitData.append(key, JSON.stringify(formData[key]));
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      // Add files
      if (formData.shopPhoto) {
        submitData.append('shopPhoto', formData.shopPhoto);
      }
      if (formData.idProof) {
        submitData.append('idProof', formData.idProof);
      }

      await api.post('/auth/partner-register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Registration successful! Please wait for admin approval.');
      navigate('/login');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !otpVerified) {
      toast.error('Please verify OTP before proceeding');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
              transition-all duration-300 transform hover:scale-110
              ${currentStep >= step 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-500'
              }
            `}>
              {currentStep > step ? <FaCheck /> : step}
            </div>
            {step < 4 && (
              <div className={`
                w-8 h-1 transition-all duration-300
                ${currentStep > step ? 'bg-blue-500' : 'bg-gray-200'}
              `} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Partner Registration
        </h2>
        <p className="text-gray-600">Join our partner network and grow your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <FaUser className="inline mr-2 text-blue-500" />
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Email Address (Optional)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="Enter email address"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <FaPhone className="inline mr-2 text-green-500" />
            Mobile Number *
          </label>
          <div className="flex">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              placeholder="Enter mobile number"
              required
            />
            <button
              type="button"
              onClick={sendOTP}
              disabled={loading || !formData.phone}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-r-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : 'Send OTP'}
            </button>
          </div>
        </div>

        {/* OTP */}
        {otpSent && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Enter OTP *
            </label>
            <div className="flex">
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
              />
              <button
                type="button"
                onClick={verifyOTP}
                disabled={loading || otpVerified || !formData.otp}
                className={`px-6 py-3 rounded-r-xl transition-all duration-300 flex items-center ${
                  otpVerified 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transform hover:scale-105'
                } disabled:opacity-50`}
              >
                {loading ? <FaSpinner className="animate-spin" /> : otpVerified ? <FaCheck /> : 'Verify'}
              </button>
            </div>
          </div>
        )}

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <FaLock className="inline mr-2 text-red-500" />
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              placeholder="Create password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              placeholder="Confirm password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Shop Details
        </h2>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shop Name */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700">
            <FaStore className="inline mr-2 text-blue-500" />
            Shop Name *
          </label>
          <input
            type="text"
            name="shopName"
            value={formData.shopName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="Enter your shop name"
            required
          />
        </div>

        {/* Owner Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Owner Name *
          </label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="Enter owner name"
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <FaTag className="inline mr-2 text-purple-500" />
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            required
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700">
            Shop Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="Brief description of your shop"
          />
        </div>

        {/* Contact Numbers */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Shop Contact Number *
          </label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="Enter shop contact number"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            WhatsApp Number (Optional)
          </label>
          <input
            type="tel"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="Enter WhatsApp number"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Location & Timing
        </h2>
        <p className="text-gray-600">Help customers find you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700">
            <FaMapMarkerAlt className="inline mr-2 text-red-500" />
            Full Address *
          </label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="Street, building number, landmark"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Area *</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="Area/Locality"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="City"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="Pincode"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">State *</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            placeholder="State"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700">GPS Location</label>
          <div className="flex space-x-4">
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              placeholder="Latitude"
            />
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              placeholder="Longitude"
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaMapMarkerAlt />}
            </button>
          </div>
        </div>

        {/* Timing */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              <FaClock className="inline mr-2 text-orange-500" />
              Shop Timing *
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isOpen24x7"
                checked={formData.isOpen24x7}
                onChange={handleInputChange}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Open 24/7</span>
            </label>
          </div>
          
          {!formData.isOpen24x7 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Opening Time</label>
                <input
                  type="time"
                  name="openTime"
                  value={formData.openTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Closing Time</label>
                <input
                  type="time"
                  name="closeTime"
                  value={formData.closeTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Working Days</label>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              {weekDays.map(day => (
                <label key={day} className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.workingDays.includes(day)}
                    onChange={() => handleWorkingDaysChange(day)}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{day.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Verification Documents
        </h2>
        <p className="text-gray-600">Optional but helps in faster approval</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shop Photo */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <FaCamera className="inline mr-2 text-green-500" />
            Shop Photo (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all duration-300">
            <input
              type="file"
              name="shopPhoto"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="shopPhoto"
            />
            <label htmlFor="shopPhoto" className="cursor-pointer">
              <FaCamera className="mx-auto text-4xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload shop photo</p>
              {formData.shopPhoto && (
                <p className="text-sm text-green-600 mt-2">{formData.shopPhoto.name}</p>
              )}
            </label>
          </div>
        </div>

        {/* ID Proof */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <FaIdCard className="inline mr-2 text-blue-500" />
            ID Proof (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all duration-300">
            <input
              type="file"
              name="idProof"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
              id="idProof"
            />
            <label htmlFor="idProof" className="cursor-pointer">
              <FaIdCard className="mx-auto text-4xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload ID proof</p>
              <p className="text-xs text-gray-500">Aadhaar, PAN, Driving License</p>
              {formData.idProof && (
                <p className="text-sm text-green-600 mt-2">{formData.idProof.name}</p>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-8">
        <h3 className="font-semibold text-blue-800 mb-2">Important Information:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Your account will be created with "Pending" approval status</li>
          <li>• Admin will review your application and approve/reject it</li>
          <li>• You'll receive notification once your application is processed</li>
          <li>• Uploading documents helps in faster approval</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          {renderStepIndicator()}

          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
            <form onSubmit={handleSubmit}>
              {/* Render Current Step */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all duration-300 flex items-center space-x-2"
                  >
                    <span>Previous</span>
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 ml-auto"
                  >
                    <span>Next</span>
                    <FaArrowRight />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 ml-auto"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <FaCheck />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegister;