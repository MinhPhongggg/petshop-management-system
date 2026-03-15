package com.petshop.repository;

import com.petshop.entity.SavedVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedVoucherRepository extends JpaRepository<SavedVoucher, Long> {

    List<SavedVoucher> findByUserIdOrderBySavedAtDesc(Long userId);

    boolean existsByUserIdAndVoucherId(Long userId, Long voucherId);

    Optional<SavedVoucher> findByUserIdAndVoucherId(Long userId, Long voucherId);

    void deleteByUserIdAndVoucherId(Long userId, Long voucherId);

    long countByUserId(Long userId);
}
