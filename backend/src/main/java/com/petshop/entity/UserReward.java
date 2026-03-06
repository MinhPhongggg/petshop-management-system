package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_rewards", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "reward_tier_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reward_tier_id", nullable = false)
    private RewardTier rewardTier;

    // Mã voucher cá nhân được tạo khi mở khóa hạng
    @Column(name = "voucher_code", nullable = false, unique = true, length = 50)
    private String voucherCode;

    // Tổng chi tiêu khi đạt hạng
    @Column(name = "spending_at_unlock", precision = 15, scale = 2)
    private BigDecimal spendingAtUnlock;

    // Đã sử dụng voucher chưa
    @Column(name = "voucher_used")
    @Builder.Default
    private Boolean voucherUsed = false;

    // Ngày sử dụng
    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @CreationTimestamp
    @Column(name = "unlocked_at", updatable = false)
    private LocalDateTime unlockedAt;
}
