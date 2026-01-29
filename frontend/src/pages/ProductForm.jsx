import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaPlus, FaImage, FaTag, FaRupeeSign, FaCoins, FaBoxes, 
  FaToggleOn, FaToggleOff, FaUpload, FaTimes, FaCheck,
  FaSpinner, FaEdit, FaTrash, FaEye, FaArrowLeft
} from 'react-icons/fa';

const ProductForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    originalPrice: '',
    discountCoins: '',
    stockQuantity: '',
    status: 'active',
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = [
    'grocery', 'fashion', 'electronics', 'pharmacy', 'restaurant', 
    'beauty', 'books', 'sports', 'toys', 'automotive', 'home', 'other'
  ];

  // Load product data for editing
  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [id, isEdit]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/${id}`);
      const product = response.data;
      
      setFormData({
        name: product.name || '',
        category: product.category || '',
        description: product.description || '',
        originalPrice: product.originalPrice?.toString() || '',
        discountCoins: product.discountCoins?.toString() || '',
        stockQuantity: product.stockQuantity?.toString() || '',
        status: product.status || 'active',
        images: product.images || []
      });
      
      setImagePreviews(product.images || []);
      
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imagePreviews.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    
    // If editing, also remove from formData.images
    if (isEdit && index < formData.images.length) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return formData.images;
    
    try {
      setImageUploading(true);
      const uploadPromises = imageFiles.map(file => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/api/upload/product-image', formData);
      });
      
      const responses = await Promise.all(uploadPromises);
      const newImageUrls = responses.map(res => res.data.url);
      
      return [...formData.images, ...newImageUrls];
      
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  const calculateFinalPrice = () => {
    const originalPrice = parseFloat(formData.originalPrice) || 0;
    const discountCoins = parseFloat(formData.discountCoins) || 0;
    const coinValue = 1; // 1 coin = ₹1 (configurable)
    
    return Math.max(0, originalPrice - (discountCoins * coinValue));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'partner') {
      toast.error('Partner access required');
      return;
    }
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
      toast.error('Please enter a valid original price');
      return;
    }
    
    if (parseFloat(formData.discountCoins) < 0) {
      toast.error('Discount coins cannot be negative');
      return;
    }
    
    try {
      setLoading(true);
      
      // Upload new images if any
      const allImageUrls = await uploadImages();
      
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        originalPrice: parseFloat(formData.originalPrice),
        discountCoins: parseFloat(formData.discountCoins) || 0,
        finalPrice: calculateFinalPrice(),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        status: formData.status,
        images: allImageUrls,
        partner: user._id
      };
      
      if (isEdit) {
        await api.put(`/api/products/${id}`, productData);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/api/products', productData);
        toast.success('Product created successfully!');
      }
      
      navigate('/products');
      
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/products')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-4"
            >
              <FaArrowLeft />
              <span>Back to Products</span>
            </button>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update your product details' : 'Create a new product for your store'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaTag className="inline mr-2 text-blue-500" />
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter stock quantity"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Describe your product..."
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaRupeeSign className="mr-2 text-green-500" />
                  Pricing & Discounts
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Original Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaCoins className="inline mr-1 text-orange-500" />
                      Discount in Coins
                    </label>
                    <input
                      type="number"
                      name="discountCoins"
                      value={formData.discountCoins}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Final Price (₹)
                    </label>
                    <div className="px-4 py-3 border-2 border-green-200 rounded-xl bg-green-50 text-green-700 font-bold text-lg">
                      ₹{calculateFinalPrice().toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated (1 coin = ₹1)</p>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  <FaImage className="inline mr-2 text-purple-500" />
                  Product Images (Max 5)
                </label>
                
                {/* Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>
                  ))}
                  
                  {imagePreviews.length < 5 && (
                    <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors duration-200 bg-gray-50 hover:bg-blue-50">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={imageUploading}
                      />
                      {imageUploading ? (
                        <FaSpinner className="text-2xl text-blue-500 animate-spin" />
                      ) : (
                        <>
                          <FaUpload className="text-2xl text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Upload Image</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Status
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      formData.status === 'active'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <FaToggleOn className={formData.status === 'active' ? 'text-white' : 'text-gray-500'} />
                    <span>Active</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      formData.status === 'inactive'
                        ? 'bg-gray-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <FaToggleOff className={formData.status === 'inactive' ? 'text-white' : 'text-gray-500'} />
                    <span>Inactive</span>
                  </button>
                </div>
              </div>

              {/* Important Policy Notice */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <h3 className="font-semibold text-red-800 mb-2">Important Policy:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• No delivery or shipping service</li>
                  <li>• No returns or refunds allowed</li>
                  <li>• All purchases must be collected from your store</li>
                  <li>• Customers pay in cash after coin discount</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all duration-300"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading || imageUploading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;