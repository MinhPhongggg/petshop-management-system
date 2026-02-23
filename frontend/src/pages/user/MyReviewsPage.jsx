import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiEdit2, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { reviewsApi } from '../../services/api';

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewsApi.getMyReviews({ page: 0, size: 20 });
      setReviews(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Demo data
      setReviews([
        { 
          id: 1, 
          product: { id: 1, name: 'Thức ăn Royal Canin', slug: 'thuc-an-royal-canin', images: [{ url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=100' }] }, 
          rating: 5, 
          comment: 'Sản phẩm rất tốt, chó nhà mình rất thích!', 
          adminReply: 'Cảm ơn bạn đã tin tưởng PetShop!',
          createdAt: '2026-02-20T10:30:00' 
        },
        { 
          id: 2, 
          product: { id: 2, name: 'Vòng cổ cho chó', slug: 'vong-co-cho-cho', images: [{ url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100' }] }, 
          rating: 4, 
          comment: 'Chất lượng tốt, đúng như mô tả', 
          adminReply: null,
          createdAt: '2026-02-18T14:20:00' 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        await reviewsApi.delete(reviewId);
        toast.success('Đã xóa đánh giá');
        fetchReviews();
      } catch (error) {
        toast.error('Không thể xóa đánh giá');
      }
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setEditForm({ rating: review.rating, comment: review.comment });
  };

  const handleSaveEdit = async () => {
    try {
      await reviewsApi.update(editingReview.id, editForm);
      toast.success('Đã cập nhật đánh giá');
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      toast.error('Không thể cập nhật đánh giá');
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        onClick={interactive ? () => onChange(i + 1) : undefined}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
          ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Đánh giá của tôi</h1>
        <div className="text-sm text-gray-500">
          Tổng cộng {reviews.length} đánh giá
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FiStar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có đánh giá</h3>
          <p className="text-gray-500 mb-6">Hãy mua sắm và đánh giá sản phẩm để nhận ưu đãi!</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <FiShoppingBag /> Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <Link to={`/products/${review.product?.slug}`} className="shrink-0">
                  <img
                    src={review.product?.images?.[0]?.url || '/images/placeholder-product.jpg'}
                    alt={review.product?.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                </Link>

                {/* Review Content */}
                <div className="flex-1">
                  <Link 
                    to={`/products/${review.product?.slug}`}
                    className="font-semibold text-gray-800 hover:text-petshop-orange transition-colors"
                  >
                    {review.product?.name}
                  </Link>
                  
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <p className="text-gray-600">{review.comment}</p>

                  {review.adminReply && (
                    <div className="bg-petshop-cream rounded-xl p-4 mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-5 h-5 bg-petshop-orange rounded-full flex items-center justify-center text-white text-xs">P</span>
                          Phản hồi từ PetShop:
                        </span>
                      </p>
                      <p className="text-gray-600 text-sm">{review.adminReply}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                    title="Chỉnh sửa"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Xóa"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Chỉnh sửa đánh giá</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
              <div className="flex gap-1">
                {renderStars(editForm.rating, true, (rating) => setEditForm(prev => ({ ...prev, rating })))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét</label>
              <textarea
                value={editForm.comment}
                onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="input-field w-full"
                placeholder="Chia sẻ trải nghiệm của bạn..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary"
              >
                Lưu thay đổi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;
