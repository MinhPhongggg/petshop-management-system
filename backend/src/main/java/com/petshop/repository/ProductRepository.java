package com.petshop.repository;

import com.petshop.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    
    Optional<Product> findBySlug(String slug);
    
    boolean existsBySlug(String slug);
    
    Page<Product> findByActiveIsTrue(Pageable pageable);
    
    // Tìm kiếm theo tên hoặc mô tả
    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);
    
    // Lọc sản phẩm theo nhiều tiêu chí (hỗ trợ nhiều categoryId)
    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND (:categoryIds IS NULL OR p.category.id IN :categoryIds) " +
           "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
           "AND (:minPrice IS NULL OR p.basePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice)")
    Page<Product> filterProducts(
            @Param("categoryIds") List<Long> categoryIds,
            @Param("brandId") Long brandId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);
    
    // Sản phẩm nổi bật
    List<Product> findByFeaturedIsTrueAndActiveIsTrue();
    
    // Sản phẩm bán chạy
    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.soldCount DESC")
    List<Product> findBestSelling(Pageable pageable);
    
    // Sản phẩm mới
    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.createdAt DESC")
    List<Product> findNewProducts(Pageable pageable);
    
    // Sản phẩm theo danh mục (hỗ trợ nhiều categoryId - bao gồm cả danh mục con)
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.id IN :categoryIds")
    Page<Product> findByCategoryIdInAndActiveIsTrue(@Param("categoryIds") List<Long> categoryIds, Pageable pageable);
    
    // Admin: Lọc theo danh mục (bao gồm cả inactive)
    @Query("SELECT p FROM Product p WHERE p.category.id IN :categoryIds")
    Page<Product> findByCategoryIdIn(@Param("categoryIds") List<Long> categoryIds, Pageable pageable);
    
    // Sản phẩm theo thương hiệu
    Page<Product> findByBrandIdAndActiveIsTrue(Long brandId, Pageable pageable);
    
    // Đếm sản phẩm active
    long countByActiveIsTrue();
    
    // ==================== ANALYTICS QUERIES ====================
    
    // Sales Velocity - tốc độ bán hàng top 10, kèm category
    @Query(value = "SELECT p.id, p.name, " +
                   "(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image, " +
                   "c.name as category_name, p.sold_count, " +
                   "COALESCE(p.base_price * p.sold_count, 0) as revenue " +
                   "FROM products p " +
                   "LEFT JOIN categories c ON p.category_id = c.id " +
                   "WHERE p.active = true AND p.sold_count > 0 " +
                   "ORDER BY p.sold_count DESC LIMIT 10", nativeQuery = true)
    List<Object[]> getSalesVelocity();
    
    // Tổng giá trị tồn kho
    @Query(value = "SELECT COALESCE(SUM(pv.price * pv.stock), 0) " +
                   "FROM product_variants pv WHERE pv.active = true", nativeQuery = true)
    BigDecimal getTotalInventoryValue();
}
