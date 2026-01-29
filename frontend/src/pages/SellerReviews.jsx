import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function SellerReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  if (!user || user.role !== 'partner') {
    return <div className="p-6 text-red-600">Partner access required.</div>;
  }

  useEffect(() => {
    loadReviews();
  }, [page]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/partner/reviews', { params: { page, limit: 20 } });
      setReviews(res.data.reviews || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Customer Reviews</h1>

        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading && <div className="text-gray-600">Loading reviews...</div>}

        {!loading && reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.reviewer?.profileImage ? `http://localhost:5000${review.reviewer.profileImage}` : '/default-avatar.png'}
                      alt={review.reviewer?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{review.reviewer?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-yellow-500">{renderStars(review.rating)}</div>
                    {review.verified && <p className="text-xs text-green-600">✓ Verified Purchase</p>}
                  </div>
                </div>

                {review.title && <p className="font-semibold mb-2">{review.title}</p>}
                {review.comment && <p className="text-gray-700 mb-4">{review.comment}</p>}

                {/* Rating Breakdown */}
                {(review.productQuality || review.shippingSpeed || review.customerService) && (
                  <div className="bg-gray-50 p-3 rounded mb-3 text-sm space-y-1">
                    {review.productQuality && <p>📦 Product Quality: {renderStars(review.productQuality)}</p>}
                    {review.shippingSpeed && <p>🚚 Shipping Speed: {renderStars(review.shippingSpeed)}</p>}
                    {review.customerService && <p>💬 Customer Service: {renderStars(review.customerService)}</p>}
                    {review.packaging && <p>📫 Packaging: {renderStars(review.packaging)}</p>}
                  </div>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {review.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${img}`}
                        alt={`Review ${idx}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                {/* Helpful Counter */}
                <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                  👍 {review.helpful} found this helpful
                </div>
              </div>
            ))}
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
