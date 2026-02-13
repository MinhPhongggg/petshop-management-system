package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
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

    // Giá
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    // Số lượng tồn kho
    @Column(nullable = false)
    @Builder.Default
    private int stock = 0;

    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
