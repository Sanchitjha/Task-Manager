import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, 
  FaBoxes, FaCoins, FaRupeeSign, FaToggleOn, FaToggleOff,
  FaImage, FaSpinner, FaSort, FaCalendarAlt, FaChartBar
} from 'react-icons/fa';

const ProductManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0
  });

  const categories = [
    'grocery', 'fashion', 'electronics', 'pharmacy', 'restaurant', 
    'beauty', 'books', 'sports', 'toys', 'automotive', 'home', 'other'
  ];

  const itemsPerPage = 12;

  // Load products
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        partner: user._id,
        sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      
      const response = await api.get('/products', { params });
      
      setProducts(response.data.products || []);
      setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
      
      // Fetch stats
      const statsResponse = await api.get(`/products/stats?partner=${user._id}`);
      setStats(statsResponse.data);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await api.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const toggleStatus = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/api/products/${productId}/status`, { status: newStatus });
      toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (!user || user.role !== 'partner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Partner access required to manage products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Product Management
              </h1>
              <p className="text-gray-600 flex items-center">
                <FaBoxes className="mr-2" />
                Manage your store inventory
              </p>
            </div>
            <Link
              to="/products/create"
              className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 w-fit"
            >
              <FaPlus />
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <FaBoxes className="text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Active Products</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <FaToggleOn className="text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Inactive Products</p>
                <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl">
                <FaToggleOff className="text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-red-600">{stats.lowStock}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                <FaChartBar className="text-2xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="originalPrice">Price</option>
              <option value="discountCoins">Discount</option>
              <option value="stockQuantity">Stock</option>
            </select>

            {/* Sort Order & Reset */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FaSort />
                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="text-4xl text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaImage className="text-4xl text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {product.status}
                    </div>

                    {/* Low Stock Warning */}
                    {product.stockQuantity && product.stockQuantity < 5 && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                        Low Stock
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-semibold capitalize">{product.category}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="font-semibold text-green-600">₹{product.originalPrice}</span>
                      </div>
                      
                      {product.discountCoins > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-semibold text-orange-600 flex items-center">
                            <FaCoins className="mr-1" />
                            {product.discountCoins}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Final Price:</span>
                        <span className="font-bold text-blue-600">₹{product.finalPrice}</span>
                      </div>
                      
                      {product.stockQuantity !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Stock:</span>
                          <span className={`font-semibold ${
                            product.stockQuantity < 5 ? 'text-red-600' : 'text-gray-800'
                          }`}>
                            {product.stockQuantity}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/products/edit/${product._id}`}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <FaEdit className="text-sm" />
                        <span className="text-sm">Edit</span>
                      </Link>
                      
                      <button
                        onClick={() => toggleStatus(product._id, product.status)}
                        className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                          product.status === 'active'
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {product.status === 'active' ? <FaToggleOff /> : <FaToggleOn />}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      currentPage === i + 1
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            )}

            {/* Empty State */}
            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <FaBoxes className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || selectedCategory || selectedStatus
                    ? 'Try adjusting your filters'
                    : 'Start by adding your first product'
                  }
                </p>
                <Link
                  to="/products/create"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <FaPlus />
                  <span>Add New Product</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;