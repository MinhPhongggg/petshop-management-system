package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    // Loại thay đổi
    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false)
    private MovementType movementType;

    // Số lượng thay đổi (dương = nhập, âm = xuất)
    @Column(nullable = false)
    private Integer quantity;

    // Số lượng trước khi thay đổi
    @Column(name = "quantity_before", nullable = false)
    private Integer quantityBefore;

    // Số lượng sau khi thay đổi
    @Column(name = "quantity_after", nullable = false)
    private Integer quantityAfter;

    // Ghi chú / Lý do
    @Column(columnDefinition = "TEXT")
    private String note;

    // Liên kết đến đơn hàng (nếu là xuất kho do bán)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    // Người thực hiện
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum MovementType {
        IMPORT,         // Nhập hàng
        EXPORT,         // Xuất hàng (bán)
        ADJUSTMENT,     // Điều chỉnh
        RETURN,         // Trả hàng
        DAMAGED         // Hàng hỏng
    }
}
