package com.petshop.service.impl;

import com.petshop.dto.response.RewardProgressDTO;
import com.petshop.dto.response.RewardProgressDTO.*;
import com.petshop.entity.*;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.*;
import com.petshop.security.UserPrincipal;
import com.petshop.service.RewardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RewardServiceImpl implements RewardService {

    private final RewardTierRepository rewardTierRepository;
    private final UserRewardRepository userRewardRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;

    @Override
    public RewardProgressDTO getMyRewardProgress() {
        User user = getCurrentUser();
        return buildRewardProgress(user);
    }

    @Override
    public RewardProgressDTO getUserRewardProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return buildRewardProgress(user);
    }

    @Override
    @Transactional
    public String checkAndUnlockRewards(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal totalSpending = calculateUserSpending(userId);
        List<RewardTier> allTiers = rewardTierRepository.findByActiveTrueOrderByTierOrderAsc();
        List<UserReward> existingRewards = userRewardRepository.findByUserIdOrderByRewardTierTierOrderAsc(userId);

        Set<Long> unlockedTierIds = existingRewards.stream()
                .map(ur -> ur.getRewardTier().getId())
                .collect(Collectors.toSet());

        String highestNewTier = null;

        for (RewardTier tier : allTiers) {
            if (totalSpending.compareTo(tier.getMinSpending()) >= 0 && !unlockedTierIds.contains(tier.getId())) {
                // Mở khóa hạng mới!
                String voucherCode = generateRewardVoucherCode(tier, user);

                // Tạo voucher thực trong hệ thống voucher
                createRewardVoucher(voucherCode, tier, user);

                // Lưu record user_reward
                UserReward userReward = UserReward.builder()
                        .user(user)
                        .rewardTier(tier)
                        .voucherCode(voucherCode)
                        .spendingAtUnlock(totalSpending)
                        .voucherUsed(false)
                        .build();
                userRewardRepository.save(userReward);

                highestNewTier = tier.getDisplayName();
                log.info("User {} unlocked reward tier: {} (spending: {})", 
                        user.getEmail(), tier.getName(), totalSpending);
            }
        }

        return highestNewTier;
    }

    // ========================= PRIVATE ========================= //

    private RewardProgressDTO buildRewardProgress(User user) {
        BigDecimal totalSpending = calculateUserSpending(user.getId());
        long completedOrders = countCompletedOrders(user.getId());
        List<RewardTier> allTiers = rewardTierRepository.findByActiveTrueOrderByTierOrderAsc();
        List<UserReward> userRewards = userRewardRepository.findByUserIdOrderByRewardTierTierOrderAsc(user.getId());

        // Map user rewards by tier id
        Map<Long, UserReward> rewardMap = userRewards.stream()
                .collect(Collectors.toMap(ur -> ur.getRewardTier().getId(), ur -> ur));

        // Tìm hạng hiện tại (hạng cao nhất đã mở khóa)
        TierInfo currentTier = null;
        TierInfo nextTier = null;

        RewardTier currentTierEntity = null;
        RewardTier nextTierEntity = null;

        for (int i = allTiers.size() - 1; i >= 0; i--) {
            RewardTier t = allTiers.get(i);
            if (totalSpending.compareTo(t.getMinSpending()) >= 0) {
                currentTierEntity = t;
                currentTier = mapToTierInfo(t);
                if (i + 1 < allTiers.size()) {
                    nextTierEntity = allTiers.get(i + 1);
                    nextTier = mapToTierInfo(nextTierEntity);
                }
                break;
            }
        }

        // Nếu user chưa đạt hạng nào, hạng tiếp theo là hạng đầu tiên
        if (currentTier == null && !allTiers.isEmpty()) {
            nextTierEntity = allTiers.get(0);
            nextTier = mapToTierInfo(nextTierEntity);
        }

        // Tính tiến trình
        int progressPercent = 0;
        BigDecimal amountToNextTier = BigDecimal.ZERO;
        if (nextTierEntity != null) {
            BigDecimal base = currentTierEntity != null ? currentTierEntity.getMinSpending() : BigDecimal.ZERO;
            BigDecimal range = nextTierEntity.getMinSpending().subtract(base);
            BigDecimal progress = totalSpending.subtract(base);
            if (range.compareTo(BigDecimal.ZERO) > 0) {
                progressPercent = progress.multiply(BigDecimal.valueOf(100))
                        .divide(range, 0, java.math.RoundingMode.FLOOR).intValue();
                progressPercent = Math.min(progressPercent, 100);
            }
            amountToNextTier = nextTierEntity.getMinSpending().subtract(totalSpending).max(BigDecimal.ZERO);
        } else if (currentTierEntity != null) {
            progressPercent = 100; // Đã đạt hạng cao nhất
        }

        // Tất cả tiers + trạng thái
        List<TierStatus> allTierStatuses = allTiers.stream().map(t -> {
            UserReward ur = rewardMap.get(t.getId());
            return TierStatus.builder()
                    .id(t.getId())
                    .name(t.getName())
                    .displayName(t.getDisplayName())
                    .icon(t.getIcon())
                    .color(t.getColor())
                    .minSpending(t.getMinSpending())
                    .discountPercent(t.getDiscountPercent())
                    .maxDiscount(t.getMaxDiscount())
                    .tierOrder(t.getTierOrder())
                    .unlocked(ur != null)
                    .voucherCode(ur != null ? ur.getVoucherCode() : null)
                    .voucherUsed(ur != null ? ur.getVoucherUsed() : null)
                    .unlockedAt(ur != null ? ur.getUnlockedAt() : null)
                    .build();
        }).collect(Collectors.toList());

        // Earned vouchers
        List<RewardVoucherInfo> earnedVouchers = userRewards.stream().map(ur -> {
            RewardTier t = ur.getRewardTier();
            return RewardVoucherInfo.builder()
                    .tierName(t.getName())
                    .tierDisplayName(t.getDisplayName())
                    .tierIcon(t.getIcon())
                    .tierColor(t.getColor())
                    .voucherCode(ur.getVoucherCode())
                    .discountPercent(t.getDiscountPercent())
                    .maxDiscount(t.getMaxDiscount())
                    .used(ur.getVoucherUsed())
                    .unlockedAt(ur.getUnlockedAt())
                    .usedAt(ur.getUsedAt())
                    .build();
        }).collect(Collectors.toList());

        return RewardProgressDTO.builder()
                .userId(user.getId())
                .userName(user.getFullName())
                .totalSpending(totalSpending)
                .completedOrders(completedOrders)
                .currentTier(currentTier)
                .nextTier(nextTier)
                .progressPercent(progressPercent)
                .amountToNextTier(amountToNextTier)
                .allTiers(allTierStatuses)
                .earnedVouchers(earnedVouchers)
                .build();
    }

    private BigDecimal calculateUserSpending(Long userId) {
        return orderRepository.getTotalSpendingByUserId(userId);
    }

    private long countCompletedOrders(Long userId) {
        return orderRepository.countCompletedOrdersByUserId(userId);
    }

    private TierInfo mapToTierInfo(RewardTier tier) {
        return TierInfo.builder()
                .id(tier.getId())
                .name(tier.getName())
                .displayName(tier.getDisplayName())
                .description(tier.getDescription())
                .icon(tier.getIcon())
                .color(tier.getColor())
                .minSpending(tier.getMinSpending())
                .discountPercent(tier.getDiscountPercent())
                .maxDiscount(tier.getMaxDiscount())
                .tierOrder(tier.getTierOrder())
                .build();
    }

    private String generateRewardVoucherCode(RewardTier tier, User user) {
        String prefix = "RW" + tier.getName().substring(0, 2).toUpperCase();
        String suffix = String.valueOf(user.getId()) + 
                        String.valueOf(System.currentTimeMillis() % 10000);
        return prefix + suffix;
    }

    private void createRewardVoucher(String code, RewardTier tier, User user) {
        // Tạo voucher thực sự trong bảng vouchers
        Voucher voucher = Voucher.builder()
                .code(code)
                .description("Voucher thưởng hạng " + tier.getDisplayName() + 
                             " - Giảm " + tier.getDiscountPercent() + "% cho " + user.getFullName())
                .discountType(Voucher.DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(tier.getDiscountPercent()))
                .maxDiscount(tier.getMaxDiscount())
                .minOrderAmount(BigDecimal.ZERO)
                .usageLimit(1)
                .usageLimitPerUser(1)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(3)) // Hiệu lực 3 tháng
                .applyTo(Voucher.ApplyTo.ALL)
                .active(true)
                .build();
        voucherRepository.save(voucher);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
