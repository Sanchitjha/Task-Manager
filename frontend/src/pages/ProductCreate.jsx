import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../lib/api';

export default function ProductCreate() {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', price: '', stock: '', category: '' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!user) return <div>Please login to create products.</div>;
  if (user.role !== 'vendor' && user.role !== 'admin') return <div>Vendor access required to create products.</div>;

  const handleFile = (e) => {
    setImages(Array.from(e.target.files));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
      const res = await productsAPI.create(data);
      const id = res.data.product._id;
      if (images.length) {
        await productsAPI.uploadImages(id, images);
      }
      setSuccess('Product created');
      setForm({ title: '', description: '', price: '', stock: '', category: '' });
      setImages([]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      <form onSubmit={submit} className="space-y-4">
        <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Title" className="input" />
        <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" className="input" />
        <input value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="Price" className="input" />
        <input value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} placeholder="Stock" className="input" />
        <input value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="Category" className="input" />
        <input type="file" multiple accept="image/*" onChange={handleFile} />

        <button disabled={loading} className="btn">{loading ? 'Creating...' : 'Create Product'}</button>
      </form>
    </div>
  );
}
