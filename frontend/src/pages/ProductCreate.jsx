import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api, { productsAPI } from '../lib/api';

const CATEGORY_OPTIONS = [
  'Clothing', 'Electronics', 'Home & Kitchen', 'Beauty', 'Toys', 'Books', 'Sports', 'General'
];

export default function ProductCreate() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', price: '', stock: '', category: 'General', sku: '', weight: '', dimensions: '', tags: '', isPublished: true
  });
  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // preview URLs
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // generate previews
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  useEffect(() => {
    // auto-generate SKU when title set
    if (form.title && !form.sku) {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setForm((s) => ({ ...s, sku: `${slug}-${Date.now().toString().slice(-5)}` }));
    }
  }, [form.title]);

  if (!user) return <div className="p-6 text-red-600">Please login to create products.</div>;
  if (user.role !== 'vendor' && user.role !== 'admin') return <div className="p-6 text-red-600">Vendor access required to create products.</div>;

  const handleFile = (e) => {
    const files = Array.from(e.target.files).slice(0, 6); // limit 6 images
    setImages(files);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!form.title || !form.price) {
      setError('Title and price are required');
      return false;
    }
    if (Number(form.price) <= 0) {
      setError('Price must be greater than zero');
      return false;
    }
    if (form.stock && Number(form.stock) < 0) {
      setError('Stock cannot be negative');
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
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        category: form.category,
        sku: form.sku,
        weight: form.weight,
        dimensions: form.dimensions,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isPublished: !!form.isPublished
      };

      const res = await productsAPI.create(payload);
      const id = res.data.product._id;

      if (images.length) {
        const formData = new FormData();
        images.forEach((f) => formData.append('images', f));
        await api.post(`/products/${id}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (p) => {
            // could show progress; kept minimal for now
          }
        });
      }

      setSuccess('Product created successfully');
      setForm({ title: '', description: '', price: '', stock: '', category: 'General', sku: '', weight: '', dimensions: '', tags: '', isPublished: true });
      setImages([]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Create Product</h1>
        {error && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded">{error}</div>}
        {success && <div className="text-green-600 mb-2 p-2 bg-green-50 rounded">{success}</div>}

        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Product title" className="w-full mt-1 p-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" rows={4} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (INR)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full mt-1 p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" className="w-full mt-1 p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 p-2 border rounded">
                  {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Auto-generated or custom SKU" className="w-full mt-1 p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 0.5" className="w-full mt-1 p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dimensions (L×W×H cm)</label>
                <input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="e.g. 10x5x2" className="w-full mt-1 p-2 border rounded" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2" className="w-full mt-1 p-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Images (up to 6)</label>
              <input type="file" multiple accept="image/*" onChange={handleFile} className="mt-1" />
              <div className="mt-2 flex gap-2 flex-wrap">
                {previews.map((p, i) => (
                  <div key={p} className="relative">
                    <img src={p} alt={`preview-${i}`} className="w-28 h-28 object-cover rounded border" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs">×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                <span className="text-sm">Publish immediately</span>
              </label>
            </div>

            <div className="pt-4">
              <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{loading ? 'Creating...' : 'Create Product'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
