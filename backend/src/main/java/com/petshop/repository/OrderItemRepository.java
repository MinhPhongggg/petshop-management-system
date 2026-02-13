package com.petshop.repository;

import com.petshop.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrderId(Long orderId);
    
    // Các sản phẩm chưa đánh giá của user
    List<OrderItem> findByOrderUserIdAndReviewedFalse(Long userId);
}
