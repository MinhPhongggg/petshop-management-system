import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiStar, FiEye, FiEyeOff, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { reviewsApi } from '../../services/api';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [replyModal, setReplyModal] = useState({ open: false, review: null, reply: '' });
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, ratingFilter, statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fetch all reviews (admin endpoint)
      const response = await reviewsApi.getAll({ 
        page: pagination.page, 
        size: 10,
        rating: ratingFilter || undefined,
        hidden: statusFilter === 'hidden' ? true : statusFilter === 'visible' ? false : undefined
      });
      const data = response.data;
      setReviews(data.content || data);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || data.length
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Demo data for display
      setReviews([
        { id: 1, user: { fullName: 'Nguyễn Văn A' }, product: { name: 'Thức ăn Royal Canin' }, rating: 5, comment: 'Sản phẩm rất tốt, chó nhà mình rất thích!', hidden: false, adminReply: null, createdAt: '2026-02-20T10:30:00' },
        { id: 2, user: { fullName: 'Trần Thị B' }, product: { name: 'Vòng cổ cho chó' }, rating: 4, comment: 'Chất lượng ổn, giao hàng nhanh', hidden: false, adminReply: 'Cảm ơn bạn đã ủng hộ!', createdAt: '2026-02-19T14:20:00' },
        { id: 3, user: { fullName: 'Lê Văn C' }, product: { name: 'Chuồng mèo cao cấp' }, rating: 2, comment: 'Sản phẩm không như mô tả', hidden: true, adminReply: null, createdAt: '2026-02-18T09:15:00' },
        { id: 4, user: { fullName: 'Phạm Thị D' }, product: { name: 'Đồ chơi cho thú cưng' }, rating: 5, comment: 'Mèo nhà mình chơi cả ngày không chán!', hidden: false, adminReply: null, createdAt: '2026-02-17T16:45:00' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyModal.reply.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }
    try {
      await reviewsApi.replyToReview(replyModal.review.id, replyModal.reply);
      toast.success('Đã phản hồi đánh giá');
      setReplyModal({ open: false, review: null, reply: '' });
      fetchReviews();
    } catch (error) {
      toast.error('Không thể phản hồi đánh giá');
    }
  };

  const handleToggleVisibility = async (review) => {
    try {
      if (review.hidden) {
        await reviewsApi.showReview(review.id);
        toast.success('Đã hiện đánh giá');
      } else {
        await reviewsApi.hideReview(review.id);
        toast.success('Đã ẩn đánh giá');
      }
      fetchReviews();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
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

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatusBadge = (hidden) => {
    if (hidden) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Đã ẩn</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">Hiển thị</span>;
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = !ratingFilter || review.rating === parseInt(ratingFilter);
    const matchesStatus = !statusFilter || 
      (statusFilter === 'hidden' && review.hidden) || 
      (statusFilter === 'visible' && !review.hidden);
    return matchesSearch && matchesRating && matchesStatus;
  });

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-petshop-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đánh giá</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo người dùng, sản phẩm..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Tổng đánh giá</p>
          <p className="text-2xl font-bold text-gray-800">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Đánh giá trung bình</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-yellow-500">{avgRating}</p>
            <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">5 sao</p>
          <p className="text-2xl font-bold text-green-600">{reviews.filter(r => r.rating === 5).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Chưa phản hồi</p>
          <p className="text-2xl font-bold text-petshop-orange">{reviews.filter(r => !r.adminReply).length}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-2xl shadow-sm p-6 ${review.hidden ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-petshop-orange to-petshop-yellow rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {review.user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-800">{review.user?.fullName}</p>
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                    {getStatusBadge(review.hidden)}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Sản phẩm: <span className="text-petshop-orange">{review.product?.name}</span>
                    {' • '}
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-gray-600 mb-3">{review.comment}</p>
                  
                  {review.adminReply && (
                    <div className="bg-petshop-cream rounded-xl p-4 mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Phản hồi từ Shop:</p>
                      <p className="text-gray-600 text-sm">{review.adminReply}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!review.adminReply && (
                  <button
                    onClick={() => setReplyModal({ open: true, review, reply: '' })}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                    title="Phản hồi"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleToggleVisibility(review)}
                  className={`p-2 rounded-lg ${
                    review.hidden 
                      ? 'text-green-500 hover:bg-green-50' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title={review.hidden ? 'Hiện đánh giá' : 'Ẩn đánh giá'}
                >
                  {review.hidden ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
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

        {filteredReviews.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <FiStar className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có đánh giá</h3>
            <p className="text-gray-500">Các đánh giá từ khách hàng sẽ hiển thị ở đây</p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Phản hồi đánh giá</h3>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{replyModal.review?.user?.fullName}</span>
                <div className="flex">{renderStars(replyModal.review?.rating)}</div>
              </div>
              <p className="text-gray-600 text-sm">{replyModal.review?.comment}</p>
            </div>

            <textarea
              value={replyModal.reply}
              onChange={(e) => setReplyModal(prev => ({ ...prev, reply: e.target.value }))}
              placeholder="Nhập nội dung phản hồi..."
              rows={4}
              className="input-field w-full mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReplyModal({ open: false, review: null, reply: '' })}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleReply}
                className="btn-primary"
              >
                Gửi phản hồi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
