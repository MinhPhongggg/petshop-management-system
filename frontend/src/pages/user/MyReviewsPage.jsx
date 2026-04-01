import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiStar, FiShoppingBag } from "react-icons/fi";
import { reviewsApi } from "../../services/api";

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewsApi.getMyReviews({ page: 0, size: 20 });
      setReviews(response.data.content || response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        onClick={interactive ? () => onChange(i + 1) : undefined}
        className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
          ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
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
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Chưa có đánh giá
          </h3>
          <p className="text-gray-500 mb-6">
            Hãy mua sắm và đánh giá sản phẩm để nhận ưu đãi!
          </p>
          <a
            href="/products"
            className="btn-primary inline-flex items-center gap-2"
          >
            <FiShoppingBag /> Mua sắm ngay
          </a>
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
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {review.productName}
                  </p>

                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <p className="text-gray-600">{review.content}</p>

                  {review.shopReply && (
                    <div className="bg-petshop-cream rounded-xl p-4 mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-5 h-5 bg-petshop-orange rounded-full flex items-center justify-center text-white text-xs">
                            P
                          </span>
                          Phản hồi từ PetShop:
                        </span>
                      </p>
                      <p className="text-gray-600 text-sm">
                        {review.shopReply}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;
