package com.petshop.repository;

import com.petshop.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrderId(Long orderId);
    
    // Các sản phẩm chưa đánh giá của user
    List<OrderItem> findByOrderUserIdAndReviewedFalse(Long userId);
    
    // Kiểm tra sản phẩm có trong đơn hàng không (qua variant)
    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END FROM OrderItem oi WHERE oi.variant.id IN :variantIds")
    boolean existsByVariantIdIn(List<Long> variantIds);
}
