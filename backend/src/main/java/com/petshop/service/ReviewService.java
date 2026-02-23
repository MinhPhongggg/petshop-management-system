package com.petshop.service;

import com.petshop.dto.request.ReviewRequest;
import com.petshop.dto.response.ReviewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    
    // Tạo đánh giá
    ReviewDTO createReview(ReviewRequest request);
    
    // Lấy đánh giá theo sản phẩm
    Page<ReviewDTO> getProductReviews(Long productId, Pageable pageable);
    
    // Lấy đánh giá của user
    Page<ReviewDTO> getMyReviews(Pageable pageable);
    
    // Lấy tất cả đánh giá (admin)
    Page<ReviewDTO> getAllReviews(Pageable pageable);
    
    // Phản hồi đánh giá (admin)
    ReviewDTO replyToReview(Long id, String reply);
    
    // Ẩn đánh giá (admin)
    ReviewDTO hideReview(Long id);
    ReviewDTO showReview(Long id);
    
    // Xóa đánh giá
    void deleteReview(Long id);
}
