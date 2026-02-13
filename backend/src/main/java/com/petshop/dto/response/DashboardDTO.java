package com.petshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    
    // Tổng quan
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long totalProducts;
    private Long totalCustomers;
    private Long totalUsers;  // Alias for totalCustomers (used by FE)
    private Long totalBookings;
    
    // Growth percentages (compared to previous period)
    private Double revenueGrowth;
    private Double orderGrowth;
    private Double bookingGrowth;
    
    // Đơn hàng theo trạng thái
    private Long pendingOrders;
    private Long processingOrders;
    private Long shippingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    
    // Booking theo trạng thái
    private Long pendingBookings;
    private Long todayBookings;
    
    // Tỷ lệ thành công
    private Double orderSuccessRate;
    
    // Top sản phẩm bán chạy
    private List<TopProductDTO> topProducts;
    
    // Doanh thu theo ngày (30 ngày)
    private List<DailyRevenueDTO> dailyRevenue;
    
    // Sản phẩm sắp hết hàng
    private List<LowStockDTO> lowStockProducts;
    
    // Recent orders and bookings for dashboard
    private List<RecentOrderDTO> recentOrders;
    private List<RecentBookingDTO> recentBookings;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductDTO {
        private Long productId;
        private String productName;
        private String productImage;
        private Integer soldCount;
        private BigDecimal revenue;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenueDTO {
        private String date;
        private BigDecimal revenue;
        private Long orderCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockDTO {
        private Long variantId;
        private String productName;
        private String variantName;
        private Integer stockQuantity;
        private Integer threshold;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentOrderDTO {
        private Long id;
        private String orderNumber;  // orderCode in DB
        private String customer;     // user name
        private BigDecimal amount;   // totalAmount
        private String status;
        private String createdAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentBookingDTO {
        private Long id;
        private String bookingCode;
        private String customer;     // user name
        private String service;      // service name
        private String status;
        private String bookingDate;
    }
}
