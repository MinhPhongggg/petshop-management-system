package com.petshop.repository;

import com.petshop.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    
    Optional<Voucher> findByCode(String code);
    
    // Voucher đang hoạt động
    @Query("SELECT v FROM Voucher v WHERE v.active = true " +
           "AND v.startDate <= :now AND v.endDate >= :now " +
           "AND (v.usageLimit IS NULL OR v.usedCount < v.usageLimit) " +
           "AND (v.targetUser IS NULL)")
    List<Voucher> findActiveVouchers(@Param("now") LocalDateTime now);
    
    // Voucher đang hoạt động (bao gồm cá nhân cho user)
    @Query("SELECT v FROM Voucher v WHERE v.active = true " +
           "AND v.startDate <= :now AND v.endDate >= :now " +
           "AND (v.usageLimit IS NULL OR v.usedCount < v.usageLimit) " +
           "AND (v.targetUser IS NULL OR v.targetUser.id = :userId)")
    List<Voucher> findActiveVouchersForUser(@Param("now") LocalDateTime now, @Param("userId") Long userId);

    // Tìm voucher theo category và target user
    @Query("SELECT v FROM Voucher v WHERE v.voucherCategory = :category " +
           "AND v.targetUser.id = :userId AND v.active = true")
    List<Voucher> findByCategoryAndTargetUser(
            @Param("category") Voucher.VoucherCategory category, 
            @Param("userId") Long userId);
    
    // Tất cả voucher (admin)
    Page<Voucher> findAllByOrderByCreatedAtDesc(Pageable pageable);
    boolean existsByCode(String code);
}
