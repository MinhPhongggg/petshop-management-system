package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mã đơn hàng (Ví dụ: ORD-20260131-001)
    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // === Thông tin giao hàng ===
    @Column(name = "receiver_name", nullable = false, length = 100)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    private String receiverPhone;

    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    // Mã vận đơn
    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    // === Chi tiết đơn hàng ===
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    // === Thanh toán ===
    // Tổng tiền hàng
    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    // Phí vận chuyển
    @Column(name = "shipping_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    // Giảm giá
    @Column(name = "discount_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    // Mã voucher đã dùng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    // Tổng thanh toán
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    // Phương thức thanh toán
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    // Trạng thái thanh toán
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // === Trạng thái đơn hàng ===
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    // Lý do hủy
    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    // Thời gian các trạng thái
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "processing_at")
    private LocalDateTime processingAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING,        // Chờ xác nhận
        CONFIRMED,      // Đã xác nhận
        PROCESSING,     // Đang chuẩn bị hàng
        SHIPPING,       // Đang giao hàng
        DELIVERED,      // Đã giao hàng
        COMPLETED,      // Hoàn thành
        CANCELLED       // Đã hủy
    }

    public enum PaymentMethod {
        COD,            // Thanh toán khi nhận hàng
        BANK_TRANSFER,  // Chuyển khoản ngân hàng
        VNPAY,          // VNPay
        MOMO,           // Ví Momo
        ZALOPAY         // ZaloPay
    }

    public enum PaymentStatus {
        PENDING,        // Chờ thanh toán
        PAID,           // Đã thanh toán
        FAILED,         // Thanh toán thất bại
        REFUNDED        // Đã hoàn tiền
    }

    // Helper: Tính tổng số sản phẩm
    public int getTotalItems() {
        return items.stream().mapToInt(OrderItem::getQuantity).sum();
    }
}
