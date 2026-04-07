import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { productsAPI } from '../lib/api';
import { Search, SlidersHorizontal, ChevronRight, Star, X } from 'lucide-react';

const CATEGORIES = [
  'All', 'Electronics', 'Fashion', 'Home & Garden', 'Sports',
  'Books', 'Grocery', 'Beauty', 'Toys', 'Automotive', 'Health',
];

const SORT_OPTIONS = [
  { value: 'featured',    label: 'Featured' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'newest',      label: 'Newest Arrivals' },
  { value: 'rating',      label: 'Avg. Customer Review' },
];

function StarRating({ rating = 4, small = false }) {
  const size = small ? 'text-xs' : 'text-sm';
  return (
    <span className={`stars ${size}`}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>
  );
}

function ProductCard({ product }) {
  const price    = product.finalPrice || product.originalPrice || 0;
  const original = product.originalPrice || 0;
  const discount = product.discountPercentage || 0;
  const imageUrl = product.images?.[0] ? api.getProfileImageUrl(product.images[0]) : null;
  const inStock  = (product.stock || 0) > 0;

  const addToCart = (e) => {
    e.preventDefault();
    try {
      const cart = JSON.parse(localStorage.getItem('shopCart') || '[]');
      const idx  = cart.findIndex((i) => i._id === product._id);
      if (idx >= 0) {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem('shopCart', JSON.stringify(cart));
      // Simple feedback
      const btn = e.currentTarget;
      const orig = btn.textContent;
      btn.textContent = '✓ Added!';
      btn.classList.add('bg-green-500');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('bg-green-500');
      }, 1200);
    } catch { /* ignore */ }
  };

  return (
    <div className="product-card bg-white group flex flex-col">
      {/* Image */}
      <Link to={`/product/${product._id}`} className="block relative">
        <div className="h-44 sm:h-48 bg-white flex items-center justify-center overflow-hidden p-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className="h-full w-full items-center justify-center text-4xl text-gray-300"
            style={{ display: imageUrl ? 'none' : 'flex' }}
          >
            📦
          </div>
        </div>
        {/* Badges */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-amazon-red text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-medium">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${product._id}`}>
          <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-snug mb-1 hover:text-amazon-link">
            {product.title}
          </p>
        </Link>

        <StarRating rating={product.ratings || 4} small />

        <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
          <span className="text-amazon-red font-medium">
            <span className="text-xs align-top">₹</span>
            <span className="text-lg">{Math.floor(price)}</span>
          </span>
          {discount > 0 && (
            <span className="text-amazon-gray line-through text-xs">₹{original}</span>
          )}
        </div>

        {discount > 0 && (
          <p className="text-amazon-green text-xs">Save {discount}%</p>
        )}

        {product.coinDiscount > 0 && (
          <p className="text-orange-500 text-xs mt-0.5 font-medium">
            🪙 Save extra with {product.coinDiscount} coins
          </p>
        )}

        <p className={`text-xs mt-1 ${inStock ? 'text-amazon-green' : 'text-red-500'}`}>
          {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
        </p>

        <div className="mt-auto pt-2 flex gap-2">
          <button
            onClick={addToCart}
            disabled={!inStock}
            className="flex-1 bg-amazon-orange hover:bg-amazon-orange-light disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 text-xs font-medium py-1.5 rounded-lg transition-colors"
          >
            Add to Cart
          </button>
          <Link
            to={`/product/${product._id}`}
            className="px-3 py-1.5 border border-amazon-border text-xs rounded-lg hover:bg-amazon-light-gray transition-colors text-gray-700"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-sm border border-amazon-border overflow-hidden">
      <div className="h-44 bg-gray-100 shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 shimmer rounded" />
        <div className="h-3 bg-gray-100 shimmer rounded w-3/4" />
        <div className="h-5 bg-gray-100 shimmer rounded w-1/2 mt-1" />
        <div className="h-7 bg-gray-100 shimmer rounded mt-2" />
      </div>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);

  const [search, setSearch]     = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort]         = useState('featured');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: LIMIT,
        ...(search   ? { search }   : {}),
        ...(category !== 'All' ? { category } : {}),
        ...(minPrice ? { minPrice } : {}),
        ...(maxPrice ? { maxPrice } : {}),
        sort,
      };
      const res = await productsAPI.list(params);
      setItems(res.data.items || []);
      setTotal(res.data.total || res.data.items?.length || 0);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort, minPrice, maxPrice]);

  useEffect(() => { load(); }, [load]);

  // Sync URL search param → state
  useEffect(() => {
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    if (s) setSearch(s);
    if (c) setCategory(c);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const clearFilter = (type) => {
    if (type === 'search') { setSearch(''); }
    if (type === 'category') { setCategory('All'); }
    if (type === 'price') { setMinPrice(''); setMaxPrice(''); }
    setPage(1);
  };

  const activeFilters = [
    search ? { key: 'search', label: `"${search}"` } : null,
    category !== 'All' ? { key: 'category', label: category } : null,
    (minPrice || maxPrice) ? { key: 'price', label: `₹${minPrice || '0'} – ₹${maxPrice || '∞'}` } : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-amazon-bg">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-amazon-border">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          {/* Search row */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-4 py-2.5 border border-amazon-border rounded-lg text-sm focus:ring-2 focus:ring-amazon-orange/30 focus:border-amazon-orange outline-none bg-white"
              />
            </div>
            <button type="submit" className="btn-amazon px-5">Search</button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn-amazon-secondary px-4 flex items-center gap-1.5"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </form>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(({ key, label }) => (
                <span key={key} className="inline-flex items-center gap-1.5 bg-amazon-orange/10 text-amazon-orange-dark border border-amazon-orange/30 text-xs px-3 py-1 rounded-full font-medium">
                  {label}
                  <button onClick={() => clearFilter(key)} className="hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6 flex gap-6">
        {/* ── Sidebar Filters ──────────────────────────────────────── */}
        <aside className={`w-56 shrink-0 space-y-5 ${showFilters ? 'block' : 'hidden md:block'}`}>
          {/* Categories */}
          <div className="bg-white rounded-sm border border-amazon-border p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3 pb-2 border-b border-amazon-border">Department</h3>
            <ul className="space-y-1">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => { setCategory(cat); setPage(1); }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                      category === cat
                        ? 'font-bold text-amazon-orange-dark bg-amazon-orange/5'
                        : 'text-gray-600 hover:text-amazon-link'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range */}
          <div className="bg-white rounded-sm border border-amazon-border p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3 pb-2 border-b border-amazon-border">Price (₹)</h3>
            <div className="space-y-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2 border border-amazon-border rounded text-sm focus:ring-1 focus:ring-amazon-orange outline-none"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2 border border-amazon-border rounded text-sm focus:ring-1 focus:ring-amazon-orange outline-none"
              />
              <button
                onClick={() => { setPage(1); load(); }}
                className="w-full btn-amazon py-2 text-xs font-medium"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Sort (mobile) */}
          <div className="bg-white rounded-sm border border-amazon-border p-4 md:hidden">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Sort By</h3>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="w-full border border-amazon-border rounded px-3 py-2 text-sm"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-amazon-border">
            <p className="text-sm text-gray-600">
              {loading ? 'Loading…' : `${total} result${total !== 1 ? 's' : ''}`}
              {category !== 'All' && <span className="font-medium"> in <span className="text-gray-900">{category}</span></span>}
            </p>
            <div className="hidden md:flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="border border-amazon-border rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-amazon-orange outline-none"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-sm border border-amazon-border">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No products found</h2>
              <p className="text-gray-500 text-sm mb-5">Try adjusting your search or filters</p>
              <button onClick={() => { setSearch(''); setCategory('All'); setMinPrice(''); setMaxPrice(''); }} className="btn-amazon px-6">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {total > LIMIT && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-amazon-border rounded text-sm disabled:opacity-40 hover:bg-amazon-light-gray"
                  >
                    ← Prev
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {Math.ceil(total / LIMIT)}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / LIMIT)}
                    className="px-4 py-2 border border-amazon-border rounded text-sm disabled:opacity-40 hover:bg-amazon-light-gray"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
