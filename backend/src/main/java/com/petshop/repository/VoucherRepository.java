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
           "AND (v.usageLimit IS NULL OR v.usedCount < v.usageLimit)")
    List<Voucher> findActiveVouchers(@Param("now") LocalDateTime now);
    
    // Tất cả voucher (admin)
    Page<Voucher> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    boolean existsByCode(String code);
}
