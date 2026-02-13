package com.petshop.dto.request;

import com.petshop.entity.Order;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    
    @NotBlank(message = "Receiver name is required")
    private String receiverName;
    
    @NotBlank(message = "Receiver phone is required")
    private String receiverPhone;
    
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
    
    private String note;
    
    @NotNull(message = "Payment method is required")
    private Order.PaymentMethod paymentMethod;
    
    private String voucherCode;
    
    // Danh sách item từ giỏ hàng (null = checkout toàn bộ giỏ)
    private List<Long> cartItemIds;
    
    // Danh sách items trực tiếp từ FE (cho guest checkout hoặc local cart)
    private List<OrderItemInput> items;
    
    @Data
    public static class OrderItemInput {
        private Long productId;
        private Long variantId;
        private Integer quantity;
    }
}
