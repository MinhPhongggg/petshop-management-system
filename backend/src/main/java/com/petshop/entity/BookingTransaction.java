package com.petshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // Mã đơn hàng gửi sang MoMo (unique per attempt)
    @Column(name = "order_id", nullable = false, unique = true, length = 100)
    private String orderId;

    // Mã giao dịch MoMo trả về
    @Column(name = "trans_id", length = 100)
    private String transId;

    // Số tiền
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    // Phương thức
    @Column(name = "payment_method", nullable = false, length = 20)
    @Builder.Default
    private String paymentMethod = "MOMO";

    // Trạng thái
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;

    // Loại giao dịch
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    @Builder.Default
    private TransactionType transactionType = TransactionType.DEPOSIT;

    // MoMo result code
    @Column(name = "result_code")
    private Integer resultCode;

    // Thông báo từ MoMo
    @Column(name = "message", length = 500)
    private String message;

    // Request ID gửi tới MoMo
    @Column(name = "request_id", length = 100)
    private String requestId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TransactionStatus {
        PENDING,
        SUCCESS,
        FAILED,
        EXPIRED
    }

    public enum TransactionType {
        DEPOSIT,    // Đặt cọc
        REFUND      // Hoàn tiền
    }
}
