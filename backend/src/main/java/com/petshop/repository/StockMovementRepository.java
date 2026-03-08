package com.petshop.repository;

import com.petshop.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    
    Page<StockMovement> findByVariantIdOrderByCreatedAtDesc(Long variantId, Pageable pageable);
    
    Page<StockMovement> findByMovementTypeOrderByCreatedAtDesc(StockMovement.MovementType type, Pageable pageable);
}