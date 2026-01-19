import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function SellerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({});

  if (!user || (user.role !== 'partner' && user.role !== 'partner')) {
    return <div className="p-6 text-red-600">Partner access required.</div>;
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/vendor/profile');
      setProfile(res.data.profile);
      setForm(res.data.profile || {});
    } catch (e) {
      console.error(e);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      await api.put('/vendor/profile', form);
      setSuccess('Profile updated successfully!');
      loadProfile();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm({
        ...form,
        [parent]: { ...(form[parent] || {}), [child]: value }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Store Settings</h1>

        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</div>}
        {success && <div className="text-green-600 mb-4 p-3 bg-green-50 rounded">{success}</div>}

        {loading ? (
          <div className="text-gray-600">Loading profile...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Store Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Store Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={form.storeName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Store Description</label>
                  <textarea
                    name="storeDescription"
                    value={form.storeDescription || ''}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Business Category</label>
                  <select
                    name="businessCategory"
                    value={form.businessCategory || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="books">Books</option>
                    <option value="home">Home & Garden</option>
                    <option value="sports">Sports</option>
                    <option value="beauty">Beauty</option>
                    <option value="groceries">Groceries</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Business Address</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="address.street"
                  placeholder="Street Address"
                  value={form.address?.street || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="address.city"
                    placeholder="City"
                    value={form.address?.city || ''}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    name="address.state"
                    placeholder="State"
                    value={form.address?.state || ''}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded"
                  />
                </div>
                <input
                  type="text"
                  name="address.zipCode"
                  placeholder="ZIP Code"
                  value={form.address?.zipCode || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Store Policies</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Policy</label>
                  <textarea
                    name="shippingPolicy"
                    value={form.shippingPolicy || ''}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Return Policy</label>
                  <textarea
                    name="returnPolicy"
                    value={form.returnPolicy || ''}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cancellation Policy</label>
                  <textarea
                    name="cancelPolicy"
                    value={form.cancelPolicy || ''}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={loadProfile}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
