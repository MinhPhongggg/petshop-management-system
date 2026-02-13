package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    // Snapshot thông tin sản phẩm tại thời điểm đặt hàng
    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "variant_name", length = 100)
    private String variantName;

    @Column(name = "product_image")
    private String productImage;

    // Giá tại thời điểm mua
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    // Tổng tiền = unitPrice * quantity
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    // Đã đánh giá chưa
    @Column(nullable = false)
    @Builder.Default
    private Boolean reviewed = false;
}
