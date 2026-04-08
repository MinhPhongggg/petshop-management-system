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
public class BusinessReportDTO {

    private RevenueProfitSummary revenueProfit;
    private List<InventoryFlowRow> inventoryFlow;
    private List<TopSellingRow> topSellingProducts;
    private List<SlowMovingRow> slowMovingProducts;
    private List<CustomerLoyaltyRow> loyalCustomers;
    private VoucherImpact voucherImpact;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueProfitSummary {
        private BigDecimal grossRevenue;
        private BigDecimal totalDiscount;
        private BigDecimal netRevenue;
        private BigDecimal cogs;
        private BigDecimal grossProfit;
        private Double grossMarginPercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryFlowRow {
        private Long variantId;
        private String productName;
        private String variantName;
        private Integer openingQuantity;
        private Integer inQuantity;
        private Integer outQuantity;
        private Integer closingQuantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingRow {
        private Long productId;
        private String productName;
        private Long soldQuantity;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlowMovingRow {
        private Long productId;
        private String productName;
        private String lastSoldAt;
        private Long soldQuantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerLoyaltyRow {
        private Long userId;
        private String fullName;
        private BigDecimal totalSpending;
        private Long completedOrders;
        private Long unlockedRewardCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoucherImpact {
        private Long usageCount;
        private BigDecimal totalDiscountAmount;
        private BigDecimal voucherOrderRevenue;
        private BigDecimal revenueUpliftPercent;
    }
}
