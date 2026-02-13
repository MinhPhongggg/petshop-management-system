package com.petshop.repository;

import com.petshop.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Đánh giá sản phẩm (công khai)
    Page<Review> findByProductIdAndVisibleAndHiddenOrderByCreatedAtDesc(
            Long productId, Boolean visible, Boolean hidden, Pageable pageable);
    
    // Đánh giá của user
    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Tính rating trung bình của sản phẩm
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.id = :productId AND r.visible = true AND r.hidden = false")
    BigDecimal getAverageRatingByProduct(@Param("productId") Long productId);
    
    // Đếm số đánh giá sản phẩm
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.visible = true AND r.hidden = false")
    Long countByProduct(@Param("productId") Long productId);
    
    // Kiểm tra user đã đánh giá sản phẩm/booking chưa
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndBookingId(Long userId, Long bookingId);
}
