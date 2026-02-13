package com.petshop.repository;

import com.petshop.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderCode(String orderCode);
    
    // Đơn hàng của user
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Lọc đơn hàng theo trạng thái
    Page<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status, Pageable pageable);
    
    // Đếm đơn theo trạng thái
    Long countByStatus(Order.OrderStatus status);
    
    // Doanh thu theo khoảng thời gian
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.status = 'COMPLETED' AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalRevenue(@Param("startDate") LocalDateTime startDate, 
                               @Param("endDate") LocalDateTime endDate);
    
    // Số đơn hàng theo khoảng thời gian
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Long countOrdersByDateRange(@Param("startDate") LocalDateTime startDate, 
                                @Param("endDate") LocalDateTime endDate);
    
    // Thống kê đơn hàng theo trạng thái trong khoảng thời gian
    @Query("SELECT o.status, COUNT(o) FROM Order o " +
           "WHERE o.createdAt BETWEEN :startDate AND :endDate GROUP BY o.status")
    List<Object[]> countByStatusAndDateRange(@Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate);
    
    // Doanh thu theo ngày (30 ngày gần nhất)
    @Query(value = "SELECT DATE(created_at) as date, SUM(total_amount) as revenue " +
                   "FROM orders WHERE status = 'COMPLETED' AND created_at >= :startDate " +
                   "GROUP BY DATE(created_at) ORDER BY date", nativeQuery = true)
    List<Object[]> getDailyRevenue(@Param("startDate") LocalDateTime startDate);
    
    // Count orders by date range
    Long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Count orders by status and date range
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :startDate AND :endDate")
    Long countByStatusAndCreatedAtBetween(@Param("status") Order.OrderStatus status,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);
    
    // Recent orders for dashboard
    List<Order> findTop5ByOrderByCreatedAtDesc();
    
    // Check if user has purchased a product
    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END FROM OrderItem oi " +
           "JOIN oi.order o WHERE o.user.id = :userId AND oi.variant.product.id = :productId AND o.status = 'COMPLETED'")
    boolean existsByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
}
