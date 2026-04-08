package com.petshop.repository;

import com.petshop.entity.VoucherUsageLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherUsageLogRepository extends JpaRepository<VoucherUsageLog, Long> {

    // Lịch sử dùng của 1 voucher (admin xem ai đã dùng mã nào, lúc nào)
    Page<VoucherUsageLog> findByVoucherIdOrderByUsedAtDesc(Long voucherId, Pageable pageable);

    // Số lần user đã dùng voucher này
    long countByUserIdAndVoucherId(Long userId, Long voucherId);

    // Lịch sử dùng voucher của user
    List<VoucherUsageLog> findByUserIdOrderByUsedAtDesc(Long userId);
}
