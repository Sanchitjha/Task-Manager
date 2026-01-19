import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../lib/api';
import { Link } from 'react-router-dom';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <div className="p-6">Please login.</div>;
  if (user.role !== 'partner' && user.role !== 'partner' && user.role !== 'admin') {
    return <div className="p-6 text-red-600">Vendor/Partner access required.</div>;
  }

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.list({ vendor: user._id, limit: 100 });
      setProducts(res.data.items || []);
    } catch (e) {
      console.error('Failed to load products', e);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [user._id]);

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productsAPI.remove(id);
      setProducts(p => p.filter(x => x._id !== id));
    } catch (e) {
      alert('Failed to delete: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <Link to="/partner/products/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + New Product
        </Link>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div className="text-gray-600">Loading products...</div>}

      {!loading && products.length === 0 && (
        <div className="text-gray-500">No products yet. <Link to="/partner/products/new" className="text-blue-600 hover:underline">Create one!</Link></div>
      )}

      <div className="grid gap-4">
        {products.map((p) => (
          <div key={p._id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
            <div className="flex gap-4 flex-1">
              {p.images && p.images[0] && (
                <img src={`http://localhost:5000${p.images[0]}`} alt={p.title} className="w-20 h-20 object-cover rounded" />
              )}
              <div>
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.description?.substring(0, 60)}...</p>
                <p className="text-sm mt-2"><strong>Price:</strong> ₹{p.price} | <strong>Stock:</strong> {p.stock}</p>
                <p className="text-xs text-gray-500 mt-1"><strong>Status:</strong> {p.isPublished ? '✅ Published' : '❌ Draft'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/partner/products/${p._id}/edit`} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Edit
              </Link>
              <button onClick={() => deleteProduct(p._id)} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
