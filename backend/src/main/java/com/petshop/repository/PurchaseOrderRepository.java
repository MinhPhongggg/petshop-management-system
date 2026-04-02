package com.petshop.repository;

import com.petshop.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Page<PurchaseOrder> findByStatusOrderByCreatedAtDesc(PurchaseOrder.Status status, Pageable pageable);
    Page<PurchaseOrder> findBySupplierIdOrderByCreatedAtDesc(Long supplierId, Pageable pageable);
    Page<PurchaseOrder> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(PurchaseOrder.Status status);
}
