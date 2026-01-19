import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const CATEGORY_OPTIONS = [
  'Clothing', 'Electronics', 'Home & Kitchen', 'Beauty', 'Toys', 'Books', 'Sports', 'General'
];

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', 
    description: '', 
    originalPrice: '', 
    discountPercentage: '0',
    coinConversionRate: '1',
    stock: '', 
    category: 'General', 
    sku: '', 
    weight: '', 
    dimensions: '', 
    tags: '', 
    isPublished: true
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    const urls = newImages.map((f) => URL.createObjectURL(f));
    setNewPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newImages]);

  const loadProduct = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      
      setForm({
        title: product.title || '',
        description: product.description || '',
        originalPrice: product.originalPrice || '',
        discountPercentage: product.discountPercentage || 0,
        coinConversionRate: product.coinConversionRate || 1,
        stock: product.stock || '',
        category: product.category || 'General',
        sku: product.sku || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        tags: product.tags ? product.tags.join(', ') : '',
        isPublished: product.isPublished !== false
      });
      
      setExistingImages(product.images || []);
    } catch (error) {
      console.error('Failed to load product:', error);
      setError('Failed to load product details');
    } finally {
      setFetchLoading(false);
    }
  };

  if (!user) return <div className="p-6 text-red-600">Please login to edit products.</div>;
<<<<<<< HEAD
  if (user.role !== 'Partner' && user.role !== 'admin') {
    return <div className="p-6 text-red-600">Vendor access required to edit products.</div>;
=======
  if (user.role !== 'partner' && user.role !== 'partner' && user.role !== 'admin') {
    return <div className="p-6 text-red-600">Partner access required to edit products.</div>;
>>>>>>> b6bc9da1e30255cf3c160ed3ab93bd413ba4f91e
  }

  const handleFile = (e) => {
    const files = Array.from(e.target.files).slice(0, 6 - existingImages.length);
    setNewImages(files);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!form.title || !form.originalPrice) {
      setError('Title and original price are required');
      return false;
    }
    if (Number(form.originalPrice) <= 0) {
      setError('Original price must be greater than zero');
      return false;
    }
    if (form.stock && Number(form.stock) < 0) {
      setError('Stock cannot be negative');
      return false;
    }
    if (Number(form.discountPercentage) < 0 || Number(form.discountPercentage) > 100) {
      setError('Discount percentage must be between 0 and 100');
      return false;
    }
    if (Number(form.coinConversionRate) <= 0) {
      setError('Coin conversion rate must be greater than zero');
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('originalPrice', Number(form.originalPrice));
      formData.append('discountPercentage', Number(form.discountPercentage) || 0);
      formData.append('coinConversionRate', Number(form.coinConversionRate) || 1);
      formData.append('stock', Number(form.stock) || 0);
      formData.append('category', form.category);
      formData.append('sku', form.sku);
      formData.append('weight', form.weight);
      formData.append('dimensions', form.dimensions);
      formData.append('isPublished', form.isPublished);
      
      if (form.tags) {
        const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
        formData.append('tags', JSON.stringify(tagsArray));
      }
      
      formData.append('existingImages', JSON.stringify(existingImages));
      
      newImages.forEach((file) => {
        formData.append('images', file);
      });

      await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Product updated successfully!');
      setTimeout(() => {
        navigate('/seller/inventory');
      }, 1500);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">✏️ Edit Product</h1>
        <Link
          to="/seller/inventory"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Inventory
        </Link>
      </div>

      {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>}
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={submit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Basic Information */}
        <div>
          fractal <h2 className="text-xl font-bold mb-4 border-b pb-2">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter product title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={4}
                placeholder="Enter product description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Original Price (₹) *</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount (%)</label>
              <input
                type="number"
                value={form.discountPercentage}
                onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Coin Conversion Rate</label>
              <input
                type="number"
                value={form.coinConversionRate}
                onChange={(e) => setForm({ ...form, coinConversionRate: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="1.0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Auto-generated"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Product Images</h2>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Current Images:</div>
              <div className="grid grid-cols-3 gap-4">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt={`Product ${i + 1}`} className="w-full h-32 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New Images */}
          <div>
            <label className="block text-sm font-medium mb-1">Add New Images (max 6 total)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFile}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          {newPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {newPreviews.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt={`New ${i + 1}`} className="w-full h-32 object-cover rounded border border-green-500" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Additional Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Weight</label>
              <input
                type="text"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., 500g"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dimensions</label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., 10x20x5 cm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., trending, sale, new"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Publish this product</label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
          <Link
            to="/seller/inventory"
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
