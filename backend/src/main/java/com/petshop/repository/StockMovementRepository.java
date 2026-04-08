package com.petshop.repository;

import com.petshop.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    
    Page<StockMovement> findByVariantIdOrderByCreatedAtDesc(Long variantId, Pageable pageable);
    
    // Xóa stock movements theo danh sách variant IDs (khi xóa sản phẩm)
    void deleteByVariantIdIn(List<Long> variantIds);
    
    Page<StockMovement> findByMovementTypeOrderByCreatedAtDesc(StockMovement.MovementType type, Pageable pageable);

    @Query("SELECT COALESCE(SUM(CASE WHEN m.createdAt < :startDate THEN m.quantity ELSE 0 END), 0) " +
            "FROM StockMovement m WHERE m.variant.id = :variantId")
    Integer getOpeningQuantity(@Param("variantId") Long variantId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(CASE WHEN m.quantity > 0 THEN m.quantity ELSE 0 END), 0) " +
            "FROM StockMovement m WHERE m.variant.id = :variantId AND m.createdAt BETWEEN :startDate AND :endDate")
    Integer getInQuantity(@Param("variantId") Long variantId,
                          @Param("startDate") LocalDateTime startDate,
                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(CASE WHEN m.quantity < 0 THEN -m.quantity ELSE 0 END), 0) " +
            "FROM StockMovement m WHERE m.variant.id = :variantId AND m.createdAt BETWEEN :startDate AND :endDate")
    Integer getOutQuantity(@Param("variantId") Long variantId,
                           @Param("startDate") LocalDateTime startDate,
                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM((CASE WHEN m.quantity < 0 THEN -m.quantity ELSE 0 END) * COALESCE(m.unitCost, 0)), 0) " +
            "FROM StockMovement m WHERE m.createdAt BETWEEN :startDate AND :endDate " +
            "AND m.movementType IN ('EXPORT_SALE')")
    BigDecimal getTotalCogs(@Param("startDate") LocalDateTime startDate,
                            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT m.variant.id, m.variant.product.name, m.variant.name, " +
            "COALESCE(SUM(CASE WHEN m.quantity > 0 THEN m.quantity ELSE 0 END),0), " +
            "COALESCE(SUM(CASE WHEN m.quantity < 0 THEN -m.quantity ELSE 0 END),0) " +
            "FROM StockMovement m WHERE m.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY m.variant.id, m.variant.product.name, m.variant.name")
    List<Object[]> getInOutSummary(@Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);
}