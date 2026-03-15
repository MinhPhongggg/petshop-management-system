package com.petshop.repository;

import com.petshop.entity.RewardTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RewardTierRepository extends JpaRepository<RewardTier, Long> {

    List<RewardTier> findByActiveTrueOrderByTierOrderAsc();

    Optional<RewardTier> findByName(String name);

    boolean existsByName(String name);

    // Tìm hạng cao nhất mà user đủ điều kiện
    List<RewardTier> findByActiveTrueAndMinSpendingLessThanEqualOrderByTierOrderDesc(BigDecimal spending);
}
