package com.petshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {

    // ==================== 1. SERVICE ANALYTICS ====================
    private ServiceAnalytics serviceAnalytics;

    // ==================== 2. RETAIL & INVENTORY ====================
    private RetailInventoryAnalytics retailInventoryAnalytics;

    // ==================== 3. PET PROFILES ====================
    private PetProfileAnalytics petProfileAnalytics;

    // ============================================================
    // 1. THỐNG KÊ THEO LOẠI HÌNH DỊCH VỤ
    // ============================================================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceAnalytics {
        // Tỷ lệ lấp đầy lịch đặt theo giờ
        private List<HourlyBookingRate> hourlyBookingRates;
        // Tỷ lệ lấp đầy lịch đặt theo ngày (7 ngày gần nhất)
        private List<DailyBookingRate> dailyBookingRates;
        // Doanh thu & hiệu suất theo nhân viên (Groomer Performance)
        private List<GroomerPerformance> groomerPerformances;
        // Dịch vụ phổ biến nhất
        private List<PopularService> popularServices;
        // Tổng số booking, tỷ lệ hoàn thành
        private Long totalBookings;
        private Long completedBookings;
        private Long cancelledBookings;
        private Double completionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyBookingRate {
        private Integer hour; // 8, 9, 10, ..., 20
        private Long bookingCount;
        private Double fillRate; // % so với max slot
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyBookingRate {
        private String date;
        private Long bookingCount;
        private Long maxSlots;
        private Double fillRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroomerPerformance {
        private Long staffId;
        private String staffName;
        private Long totalBookings;
        private Long completedBookings;
        private BigDecimal totalRevenue;
        private Double averageRating;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PopularService {
        private Long serviceId;
        private String serviceName;
        private Long bookingCount;
        private BigDecimal totalRevenue;
        private Double percentage; // % tổng doanh thu dịch vụ
    }

    // ============================================================
    // 2. THỐNG KÊ BÁN LẺ & KHO HÀNG
    // ============================================================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RetailInventoryAnalytics {
        private List<LowStockAlert> lowStockAlerts;
        private Long lowStockCount;
        private Long outOfStockCount;
        private List<ExpiryAlert> expiryAlerts;
        private Long expiringCount;
        private List<SalesVelocity> salesVelocities;
        private BigDecimal totalInventoryValue;
        private Long totalVariants;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpiryAlert {
        private Long variantId;
        private String productName;
        private String variantName;
        private String sku;
        private String expiryDate;
        private long daysUntilExpiry;
        private int currentStock;
        private String urgency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockAlert {
        private Long variantId;
        private String productName;
        private String variantName;
        private String sku;
        private Integer currentStock;
        private Integer threshold;
        private String urgency; // CRITICAL (<=2), WARNING (<=5), LOW (<=10)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesVelocity {
        private Long productId;
        private String productName;
        private String productImage;
        private String categoryName;
        private Integer soldCount;
        private BigDecimal revenue;
        private Double dailyAvgSales; // Trung bình bán / ngày trong 30 ngày
    }

    // ============================================================
    // 3. THỐNG KÊ KHÁCH HÀNG ĐẶC BIỆT (PET PROFILES)
    // ============================================================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PetProfileAnalytics {
        // Phân loại giống loài
        private List<PetTypeDistribution> petTypeDistribution;
        private Long totalPets;
        // Chu kỳ chăm sóc (Customer Retention)
        private List<CustomerRetention> customerRetentions;
        private Double averageReturnDays; // Trung bình bao nhiêu ngày quay lại
        // Khách hàng VIP (thú cưng chi tiêu nhiều nhất)
        private List<VipPet> vipPets;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PetTypeDistribution {
        private String petType; // DOG, CAT, BIRD...
        private Long count;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerRetention {
        private Long customerId;
        private String customerName;
        private String petName;
        private String petType;
        private Long totalVisits;
        private Double avgDaysBetweenVisits;
        private String lastVisitDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VipPet {
        private Long petId;
        private String petName;
        private String petType;
        private String breed;
        private String ownerName;
        private Long totalBookings;
        private BigDecimal totalServiceSpending;
        private BigDecimal totalProductSpending;
        private BigDecimal totalSpending;
    }
}
