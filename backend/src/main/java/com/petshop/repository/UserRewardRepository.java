package com.petshop.repository;

import com.petshop.entity.UserReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRewardRepository extends JpaRepository<UserReward, Long> {

    List<UserReward> findByUserIdOrderByRewardTierTierOrderAsc(Long userId);

    boolean existsByUserIdAndRewardTierId(Long userId, Long rewardTierId);

    Optional<UserReward> findByVoucherCode(String voucherCode);

    Optional<UserReward> findByUserIdAndRewardTierId(Long userId, Long rewardTierId);

    // Đếm số voucher chưa dùng của user
    long countByUserIdAndVoucherUsedFalse(Long userId);
}
