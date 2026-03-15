package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reward_tiers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên hạng (Bronze, Silver, Gold, Platinum, Diamond)
    @Column(nullable = false, unique = true, length = 50)
    private String name;

    // Tên hiển thị tiếng Việt
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    // Mô tả
    @Column(length = 255)
    private String description;

    // Icon/Emoji đại diện
    @Column(length = 10)
    private String icon;

    // Màu sắc (hex) cho UI
    @Column(length = 20)
    private String color;

    // Tổng chi tiêu tối thiểu để đạt hạng
    @Column(name = "min_spending", nullable = false, precision = 15, scale = 2)
    private BigDecimal minSpending;

    // Phần trăm giảm giá voucher thưởng
    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;

    // Giảm tối đa
    @Column(name = "max_discount", precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    // Thứ tự (1=thấp nhất)
    @Column(name = "tier_order", nullable = false)
    private Integer tierOrder;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
