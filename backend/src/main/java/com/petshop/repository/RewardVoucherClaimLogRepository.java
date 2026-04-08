package com.petshop.repository;

import com.petshop.entity.RewardVoucherClaimLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RewardVoucherClaimLogRepository extends JpaRepository<RewardVoucherClaimLog, Long> {

    boolean existsByUserIdAndProductIdAndClaimType(Long userId, Long productId, RewardVoucherClaimLog.ClaimType claimType);

    @Query("SELECT COALESCE(SUM(r.pointsUsed), 0) FROM RewardVoucherClaimLog r " +
            "WHERE r.user.id = :userId AND r.claimType = 'POINTS_REDEEM'")
    Long getTotalRedeemedPointsByUserId(@Param("userId") Long userId);
}
