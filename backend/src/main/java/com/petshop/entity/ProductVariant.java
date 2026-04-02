package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Tên biến thể (Ví dụ: "500g", "1kg", "Size S")
    @Column(nullable = false, length = 100)
    private String name;

    // SKU của biến thể
    @Column(unique = true, length = 50)
    private String sku;

    // Barcode/EAN code
    @Column(unique = true, length = 64)
    private String barcode;

    // Đơn vị tính (gói, chai, kg, ...)
    @Column(length = 30)
    @Builder.Default
    private String unit = "pcs";

    // Giá
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    // Giá nhập gần nhất
    @Column(name = "last_import_price", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal lastImportPrice = BigDecimal.ZERO;

    // Giá vốn bình quân gia quyền
    @Column(name = "average_cost", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal averageCost = BigDecimal.ZERO;

    // Số lượng tồn kho
    @Column(nullable = false)
    @Builder.Default
    private int stock = 0;

    @Column(name = "min_stock", columnDefinition = "int default 10")
    @Builder.Default
    private int minStock = 10;

    @Column(name = "max_stock")
    @Builder.Default
    private Integer maxStock = 1000;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
