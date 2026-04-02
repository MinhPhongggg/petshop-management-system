package com.petshop.service.impl;

import com.petshop.dto.response.RewardProgressDTO;
import com.petshop.dto.response.RewardProgressDTO.*;
import com.petshop.dto.response.VoucherDTO;
import com.petshop.entity.*;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.*;
import com.petshop.security.UserPrincipal;
import com.petshop.service.RewardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
    private final ProductRepository productRepository;
    private final SavedVoucherRepository savedVoucherRepository;
    private final RewardVoucherClaimLogRepository rewardVoucherClaimLogRepository;
    private final RewardVerificationCodeRepository rewardVerificationCodeRepository;

    @Value("${petshop.points.earn-rate:1000}")
    private long pointsEarnRate;

    @Value("${petshop.points.redeem-value:100}")
    private long pointsRedeemValue;

    @Value("${petshop.verification.microsoft.required:true}")
    private boolean microsoftEmailRequired;

    @Override
    public RewardProgressDTO getMyRewardProgress() {
        User user = getCurrentUser();
        return buildRewardProgress(user, false);
    }

    @Override
    public List<RewardProgressDTO.TierStatus> getPublicTiers() {
        List<RewardTier> allTiers = rewardTierRepository.findByActiveTrueOrderByTierOrderAsc();
        return allTiers.stream().map(t -> RewardProgressDTO.TierStatus.builder()
                .id(t.getId())
                .name(t.getName())
                .displayName(t.getDisplayName())
                .icon(t.getIcon())
                .color(t.getColor())
                .minSpending(t.getMinSpending())
                .discountPercent(t.getDiscountPercent())
                .maxDiscount(t.getMaxDiscount())
                .tierOrder(t.getTierOrder())
                .unlocked(false)
                .build()).collect(Collectors.toList());
    }

    @Override
    public RewardProgressDTO getUserRewardProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return buildRewardProgress(user, true);
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

    @Override
    public long getMyAvailablePoints() {
        User user = getCurrentUser();
        return calculateAvailablePoints(user.getId());
    }

    @Override
    @Transactional
    public String requestPointsViewVerificationCode() {
        User user = getCurrentUser();
        validateMicrosoftEmail(user.getEmail());

        rewardVerificationCodeRepository.deleteByUserIdAndUsedTrue(user.getId());
        rewardVerificationCodeRepository.deleteByUserIdAndExpiresAtBefore(user.getId(), LocalDateTime.now());

        String verificationCode = String.format("%06d", new Random().nextInt(1_000_000));
        RewardVerificationCode code = RewardVerificationCode.builder()
                .user(user)
                .code(verificationCode)
                .provider(RewardVerificationCode.Provider.MICROSOFT)
                .pointsToRedeem(0L)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();
        rewardVerificationCodeRepository.save(code);

        // Integration point: gửi mã qua Microsoft channel (Outlook/Azure) tại đây.
        log.info("Microsoft OTP for points-view {} is {}", user.getEmail(), verificationCode);
        return verificationCode;
    }

    @Override
    @Transactional
    public long getMyAvailablePointsWithVerificationCode(String verificationCode) {
        if (verificationCode == null || verificationCode.isBlank()) {
            throw new BadRequestException("Mã OTP không được để trống");
        }

        User user = getCurrentUser();
        validateMicrosoftEmail(user.getEmail());

        RewardVerificationCode code = rewardVerificationCodeRepository
                .findTopByUserIdAndCodeAndUsedFalseOrderByCreatedAtDesc(user.getId(), verificationCode.trim())
                .orElseThrow(() -> new BadRequestException("Mã OTP không hợp lệ"));

        if (code.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn");
        }
        if (!Objects.equals(code.getPointsToRedeem(), 0L)) {
            throw new BadRequestException("Mã OTP này không dùng để xem điểm");
        }

        code.setUsed(true);
        rewardVerificationCodeRepository.save(code);

        return calculateAvailablePoints(user.getId());
    }

    @Override
    @Transactional
    public VoucherDTO claimWatchProductVoucher(Long productId, Integer watchedSeconds) {
        if (watchedSeconds == null || watchedSeconds < 30) {
            throw new BadRequestException("Bạn cần xem sản phẩm tối thiểu 30 giây để nhận voucher");
        }

        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        boolean alreadyClaimed = rewardVoucherClaimLogRepository.existsByUserIdAndProductIdAndClaimType(
                user.getId(), productId, RewardVoucherClaimLog.ClaimType.WATCH_30S
        );
        if (alreadyClaimed) {
            throw new BadRequestException("Bạn đã nhận voucher từ sản phẩm này rồi");
        }

        String code = "WATCH-" + user.getId() + "-" + productId + "-" +
                UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        Voucher voucher = Voucher.builder()
                .code(code)
                .description("Thưởng xem 30s sản phẩm " + product.getName() + " - giảm 5%")
                .discountType(Voucher.DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(5))
                .maxDiscount(BigDecimal.valueOf(30000))
                .minOrderAmount(BigDecimal.valueOf(150000))
                .usageLimit(1)
                .usageLimitPerUser(1)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(7))
                .applyTo(Voucher.ApplyTo.PRODUCTS)
                .active(true)
                .voucherCategory(Voucher.VoucherCategory.LOYALTY)
                .targetUser(user)
                .build();
        voucherRepository.save(voucher);

        savedVoucherRepository.save(SavedVoucher.builder()
                .user(user)
                .voucher(voucher)
                .build());

        rewardVoucherClaimLogRepository.save(RewardVoucherClaimLog.builder()
                .user(user)
                .voucher(voucher)
                .product(product)
                .claimType(RewardVoucherClaimLog.ClaimType.WATCH_30S)
                .build());

        return mapToVoucherDTO(voucher, true);
    }

    @Override
    @Transactional
    public String requestRedeemVerificationCode(Long pointsToRedeem) {
        if (pointsToRedeem == null || pointsToRedeem <= 0) {
            throw new BadRequestException("Số điểm đổi không hợp lệ");
        }

        User user = getCurrentUser();
        validateMicrosoftEmail(user.getEmail());
        validatePointsToRedeem(pointsToRedeem, user.getId());

        rewardVerificationCodeRepository.deleteByUserIdAndUsedTrue(user.getId());
        rewardVerificationCodeRepository.deleteByUserIdAndExpiresAtBefore(user.getId(), LocalDateTime.now());

        String verificationCode = String.format("%06d", new Random().nextInt(1_000_000));
        RewardVerificationCode code = RewardVerificationCode.builder()
                .user(user)
                .code(verificationCode)
                .provider(RewardVerificationCode.Provider.MICROSOFT)
                .pointsToRedeem(pointsToRedeem)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();
        rewardVerificationCodeRepository.save(code);

        // Integration point: gửi mã qua Microsoft channel (Outlook/Azure) tại đây.
        log.info("Microsoft verification code for {} is {}", user.getEmail(), verificationCode);
        return verificationCode;
    }

    @Override
    @Transactional
    public VoucherDTO redeemPointsWithVerificationCode(Long pointsToRedeem, String verificationCode) {
        if (pointsToRedeem == null || pointsToRedeem <= 0) {
            throw new BadRequestException("Số điểm đổi không hợp lệ");
        }
        if (verificationCode == null || verificationCode.isBlank()) {
            throw new BadRequestException("Mã xác thực không được để trống");
        }

        User user = getCurrentUser();
        validateMicrosoftEmail(user.getEmail());
        validatePointsToRedeem(pointsToRedeem, user.getId());

        RewardVerificationCode code = rewardVerificationCodeRepository
                .findTopByUserIdAndCodeAndUsedFalseOrderByCreatedAtDesc(user.getId(), verificationCode.trim())
                .orElseThrow(() -> new BadRequestException("Mã xác thực không hợp lệ"));

        if (code.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã xác thực đã hết hạn");
        }
        if (!Objects.equals(code.getPointsToRedeem(), pointsToRedeem)) {
            throw new BadRequestException("Số điểm không khớp với mã xác thực");
        }

        BigDecimal discountAmount = BigDecimal.valueOf(pointsToRedeem)
                .multiply(BigDecimal.valueOf(pointsRedeemValue));

        String voucherCode = "POINT-" + user.getId() + "-" +
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Voucher voucher = Voucher.builder()
                .code(voucherCode)
                .description("Đổi " + pointsToRedeem + " điểm tích lũy - giảm " + discountAmount + " VND")
                .discountType(Voucher.DiscountType.FIXED_AMOUNT)
                .discountValue(discountAmount)
                .maxDiscount(null)
                .minOrderAmount(BigDecimal.valueOf(100000))
                .usageLimit(1)
                .usageLimitPerUser(1)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(30))
                .applyTo(Voucher.ApplyTo.ALL)
                .active(true)
                .voucherCategory(Voucher.VoucherCategory.LOYALTY)
                .targetUser(user)
                .build();
        voucherRepository.save(voucher);

        savedVoucherRepository.save(SavedVoucher.builder()
                .user(user)
                .voucher(voucher)
                .build());

        rewardVoucherClaimLogRepository.save(RewardVoucherClaimLog.builder()
                .user(user)
                .voucher(voucher)
                .claimType(RewardVoucherClaimLog.ClaimType.POINTS_REDEEM)
                .pointsUsed(pointsToRedeem)
                .build());

        code.setUsed(true);
        rewardVerificationCodeRepository.save(code);

        return mapToVoucherDTO(voucher, true);
    }

    // ========================= PRIVATE ========================= //

    private RewardProgressDTO buildRewardProgress(User user, boolean includeAvailablePoints) {
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
                .availablePoints(includeAvailablePoints ? calculateAvailablePoints(user.getId()) : null)
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

    private long calculateAvailablePoints(Long userId) {
        BigDecimal totalSpending = calculateUserSpending(userId);
        long earnedPoints = totalSpending
                .divide(BigDecimal.valueOf(Math.max(pointsEarnRate, 1)), 0, java.math.RoundingMode.FLOOR)
                .longValue();
        Long redeemed = rewardVoucherClaimLogRepository.getTotalRedeemedPointsByUserId(userId);
        long redeemedPoints = redeemed != null ? redeemed : 0L;
        return Math.max(0L, earnedPoints - redeemedPoints);
    }

    private void validatePointsToRedeem(Long pointsToRedeem, Long userId) {
        long availablePoints = calculateAvailablePoints(userId);
        if (pointsToRedeem > availablePoints) {
            throw new BadRequestException("Điểm không đủ để đổi voucher");
        }
    }

    private void validateMicrosoftEmail(String email) {
        if (!microsoftEmailRequired) {
            return;
        }
        if (email == null) {
            throw new BadRequestException("Tài khoản chưa có email");
        }
        String lower = email.toLowerCase();
        boolean isMicrosoftAccount = lower.endsWith("@outlook.com") ||
                lower.endsWith("@hotmail.com") ||
                lower.endsWith("@live.com") ||
                lower.endsWith("@msn.com");
        if (!isMicrosoftAccount) {
            throw new BadRequestException("Đổi điểm yêu cầu tài khoản Microsoft (outlook/hotmail/live/msn)");
        }
    }

    private VoucherDTO mapToVoucherDTO(Voucher voucher, boolean saved) {
        Integer remainingUsage = voucher.getUsageLimit() != null
                ? voucher.getUsageLimit() - voucher.getUsedCount()
                : null;

        return VoucherDTO.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .maxDiscount(voucher.getMaxDiscount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .usageLimitPerUser(voucher.getUsageLimitPerUser())
                .remainingUsage(remainingUsage)
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .applyTo(voucher.getApplyTo())
                .voucherCategory(voucher.getVoucherCategory())
                .active(voucher.getActive())
                .isValid(voucher.isValid())
                .saved(saved)
                .createdAt(voucher.getCreatedAt())
                .build();
    }
}
