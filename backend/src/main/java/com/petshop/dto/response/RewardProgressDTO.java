package com.petshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardProgressDTO {

    // Thông tin user
    private Long userId;
    private String userName;

    // Tổng chi tiêu hiện tại
    private BigDecimal totalSpending;

    // Số đơn hoàn thành
    private Long completedOrders;

    // Hạng hiện tại (null nếu chưa đạt hạng nào)
    private TierInfo currentTier;

    // Hạng tiếp theo cần đạt (null nếu đã max)
    private TierInfo nextTier;

    // Tiến trình đến hạng tiếp theo (0-100%)
    private Integer progressPercent;

    // Số tiền còn thiếu để đạt hạng tiếp theo
    private BigDecimal amountToNextTier;

    // Danh sách tất cả hạng + trạng thái
    private List<TierStatus> allTiers;

    // Danh sách voucher thưởng đã nhận
    private List<RewardVoucherInfo> earnedVouchers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TierInfo {
        private Long id;
        private String name;
        private String displayName;
        private String description;
        private String icon;
        private String color;
        private BigDecimal minSpending;
        private Integer discountPercent;
        private BigDecimal maxDiscount;
        private Integer tierOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TierStatus {
        private Long id;
        private String name;
        private String displayName;
        private String icon;
        private String color;
        private BigDecimal minSpending;
        private Integer discountPercent;
        private BigDecimal maxDiscount;
        private Integer tierOrder;
        private Boolean unlocked;
        private String voucherCode;
        private Boolean voucherUsed;
        private LocalDateTime unlockedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RewardVoucherInfo {
        private String tierName;
        private String tierDisplayName;
        private String tierIcon;
        private String tierColor;
        private String voucherCode;
        private Integer discountPercent;
        private BigDecimal maxDiscount;
        private Boolean used;
        private LocalDateTime unlockedAt;
        private LocalDateTime usedAt;
    }
}
