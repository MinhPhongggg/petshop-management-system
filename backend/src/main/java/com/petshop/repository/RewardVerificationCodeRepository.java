package com.petshop.repository;

import com.petshop.entity.RewardVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RewardVerificationCodeRepository extends JpaRepository<RewardVerificationCode, Long> {

    Optional<RewardVerificationCode> findTopByUserIdAndCodeAndUsedFalseOrderByCreatedAtDesc(Long userId, String code);

    void deleteByUserIdAndUsedTrue(Long userId);

    void deleteByUserIdAndExpiresAtBefore(Long userId, LocalDateTime now);
}
