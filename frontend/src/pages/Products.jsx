import React, { useEffect, useState } from 'react';
import { productsAPI } from '../lib/api';

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.list({ page: 1, limit: 24 });
      setItems(res.data.items || []);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {loading && <div>Loading...</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p._id} className="border rounded p-4">
            {p.images && p.images[0] ? (
              <img src={`http://localhost:5000${p.images[0]}`} alt={p.title} className="h-40 w-full object-cover mb-2 rounded" />
            ) : (
              <div className="h-40 w-full bg-gray-100 mb-2 flex items-center justify-center">No image</div>
            )}
            <h2 className="font-semibold">{p.title}</h2>
            <p className="text-sm text-gray-600">{p.category}</p>
            <p className="mt-2 font-bold">₹{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
