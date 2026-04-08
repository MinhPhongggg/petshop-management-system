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
       @Query(value = "SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as order_count " +
                               "FROM orders WHERE status = 'COMPLETED' AND created_at BETWEEN :startDate AND :endDate " +
                   "GROUP BY DATE(created_at) ORDER BY date", nativeQuery = true)
       List<Object[]> getDailyRevenue(@Param("startDate") LocalDateTime startDate,
                                                           @Param("endDate") LocalDateTime endDate);
    
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
           "JOIN oi.order o WHERE o.user.id = :userId AND oi.variant.product.id = :productId AND (o.status = 'DELIVERED' OR o.status = 'COMPLETED')")
    boolean existsByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
    
    // ==================== ANALYTICS QUERIES ====================
    
    // Tổng chi tiêu sản phẩm theo user (để tính VIP)
    @Query(value = "SELECT o.user_id, COALESCE(SUM(o.total_amount), 0) as total_spending " +
                   "FROM orders o WHERE o.status = 'COMPLETED' " +
                   "GROUP BY o.user_id", nativeQuery = true)
    List<Object[]> getUserProductSpending();

    // ==================== REWARD QUERIES ====================

    // Tổng chi tiêu của 1 user (đơn hoàn thành)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user.id = :userId AND o.status = 'COMPLETED'")
    BigDecimal getTotalSpendingByUserId(@Param("userId") Long userId);

    // Số đơn hoàn thành của 1 user
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.status = 'COMPLETED'")
    long countCompletedOrdersByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(o.subtotal), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getGrossRevenue(@Param("startDate") LocalDateTime startDate,
                               @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(o.discountAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalDiscount(@Param("startDate") LocalDateTime startDate,
                                @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT p.id, p.name, COALESCE(SUM(oi.quantity),0) qty, COALESCE(SUM(oi.subtotal),0) revenue " +
            "FROM order_items oi " +
            "JOIN orders o ON oi.order_id = o.id " +
            "JOIN product_variants pv ON oi.variant_id = pv.id " +
            "JOIN products p ON pv.product_id = p.id " +
            "WHERE o.status = 'COMPLETED' AND o.created_at BETWEEN :startDate AND :endDate " +
            "GROUP BY p.id, p.name ORDER BY qty DESC LIMIT :limit", nativeQuery = true)
    List<Object[]> getTopSellingProductsByPeriod(@Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate,
                                                 @Param("limit") int limit);

    @Query(value = "SELECT p.id, p.name, MAX(o.created_at) last_sold_at, COALESCE(SUM(oi.quantity),0) sold_qty " +
            "FROM products p " +
            "LEFT JOIN product_variants pv ON p.id = pv.product_id " +
            "LEFT JOIN order_items oi ON pv.id = oi.variant_id " +
            "LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'COMPLETED' " +
            "GROUP BY p.id, p.name " +
            "ORDER BY last_sold_at ASC LIMIT :limit", nativeQuery = true)
    List<Object[]> getSlowMovingProducts(@Param("limit") int limit);

    @Query(value = "SELECT u.id, u.full_name, COALESCE(SUM(o.total_amount),0) spend, COUNT(o.id) completed_orders " +
            "FROM users u " +
            "LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'COMPLETED' " +
            "GROUP BY u.id, u.full_name ORDER BY spend DESC LIMIT :limit", nativeQuery = true)
    List<Object[]> getTopCustomersBySpend(@Param("limit") int limit);

    @Query(value = "SELECT o.id, o.order_code, o.total_amount, o.discount_amount, o.created_at " +
            "FROM orders o WHERE o.status = 'COMPLETED' AND o.created_at BETWEEN :startDate AND :endDate " +
            "ORDER BY o.created_at DESC", nativeQuery = true)
    List<Object[]> getCompletedOrdersForDrilldown(@Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);
}
