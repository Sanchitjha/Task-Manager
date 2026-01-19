import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { productsAPI } from '../lib/api';

export default function SellerInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  if (!user || (user.role !== 'vendor' && user.role !== 'partner')) {
    return <div className="p-6 text-red-600">Vendor access required.</div>;
  }

  useEffect(() => {
    loadProducts();
  }, [page, search, category]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { vendor: user._id, page, limit: 20 };
      if (search) params.q = search;
      if (category) params.category = category;

      const res = await productsAPI.list(params);
      setProducts(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product? This action cannot be undone.')) return;
    try {
      await productsAPI.remove(id);
      setProducts(p => p.filter(x => x._id !== id));
    } catch (e) {
      alert('Failed to delete: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <Link to="/seller/products/new" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            + Add New Product
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Filter by category..."
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={loadProducts} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Search
            </button>
          </div>
        </div>

        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</div>}
        {loading && <div className="text-gray-600">Loading products...</div>}

        {!loading && products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg mb-4">No products yet</p>
            <Link to="/seller/products/new" className="text-blue-600 hover:underline">
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.images && p.images[0] ? (
                          <img src={`http://localhost:5000${p.images[0]}`} alt={p.title} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded"></div>
                        )}
                        <span className="font-medium">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">₹{p.price}</td>
                    <td className="px-6 py-4">{p.stock} units</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${p.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {p.isPublished ? '✓ Live' : '◉ Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link to={`/seller/products/${p._id}/edit`} className="text-blue-600 hover:underline text-sm">
                        Edit
                      </Link>
                      <button onClick={() => deleteProduct(p._id)} className="text-red-600 hover:underline text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${page === p ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
