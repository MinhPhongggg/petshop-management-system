package com.petshop.repository;

import com.petshop.entity.StockAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockAuditRepository extends JpaRepository<StockAudit, Long> {
    Page<StockAudit> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<StockAudit> findByStatusOrderByCreatedAtDesc(StockAudit.Status status, Pageable pageable);
}
