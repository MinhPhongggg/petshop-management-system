package com.petshop.repository;

import com.petshop.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    
    List<ProductVariant> findByProductIdAndActiveIsTrue(Long productId);
    
    Optional<ProductVariant> findBySku(String sku);
    
    boolean existsBySku(String sku);
    
    // Sản phẩm sắp hết hàng (dùng minStock per-variant)
    @Query("SELECT v FROM ProductVariant v WHERE v.active = true AND v.stock > 0 AND v.stock <= v.minStock")
    List<ProductVariant> findLowStockDynamic();

    // Sản phẩm sắp hết hàng (dùng threshold cố định - backward compat)
    @Query("SELECT v FROM ProductVariant v WHERE v.active = true AND v.stock > 0 AND v.stock <= :threshold")
    List<ProductVariant> findLowStock(@Param("threshold") int threshold);
    
    // Sản phẩm hết hàng
    @Query("SELECT v FROM ProductVariant v WHERE v.active = true AND v.stock <= 0")
    List<ProductVariant> findOutOfStock();
    
    // Đếm số sản phẩm sắp hết
    @Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.active = true AND v.stock > 0 AND v.stock <= :threshold")
    long countLowStock(@Param("threshold") int threshold);
    
    // Đếm số sản phẩm hết hàng
    @Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.active = true AND v.stock <= 0")
    long countOutOfStock();

    // Sản phẩm tồn vượt định mức
    @Query("SELECT v FROM ProductVariant v WHERE v.active = true AND v.maxStock IS NOT NULL AND v.stock > v.maxStock")
    List<ProductVariant> findOverStock();

    @Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.active = true AND v.maxStock IS NOT NULL AND v.stock > v.maxStock")
    long countOverStock();

    // Sản phẩm sắp hết hạn sử dụng
    @Query("SELECT v FROM ProductVariant v WHERE v.active = true AND v.expiryDate IS NOT NULL AND v.expiryDate <= :date")
    List<ProductVariant> findExpiringBefore(@Param("date") LocalDate date);
}
