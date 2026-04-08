package com.petshop.repository;

import com.petshop.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    
    Page<StockMovement> findByVariantIdOrderByCreatedAtDesc(Long variantId, Pageable pageable);
    
    // Xóa stock movements theo danh sách variant IDs (khi xóa sản phẩm)
    void deleteByVariantIdIn(List<Long> variantIds);
    
    Page<StockMovement> findByMovementTypeOrderByCreatedAtDesc(StockMovement.MovementType type, Pageable pageable);
}