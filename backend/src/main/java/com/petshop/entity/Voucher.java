package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mã voucher (Ví dụ: SALE10, NEWYEAR2026)
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 255)
    private String description;

    // Loại giảm giá
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    // Giá trị giảm (số tiền hoặc %)
    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    // Giảm tối đa (nếu giảm %)
    @Column(name = "max_discount", precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    // Đơn hàng tối thiểu để áp dụng
    @Column(name = "min_order_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    // Số lượng mã giới hạn
    @Column(name = "usage_limit")
    private Integer usageLimit;

    // Số lần đã sử dụng
    @Column(name = "used_count")
    @Builder.Default
    private Integer usedCount = 0;

    // Giới hạn số lần mỗi user có thể dùng
    @Column(name = "usage_limit_per_user")
    @Builder.Default
    private Integer usageLimitPerUser = 1;

    // Ngày bắt đầu
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    // Ngày kết thúc
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    // Áp dụng cho loại nào (sản phẩm/dịch vụ/tất cả)
    @Enumerated(EnumType.STRING)
    @Column(name = "apply_to")
    @Builder.Default
    private ApplyTo applyTo = ApplyTo.ALL;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    // Phân loại voucher
    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_category")
    @Builder.Default
    private VoucherCategory voucherCategory = VoucherCategory.GENERAL;

    // User được tặng voucher (cho voucher cá nhân: WELCOME, LOYALTY, RECURRING)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private User targetUser;

    // Lịch sử sử dụng
    @OneToMany(mappedBy = "voucher")
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum DiscountType {
        PERCENTAGE,     // Giảm %
        FIXED_AMOUNT    // Giảm số tiền cố định
    }

    public enum ApplyTo {
        ALL,            // Tất cả
        PRODUCTS,       // Chỉ sản phẩm
        SERVICES        // Chỉ dịch vụ
    }

    // Phân loại chiến lược voucher
    public enum VoucherCategory {
        GENERAL,        // Voucher thông thường
        WELCOME,        // Chào mừng khách hàng mới
        SERVICE,        // Giảm giá dịch vụ (kèm điều kiện)
        LOYALTY,        // Tri ân sinh nhật thú cưng
        RECURRING       // Voucher định kỳ (nhắc mua lại)
    }

    // Helper: Kiểm tra voucher còn hiệu lực
    public boolean isValid() {
        if (startDate == null || endDate == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        int used = usedCount != null ? usedCount : 0;
        return Boolean.TRUE.equals(active) &&
               !now.isBefore(startDate) &&
               !now.isAfter(endDate) &&
               (usageLimit == null || used < usageLimit);
    }

    // Helper: Tính số tiền giảm
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (orderAmount == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal minAmount = minOrderAmount != null ? minOrderAmount : BigDecimal.ZERO;
        if (orderAmount.compareTo(minAmount) < 0 || discountValue == null || discountType == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal discount;
        if (discountType == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100));
            if (maxDiscount != null && discount.compareTo(maxDiscount) > 0) {
                discount = maxDiscount;
            }
        } else {
            discount = discountValue;
        }
        
        return discount.min(orderAmount);
    }
}
