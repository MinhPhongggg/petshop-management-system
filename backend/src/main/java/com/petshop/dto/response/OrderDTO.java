package com.petshop.dto.response;

import com.petshop.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    
    private Long id;
    private String orderCode;
    
    // Thông tin khách hàng
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    
    // Thông tin giao hàng
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String note;
    private String trackingNumber;
    
    // Chi tiết đơn hàng
    private List<OrderItemDTO> items;
    private Integer totalItems;
    
    // Thanh toán
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private String voucherCode;
    private BigDecimal totalAmount;
    private Order.PaymentMethod paymentMethod;
    private Order.PaymentStatus paymentStatus;
    private String transactionId;
    private LocalDateTime paidAt;
    
    // Trạng thái
    private Order.OrderStatus status;
    private String cancelReason;
    
    // Thời gian
    private LocalDateTime confirmedAt;
    private LocalDateTime processingAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
}
